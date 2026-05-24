# AI Email Assistant — Project Context for Claude

## Project Overview

**Product name: Replie**

Chrome Extension (Manifest V3) that integrates AI into Gmail and Outlook to provide smart reply generation, email summarization, and sentiment analysis. Powered by OpenAI's GPT-3.5-turbo via a Node.js/Express backend.

**Current status (2026-05-02):** Backend deployed at `api.replie.email`. Supports multiple AI providers (OpenAI, DeepSeek, Groq) via `AI_PROVIDER` env var. Prompts centralized in `emailPrompts.js` with email cleaning, sender detection, reply length control, and automatic language detection via `franc`. Extension inline toolbar working end-to-end: generates replies, summarizes emails, persists tone + length settings. Popup shows live usage counter. Landing page at `/landing`.

---

## Repository Structure

```
ai-email-assistant/
├── landing/            # Landing page / marketing site (React + Firebase)
├── extension/          # Chrome extension (React + TypeScript + Vite)
│   ├── public/
│   │   ├── manifest.json                  # Extension manifest (MV3)
│   │   └── static/js/
│   │       ├── background.js              # Service worker (raw JS)
│   │       └── content-script.js         # Content script (raw JS)
│   ├── src/
│   │   ├── main.tsx                       # Popup entry point
│   │   ├── App.tsx                        # Root popup component
│   │   ├── components/
│   │   │   ├── popup.tsx                  # Settings & usage dashboard
│   │   │   └── ui/                        # shadcn/Radix UI components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── input.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── label.tsx
│   │   │       ├── select.tsx
│   │   │       └── separator.tsx
│   │   ├── services/
│   │   │   └── api.ts                     # Backend API client
│   │   ├── utils/
│   │   │   └── constants.ts               # Global constants & config
│   │   └── lib/
│   │       └── utils.ts                   # cn() helper (clsx + tailwind-merge)
│   ├── index.html                         # Popup HTML entry
│   └── vite.config.ts                     # Vite build config
│
└── backend/
    ├── Dockerfile                         # Multi-stage production image
    ├── docker-compose.yml                 # Local dev with hot-reload
    ├── .env.example                       # Required env vars documented
    ├── server.js                          # Entry point (starts Express)
    └── src/
        ├── app.js                         # Express setup + middleware
        ├── routes/
        │   └── ai.js                      # API routes
        ├── controllers/
        │   └── aiController.js            # Request handlers
        ├── services/
        │   ├── aiService.js               # Provider factory — reads AI_PROVIDER env var
        │   ├── openaiService.js           # OpenAI provider (gpt-3.5-turbo)
        │   ├── deepseekService.js         # DeepSeek provider (deepseek-chat)
        │   ├── groqService.js             # Groq provider (llama-3.1-8b-instant) — free tier
        │   └── emailPrompts.js            # Shared prompts + email content cleaner
        ├── middlewares/
        │   └── auth.js                    # EMPTY — not implemented yet
        └── utils/
            └── reteLimiter.js             # EMPTY — not implemented yet
```

---

## Technology Stack

### Extension (Frontend)
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19.1.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 7.1.7 | Build tool |
| Tailwind CSS | 4.1.13 | Styling |
| Radix UI | various | Accessible primitives |
| CVA | 0.7.1 | Component variants |
| Lucide React | 0.544.0 | Icons |
| clsx + tailwind-merge | latest | className utilities |

### Backend (API Server)
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22 (Alpine) | Runtime |
| Express | 5.1.0 | HTTP server |
| OpenAI SDK | 5.23.1 | Shared SDK for OpenAI + DeepSeek + Groq (all OpenAI-compatible) |
| franc | 6.2.0 | Language detection from email content (ISO 639-3) |
| Helmet | 8.1.0 | Security headers |
| CORS | 2.8.5 | Cross-origin config |
| Morgan | 1.10.1 | Request logging |
| compression | 1.8.1 | Response compression |
| dotenv | 17.2.2 | Environment variables |

---

## Extension Architecture (Manifest V3)

### Entry Points
| Entry | File | Role |
|-------|------|------|
| Popup | `index.html` → `main.tsx` → `App.tsx` → `popup.tsx` | Settings & usage dashboard (NOT action launcher) |
| Service Worker | `static/js/background.js` | Background logic, API orchestration, daily limit enforcement |
| Content Script | `static/js/content-script.js` | DOM injection, inline email toolbar (primary UX) |

