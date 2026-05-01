# Server Setup — Digital Ocean Droplet

## Stack en producción

```
Internet :80/:443
    │
    ▼
[ caddy container ]  ← SSL automático (Let's Encrypt), reverse proxy
    │ red interna Docker
    ▼
[ api container ]    ← Node.js/Express, solo accesible internamente
    │ red interna Docker
    ▼
[ db container ]     ← PostgreSQL, solo accesible internamente
```

Todos los containers viven en el mismo Droplet. Solo Caddy expone puertos al exterior.
El API **no expone puertos al host** — solo es accesible a través de Caddy o desde dentro de la red Docker.

---

## Specs del Droplet (configuración actual)

```
Tipo:     Basic Shared CPU
OS:       Ubuntu 22.04 LTS
Plan:     Regular SSD — 2GB RAM / 1 vCPU / 50GB
Precio:   $12/mes
Región:   New York 3
Auth:     SSH Key (nunca password)
Hostname: replie-api
Extras:   ✓ Monitoring activado
```

---

## Qué es manual vs automático

| Tarea | Quién lo hace |
|-------|--------------|
| Instalar Docker en el servidor | Manual — una sola vez |
| Crear usuario `deploy` | Manual — una sola vez |
| Crear `.env` con secrets en el servidor | Manual — una sola vez |
| Configurar DNS en Namecheap | Manual — una sola vez |
| Login a ghcr.io en el servidor | Manual — una sola vez |
| Copiar archivos de config + primer arranque | Manual — una sola vez |
| Todos los deploys posteriores | GitHub Actions automático |
| Copiar `docker-compose.prod.yml` y `Caddyfile` | GitHub Actions automático |
| Renovar certificados SSL | Caddy automático |

---

## Setup inicial (solo una vez)

### 1. Crear el Droplet en Digital Ocean

```
DO Dashboard → Create → Droplets
→ Ubuntu 22.04 LTS
→ Basic / Regular SSD / $12/mo
→ New York 3
→ SSH Key: pegar contenido de id_rsa.pub (clave PÚBLICA)
→ Hostname: replie-api
→ Create Droplet
```

> En Windows la clave pública está en `C:\Users\<tu-usuario>\.ssh\id_rsa.pub`

### 2. Conectarse al servidor

```bash
ssh root@<IP_DEL_DROPLET>
```

### 3. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose-plugin
```

### 4. Crear usuario de deploy (no operar como root)

```bash
adduser deploy
usermod -aG docker deploy

mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 5. Crear carpeta del proyecto

```bash
mkdir -p /opt/replie
chown deploy:deploy /opt/replie
```

### 6. Configurar DNS en Namecheap

En Namecheap → Domain List → replie.email → Manage → Advanced DNS:

```
Type:  A Record
Host:  api
Value: <IP_DEL_DROPLET>
TTL:   Automatic
```

Verificar propagación en `dnschecker.org` antes de continuar.

### 7. Crear el .env de producción en el servidor

```bash
# Conectar como usuario deploy
ssh deploy@<IP_DEL_DROPLET>

cat > /opt/replie/.env << 'EOF'
GITHUB_REPO=fernastereo
OPENAI_API_KEY=sk-proj-...
CORS_ORIGIN=chrome-extension://TU_EXTENSION_ID
POSTGRES_DB=replie
POSTGRES_USER=replieuser
POSTGRES_PASSWORD=una-password-segura-aqui
EOF

# Permisos correctos — crítico para que GitHub Actions pueda leerlo
chown deploy:deploy /opt/replie/.env
chmod 600 /opt/replie/.env
```

> IMPORTANTE: `GITHUB_REPO` debe ser solo el usuario de GitHub (`fernastereo`), NO la URL completa.
> La imagen se construye como `ghcr.io/${GITHUB_REPO}/replie-api:latest`

### 8. Login al GitHub Container Registry

```bash
# En el servidor como deploy
# Generar un Personal Access Token (classic) en:
# github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Scope requerido: ✓ read:packages

echo "TU_GITHUB_PAT" | docker login ghcr.io -u fernastereo --password-stdin
```

### 9. Copiar archivos de configuración al servidor (primera vez)

```bash
# Desde tu máquina local (Windows — usar Git Bash o WSL)
scp backend/docker-compose.prod.yml deploy@<IP>:/opt/replie/
scp backend/Caddyfile deploy@<IP>:/opt/replie/
```

A partir del segundo deploy, GitHub Actions copia estos archivos automáticamente.

### 10. Primer arranque de los containers

