# AI Email Assistant — Project Context for Claude

## Project Overview

Chrome Extension (Manifest V3) that integrates AI into Gmail and Outlook to provide smart reply generation, email summarization, and sentiment analysis. Powered by OpenAI's GPT-3.5-turbo via a Node.js/Express backend.

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
    └── src/
        ├── app.js                         # Express setup + middleware
        ├── routes/
        │   └── ai.js                      # API routes
        ├── controllers/
        │   └── aiController.js            # Request handlers
        └── services/
            └── opnaiService.js            # OpenAI SDK integration
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
| Node.js | - | Runtime |
| Express | 5.1.0 | HTTP server |
| OpenAI SDK | 5.23.1 | GPT-3.5-turbo calls |
| Helmet | 8.1.0 | Security headers |
| CORS | 2.8.5 | Cross-origin config |
| Morgan | 1.10.1 | Request logging |
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
https://ai-email-assistant.vercel.app/*  ← production API
```

---

## Data Flow

```
User clicks action (Popup or Sidebar)
  ↓
chrome.runtime.sendMessage({ type, data })
  ↓
background.js (Service Worker)
  → makeAPIRequest() → POST http://localhost:3001/api/ai/<action>
  ↓
Express backend
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

Base URL: `http://localhost:3001` (dev) or `https://ai-email-assistant.vercel.app` (prod)

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
// analysis is a JSON string: { sentiment, urgency, tone }
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

### NPM Scripts
```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build → dist/
npm run lint     # ESLint
npm run preview  # Preview dist
```

---

## OpenAI Integration Details

**Model:** `gpt-3.5-turbo`
**Temperature:** `0.7`
**Max tokens:** `500`
**File:** `backend/src/services/opnaiService.js` (note: typo in filename — `opnai`, not `openai`)

### System Prompt Strategy
- Language: responds in same language as the email (important: content is in Spanish by default)
- Tone injection: system prompt dynamically sets tone based on `tone` param
- Custom instructions appended to system prompt when `customPrompt` is provided

---

## Known Issues & Technical Debt

1. **Sidebar uses hardcoded mock data** — `sidebar/sidebar.tsx` simulates API with a 2-second setTimeout; not wired to real backend yet.
2. **DOM selector fragility** — Gmail/Outlook selectors break on UI updates.
3. **No server-side rate limiting** — daily limit is soft, tracked only in `chrome.storage.local`.
4. **Typo in service filename** — `opnaiService.js` (should be `openaiService.js`).
5. **CORS set to `*`** — Should be restricted to extension origin in production.
6. **No user authentication** — Extension is anonymous; no multi-device sync.
7. **OpenAI API key in `.env`** — Never commit this file.
8. **Commented-out code** — Some sections in content script and popup need cleanup.

---

## Development Priorities / Roadmap

- [ ] Wire sidebar to real backend API (replace mock setTimeout)
- [ ] Add options/settings page for user configuration
- [ ] Server-side rate limiting enforcement
- [ ] Template management system (save generated replies)
- [ ] Support additional email providers (Yahoo, ProtonMail)
- [ ] User authentication for multi-device sync
- [ ] Restrict CORS to extension origin
- [ ] Fix typo: rename `opnaiService.js` → `openaiService.js`
- [ ] Keyboard shortcuts
- [ ] Dark mode improvements

---

## Language Notes

- The extension UI is in **Spanish** (`language: 'es'` default)
- OpenAI prompts instruct the model to respond in the same language as the email
- Labels in sidebar: "ACCIONES DE IA", "RESPUESTA GENERADA", "EMAIL ANALIZADO"
- Error/success messages defined in `constants.ts → MESSAGES`