### UX Architecture Decisions (2026-05-02)

**Decision: inline compose toolbar is the primary UX, not the sidepanel.**

| Surface | Role | Reasoning |
|---------|------|-----------|
| Inline toolbar (content script) | Primary — generate + insert reply | Zero friction: lives where the user already is (compose box). No copy/paste, no panel switching. Pattern used by Compose AI, Grammarly. |
| Popup (Chrome toolbar icon) | Settings + usage dashboard | Available everywhere, not tied to Gmail. Will hold login/account when auth is added. |
| Sidepanel | Secondary — advanced features | Thread analysis, reply history, templates (Phase 4). Too much friction for the core generate-reply flow. |

**Inline toolbar UX spec (✅ implemented):**
- Appears automatically below each expanded email body in Gmail (detected via MutationObserver on `.ii.gt`)
- One toolbar per `[data-message-id]` container — handles threads (N emails = N toolbars) and HTML emails correctly
- Contains: "✨ Replie" brand label + tone selector + "↩ Generar respuesta" + "📄 Resumir"
- Generate Reply: auto-clicks Gmail's Reply button + calls API in parallel → injects text into compose box; fallback shows text inline if compose doesn't open
- Summarize: calls API → shows result in expandable area below toolbar
- Sender name extracted from Gmail DOM (`.gD` element) and sent in payload — model uses it in the greeting
- Tone + length settings persisted in `chrome.storage.local → settings.defaultTone / defaultLength`

---

### Chrome Permissions
```
contextMenus, tabs, activeTab, storage, scripting, notifications
```

### Host Permissions
```
http://localhost:3001/*              ← local backend (dev)
https://api.replie.email/*           ← production backend (DO Droplet)
https://mail.google.com/*            ← Gmail
https://outlook.live.com/*           ← Outlook Personal
https://outlook.office.com/*         ← Outlook 365
```

---

## Data Flow

### Primary flow — Inline compose toolbar (target UX)
```
User opens Reply in Gmail/Outlook
  ↓
content-script.js detects compose box → injects Replie toolbar above it
  ↓
User selects tone + clicks "Generate" in the toolbar
  ↓
chrome.runtime.sendMessage({ type: 'GENERATE_REPLY', data })
  ↓
background.js → makeAPIRequest() → POST https://api.replie.email/api/ai/generate-reply
  ↓
Express backend → aiController → openaiService → OpenAI API (gpt-3.5-turbo)
  ↓
Response back: background → content-script.js
  ↓
content-script.js injects reply text directly into compose box
```

### Popup
```
User clicks extension icon in Chrome toolbar
  ↓
Popup opens → shows: usage today (live counter), default tone, reply length
  (Login/account management will live here in Phase 3)
```

---

## Message Types

Defined in `constants.ts` — used for `chrome.runtime.sendMessage`:

```
GET_SETTINGS        Popup → Background
UPDATE_SETTINGS     Popup → Background
GENERATE_REPLY      Content Script (inline toolbar) → Background
SUMMARIZE_EMAIL     Content Script (inline toolbar) → Background
ANALYZE_SENTIMENT   Content Script (inline toolbar) → Background
INSERT_REPLY        Background → Content Script (injects into compose box)
PING                Health check
```

---

## Backend API Endpoints

Base URL: `http://localhost:3001` (dev) / `https://api.replie.email` (prod)

```
GET  /              → API info
GET  /health        → Health check
POST /api/ai/generate-reply    → { emailContent, tone?, customPrompt?, senderName?, length? }
POST /api/ai/summarize-email   → { emailContent }
POST /api/ai/detect-sentiment  → { emailContent }
```

### Request fields — generate-reply
```
emailContent   string   required  Raw email text (cleaned server-side before sending to model)
tone           string   optional  formal | casual | concise | persuasive (default: formal)
customPrompt   string   optional  Extra instructions appended to system prompt
senderName     string   optional  Extracted from Gmail DOM (.gD) — used in greeting
length         string   optional  short | medium | long (default: medium)
```

### Response Shapes
```typescript
// generate-reply
{ success: boolean, reply: string, metadata: { tone: string, timestamp: string } }

// summarize-email
{ success: boolean, summary: string, timestamp: string }

// detect-sentiment
{ success: boolean, analysis: string, timestamp: string }
// analysis is a JSON string: { sentiment, urgency, tone } — needs JSON.parse() on client
```

