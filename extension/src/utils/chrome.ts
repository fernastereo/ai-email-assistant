// chrome.ts - Utilidades para APIs de Chrome Extension

// Tipos para mensajes
export type MessageType = 
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'TRACK_USAGE'
  | 'GENERATE_REPLY'
  | 'SUMMARIZE_EMAIL'
  | 'ANALYZE_SENTIMENT'
  | 'OPEN_OPTIONS'
  | 'GET_EMAIL_CONTENT'
  | 'INSERT_REPLY'
  | 'PING'
  | 'CLOSE_SIDEBAR';

export interface ChromeMessage {
  type: MessageType;
  data?: Record<string, string | number | boolean>;
  settings?: Settings;
  reply?: string;
  emailContent?: string;
  tone?: string;
  customPrompt?: string;
}

export interface ChromeResponse {
  success: boolean;
  error?: string;
  settings?: Settings;
  usage?: Usage;
  content?: string;
  provider?: string;
  hasContent?: boolean;
  reply?: string;
  summary?: string;
  analysis?: SentimentAnalysis;
  metadata?: ResponseMetadata;
}

export interface Settings {
  defaultTone: string;
  language: string;
  apiUrl: string;
  autoDetectEmails: boolean;
  shortcuts?: KeyboardShortcuts;
  connectedEmail?: string;
  isConnected?: boolean;
}

export interface KeyboardShortcuts {
  quickReply: string;
  openSidebar: string;
  summarize: string;
}

export interface Usage {
  requestsToday: number;
  lastReset: string;
  maxRequests?: number;
  stats?: UsageStats;
}

export interface UsageStats {
  summaries: number;
  replies: number;
  toneChanges: number;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  urgency: 'high' | 'medium' | 'low';
  tone: 'formal' | 'casual' | 'aggressive' | 'friendly';
}

export interface ResponseMetadata {
  tone: string;
  timestamp: string;
}

export type EmailProvider = 'gmail' | 'outlook' | null;

class ChromeUtils {
  // Verificar si estamos en una extensión
  static isExtension(): boolean {
    return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
  }

