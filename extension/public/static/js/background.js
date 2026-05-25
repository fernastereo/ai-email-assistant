// background.js - Service Worker de la extensión
// UBICACIÓN: public/background.js
//
// ⚠️  CAMBIAR ESTA URL al hacer deploy a producción
const API_BASE_URL = 'https://api.replie.email';

const FREE_DAILY_LIMIT = 20;

// Instalar extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Email Assistant installed');
  
  // Configuración inicial — solo setea valores que no existan aún
  chrome.storage.local.get(['settings', 'usage'], (result) => {
    const defaults = {};
    if (!result.settings) {
      defaults.settings = {
        defaultTone: 'formal',
        defaultLength: 'medium',
        language: 'es',
        apiUrl: API_BASE_URL,
        autoDetectEmails: true,
        dailyLimit: FREE_DAILY_LIMIT,
      };
    } else {
      // Merge new keys into existing settings without overwriting
      const merged = { ...result.settings };
      if (!merged.defaultLength) merged.defaultLength = 'medium';
      if (!merged.dailyLimit) merged.dailyLimit = FREE_DAILY_LIMIT;
      defaults.settings = merged;
    }
    if (!result.usage) {
      defaults.usage = { requestsToday: 0, lastReset: new Date().toDateString() };
    }
    chrome.storage.local.set(defaults);
  });

  // Crear context menu
  chrome.contextMenus.create({
    id: 'analyze-email',
    title: 'Analyze with AI Email Assistant',
    contexts: ['selection']
  });
});

// Escuchar mensajes de content scripts y popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);
  
  switch (message.type) {
    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true; // Respuesta asíncrona
      
    case 'UPDATE_SETTINGS':
      updateSettings(message.settings).then(sendResponse);
      return true;
      
    case 'TRACK_USAGE':
      trackUsage().then(sendResponse);
      return true;
      
    case 'GENERATE_REPLY':
      handleGenerateReply(message.data).then(sendResponse);
      return true;
      
    case 'SUMMARIZE_EMAIL':
      handleSummarizeEmail(message.data).then(sendResponse);
      return true;
      
    case 'ANALYZE_SENTIMENT':
      handleAnalyzeSentiment(message.data).then(sendResponse);
      return true;
      
    case 'GET_EMAIL_CONTENT':
      getEmailContentFromTab().then(sendResponse);
      return true;

    case 'INSERT_REPLY':
      insertReplyInTab(message.data).then(sendResponse);
      return true;

    case 'CLERK_SESSION_SYNC':
      chrome.storage.local.set({ authToken: message.token, authEmail: message.email });
      sendResponse({ success: true });
      break;

    case 'CLERK_SESSION_CLEAR':
      chrome.storage.local.remove(['authToken', 'authEmail']);
      sendResponse({ success: true });
      break;

    case 'OPEN_OPTIONS':
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      break;

    default:
      console.log('Unknown message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }
});

// Obtener configuración
async function getSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    return { success: true, settings: result.settings };
  } catch (error) {
    console.error('Error getting settings:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar configuración
async function updateSettings(newSettings) {
  try {
    await chrome.storage.local.set({ settings: newSettings });
    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }
}

// Rastrear uso diario
async function trackUsage() {
  try {
    const result = await chrome.storage.local.get(['usage']);
    const today = new Date().toDateString();
    
    let usage = result.usage || { requestsToday: 0, lastReset: today };
    
    // Reset diario
    if (usage.lastReset !== today) {
      usage = { requestsToday: 0, lastReset: today };
    }
    
    usage.requestsToday++;
    await chrome.storage.local.set({ usage });
    
    return { success: true, usage };
  } catch (error) {
    console.error('Error tracking usage:', error);
    return { success: false, error: error.message };
  }
}

// Hacer request al backend
async function makeAPIRequest(endpoint, data) {
  try {
    // Obtener configuración y token de auth
    const [settingsResult, storageResult] = await Promise.all([
      getSettings(),
      chrome.storage.local.get(['authToken'])
    ]);
    const apiUrl = settingsResult.settings?.apiUrl || API_BASE_URL;
    const authToken = storageResult.authToken;

    console.log('Making API request to:', `${apiUrl}${endpoint}`);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    return result;
    
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Verificar límite diario sin incrementar
async function checkDailyLimit() {
  const result = await chrome.storage.local.get(['usage']);
  const today = new Date().toDateString();
  const usage = result.usage || { requestsToday: 0, lastReset: today };
  if (usage.lastReset !== today) return false; // reset day, allow
  return usage.requestsToday >= FREE_DAILY_LIMIT;
}

// Manejar generación de respuesta
async function handleGenerateReply(data) {
  try {
    if (await checkDailyLimit()) {
      return { success: false, error: `Daily limit exceeded (${FREE_DAILY_LIMIT} requests/day)` };
    }
    const result = await makeAPIRequest('/api/ai/generate-reply', data);
    await trackUsage(); // solo cuenta si el request fue exitoso
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Manejar resumen de email
async function handleSummarizeEmail(data) {
  try {
    if (await checkDailyLimit()) {
      return { success: false, error: 'Daily limit exceeded (50 requests)' };
    }
    const result = await makeAPIRequest('/api/ai/summarize-email', data);
    await trackUsage();
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Manejar análisis de sentimiento
async function handleAnalyzeSentiment(data) {
  try {
    if (await checkDailyLimit()) {
      return { success: false, error: 'Daily limit exceeded (50 requests)' };
    }
    const result = await makeAPIRequest('/api/ai/detect-sentiment', data);
    await trackUsage();
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener contenido del email desde el content script de la pestaña activa
async function getEmailContentFromTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return { success: false, error: 'No active tab' };
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_EMAIL_CONTENT' });
    return response;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Insertar respuesta en el compose box via content script
async function insertReplyInTab(data) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return { success: false, error: 'No active tab' };
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'INSERT_REPLY', reply: data.reply });
    return response;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyze-email' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'ANALYZE_SELECTED_TEXT',
      text: info.selectionText
    });
  }
});

// Manejar errores no capturados
self.addEventListener('error', (event) => {
  console.error('Background script error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Background script unhandled rejection:', event.reason);
});