### AI Provider system
Controlled by `AI_PROVIDER` env var. All providers use the OpenAI SDK with different `baseURL`.

| Provider | Env value | Model | Notes |
|----------|-----------|-------|-------|
| OpenAI | `openai` | gpt-3.5-turbo | Default |
| DeepSeek | `deepseek` | deepseek-chat | Requires `DEEPSEEK_API_KEY` |
| Groq | `groq` | llama-3.3-70b-versatile | Free tier — upgraded from 8b-instant (too small, hallucinated names/gender) |

**`emailPrompts.js`** — shared module used by all providers:
- `cleanEmailContent()` — strips legal disclaimers, signatures, forward headers, URLs, Gmail truncation notices before sending to model
- `detectLanguage(text)` — uses `franc` to detect ISO 639-3 language code, maps to human-readable name (e.g. `spa` → `"Spanish"`)
- `buildReplyPrompt(tone, customPrompt, senderName, length, emailContent)` — instructs model it's the RECIPIENT replying, injects explicit language instruction (`"Write the entire reply in German"`), uses senderName in greeting, enforces length, explicitly forbids signing with a name
- `buildSummarizePrompt(emailContent)` — 3-5 bullet points, detects and responds in same language as email
- `buildSentimentPrompt()` — returns strict JSON `{ sentiment, urgency, tone }`

---

## Docker Setup (completed 2026-04-25)

Backend is fully Dockerized. Files created:
- `backend/Dockerfile` — multi-stage build, node:22-alpine, non-root user, HEALTHCHECK
- `backend/.dockerignore` — excludes node_modules, .env, logs
- `backend/.env.example` — documents required env vars
- `backend/docker-compose.yml` — local dev with hot-reload via nodemon

### Local development
```bash
cd backend
docker compose up          # hot-reload, reads .env
```

### Production build & test
```bash
cd backend
docker build -t ai-email-api .
docker run -p 3001:3001 --env-file .env ai-email-api
```

### Test endpoints locally
```bash
curl http://localhost:3001/health

curl -X POST http://localhost:3001/api/ai/generate-reply \
  -H "Content-Type: application/json" \
  -d '{"emailContent": "Hi, can we schedule a meeting?", "tone": "formal"}'

curl -X POST http://localhost:3001/api/ai/summarize-email \
  -H "Content-Type: application/json" \
  -d '{"emailContent": "Hi John, please review the Q3 budget by Friday. Thanks, Sarah"}'

curl -X POST http://localhost:3001/api/ai/detect-sentiment \
  -H "Content-Type: application/json" \
  -d '{"emailContent": "This is urgent! I need the report NOW."}'
```

### Deploy a producción (Digital Ocean Droplet)
El servidor corre la imagen pre-construida de `ghcr.io` — no hay código fuente en el servidor, solo:
- `/opt/replie/.env` — variables de entorno (nunca en git)
- `/opt/replie/docker-compose.prod.yml` — orquestación (sí en git, en `backend/`)
- `/opt/replie/Caddyfile` — reverse proxy con SSL

El workflow `backend.yml` de GitHub Actions:
1. Hace build del Dockerfile y sube la imagen a `ghcr.io`
2. Copia el `docker-compose.prod.yml` al servidor via SSH
3. Ejecuta `docker compose pull && docker compose up -d` en el servidor

### ⚠️ REGLA: Agregar una nueva variable de entorno

Cada vez que se agrega una nueva env var al backend hay que hacer **dos cosas**:

**1. Agregar la variable al `.env` del servidor** (SSH):
```bash
nano /opt/replie/.env
# Agregar: NUEVA_KEY=valor
```

**2. Exponerla en `docker-compose.prod.yml`** (localmente, luego commit):
```yaml
# backend/docker-compose.prod.yml → sección environment del servicio api:
- NUEVA_KEY=${NUEVA_KEY}
```

Luego hacer commit y push para disparar el deploy:
```bash
git add backend/docker-compose.prod.yml
git commit -m "fix: expose NUEVA_KEY to production container"
git push origin staging
```

> **Por qué:** El compose file usa `image:` (no `build:`), así que Docker no lee el `.env` automáticamente — cada variable debe estar explícitamente listada en `environment:`. Si solo se agrega al `.env` del servidor pero no al compose, el contenedor arranca sin esa variable.

