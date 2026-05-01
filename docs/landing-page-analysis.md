# Landing Page (Replie) — Análisis Completo

## Stack tecnológico

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool |
| Tailwind CSS | 3.4.17 | Estilos |
| shadcn/ui | 50+ componentes | UI library |
| React Router DOM | 6.30.1 | Routing |
| React Hook Form + Zod | 7.61.1 / 3.25.76 | Formularios + validación |
| Firebase | 12.3.0 | Firestore (DB) + Analytics |
| i18next | 25.5.2 | Internacionalización |
| TanStack Query | 5.83.0 | Estado del servidor |

---

## Estructura de archivos

```
landing/
├── src/
│   ├── App.tsx                    # Routing principal
│   ├── pages/
│   │   ├── Index.tsx              # Landing page principal
│   │   ├── Thanks.tsx             # Página post-registro
│   │   └── NotFound.tsx           # 404
│   ├── components/
│   │   ├── header.tsx             # Nav fija con menú mobile
│   │   ├── hero-section.tsx       # Hero con CTAs
│   │   ├── features-section.tsx   # Grid de 6 features
│   │   ├── how-it-works.tsx       # 3 pasos + video demo
│   │   ├── differentiation.tsx    # Propuesta de valor
│   │   ├── waitlist-section.tsx   # Formulario + pricing card
│   │   ├── footer.tsx             # Footer con links
│   │   └── ui/                    # 50 componentes shadcn
│   ├── services/
│   │   └── waitlistService.ts     # Operaciones Firestore
│   └── lib/
│       ├── firebaseConfig.ts      # Firebase init + Analytics
│       └── i18n.ts                # Configuración i18next
├── public/
│   ├── locales/{en|es|de}/        # Traducciones (DE incompleto)
│   ├── videos/
│   │   ├── ai_email_assistant_en.mp4
│   │   └── ai_email_assistant_es.mp4
│   └── docs/privacy-policy.pdf
└── .github/workflows/deploy.yml   # CI/CD via FTP
```

---

## Secciones de la landing

1. **Header** — Nav fija, links a secciones, selector de idioma (EN/ES), CTA al waitlist
2. **Hero** — Headline, CTAs ("Join Now!!", "See Demo"), social proof "Join 30+ early users", ilustración animada
3. **Features** — Grid 3 columnas, 6 cards: Smart Reply, Tone Detection, Summarization, Style, Conditional Replies, One-Click
4. **How It Works** — 3 pasos numerados + video demo con cambio de idioma (EN/ES)
5. **Differentiation** — Headline corto de propuesta de valor
6. **Waitlist** — Formulario (nombre + email) + pricing card + checklist de 8 beneficios
7. **Footer** — 4 columnas: Brand, Product, Support, Connect
8. **Thanks** (/thanks) — Confirmación post-registro, pasos siguientes, sección referral

---

## Formulario y base de datos

### Flujo del formulario
```
Nombre + Email → validación → WaitlistService.saveUser() → Firestore
```

### Schema en Firestore (colección `waitlist`)
```javascript
{
  name: string,
  email: string,
  paymentStatus: 'pending' | 'completed',
  payerId: string,         // de PayPal
  transactionId: string,
  amount: '1.00',
  currency: 'USD',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Validación actual
```javascript
// Email regex — demasiado permisivo
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Pago
- $1 USD como depósito de waitlist (totalmente reembolsable)
- Integración con **PayPal** (inferido del manejo de `PayerID` en URL)
- Thanks page procesa el `PayerID` desde query params

---

## Internacionalización

| Idioma | Estado |
|--------|--------|
| Inglés (en) | Completo |
| Español (es) | Completo |
| Alemán (de) | Incompleto — solo estructura básica |

El idioma no actualiza el atributo `lang` del HTML dinámicamente (siempre es `lang="en"`).

---

## Analytics implementado

```javascript
// Eventos trackeados (solo en producción)
click_on_header_join_waitlist
click_on_hero_join_waitlist
click_on_hero_demo
click_join_waitlist
```

Controlado por `VITE_APP_ENV=production`. Firebase Analytics integrado.

---

## Pricing actual

**Un solo tier: "Early Access"**
- $1 USD depósito (cubre 1 año de uso)
- Precio esperado al lanzar: $10/mes
- Depósito totalmente reembolsable
- Referral: +1 mes por amigo referido (ilimitado)
- $10 USD en créditos al launch

---

## BLOQUEADORES CRÍTICOS (seguridad)

### 1. Firebase API key expuesta en `.env` del repo
```
VITE_FIREBASE_API_KEY=AIzaSyC5vixA25E9tbJlq06xJhwJ3TDIgZdfma8
```
**Acción inmediata:** Rotar esta key en Firebase Console → Project Settings → API Keys.
Aunque las keys de Firebase en el cliente son parcialmente públicas por diseño, sin reglas de Firestore correctas cualquiera puede leer/escribir la base de datos.

### 2. Reglas de Firestore desconocidas
No hay evidencia de reglas de seguridad configuradas. Si están en modo por defecto abierto (durante desarrollo), **cualquier persona puede leer toda la lista de waitlist y datos de pago**.

