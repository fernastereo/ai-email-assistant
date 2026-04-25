# AI Email Assistant — Project Context for Claude

## Project Overview

Chrome Extension (Manifest V3) that integrates AI into Gmail and Outlook to provide smart reply generation, email summarization, and sentiment analysis. Powered by OpenAI's GPT-3.5-turbo via a Node.js/Express backend.

**Current status (2026-04-25):** Backend is Dockerized and ready for deploy. Extension frontend is mostly UI-only — core functionality not yet wired to real API. Active development phase.

---

## Repository Structure

```
ai-email-assistant/
├── extension/          # Chrome extension (React + TypeScript + Vite)
│   ├── public/
│   │   ├── manifest.json                  # Extension manifest (MV3)
│   │   └── static/js/
│   │       ├── background.js              # Service worker (raw JS)
│   │       └── content-script.js         # Content script (raw JS)
│   ├── src/
│   │   ├── main.tsx                       # Popup entry point
│   │   ├── sidebar.tsx                    # Sidebar entry point
│   │   ├── App.tsx                        # Root popup component
│   │   ├── components/
│   │   │   ├── popup.tsx                  # Popup UI
│   │   │   ├── sidebar/
│   │   │   │   └── sidebar.tsx            # Sidebar UI
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
│   ├── sidepanel.html                     # Sidebar HTML entry
│   └── vite.config.ts                     # Multi-entry Vite build config
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
        │   └── opnaiService.js            # OpenAI SDK integration (note: typo in filename)
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
| OpenAI SDK | 5.23.1 | GPT-3.5-turbo calls |
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
| Popup | `index.html` → `main.tsx` → `App.tsx` → `popup.tsx` | Main action popup (380px card) |
| Sidebar | `sidepanel.html` → `sidebar.tsx` → `sidebar/sidebar.tsx` | Side panel in Gmail/Outlook |
| Service Worker | `static/js/background.js` | Background logic, API orchestration |
| Content Script | `static/js/content-script.js` | DOM interaction on mail sites |

### Chrome Permissions
```
contextMenus, tabs, sidePanel, activeTab, storage, scripting, notifications
```

### Host Permissions
```
http://localhost:3001/*              ← local backend
https://mail.google.com/*           ← Gmail
https://outlook.live.com/*          ← Outlook Personal
https://outlook.office.com/*        ← Outlook 365
https://ai-email-assistant.vercel.app/*  ← placeholder, update with real DO URL
```

---

## Data Flow

```
User clicks action (Popup or Sidebar)
  ↓
chrome.runtime.sendMessage({ type, data })
  ↓
background.js (Service Worker)
  → makeAPIRequest() → POST https://<backend-url>/api/ai/<action>
  ↓
Express backend (Docker container on Digital Ocean)
  → aiController → openaiService → OpenAI API (gpt-3.5-turbo)
  ↓
Response back: background → popup/sidebar
  ↓
User can Copy | Insert | Regenerate
  ↓
If Insert: background sends INSERT_REPLY → content-script.js
  → Finds compose box (Gmail/Outlook) → injects text
```

---

## Message Types

Defined in `constants.ts` — used for `chrome.runtime.sendMessage`:

```
GET_SETTINGS        Popup → Background
UPDATE_SETTINGS     Popup → Background
TRACK_USAGE         Popup → Background
GENERATE_REPLY      Popup/Sidebar → Background
EMAIL_DETECTED      Content Script → Background
SIDEBAR_TOGGLE      Content Script → Background
INJECT_SIDEBAR      Background → Content Script
ANALYZE_EMAIL       Background → Content Script
GET_EMAIL_CONTENT   Popup → Content Script
INSERT_REPLY        Popup/Sidebar → Content Script
OPEN_SIDE_PANEL     Content Script (robot button) → Background
PING                Health check
```

---

## Backend API Endpoints

Base URL: `http://localhost:3001` (dev) — Digital Ocean App Platform (prod, not deployed yet)