### Variables de entorno actuales en producción
```bash
# /opt/replie/.env — todas deben estar en environment: del compose
NODE_ENV=production
PORT=3001
AI_PROVIDER=groq               # openai | deepseek | groq
OPENAI_API_KEY=sk-proj-...
DEEPSEEK_API_KEY=...
GROQ_API_KEY=gsk_...
CORS_ORIGIN=chrome-extension://...
GITHUB_REPO=fernastereo/ai-email-assistant
POSTGRES_DB=...
POSTGRES_USER=...
POSTGRES_PASSWORD=...
```

---

## Required Environment Variables

```bash
# backend/.env (never commit this file)
PORT=3001
NODE_ENV=production
OPENAI_API_KEY=sk-proj-...        # platform.openai.com/api-keys
CORS_ORIGIN=chrome-extension://   # set after publishing extension to get real ID
```

---

## Email Tones

Defined in `constants.ts → EMAIL_TONES`:
- `formal` — Professional and respectful
- `casual` — Friendly and relaxed
- `concise` — Straightforward
- `persuasive` — Convincing and motivating
- `urgent` — Urgent and important
- `aggressive` — Aggressive and direct

---

## Email Provider DOM Selectors

Defined in `constants.ts → EMAIL_PROVIDERS`:

**Gmail** (`mail.google.com`):
```
emailBody:    [role="listitem"] [dir="ltr"]
composeBox:   [role="textbox"][aria-label*="Mensaje"]
replyButton:  [role="button"][aria-label*="Responder"]
sendButton:   [role="button"][aria-label*="Enviar"]
```

**Outlook** (`outlook.live.com`, `outlook.office.com`):
```
emailBody:    [role="main"] [dir="ltr"]
composeBox:   [role="textbox"][aria-label*="Message body"]
replyButton:  [aria-label*="Reply"]
sendButton:   [aria-label*="Send"]
```

> WARNING: These selectors are version-dependent. Gmail/Outlook UI changes can break them.

---

## Chrome Storage Schema

Stored via `chrome.storage.local`:

```javascript
settings: {
  defaultTone: 'formal',        // tone used by inline toolbar
  defaultLength: 'medium',      // reply length: short | medium | long
  language: 'es',
  apiUrl: 'http://localhost:3001', // backend URL (dev). Change for prod
  autoDetectEmails: true,
  dailyLimit: 20,               // FREE_DAILY_LIMIT from background.js
}
usage: {
  requestsToday: number,        // resets daily
  lastReset: string             // toDateString() format
}
```

**Important:** `onInstalled` merges new keys into existing settings without overwriting `apiUrl` or other user-set values. Safe to reload the extension without losing settings.

---

## Usage Limits

```
FREE_DAILY:            20 requests/day  ← FREE_DAILY_LIMIT constant in background.js
PREMIUM_DAILY:        200 requests/day  ← future, when auth is added
MAX_EMAIL_LENGTH:    3000 characters    ← truncated in content-script.js before sending
```

- Enforced client-side in `background.js → checkDailyLimit()` before every API call
- Resets daily based on `toDateString()` comparison
- `dailyLimit` stored in `chrome.storage.local → settings` so popup reads it dynamically
- Not enforced server-side yet (Phase 2)

---

## UI Component System

Located in `extension/src/components/ui/`. All built with **Radix UI** + **Tailwind CSS** + **CVA**.

### Button Variants: `default | destructive | outline | secondary | ghost | link`
### Button Sizes: `default | sm | lg | icon`
### Badge Variants: `default | secondary | destructive | outline`

### CSS Custom Properties (light/dark)
```css
--primary, --primary-foreground
--secondary, --muted-foreground
--border, --ring, --background, --foreground
--ai-surface  (custom for the extension)
```

---

## Build System

### Vite Multi-Entry Config (`vite.config.ts`)
```
Input:
  main:    index.html      (popup only — sidepanel removed)

Output dir: dist/
Asset naming: assets/[name].js | assets/[name].[ext]
Path alias: @ → ./src
```

### NPM Scripts (extension)
```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build → dist/
npm run lint     # ESLint
npm run preview  # Preview dist
```

### NPM Scripts (backend)
```bash
npm run start        # node server.js (production)
npm run dev          # nodemon server.js (local without Docker)
npm run docker:build # docker build -t ai-email-api .
npm run docker:run   # docker run -p 3001:3001 --env-file .env ai-email-api
npm run docker:dev   # docker compose up (hot-reload)
```