**Reglas mínimas necesarias:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /waitlist/{docId} {
      allow create: if request.resource.data.email is string
                    && request.resource.data.name is string;
      allow read: if false;   // solo backend puede leer
      allow update, delete: if false;
    }
  }
}
```

### 3. Sin GDPR/Consent
- No hay cookie banner
- No hay mecanismo de opt-in para analytics
- Almacena nombre + email + datos de pago sin consent explícito
- Riesgo legal si usuarios son de la UE o California

### 4. PayerID viaja en URL (query string)
```
/thanks?PayerID=XXXX&transactionId=YYYY
```
Queda en historial del navegador y logs del servidor. Usar POST o almacenarlo solo server-side.

---

## PROBLEMAS ENCONTRADOS

### Links rotos / placeholders
| Elemento | Problema |
|----------|---------|
| Footer → Twitter | `href="#"` — sin URL real |
| Footer → GitHub | `href="#"` — sin URL real |
| Footer → Help Center | `href="#"` — página no existe |
| Footer → Demo | `href="#"` — sin destino |
| Footer → Cookies | `href="#"` — política no existe |
| og:image | Apunta a `lovable.dev/opengraph-image-p98pqg.png` — dominio externo, frágil |
| twitter:site | `@lovable_dev` en vez de cuenta del producto |

### Contenido hardcoded que debería ser dinámico
- `"Join 30+ early users"` — número estático, no se actualiza con conteo real de Firestore
- Contador de usuarios en hero podría ser dinámico fácilmente

### Bug: TOAST_REMOVE_DELAY
```javascript
const TOAST_REMOVE_DELAY = 1000000  // ~16 minutos — claramente un bug
```
Debería ser ~5000 (5 segundos).

### Traducción alemana incompleta
`public/locales/de/translation.json` tiene solo la estructura básica. Si alguien navega con browser en alemán, verá keys sin traducir.

### HTML `lang` no se actualiza al cambiar idioma
```html
<html lang="en">  <!-- siempre "en" aunque el usuario cambie a español -->
```
Afecta accesibilidad y SEO.

---

## FALTANTES PARA CONVERTIR BIEN

### Prueba social y credibilidad
- Sin testimonios de usuarios reales
- Sin logos de empresas que usan el producto
- Sin calificaciones / reseñas
- Sin fotos/bios del equipo fundador
- "30+ early users" estático

### Manejo de objeciones
- Sin sección FAQ
- Sin comparación con alternativas (ChatGPT, Compose AI, etc.)
- Sin detalles de privacidad de datos ("¿mis emails se almacenan?")
- Sin garantía de reembolso prominente

### Urgencia y conversión
- Sin contador de spots disponibles
- Sin countdown timer
- Sin testimonios de usuarios en waitlist

### Infraestructura de email
- No hay integración con ESP (Mailchimp, ConvertKit, Resend, Brevo, etc.)
- El "confirmation email" mencionado en Thanks page no tiene implementación visible
- Sin secuencia de nurturing para waitlist

### Páginas faltantes
- Help Center (mencionado en footer, no existe)
- FAQ
- About / Equipo
- Changelog / Roadmap
- Política de cookies

### SEO faltante
- Sin `sitemap.xml`
- Sin schema.org (Product, FAQ, Organization, SoftwareApplication)
- Sin `hreflang` para versiones multi-idioma
- Sin canonical tags
- Sin preload/prefetch hints

### Accesibilidad
- `aria-expanded` y `aria-label` faltantes en menú mobile
- Links sociales en footer solo tienen ícono, sin texto alternativo
- Elementos decorativos animados sin `aria-hidden="true"`
- No respeta `prefers-reduced-motion`
- Errores de formulario via toast en vez de `aria-describedby`

---

## PLAN DE MEJORAS (ordenado por impacto)

### Inmediato (antes de recibir tráfico real)
1. Rotar Firebase API key
2. Configurar reglas de seguridad en Firestore
3. Integrar ESP para emails transaccionales (Resend recomendado — gratis hasta 3k/mes)
4. Agregar cookie consent banner (GDPR)
5. Corregir links rotos del footer
6. Fix bug `TOAST_REMOVE_DELAY`

### Alta prioridad (primera semana)
7. Conectar contador de "early users" a Firestore en tiempo real
8. Agregar sección FAQ (responde las 5 objeciones principales)
9. Actualizar og:image a imagen propia (no depender de lovable.dev)
10. Corregir `twitter:site` a cuenta del producto
11. Agregar `lang` dinámico en el `<html>` al cambiar idioma
12. Completar traducción alemana o eliminarla del selector

### Conversión (segunda semana)
13. Agregar sección de testimonios (aunque sean de usuarios beta)
14. Agregar sección "¿Por qué Replie?" con comparación
15. Agregar garantía de reembolso más prominente
16. FAQ con acordeón en la landing
17. Añadir sitemap.xml + schema.org SoftwareApplication
18. Crear página de Help Center básica

### Mediano plazo
19. Implementar secuencia de email nurturing para waitlist (Resend + templates)
20. Referral system funcional (mecanismo real, no solo texto)
21. A/B testing en headline del hero
22. Hotjar o Microsoft Clarity para heatmaps
23. Página "About / Equipo" para credibilidad
24. Testimonios dinámicos desde base de datos

---

## Deployment actual

CI/CD via GitHub Actions → FTP (`/.github/workflows/deploy.yml`)
Dominio objetivo: `replie.email`

---

## Variables de entorno requeridas (landing)

```bash
# landing/.env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_APP_ENV=production   # controla si se logea analytics
```
