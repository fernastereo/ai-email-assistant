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

---

## Specs del Droplet

```
Tipo:    Basic Shared CPU
OS:      Ubuntu 22.04 LTS
Plan:    Regular SSD — 2GB RAM / 1 vCPU / 50GB
Precio:  $12/mes
Región:  New York 3 (o Frankfurt para usuarios EU/LATAM)
Auth:    SSH Key (nunca password)
Extras:  ✓ Monitoring (gratis, actívalo)
```

---

## Qué es manual vs automático

| Tarea | Quién lo hace |
|-------|--------------|
| Instalar Docker en el servidor | Manual — una sola vez |
| Crear usuario `deploy` | Manual — una sola vez |
| Crear `.env` con secrets en el servidor | Manual — una sola vez |
| Primer arranque de los containers | Manual — una sola vez |
| Todos los deploys posteriores | GitHub Actions automático |
| Copiar `docker-compose.prod.yml` y `Caddyfile` | GitHub Actions automático |
| Renovar certificados SSL | Caddy automático |

---

## Setup inicial (solo una vez)

### 1. Conectarse al servidor

```bash
ssh root@<IP_DEL_DROPLET>
```

### 2. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose-plugin
```

### 3. Crear usuario de deploy

```bash
adduser deploy
usermod -aG docker deploy

mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 4. Crear carpeta del proyecto

```bash
mkdir -p /opt/replie
chown deploy:deploy /opt/replie
```

### 5. Apuntar el dominio al Droplet

En tu DNS (donde tengas `replie.email`), crear un registro A:
```
api.replie.email  →  <IP_DEL_DROPLET>
```

Esperar propagación (5-30 minutos) antes de continuar.

### 6. Crear el .env de producción en el servidor

```bash
# Conectar como deploy
ssh deploy@<IP_DEL_DROPLET>

cat > /opt/replie/.env << 'EOF'
GITHUB_REPO=tu-usuario-github/ai-email-assistant
OPENAI_API_KEY=sk-proj-...
CORS_ORIGIN=chrome-extension://TU_EXTENSION_ID
POSTGRES_DB=replie
POSTGRES_USER=replieuser
POSTGRES_PASSWORD=genera-una-password-segura-aqui
EOF

chmod 600 /opt/replie/.env
```

### 7. Copiar archivos de configuración al servidor (primera vez)

```bash
# Desde tu máquina local
scp backend/docker-compose.prod.yml deploy@<IP>:/opt/replie/
scp backend/Caddyfile deploy@<IP>:/opt/replie/
```

A partir del segundo deploy, GitHub Actions copia estos archivos automáticamente.

### 8. Login al GitHub Container Registry

```bash
# En el servidor como deploy
# Necesitas un GitHub Personal Access Token con scope read:packages
# Generarlo en: github.com → Settings → Developer settings → Personal access tokens
echo TU_GITHUB_PAT | docker login ghcr.io -u TU_USUARIO_GITHUB --password-stdin
```

### 9. Primer arranque

```bash
cd /opt/replie
docker compose -f docker-compose.prod.yml --env-file .env up -d

# Verificar que todo corrió
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3001/health
```

Caddy obtiene el certificado SSL automáticamente en el primer arranque.
La URL pública `https://api.replie.email` debería estar activa en ~30 segundos.

---

## Secrets que necesita GitHub Actions

GitHub repo → Settings → Secrets and Actions → New repository secret:

| Secret | Valor | Cómo obtenerlo |
|--------|-------|---------------|
| `DO_DROPLET_IP` | IP pública del Droplet | Dashboard de Digital Ocean |
| `DO_SSH_PRIVATE_KEY` | Clave SSH privada | `cat ~/.ssh/id_rsa` en tu máquina |

Los secrets de OpenAI, DB, etc. **NO van en GitHub** — viven en el `.env` del servidor.

---

## Qué pasa en cada deploy (automático)

```
git push con cambios en backend/
    │
    ▼
GitHub Actions:
  1. Build nueva imagen Docker
  2. Push a ghcr.io
  3. SCP → copia docker-compose.prod.yml y Caddyfile al servidor
  4. SSH → docker pull api (solo la imagen nueva)
  5. SSH → docker compose up -d --no-deps api (reinicia solo api)
  6. SSH → curl /health (verifica que vive)

  postgres → NO se toca (datos seguros)
  caddy    → NO se toca (SSL no se interrumpe)
```

---

## Comandos útiles en el servidor

```bash
# Ver logs del API en tiempo real
docker compose -f /opt/replie/docker-compose.prod.yml logs -f api

# Ver logs de postgres
docker compose -f /opt/replie/docker-compose.prod.yml logs -f db

# Ver logs de caddy (SSL, requests)
docker compose -f /opt/replie/docker-compose.prod.yml logs -f caddy

# Ver estado de todos los containers
docker compose -f /opt/replie/docker-compose.prod.yml ps

# Reiniciar API manualmente
docker compose -f /opt/replie/docker-compose.prod.yml restart api

# Entrar a la DB
docker compose -f /opt/replie/docker-compose.prod.yml exec db psql -U replieuser -d replie

# Ver uso de recursos en tiempo real
docker stats
```