---

## AI Integration Details

**Provider selection:** `AI_PROVIDER` env var → `aiService.js` factory
**Shared prompt logic:** `backend/src/services/emailPrompts.js`

| Setting | Value |
|---------|-------|
| OpenAI model | `gpt-3.5-turbo` |
| DeepSeek model | `deepseek-chat` |
| Groq model | `llama-3.3-70b-versatile` |
| Temperature (reply) | `0.7` |
| Temperature (summarize) | `0.5` |
| Temperature (sentiment) | `0.3` |
| Max tokens (reply) | `500` |
| Max tokens (summarize) | `400` |
| Max tokens (sentiment) | `100` |

### Prompt Strategy (`emailPrompts.js`)
- `cleanEmailContent()` strips legal disclaimers, signatures, forward headers, URLs, Gmail truncation (`[Mensaje acortado]`) before sending to model
- Reply prompt explicitly tells model it's the **RECIPIENT** responding, not the sender
- `senderName` from Gmail DOM injected directly into greeting instruction — no inference needed
- `length` maps to explicit word-count instruction: short (2-3 sentences), medium (1-2 paragraphs), long (3-4 paragraphs)
- Language detected server-side via `franc` — explicit instruction injected (`"Write the entire reply in German"`) instead of relying on model inference (small models ignore "respond in same language")
- Reply prompt explicitly forbids signing with a name or inferring recipient gender — small models hallucinate both

### Why `llama-3.1-8b-instant` was replaced
Groq's 8b model was unreliable with instruction following:
- Ignored "respond in same language" → always replied in Spanish
- Added a closing signature with an invented name
- Inferred recipient's gender incorrectly
Upgraded to `llama-3.3-70b-versatile` (also free on Groq) which follows instructions correctly.

---

## BLOCKERS — Things broken right now

### 1. ✅ FIXED — API endpoints mismatch in background.js
### 2. ✅ FIXED — Sidebar wired to real API
### 3. ✅ FIXED — Popup handlers implemented
### 4. ✅ FIXED — sidepanel.html script reference (Vite handles correctly)
### 5. ✅ FIXED — Usage tracking now fires only after successful API call
### 10. ✅ FIXED — Inline email toolbar implemented and working
### 11. ✅ FIXED — Language detection implemented via `franc` (server-side, explicit injection)
### 12. ✅ FIXED — Groq model upgraded to llama-3.3-70b-versatile (stops hallucinating signatures/gender)

### 6. CORS_ORIGIN is a placeholder
`backend/.env` has `CORS_ORIGIN=chrome-extension://your-extension-id`. Needs real extension ID (obtained after loading unpacked or publishing).

### 7. No extension icons
Manifest references `/icons/icon48.png` but the `/icons/` directory doesn't exist. Notifications will fail.

### 8. auth.js and reteLimiter.js are empty files
`backend/src/middlewares/auth.js` and `backend/src/utils/reteLimiter.js` — both 0 bytes.

### 9. detectSentiment returns raw string, not parsed JSON
`backend/src/services/openaiService.js` returns `completion.choices[0].message.content` directly. Client does `JSON.parse()` with a try/catch but no server-side validation if OpenAI returns malformed JSON.

### 13. franc not installed in production Docker image
`franc` was added to `package.json` but the production Docker image on DO has not been rebuilt yet. Run `docker compose build --no-cache && docker compose up -d` on the server, or push to trigger the GitHub Actions backend deploy.

---

## TECHNICAL DEBT

```
content-script.js      ← emailObserver — fixed: disconnect en beforeunload + extensión huérfana
content-script.js      ← .ii.gt selector is Gmail-specific; Outlook not yet supported
content-script.js      ← reply button selector includes Spanish aria-labels only (Responder)
No tests               ← jest configured but 0 test files exist
emailPrompts.js        ← franc minLength: 20 may misdetect very short emails (< 20 chars)
```

---

## WORK PLAN — Ordered by priority

### Infrastructure & CI/CD ✅ COMPLETED (2026-05-02)