```
GET  /              → API info
GET  /health        → Health check
POST /api/ai/generate-reply    → { emailContent, tone?, customPrompt? }
POST /api/ai/summarize-email   → { emailContent }
POST /api/ai/detect-sentiment  → { emailContent }
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

### Deploy to Digital Ocean App Platform
```
1. Push repo to GitHub
2. DO Dashboard → App Platform → Create App
3. Connect GitHub repo → Source directory: /backend
4. DO detects Dockerfile automatically
5. Set env vars: OPENAI_API_KEY, NODE_ENV=production, CORS_ORIGIN=chrome-extension://<id>
6. Deploy → auto-deploys on every git push
Cost: ~$5/month (Basic plan)
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
  defaultTone: 'formal',
  language: 'es',
  apiUrl: 'http://localhost:3001/api',
  autoDetectEmails: true,
  showSentimentAnalysis: true,
  showSummary: true,
  theme: 'light'
}
usage: {
  requestsToday: number,
  lastReset: string  // ISO date string
}
```

---

## Usage Limits

```
FREE_DAILY:            20 requests/day
PREMIUM_DAILY:        200 requests/day
MAX_EMAIL_LENGTH:    5000 characters
MAX_RESPONSE_LENGTH: 2000 characters
```

Rate limiting is tracked client-side in `chrome.storage.local`. Not enforced server-side yet.

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
  main:    index.html      (popup)
  sidebar: sidepanel.html  (side panel)

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

## OpenAI Integration Details

**Model:** `gpt-3.5-turbo`
**Temperature:** `0.7`
**Max tokens:** `500`
**File:** `backend/src/services/opnaiService.js` (note: typo in filename — `opnai`, not `openai`)

### System Prompt Strategy
- Language: responds in same language as the email
- Tone injection: system prompt dynamically sets tone based on `tone` param
- Custom instructions appended to system prompt when `customPrompt` is provided

---

## BLOCKERS — Things broken right now

These are the critical issues preventing end-to-end functionality. Must be fixed before the extension works:

### 1. API endpoints mismatch (background.js calls wrong paths)
```
background.js calls:     /ai/generate-reply        → should be /api/ai/generate-reply
background.js calls:     /ai/summarize             → should be /api/ai/summarize-email
background.js calls:     /ai/analyze-sentiment     → should be /api/ai/detect-sentiment
```
**File to fix:** `extension/public/static/js/background.js`

### 2. Sidebar uses mock data — never calls real API
`extension/src/components/sidebar/sidebar.tsx` — `handleGenerateResponse` uses `setTimeout` with hardcoded string. All real API integration code is commented out.
**File to fix:** `extension/src/components/sidebar/sidebar.tsx`

### 3. Popup has no functionality — all handlers commented out
`extension/src/components/popup.tsx` — buttons have no onClick handlers.
**File to fix:** `extension/src/components/popup.tsx`

### 4. sidepanel.html points to .tsx source instead of built output
```html
<script src="/src/sidebar.tsx"></script>  ← wrong, sidebar won't load
```
**File to fix:** `extension/sidepanel.html`

### 5. CORS_ORIGIN is a placeholder
`backend/.env` has `CORS_ORIGIN=chrome-extension://your-extension-id`. Needs real extension ID (obtained after publishing to Chrome Web Store or loading unpacked).

### 6. Copy and Insert buttons have no onClick handlers
`extension/src/components/sidebar/sidebar.tsx` — both buttons render but do nothing.

### 7. No extension icons
Manifest and background.js reference `/icons/icon48.png` but the `/icons/` directory doesn't exist. Notifications will fail.

### 8. auth.js and reteLimiter.js are empty files
`backend/src/middlewares/auth.js` and `backend/src/utils/reteLimiter.js` — both 0 bytes.

### 9. detectSentiment returns raw string, not parsed JSON
`backend/src/services/opnaiService.js` returns `completion.choices[0].message.content` directly. Client needs to `JSON.parse()` it — no validation if OpenAI returns malformed JSON.

### 10. Usage tracking fires before API call succeeds
In `background.js`, `trackUsage()` is called before the API response — if the call fails, the usage is still counted.

---

## TECHNICAL DEBT

