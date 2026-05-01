# Cómo funciona una Chrome Extension

## Concepto fundamental

Una extensión de Chrome es un **conjunto de archivos estáticos** (HTML, CSS, JS) que Chrome carga directamente desde el disco. No hay servidor que sirva la extensión — Chrome la lee del sistema de archivos local o del Web Store.

Esto significa:
- No puede correr Node.js ni ningún servidor dentro de la extensión
- Todo el backend tiene que vivir en un servidor externo
- La extensión solo puede hacer `fetch()` hacia afuera para hablar con APIs

---

## Las 4 piezas de una extensión

```
┌─────────────────────────────────────────────────────────────┐
│                    CHROME BROWSER                           │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐   │
│  │   POPUP      │   │   SIDEBAR    │   │  OPTIONS PAGE  │   │
│  │  (index.html)│   │(sidepanel    │   │ (options.html) │   │
│  │  React UI    │   │  .html)      │   │                │   │
│  └──────┬───────┘   └──────┬───────┘   └───────┬────────┘   │
│         │                  │                   │            │
│         └──────────────────┼───────────────────┘            │
│                            │  chrome.runtime.sendMessage    │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         BACKGROUND SERVICE WORKER                   │    │
│  │         (background.js)                             │    │
│  │  - Router de mensajes                               │    │
│  │  - Llama al backend externo                         │    │
│  │  - Maneja chrome.storage                            │    │
│  └─────────────────────────┬───────────────────────────┘    │
│                            │  chrome.tabs.sendMessage       │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  GMAIL / OUTLOOK TAB    │   CONTENT SCRIPT          │    │
│  │  mail.google.com        │   (content-script.js)     │    │
│  │                         │   - Lee el DOM del email  │    │
│  │                         │   - Inyecta respuestas    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ fetch() / HTTP
                             ▼
              ┌──────────────────────────┐
              │   BACKEND EXTERNO        │
              │   (Node.js/Express)      │
              │   Railway / DO / Render  │
              │                          │
              │   → llama OpenAI API     │
              └──────────────────────────┘
```

### Resumen de cada pieza

| Pieza | Qué es | Corre en | Acceso al DOM de la página | Puede llamar APIs externas |
|-------|--------|----------|--------------------------|---------------------------|
| **Popup** | Ventanita al hacer click en el ícono | Proceso de Chrome | No | Sí |
| **Sidebar** | Panel lateral (Chrome 114+) | Proceso de Chrome | No | Sí |
| **Options Page** | Página de configuración | Proceso de Chrome | No | Sí |
| **Background Service Worker** | Hilo separado, siempre activo | Proceso de Chrome | No | Sí |
| **Content Script** | JS inyectado en la web | Proceso de la pestaña | Sí | Limitado |

---

## Comunicación entre las piezas

Las piezas **no pueden llamarse directamente**. Solo se comunican por mensajes.

### chrome.runtime.sendMessage — para hablar con el background

```javascript
// Desde popup o sidebar → background
chrome.runtime.sendMessage(
  { type: 'GENERATE_REPLY', data: { emailContent, tone } },
  (response) => {
    console.log(response.reply)
  }
)

// Background escucha
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_REPLY') {
    // hacer fetch al backend...
    sendResponse({ reply: '...' })
  }
  return true // IMPORTANTE: para respuestas asíncronas
})
```

### chrome.tabs.sendMessage — para hablar con el content script

```javascript
// Desde background → content script en la pestaña activa
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
chrome.tabs.sendMessage(tab.id, { type: 'INSERT_REPLY', text: replyText })

// Content script escucha
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'INSERT_REPLY') {
    // insertar texto en el compose box de Gmail...
  }
})
```

### Flujo completo en este proyecto

```
Usuario hace click en "Generar respuesta"
  ↓
Popup/Sidebar → chrome.runtime.sendMessage({ type: 'GENERATE_REPLY' })
  ↓
Background recibe → fetch('https://backend.com/api/ai/generate-reply')
  ↓
Backend → OpenAI API → respuesta
  ↓
Background → sendResponse({ reply: '...' })
  ↓
Popup/Sidebar muestra la respuesta
  ↓
Usuario hace click en "Insertar"
  ↓
Background → chrome.tabs.sendMessage({ type: 'INSERT_REPLY' })
  ↓
Content Script → encuentra el compose box de Gmail → inserta texto
```

---

## El manifest.json — el corazón de la extensión

Define todo lo que la extensión puede hacer. Sin permiso declarado aquí, Chrome lo bloquea.

```json
{
  "manifest_version": 3,
  "name": "AI Email Assistant",
  "version": "1.0.0",

  // Qué archivos cumplen qué rol
  "action": {
    "default_popup": "index.html"      // el popup al hacer click en el ícono
  },
  "side_panel": {
    "default_path": "sidepanel.html"   // el sidebar lateral
  },
  "background": {
    "service_worker": "background.js"  // el service worker
  },
  "content_scripts": [{
    "matches": ["https://mail.google.com/*"],
    "js": ["content-script.js"]        // se inyecta automáticamente en Gmail
  }],

  // Permisos de APIs de Chrome
  "permissions": [
    "storage",       // chrome.storage.local
    "tabs",          // chrome.tabs
    "sidePanel",     // chrome.sidePanel
    "scripting",     // chrome.scripting
    "contextMenus",  // menú clic derecho
    "notifications"  // notificaciones del sistema
  ],

  // Permisos de URLs externas (fetch)
  "host_permissions": [
    "https://mail.google.com/*",
    "https://tu-backend.com/*"
  ]
}
```