| Status | Task |
|--------|------|
| ✅ | Dockerize backend (multi-stage, non-root, healthcheck) |
| ✅ | Add Caddy as reverse proxy container (SSL automático) |
| ✅ | Add PostgreSQL container |
| ✅ | Deploy backend to Digital Ocean Droplet ($12/mes, NY3) |
| ✅ | `api.replie.email` live with SSL via Let's Encrypt |
| ✅ | GitHub Actions — `landing.yml` (build + FTP deploy, path filter) |
| ✅ | GitHub Actions — `backend.yml` (build Docker + push ghcr.io + SSH deploy) |
| ✅ | Move workflows from `landing/.github` to repo root `.github` |
| ✅ | `workflow_dispatch` for manual deploys |

### Phase 1 — Extension core ✅ COMPLETED

| # | Status | Task | File(s) |
|---|--------|------|---------|
| 1 | ✅ | Fix API endpoint paths in background.js | `background.js` |
| 2 | ✅ | Remove sidepanel entirely | `manifest.json`, `vite.config.ts`, `background.js` |
| 3 | ✅ | Inline toolbar: detect email body via MutationObserver on `.ii.gt` | `content-script.js` |
| 4 | ✅ | Inline toolbar: one toolbar per `[data-message-id]` (threads + HTML emails) | `content-script.js` |
| 5 | ✅ | Inline toolbar: Generate Reply (opens compose + injects text) | `content-script.js` |
| 6 | ✅ | Inline toolbar: Summarize (shows result below toolbar) | `content-script.js` |
| 7 | ✅ | Inline toolbar: tone + length settings persisted via chrome.storage.local | `content-script.js` |
| 8 | ✅ | Redesign popup as settings/usage dashboard with live counter | `popup.tsx` |
| 9 | ✅ | Multi-provider AI backend (OpenAI / DeepSeek / Groq) via AI_PROVIDER | `aiService.js`, `*Service.js` |
| 10 | ✅ | Centralized prompt system with email cleaning + sender name + length control | `emailPrompts.js` |
| 11 | ✅ | Daily limit enforcement (FREE_DAILY_LIMIT=20) with safe settings merge on install | `background.js` |
| 12 | ✅ | Language detection via `franc` — explicit language injected into prompt | `emailPrompts.js` |
| 13 | ✅ | Upgrade Groq model to llama-3.3-70b-versatile | `groqService.js` |

### Phase 2 — Make it work well

| # | Status | Task | Notes |
|---|--------|------|-------|
| 1 | ✅ | Create extension icons (16, 48, 128px PNG) | `extension/public/icons/` |
| 2 | ✅ | Update CORS_ORIGIN with real extension ID | `.env` on server |
| 3 | ✅ | Rebuild production Docker image with franc | Triggered via GitHub Actions |
| 4 | ✅ | GitHub Actions — `extension.yml` (build + zip artifact) | `.github/workflows/extension.yml` |
| 5 | ✅ | Server-side rate limiting | `express-rate-limit` en `app.js` — 20 req/día por IP |
| 6 | ✅ | Validate detectSentiment JSON server-side | `aiController.js` — parse + valida campos + devuelve objeto |
| 7 | ✅ | Fix MutationObserver memory leak | `content-script.js` — disconnect en `beforeunload` y cuando el contexto de la extensión se invalida |
| 8 | ✅ | Error boundaries in React popup | `App.tsx` — ErrorBoundary class con fallback + botón Retry |

### Phase 2b — Landing page fixes (critical before real traffic)

| # | Status | Task | Notes |
|---|--------|------|-------|
| L1 | ✅ | Rotate Firebase API key | Firebase Console |
| L2 | ✅ | Configure Firestore security rules | Write-only from client — reglas en `landing/firestore.rules` |
| L3 | ⬜ | Integrate email service (Resend) | Confirmation emails not implemented |
| L4 | ✅ | Add GDPR cookie consent banner | `cookie-consent.tsx` + gateado en `App.tsx` con localStorage |
| L5 | ⬜ | Fix broken footer links (Twitter, GitHub, Help Center) | All `href="#"` |
| L6 | ✅ | Fix `TOAST_REMOVE_DELAY` bug (1000000ms → 5000ms) | `use-toast.ts` |
| L7 | ⬜ | Make "30+ early users" count dynamic from Firestore | `hero-section.tsx` |
| L8 | ⬜ | Replace `og:image` with own hosted image | `index.html` |

### Phase 3 — Monetization (after Phase 1 + 2)

