// chrome.js - Utilidades para APIs de Chrome Extension

class ChromeUtils {
  // Verificar si estamos en una extensión
  static isExtension() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }

  // Mensajería con background script
  static async sendMessage(message) {
    if (!this.isExtension()) {
      console.warn('Not running in extension context');
      return { success: false, error: 'Not in extension' };
    }

    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }

  // Mensajería con content scripts
  static async sendMessageToTab(tabId, message) {
    if (!this.isExtension()) return { success: false };

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: true });
        }
      });
    });
  }

  // Obtener tab activa
  static async getCurrentTab() {
    if (!this.isExtension()) return null;

    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0] || null);
      });
    });
  }

  // Storage local
  static async getStorage(keys) {
    if (!this.isExtension()) return {};

    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  }

  static async setStorage(data) {
    if (!this.isExtension()) return false;

    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve(!chrome.runtime.lastError);
      });
    });
  }

  // Configuración
  static async getSettings() {
    const response = await this.sendMessage({ type: 'GET_SETTINGS' });
    return response.settings || {};
  }

  static async updateSettings(settings) {
    return await this.sendMessage({ 
      type: 'UPDATE_SETTINGS', 
      settings 
    });
  }

  // Uso de API
  static async trackUsage() {
    return await this.sendMessage({ type: 'TRACK_USAGE' });
  }

  // Detectar si estamos en Gmail o Outlook
  static getCurrentEmailProvider() {
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
  static async injectCSS(tabId, css) {
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
  static async injectScript(tabId, func, args = []) {
    if (!this.isExtension()) return null;

    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func,
        args
      });
      return result[0]?.result || null;
    } catch (error) {
      console.error('Failed to inject script:', error);
      return null;
    }
  }

  // Abrir página de opciones
  static openOptions() {
    if (this.isExtension()) {
      chrome.runtime.openOptionsPage();
    }
  }

  // Notificaciones
  static async showNotification(title, message, type = 'basic') {
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
  static async copyToClipboard(text) {
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
    if (!tab) return false;

    return await this.injectScript(tab.id, (text) => {
      navigator.clipboard.writeText(text);
      return true;
    }, [text]);
  }
}

export default ChromeUtils;