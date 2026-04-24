# AI Email Assistant Landing Page

A modern, responsive landing page for an AI-powered email assistant Chrome extension. Built with React, TypeScript, and Tailwind CSS, featuring multi-language support and a sleek, professional design.

## 🌟 Features

### Core Features
- **Smart Reply Generation**: Generate contextual responses instantly with AI that understands tone and intent
- **Tone Detection**: Automatically detect if emails are formal, casual, urgent, or positive/negative
- **Email Summarization**: Get key points from long emails in 3-5 sentences to save time
- **Style Customization**: Choose from formal, casual, concise, or persuasive writing styles
- **One-Click Responses**: Pre-generated quick replies for common email scenarios
- **Reply Only When Needed**: No confusing drafts cluttering your inbox - AI only generates responses when you ask

### Technical Features
- 🌐 **Multi-language Support**: English, Spanish, and German translations
- 📱 **Responsive Design**: Optimized for all device sizes
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and builds
- 🎨 **Modern UI**: Beautiful design with Tailwind CSS and custom animations
- 🔧 **TypeScript**: Full type safety and better developer experience
- 🎯 **Accessibility**: Built with accessibility best practices

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Internationalization**: i18next + react-i18next
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-mail-assistant-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── header.tsx       # Navigation header
│   ├── hero-section.tsx # Hero section with CTA
│   ├── features-section.tsx # Features showcase
│   ├── how-it-works.tsx # How it works section
│   ├── differentiation.tsx # Unique value proposition
│   ├── waitlist-section.tsx # Waitlist signup
│   └── footer.tsx       # Footer component
├── pages/               # Page components
│   ├── Index.tsx        # Main landing page
│   └── NotFound.tsx     # 404 page
├── lib/                 # Utility libraries
│   ├── i18n.ts         # Internationalization config
│   └── utils.ts        # Utility functions
├── hooks/               # Custom React hooks
├── assets/              # Static assets
└── main.tsx            # Application entry point
```

## 🌍 Internationalization

The project supports multiple languages:
- **English** (default)
- **Spanish** 

Translation files are located in `public/locales/{language}/translation.json`

### Adding a New Language

1. Create a new directory in `public/locales/`
2. Add a `translation.json` file with translated content
3. Update the `supportedLngs` array in `src/lib/i18n.ts`

## 🎨 Customization

### Colors and Themes
The project uses CSS custom properties for theming. Main colors are defined in `src/index.css`:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --accent: 210 40% 96%;
  /* ... more color definitions */
}
```

### Animations
Custom animations are defined in `tailwind.config.ts`:
- `float`: Floating animation for elements
- `pulse-glow`: Pulsing glow effect
- `accordion-down/up`: Accordion animations

## 📱 Responsive Design

The landing page is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Configuration

### Vite Configuration
- Development server runs on port 8080
- Path aliases configured for `@/` pointing to `src/`
- React SWC plugin for fast compilation

### Tailwind Configuration
- Custom color palette
- Custom animations and keyframes
- Extended spacing and sizing utilities
- Custom gradient backgrounds

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email to support@replie.email

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

---

# AI Email Assistant Landing Page (Español)

Una página de destino moderna y responsiva para una extensión de Chrome de asistente de correo electrónico con IA. Construida con React, TypeScript y Tailwind CSS, con soporte multiidioma y un diseño elegante y profesional.

## 🌟 Características

### Características Principales
- **Generación de Respuestas Inteligentes**: Genera respuestas contextuales instantáneas con IA que entiende el tono y el propósito
- **Detección de Tono**: Detecta automáticamente si los correos electrónicos son formales, casuales, urgentes o positivos/negativos
- **Resumen de Correos Electrónicos**: Obtén los puntos clave de correos electrónicos largos en 3-5 oraciones para ahorrar tiempo
- **Personalización de Estilo**: Elige entre estilos de escritura formal, casual, conciso o persuasivo
- **Respuestas de Un Solo Clic**: Respuestas pregeneradas para escenarios y preguntas comunes de correo electrónico
- **Respuestas Solo Cuando las Necesitas**: No confusos borradores que saturen tu bandeja de entrada - la IA solo genera respuestas cuando las pides