| # | Status | Task | Notes |
|---|--------|------|-------|
| 17 | ⬜ | Authentication system | Clerk or Auth0 recommended |
| 18 | ⬜ | Database schema for users + usage | PostgreSQL already running on DO |
| 19 | ⬜ | Stripe payment integration | Freemium model |
| 20 | ⬜ | Rate limiting per plan tier | Backend middleware |
| 21 | ⬜ | Publish to Chrome Web Store | $5 one-time fee, 1-5 day review |
| 22 | ⬜ | Publish to Edge Add-ons | Free, same extension package |

### Phase 4 — Growth features

| Feature | Description |
|---------|-------------|
| Reply history | Save generated replies for reuse |
| Template system | Save custom prompts as reusable templates |
| Quick reply mode | 3 short options in one click (like iOS) |
| Full thread context | Send full conversation, not just last email |
| Attachment reading | Extract text from PDF/DOCX/XLSX attachments and include in AI context (see below) |
| Keyboard shortcuts | Alt+G generate, Alt+I insert |
| Onboarding tour | First-use tooltip walkthrough |
| Firefox Add-on | Same codebase, different manifest |
| Analytics dashboard | Usage stats, time saved metrics |

### Attachment Reading — Future Feature Design

**Feasibility:** Yes, possible via Gmail DOM + fetch with session cookies.

**Flow:**
```
content-script detects attachment link in Gmail DOM
  → fetch attachment URL (same-origin, uses Gmail session cookies)
  → POST binary to /api/ai/process-attachment
  → backend extracts text by file type
  → text prepended to emailContent before sending to model
```

**Backend libraries by type:**
| Type | Library | Notes |
|------|---------|-------|
| PDF | `pdf-parse` or `pdfjs-dist` | Easy |
| DOCX | `mammoth` | Easy |
| XLSX | `xlsx` | Easy |
| Images | GPT-4o / Claude vision | Requires multimodal model — extra cost |
| Other (zip, exe) | Not supported | Skip |

**Main constraint:** Large attachments (20-page PDF = ~50k tokens) blow past `max_tokens` and spike cost. Solution: summarize attachment text before passing to model, or truncate to first N characters.

**Implementation plan (when ready):**
1. Add `/api/ai/process-attachment` endpoint — accepts multipart file upload, returns extracted text
2. content-script: detect `.aQH` elements (Gmail attachment container), add "Include attachment" checkbox to toolbar
3. On generate: fetch attachment → POST to process-attachment → combine text with emailContent
4. Add per-attachment size limit (e.g. 50KB extracted text max)

---

## Monetization Strategy

### Recommended model: Freemium

**Free plan:**
- 20 responses/day
- Formal + casual tones
- Gmail only

**Pro plan (~$8/month):**
- 200 responses/day
- All tones + custom prompts
- Gmail + Outlook
- Reply templates
- Priority support

**Team plan (~$18/user/month):**
- Unlimited responses
- Shared templates
- Usage analytics per team
- CRM integration (HubSpot, Salesforce)

### Infrastructure cost at scale
```
Auth (Clerk):          ~$25/month
Database (Supabase):   free → $25/month
Payments (Stripe):     2.9% + $0.30/transaction
Backend (DO):          $5-12/month
Total base:            ~$55-62/month
Break-even at $8/mo:   ~8 paying users
```

---

## Chrome Web Store Requirements (when ready to publish)

- [ ] Developer account ($5 one-time)
- [ ] Icons: 16x16, 48x48, 128x128 PNG
- [ ] Screenshots: 1280x800 or 640x400 (min 1, max 5)
- [ ] Short description (max 132 characters)
- [ ] Privacy Policy (public URL — Notion or GitHub Pages works)
- [ ] Justify each permission in the submission form
- [ ] No unexplained minified code

---

## Known Issues & Technical Debt Summary

1. **Gmail-only** — `.ii.gt` selector is Gmail-specific; Outlook not yet supported
2. **Reply button selector** — uses Spanish aria-labels (`Responder`); may miss English Gmail
3. **MutationObserver leak** — `emailObserver` never disconnects
4. **No server-side rate limiting** — daily limit is soft, client-side only
5. **CORS set to `*` by default** — must restrict to extension origin in production
6. **No user authentication** — extension is anonymous
7. **No extension icons** — `extension/public/icons/` directory missing entirely
8. **detectSentiment not validated server-side** — model may return malformed JSON
9. **franc not in production image** — production backend will crash until Docker image is rebuilt

---

## Language Notes