---

## Chrome Storage — cómo se persiste el estado

No hay localStorage entre las piezas. Se usa `chrome.storage.local` como estado compartido.

```javascript
// Guardar
chrome.storage.local.set({ settings: { tone: 'formal', language: 'es' } })

// Leer
chrome.storage.local.get('settings', (data) => {
  console.log(data.settings.tone) // 'formal'
})

// Escuchar cambios (desde cualquier pieza)
chrome.storage.onChanged.addListener((changes) => {
  console.log(changes.settings.newValue)
})
```

---

## Cómo se desarrolla localmente

```
1. Escribir código en /src (TypeScript, React, etc.)
   ↓
2. npm run build → compila todo a /dist (JS plano que Chrome entiende)
   ↓
3. chrome://extensions/ → activar "Modo desarrollador"
   → "Cargar descomprimida" → seleccionar /dist
   ↓
4. La extensión aparece en Chrome con un ícono de puzzle
   ↓
5. Hacer un cambio → npm run build → botón "Reload" en chrome://extensions/
```

No hay hot-reload automático como en una web normal. Cada cambio requiere rebuild + reload.

---

## Cómo se publica en el Chrome Web Store

```
1. npm run build → genera /dist

2. Comprimir:
   zip -r extension.zip dist/

3. Chrome Developer Dashboard
   → chromewebstore.google.com/developer
   → "New Item" → subir el .zip

4. Llenar el formulario:
   - Nombre, descripción (max 132 chars para el resumen)
   - Screenshots (mínimo 1, resolución 1280x800)
   - Privacy Policy (URL pública obligatoria)
   - Justificar cada permiso que se declara

5. Pagar $5 (única vez, para toda la cuenta de desarrollador)

6. Submit → Google revisa (1-5 días laborales)

7. Aprobada → aparece públicamente
   Los usuarios la instalan con un click
```

### Actualizaciones

```
1. Incrementar versión en manifest.json (ej: 1.0.0 → 1.0.1)
2. npm run build → nuevo .zip
3. Subir al Developer Dashboard → "Publish update"
4. Chrome auto-actualiza en todos los usuarios en ~24-48 horas
```

---

## Dónde vive el backend y por qué no puede estar en la extensión

La extensión no puede correr un servidor. Es solo archivos estáticos. El backend tiene que ser un servidor externo siempre disponible.

### Opciones de hosting

| Opción | Precio | Pros | Contras |
|--------|--------|------|---------|
| **Digital Ocean App Platform** | $5/mes | Simple, auto-deploy desde GitHub, detecta Docker | — |
| **Railway** | $5/mes | Muy fácil, buen DX | Menos control que DO |
| **Render** | Gratis / $7/mes | Gratis disponible | Free tier se "duerme" (30s de latencia al despertar) |
| **Vercel** | Gratis / $20/mes | Escala automático | Express necesita adaptación a serverless |
| **VPS (Hetzner/DO Droplet)** | $4-6/mes | Control total | Requiere configurar Linux, nginx, PM2 |

### Para este proyecto: Digital Ocean App Platform + Docker

```
Repo GitHub → push → DO auto-detecta Dockerfile → build → deploy
URL pública: https://tu-app.ondigitalocean.app
```

---

## El ID de la extensión

Cada extensión tiene un ID único que Google asigna al publicarla.

```
chrome-extension://abcdefghijklmnop1234567890abcdef/popup.html
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                   este es el extension ID
```

**Importancia para el backend:**
- El CORS del backend debe permitir requests desde `chrome-extension://<ID>`
- El ID cambia en desarrollo cada vez que recargas la extensión sin publicar
- Una vez publicada en el Web Store, el ID es fijo para siempre

**Cómo fijarlo en desarrollo:**
En el Developer Dashboard puedes reservar el ID antes de publicar generando una clave privada. Así el ID es consistente entre dev y prod.

---

## Limitaciones importantes de Manifest V3

MV3 (la versión actual requerida por Google desde 2023) tiene restricciones importantes vs la versión anterior:

| Limitación | Impacto |
|-----------|---------|
| Service worker en lugar de background page | El SW se puede "dormir" si no hay actividad. No se puede usar variables globales persistentes — usar `chrome.storage` |
| No `eval()` ni código remoto | Todo el JS debe estar empaquetado en el .zip |
| Reglas de red declarativas | Modificar requests HTTP requiere `declarativeNetRequest`, no interceptores arbitrarios |
| Content scripts tienen scope aislado | No pueden acceder a variables JS de la página host, solo al DOM |

---

## Resumen en una línea por pieza

- **Popup:** mini-webapp que se abre al hacer click en el ícono, vive en su propio proceso
- **Sidebar:** como el popup pero panel lateral, disponible mientras navegas (Chrome 114+)
- **Background Service Worker:** el cerebro — enruta mensajes, llama APIs, maneja estado global
- **Content Script:** el único que puede tocar el DOM de Gmail/Outlook, habla con el background por mensajes
- **Backend externo:** donde vive la lógica que requiere secretos (API keys) y procesamiento pesado
