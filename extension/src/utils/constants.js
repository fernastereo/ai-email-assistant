// constants.js - Constantes globales de la aplicación

// APIs y URLs
export const API_CONFIG = {
  DEVELOPMENT: 'http://localhost:3001/api',
  PRODUCTION: 'https://tu-dominio.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

// Tonos disponibles
export const EMAIL_TONES = {
  FORMAL: {
    id: 'formal',
    label: 'Formal',
    description: 'Profesional y respetuoso',
    icon: '📋'
  },
  CASUAL: {
    id: 'casual',
    label: 'Casual',
    description: 'Amigable y relajado',
    icon: '😊'
  },
  CONCISE: {
    id: 'concise',
    label: 'Conciso',
    description: 'Directo al grano',
    icon: '⚡'
  },
  PERSUASIVE: {
    id: 'persuasive',
    label: 'Persuasivo',
    description: 'Convincente y motivador',
    icon: '🎯'
  }
};

// Proveedores de email
export const EMAIL_PROVIDERS = {
  GMAIL: {
    id: 'gmail',
    name: 'Gmail',
    domains: ['mail.google.com'],
    selectors: {
      emailBody: '[role="listitem"] [dir="ltr"]',
      composeBox: '[role="textbox"][aria-label*="Mensaje"]',
      replyButton: '[role="button"][aria-label*="Responder"]',
      sendButton: '[role="button"][aria-label*="Enviar"]'
    }
  },
  OUTLOOK: {
    id: 'outlook',
    name: 'Outlook',
    domains: ['outlook.live.com', 'outlook.office.com'],
    selectors: {
      emailBody: '[role="main"] [dir="ltr"]',
      composeBox: '[role="textbox"][aria-label*="Message body"]',
      replyButton: '[aria-label*="Reply"]',
      sendButton: '[aria-label*="Send"]'
    }
  }
};

// Tipos de análisis
export const ANALYSIS_TYPES = {
  SENTIMENT: 'sentiment',
  URGENCY: 'urgency',
  TONE: 'tone',
  SUMMARY: 'summary'
};

// Estados de sentimiento
export const SENTIMENT_TYPES = {
  POSITIVE: { id: 'positive', label: 'Positivo', color: '#4CAF50', icon: '😊' },
  NEGATIVE: { id: 'negative', label: 'Negativo', color: '#F44336', icon: '😟' },
  NEUTRAL: { id: 'neutral', label: 'Neutral', color: '#9E9E9E', icon: '😐' }
};

// Niveles de urgencia
export const URGENCY_LEVELS = {
  HIGH: { id: 'high', label: 'Alta', color: '#F44336', icon: '🔴' },
  MEDIUM: { id: 'medium', label: 'Media', color: '#FF9800', icon: '🟡' },
  LOW: { id: 'low', label: 'Baja', color: '#4CAF50', icon: '🟢' }
};

// Límites de uso
export const USAGE_LIMITS = {
  FREE_DAILY: 20,
  PREMIUM_DAILY: 200,
  MAX_EMAIL_LENGTH: 5000,
  MAX_RESPONSE_LENGTH: 2000
};

// Mensajes del sistema
export const SYSTEM_MESSAGES = {
  ERRORS: {
    API_UNAVAILABLE: 'Servicio no disponible. Inténtalo más tarde.',
    RATE_LIMIT: 'Has alcanzado el límite diario. Actualiza tu plan.',
    INVALID_EMAIL: 'El contenido del email no es válido.',
    NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
    UNKNOWN_ERROR: 'Error inesperado. Reporta este problema.'
  },
  SUCCESS: {
    REPLY_GENERATED: 'Respuesta generada exitosamente',
    EMAIL_SUMMARIZED: 'Email resumido correctamente',
    SETTINGS_SAVED: 'Configuración guardada',
    COPIED_TO_CLIPBOARD: 'Copiado al portapapeles'
  },
  LOADING: {
    GENERATING_REPLY: 'Generando respuesta...',
    SUMMARIZING: 'Analizando email...',
    ANALYZING: 'Detectando sentimiento...',
    SAVING: 'Guardando...'
  }
};

// Configuración por defecto
export const DEFAULT_SETTINGS = {
  defaultTone: 'formal',
  language: 'es',
  autoDetectEmails: true,
  showSentimentAnalysis: true,
  showSummary: true,
  maxEmailLength: 5000,
  theme: 'light'
};

// Plantillas predefinidas
export const DEFAULT_TEMPLATES = {
  ACKNOWLEDGE: {
    id: 'acknowledge',
    name: 'Acuse de recibo',
    content: 'Gracias por tu email. He recibido tu mensaje y te responderé pronto.',
    tone: 'formal'
  },
  MEETING_REQUEST: {
    id: 'meeting',
    name: 'Solicitud de reunión',
    content: 'Gracias por contactarme. Me gustaría agendar una reunión para discutir esto más a detalle. ¿Cuándo te viene bien?',
    tone: 'formal'
  },
  FOLLOW_UP: {
    id: 'followup',
    name: 'Seguimiento',
    content: 'Espero que estés bien. Quería hacer un seguimiento sobre nuestro último intercambio.',
    tone: 'casual'
  },
  DECLINE_POLITELY: {
    id: 'decline',
    name: 'Declinar educadamente',
    content: 'Agradezco la oportunidad, pero no podré participar en este momento.',
    tone: 'formal'
  }
};

// Configuración de UI
export const UI_CONFIG = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  SIDEBAR_WIDTH: 400,
  ANIMATION_DURATION: 300,
  COLORS: {
    PRIMARY: '#4285F4',
    SECONDARY: '#34A853',
    WARNING: '#FBBC04',
    ERROR: '#EA4335',
    TEXT: '#202124',
    BACKGROUND: '#FFFFFF'
  }
};

// Eventos de mensaje
export const MESSAGE_TYPES = {
  // Popup to Background
  GET_SETTINGS: 'GET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  TRACK_USAGE: 'TRACK_USAGE',
  GENERATE_REPLY: 'GENERATE_REPLY',
  
  // Content Script to Background
  EMAIL_DETECTED: 'EMAIL_DETECTED',
  SIDEBAR_TOGGLE: 'SIDEBAR_TOGGLE',
  
  // Background to Content Script
  INJECT_SIDEBAR: 'INJECT_SIDEBAR',
  ANALYZE_EMAIL: 'ANALYZE_EMAIL',
  
  // Popup to Content Script
  GET_EMAIL_CONTENT: 'GET_EMAIL_CONTENT',
  INSERT_REPLY: 'INSERT_REPLY'
};

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_CONTENT: /^[\s\S]{10,5000}$/,
  PHONE: /(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/,
  URL: /(https?:\/\/[^\s]+)/g
};

export default {
  API_CONFIG,
  EMAIL_TONES,
  EMAIL_PROVIDERS,
  ANALYSIS_TYPES,
  SENTIMENT_TYPES,
  URGENCY_LEVELS,
  USAGE_LIMITS,
  SYSTEM_MESSAGES,
  DEFAULT_SETTINGS,
  DEFAULT_TEMPLATES,
  UI_CONFIG,
  MESSAGE_TYPES,
  PATTERNS
};