```
opnaiService.js        ← typo in filename (opnai vs openai)
content-script.js:387  ← 'Replie' instead of 'Reply'
sidebar.tsx            ← commented-out imports, dead code
popup.tsx              ← all handlers commented out
background.js          ← trackUsage() fires before confirming success
content-script.js      ← MutationObserver never disconnects (memory leak)
content-script.js      ← DOM selectors hardcoded, break on Gmail/Outlook updates
No tests               ← jest configured but 0 test files exist
```

---

## WORK PLAN — Ordered by priority

### Phase 1 — Make it work end-to-end (next sessions)

| # | Task | File(s) |
|---|------|---------|
| 1 | Fix API endpoint paths in background.js | `background.js` |
| 2 | Fix sidepanel.html script reference | `sidepanel.html` |
| 3 | Wire sidebar to real API (replace mock setTimeout) | `sidebar/sidebar.tsx` |
| 4 | Implement popup button handlers | `popup.tsx` |
| 5 | Implement Copy + Insert button handlers in sidebar | `sidebar/sidebar.tsx` |
| 6 | Create extension icons (16, 48, 128px PNG) | `extension/public/icons/` |
| 7 | Deploy backend to Digital Ocean App Platform | Docker + DO |
| 8 | Get real extension ID → update CORS_ORIGIN | `.env` on server |

### Phase 2 — Make it work well

| # | Task | Notes |
|---|------|-------|
| 9 | Options/settings page | `options.html` + chrome.storage wiring |
| 10 | Server-side rate limiting | `express-rate-limit` in backend |
| 11 | Parse + validate detectSentiment JSON response | `opnaiService.js` + controller |
| 12 | Error boundaries in React | Prevent full crash on JS error |
| 13 | Retry logic in ApiService | Currently fails on first error |
| 14 | Fix MutationObserver memory leak | `content-script.js` |
| 15 | Persist tone/settings across sessions | `chrome.storage.local` integration |
| 16 | Real usage count shown in sidebar UI | Wire to background.js storage |

### Phase 3 — Monetization (after Phase 1 + 2)

| # | Task | Notes |
|---|------|-------|
| 17 | Authentication system | Clerk or Auth0 recommended |
| 18 | Database for users + usage | Supabase (PostgreSQL) |
| 19 | Stripe payment integration | Freemium model |
| 20 | Rate limiting per plan tier | Backend middleware |
| 21 | Publish to Chrome Web Store | $5 one-time fee, 1-5 day review |
| 22 | Publish to Edge Add-ons | Free, same extension package |

### Phase 4 — Growth features

| Feature | Description |
|---------|-------------|
| Reply history | Save generated replies for reuse |
| Template system | Save custom prompts as reusable templates |
| Quick reply mode | 3 short options in one click (like iOS) |
| Auto-detect email language | Already partially in prompts, needs UI |
| Full thread context | Send full conversation, not just last email |
| Keyboard shortcuts | Alt+G generate, Alt+I insert |
| Onboarding tour | First-use tooltip walkthrough |
| Firefox Add-on | Same codebase, different manifest |
| Analytics dashboard | Usage stats, time saved metrics |

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

1. **Sidebar uses hardcoded mock data** — not wired to real backend
2. **DOM selector fragility** — Gmail/Outlook selectors break on UI updates
3. **No server-side rate limiting** — daily limit is soft, client-side only
4. **Typo in service filename** — `opnaiService.js` (should be `openaiService.js`)
5. **CORS set to `*` by default** — must restrict to extension origin in production
6. **No user authentication** — extension is anonymous
7. **Popup buttons non-functional** — all handlers commented out
8. **sidepanel.html broken** — points to .tsx source file
9. **No extension icons** — directory missing entirely
10. **detectSentiment not JSON-parsed** — raw string returned to client

---

## Language Notes

- The extension UI is in **Spanish** (`language: 'es'` default)
- OpenAI prompts instruct the model to respond in the same language as the email
- Labels in sidebar: "ACCIONES DE IA", "RESPUESTA GENERADA", "EMAIL ANALIZADO"
- Error/success messages defined in `constants.ts → MESSAGES`