- The extension UI is in **Spanish** (`language: 'es'` default)
- OpenAI prompts instruct the model to respond in the same language as the email
- Labels in sidebar: "ACCIONES DE IA", "RESPUESTA GENERADA", "EMAIL ANALIZADO"
- Error/success messages defined in `constants.ts → MESSAGES`

---

## Landing Page (Replie Marketing Site)

> Full analysis: `docs/landing-page-analysis.md`

**Location:** `/landing`
**Domain:** `replie.email`
**Deploy:** GitHub Actions → FTP (see `.github/workflows/deploy.yml`)

### Stack
React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Firebase (Firestore + Analytics) + i18next (EN/ES/DE-incomplete) + React Hook Form + Zod

### Purpose
Primary customer acquisition channel. Captures early adopters via waitlist with $1 USD deposit. Will evolve into full signup/payment/account management site.

### Sections
1. Header — nav, language selector (EN/ES), CTA
2. Hero — headline, CTAs, "30+ early users" social proof
3. Features — 6 feature cards
4. How It Works — 3 steps + demo video (language-aware: en/es)
5. Differentiation — value prop headline
6. Waitlist — signup form + pricing card ($1 USD deposit)
7. Footer — links, social, legal
8. `/thanks` — post-signup confirmation + referral CTA

### Waitlist & Payment Flow
```
Form (name + email) → Firestore (collection: waitlist)
→ PayPal payment ($1 USD) → PayerID in URL query params
→ /thanks page → updates Firestore with payment details
```

### Firestore Schema (collection: `waitlist`)
```javascript
{
  name, email,
  paymentStatus: 'pending' | 'completed',
  payerId, transactionId, amount: '1.00', currency: 'USD',
  createdAt, updatedAt
}
```

### Firebase Analytics Events
```
click_on_header_join_waitlist
click_on_hero_join_waitlist
click_on_hero_demo
click_join_waitlist
```
Only fires when `VITE_APP_ENV=production`.

### CRITICAL SECURITY ISSUES — Landing

1. **Firebase API key committed to `.env`** — rotate immediately in Firebase Console
2. **Firestore security rules unknown** — if open (dev default), anyone can read all waitlist data and payment info
3. **No GDPR/cookie consent** — collecting name + email + payment data without explicit consent; legal risk for EU/CA users
4. **PayerID in URL query string** — stays in browser history and server logs

### Known Bugs
- `TOAST_REMOVE_DELAY = 1000000` (~16 min) — should be ~5000ms
- `lang="en"` in HTML never updates when user switches language
- "Join 30+ early users" is static hardcoded text

### Broken Links (all `href="#"`)
- Footer: Twitter, GitHub, Help Center, Demo, Cookies
- `og:image` points to `lovable.dev` domain (external, fragile)
- `twitter:site` shows `@lovable_dev` instead of product account
- Support email `support@replie.email` domain status unverified

### Missing for Real Conversion
- Email service provider (Resend recommended) — confirmation emails not implemented
- Customer testimonials / social proof
- FAQ section
- Cookie consent banner
- Sitemap.xml + schema.org markup
- `hreflang` tags for multi-language SEO
- German translation is incomplete (only basic structure)
- Help Center page (mentioned in footer, doesn't exist)

### Landing Improvement Plan (ordered by priority)

**Immediate (before real traffic):**
1. Rotate Firebase API key
2. Set Firestore security rules (write-only from client, read only from backend)
3. Integrate email service — Resend (free up to 3k/month) for transactional emails
4. Add GDPR cookie consent banner
5. Fix broken footer links
6. Fix `TOAST_REMOVE_DELAY` bug

**High priority (week 1):**
7. Make "early users" count dynamic from Firestore
8. Add FAQ section with top 5 objections
9. Replace `og:image` with own hosted image
10. Fix `twitter:site` to product account
11. Update `lang` attribute dynamically on language switch
12. Complete German translation or remove from selector

**Conversion (week 2):**
13. Add testimonials section (even from beta users)
14. Add competitor comparison ("Why Replie vs Compose AI / ChatGPT")
15. Make refund guarantee more prominent
16. Add sitemap.xml + schema.org SoftwareApplication markup
17. Create basic Help Center page

**Medium term:**
18. Email nurturing sequence for waitlist (Resend + templates)
19. Functional referral system (real mechanism, not just text)
20. A/B test hero headline copy
21. Heatmap tracking (Hotjar or Microsoft Clarity — both free)
22. About / Team page for credibility

### Landing Environment Variables
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_APP_ENV=production
```