```bash
# En el servidor como deploy
cd /opt/replie
docker compose -f docker-compose.prod.yml --env-file .env up -d

# Verificar que los 3 containers están corriendo y healthy
docker compose -f docker-compose.prod.yml ps
```

Output esperado:
```
NAME             IMAGE                                    STATUS
replie-api-1     ghcr.io/fernastereo/replie-api:latest    Up (healthy)
replie-caddy-1   caddy:2-alpine                           Up
replie-db-1      postgres:16-alpine                       Up (healthy)
```

Caddy obtiene el certificado SSL automáticamente en el primer request al dominio.

### 11. Verificar que todo funciona

```bash
# Verificar API desde dentro de la red Docker (el puerto no está expuesto al host)
docker compose -f /opt/replie/docker-compose.prod.yml exec api wget -qO- http://localhost:3001/health

# Verificar desde fuera (requiere DNS configurado)
curl https://api.replie.email/health
```

Respuesta esperada: `{"status":"OK","timestamp":"..."}`

---

## Secrets que necesita GitHub Actions

GitHub repo → Settings → Secrets and Actions → New repository secret:

| Secret | Valor | Cómo obtenerlo |
|--------|-------|---------------|
| `DO_DROPLET_IP` | IP pública del Droplet | Dashboard de Digital Ocean |
| `DO_SSH_PRIVATE_KEY` | Contenido de `id_rsa` (clave PRIVADA completa) | En Windows: `type C:\Users\<usuario>\.ssh\id_rsa` |

> En Windows: usar `Get-Content C:\Users\<usuario>\.ssh\id_rsa | Set-Clipboard` para copiar al portapapeles sin errores de formato.

Los secrets de OpenAI, DB, etc. **NO van en GitHub** — viven en el `.env` del servidor.

---

## Qué pasa en cada deploy automático

```
git push con cambios en backend/ (o workflow_dispatch manual)
    │
    ▼
GitHub Actions:
  1. Validate  → node -e "require('./src/app')" con dummy key
  2. Build     → docker buildx build → push a ghcr.io/fernastereo/replie-api
  3. Deploy:
     a. SCP → copia docker-compose.prod.yml y Caddyfile al servidor
     b. SSH → docker login ghcr.io
     c. SSH → docker compose pull api   (solo baja imagen nueva)
     d. SSH → docker compose up -d --no-deps api  (reinicia solo api)
     e. SSH → docker exec api wget /health  (verifica que vive)

  postgres → NO se toca (datos seguros)
  caddy    → NO se toca (SSL no se interrumpe)
```

---

## Notas importantes aprendidas en el setup

- **`curl localhost:3001` desde el host siempre falla** — el puerto no está expuesto. Usar `docker exec` para verificar internamente.
- **`GITHUB_TOKEN` no funciona en scripts SSH** — las expresiones `${{ }}` no se resuelven en el servidor remoto. Pasar como variable de entorno con `envs:`.
- **El `.env` debe ser propiedad del usuario `deploy`** con `chown deploy:deploy` — si es de root, el workflow falla con `permission denied`.
- **`GITHUB_REPO` debe ser solo el usuario** (`fernastereo`), no la URL completa ni el path del repo.
- **Caddy no responde por IP** — solo responde al dominio configurado en el `Caddyfile`. El DNS debe estar propagado antes de probar desde el exterior.
- **El `DO_SSH_PRIVATE_KEY` debe ser la clave PRIVADA** (`id_rsa`), no la pública (`id_rsa.pub`). Error común al configurar.

---

## Comandos útiles en el servidor

```bash
# Ver logs del API en tiempo real
docker compose -f /opt/replie/docker-compose.prod.yml logs -f api

# Ver logs de postgres
docker compose -f /opt/replie/docker-compose.prod.yml logs -f db

# Ver logs de caddy (SSL, requests entrantes)
docker compose -f /opt/replie/docker-compose.prod.yml logs -f caddy

# Ver estado de todos los containers
docker compose -f /opt/replie/docker-compose.prod.yml ps

# Verificar health del API desde dentro de Docker
docker compose -f /opt/replie/docker-compose.prod.yml exec api wget -qO- http://localhost:3001/health

# Reiniciar API manualmente
docker compose -f /opt/replie/docker-compose.prod.yml restart api

# Entrar a la DB
docker compose -f /opt/replie/docker-compose.prod.yml exec db psql -U replieuser -d replie

# Ver uso de recursos en tiempo real
docker stats

# Limpiar imágenes viejas
docker image prune -f
```