### Características Técnicas
- 🌐 **Soporte Multiidioma**: Traducciones en inglés, español y alemán
- 📱 **Diseño Responsivo**: Optimizado para todos los tamaños de dispositivo
- ⚡ **Rendimiento Rápido**: Construido con Vite para desarrollo y builds ultrarrápidos
- 🎨 **UI Moderna**: Diseño hermoso con Tailwind CSS y animaciones personalizadas
- 🔧 **TypeScript**: Seguridad de tipos completa y mejor experiencia de desarrollador
- 🎯 **Accesibilidad**: Construido con mejores prácticas de accesibilidad

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Herramienta de Build**: Vite
- **Estilos**: Tailwind CSS
- **Componentes UI**: Radix UI + shadcn/ui
- **Internacionalización**: i18next + react-i18next
- **Iconos**: Lucide React
- **Formularios**: React Hook Form + validación Zod
- **Gestión de Estado**: TanStack Query
- **Enrutamiento**: React Router DOM

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd ai-mail-assistant-landing
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

4. **Abre tu navegador**
   Navega a `http://localhost:8080`

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run build:dev` - Construye para desarrollo
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta ESLint

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes UI reutilizables (shadcn/ui)
│   ├── header.tsx       # Encabezado de navegación
│   ├── hero-section.tsx # Sección hero con CTA
│   ├── features-section.tsx # Muestra de características
│   ├── how-it-works.tsx # Sección cómo funciona
│   ├── differentiation.tsx # Propuesta de valor única
│   ├── waitlist-section.tsx # Registro en lista de espera
│   └── footer.tsx       # Componente de pie de página
├── pages/               # Componentes de página
│   ├── Index.tsx        # Página principal de destino
│   └── NotFound.tsx     # Página 404
├── lib/                 # Bibliotecas de utilidades
│   ├── i18n.ts         # Configuración de internacionalización
│   └── utils.ts        # Funciones de utilidad
├── hooks/               # Hooks personalizados de React
├── assets/              # Recursos estáticos
└── main.tsx            # Punto de entrada de la aplicación
```

## 🌍 Internacionalización

El proyecto soporta múltiples idiomas:
- **Inglés** (por defecto)
- **Español**

Los archivos de traducción se encuentran en `public/locales/{idioma}/translation.json`

### Agregar un Nuevo Idioma

1. Crea un nuevo directorio en `public/locales/`
2. Agrega un archivo `translation.json` con el contenido traducido
3. Actualiza el array `supportedLngs` en `src/lib/i18n.ts`

## 🎨 Personalización

### Colores y Temas
El proyecto usa propiedades CSS personalizadas para temas. Los colores principales se definen en `src/index.css`:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --accent: 210 40% 96%;
  /* ... más definiciones de color */
}
```

### Animaciones
Las animaciones personalizadas se definen en `tailwind.config.ts`:
- `float`: Animación flotante para elementos
- `pulse-glow`: Efecto de resplandor pulsante
- `accordion-down/up`: Animaciones de acordeón

## 📱 Diseño Responsivo

La página de destino es completamente responsiva con puntos de quiebre:
- **Móvil**: < 768px
- **Tablet**: 768px - 1024px
- **Escritorio**: > 1024px

## 🔧 Configuración

### Configuración de Vite
- El servidor de desarrollo corre en el puerto 8080
- Alias de rutas configurados para `@/` apuntando a `src/`
- Plugin React SWC para compilación rápida

### Configuración de Tailwind
- Paleta de colores personalizada
- Animaciones y keyframes personalizados
- Utilidades de espaciado y tamaño extendidas
- Fondos de gradiente personalizados

## 🚀 Despliegue

### Construir para Producción
```bash
npm run build
```

La salida de construcción estará en el directorio `dist/`.

### Desplegar en Vercel
1. Conecta tu repositorio a Vercel
2. Establece comando de build: `npm run build`
3. Establece directorio de salida: `dist`
4. ¡Despliega!

### Desplegar en Netlify
1. Conecta tu repositorio a Netlify
2. Establece comando de build: `npm run build`
3. Establece directorio de publicación: `dist`
4. ¡Despliega!

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama de característica: `git checkout -b feature/caracteristica-increible`
3. Confirma tus cambios: `git commit -m 'Agrega característica increíble'`
4. Envía a la rama: `git push origin feature/caracteristica-increible`
5. Abre una Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte, envía un email a support@replie.email

---

**Construido con ❤️ usando React, TypeScript y Tailwind CSS**