  // Mensajería con background script
  static async sendMessage(message: ChromeMessage): Promise<ChromeResponse> {
    if (!this.isExtension()) {
      console.warn('Not running in extension context');
      return { success: false, error: 'Not in extension' };
    }

    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response: ChromeResponse) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }

  // Mensajería con content scripts
  static async sendMessageToTab(tabId: number, message: ChromeMessage): Promise<ChromeResponse> {
    if (!this.isExtension()) return { success: false };

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response: ChromeResponse) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: true });
        }
      });
    });
  }

  // Obtener tab activa
  static async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    if (!this.isExtension()) return null;

    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0] || null);
      });
    });
  }

  // Storage local
  static async getStorage<T extends Record<string, unknown>>(keys: string | string[] | null): Promise<T> {
    if (!this.isExtension()) return {} as T;

    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result as T);
      });
    });
  }

  static async setStorage(data: Record<string, Settings | Usage | string | number | boolean>): Promise<boolean> {
    if (!this.isExtension()) return false;

    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve(!chrome.runtime.lastError);
      });
    });
  }

  // Configuración
  static async getSettings(): Promise<Settings> {
    const response = await this.sendMessage({ type: 'GET_SETTINGS' });
    return response.settings || {};
  }

  static async updateSettings(settings: Settings): Promise<ChromeResponse> {
    return await this.sendMessage({ 
      type: 'UPDATE_SETTINGS', 
      settings 
    });
  }

  // Uso de API
  static async trackUsage(): Promise<ChromeResponse> {
    return await this.sendMessage({ type: 'TRACK_USAGE' });
  }

  // Obtener información de uso
  static async getUsage(): Promise<Usage | null> {
    const result = await this.getStorage(['usage']);
    return result.usage || null;
  }

  // Detectar si estamos en Gmail o Outlook
  static getCurrentEmailProvider(): EmailProvider {
    if (!this.isExtension()) return null;
    
    const hostname = window.location.hostname;
    
    if (hostname.includes('mail.google.com')) {
      return 'gmail';
    } else if (hostname.includes('outlook.live.com') || hostname.includes('outlook.office.com')) {
      return 'outlook';
    }
    
    return null;
  }

  // Inyectar CSS
  static async injectCSS(tabId: number, css: string): Promise<boolean> {
    if (!this.isExtension()) return false;

    try {
      await chrome.scripting.insertCSS({
        target: { tabId },
        css
      });
      return true;
    } catch (error) {
      console.error('Failed to inject CSS:', error);
      return false;
    }
  }

  // Inyectar JavaScript
  static async injectScript<TArgs extends readonly unknown[], TResult>(
    tabId: number, 
    func: (...args: TArgs) => TResult, 
    args: TArgs
  ): Promise<TResult | null> {
    if (!this.isExtension()) return null;

    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: func as (...args: readonly unknown[]) => TResult,
        args: args as readonly unknown[]
      });
      return result[0]?.result ?? null;
    } catch (error) {
      console.error('Failed to inject script:', error);
      return null;
    }
  }

  // Abrir página de opciones
  static openOptions(): void {
    if (this.isExtension()) {
      chrome.runtime.openOptionsPage();
    }
  }

  // Notificaciones
  static async showNotification(
    title: string, 
    message: string, 
    type: chrome.notifications.TemplateType = 'basic'
  ): Promise<boolean> {
    if (!this.isExtension()) return false;

    return new Promise((resolve) => {
      chrome.notifications.create({
        type,
        iconUrl: 'icons/icon48.png',
        title,
        message
      }, (notificationId) => {
        resolve(!!notificationId);
      });
    });
  }

  // Copiar al portapapeles
  static async copyToClipboard(text: string): Promise<boolean> {
    if (!this.isExtension()) {
      // Fallback para desarrollo
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }

    // En extensión, usar tabs para acceso al portapapeles
    const tab = await this.getCurrentTab();
    if (!tab || !tab.id) return false;

    const result = await this.injectScript(
      tab.id, 
      (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        return true;
      }, 
      [text] as const
    );
    
    return result ?? false;
  }

  // Obtener todas las tabs
  static async getAllTabs(): Promise<chrome.tabs.Tab[]> {
    if (!this.isExtension()) return [];

    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs);
      });
    });
  }

  // Crear nueva tab
  static async createTab(url: string): Promise<chrome.tabs.Tab | null> {
    if (!this.isExtension()) return null;

    return new Promise((resolve) => {
      chrome.tabs.create({ url }, (tab) => {
        resolve(tab || null);
      });
    });
  }

  // Actualizar tab
  static async updateTab(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<boolean> {
    if (!this.isExtension()) return false;

    return new Promise((resolve) => {
      chrome.tabs.update(tabId, updateProperties, (tab) => {
        resolve(!!tab);
      });
    });
  }

  // Cerrar tab
  static async closeTab(tabId: number): Promise<boolean> {
    if (!this.isExtension()) return false;

    return new Promise((resolve) => {
      chrome.tabs.remove(tabId, () => {
        resolve(!chrome.runtime.lastError);
      });
    });
  }

  // Verificar permisos
  static async hasPermission(permission: string): Promise<boolean> {
    if (!this.isExtension()) return false;

    return new Promise((resolve) => {
      chrome.permissions.contains({ permissions: [permission] }, (result) => {
        resolve(result);
      });
    });
  }

  // Solicitar permisos
  static async requestPermission(permission: string): Promise<boolean> {
    if (!this.isExtension()) return false;

    return new Promise((resolve) => {
      chrome.permissions.request({ permissions: [permission] }, (granted) => {
        resolve(granted);
      });
    });
  }

  // Obtener URL de recurso de la extensión
  static getURL(path: string): string {
    if (!this.isExtension()) return '';
    return chrome.runtime.getURL(path);
  }

  // Escuchar cambios en storage
  static onStorageChanged(
    callback: (changes: Record<string, chrome.storage.StorageChange>) => void
  ): void {
    if (!this.isExtension()) return;

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>, 
      areaName: string
    ) => {
      if (areaName === 'local') {
        callback(changes);
      }
    };

    chrome.storage.onChanged.addListener(listener);
  }

  // Remover listener de storage
  static removeStorageListener(
    callback: (changes: Record<string, chrome.storage.StorageChange>) => void
  ): void {
    if (!this.isExtension()) return;
    chrome.storage.onChanged.removeListener(callback);
  }
}

export default ChromeUtils;