// background.js - Service Worker de la extensión
// UBICACIÓN: public/background.js

// Instalar extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Email Assistant installed');
  
  // Configuración inicial
  chrome.storage.local.set({
    settings: {
      defaultTone: 'formal',
      language: 'es',
      apiUrl: 'http://localhost:3001/api',
      autoDetectEmails: true
    },
    usage: {
      requestsToday: 0,
      lastReset: new Date().toDateString()
    }
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
    // Obtener configuración
    const settingsResult = await getSettings();
    const apiUrl = settingsResult.settings?.apiUrl || 'http://localhost:3001/api';
    
    console.log('Making API request to:', `${apiUrl}${endpoint}`);
    
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
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

// Manejar generación de respuesta
async function handleGenerateReply(data) {
  try {
    // Verificar límite diario
    const usageResult = await trackUsage();
    if (usageResult.usage && usageResult.usage.requestsToday > 50) {
      return { success: false, error: 'Daily limit exceeded (50 requests)' };
    }
    
    const result = await makeAPIRequest('/ai/generate-reply', data);
    return { success: true, ...result };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Manejar resumen de email
async function handleSummarizeEmail(data) {
  try {
    const usageResult = await trackUsage();
    if (usageResult.usage && usageResult.usage.requestsToday > 50) {
      return { success: false, error: 'Daily limit exceeded' };
    }
    
    const result = await makeAPIRequest('/ai/summarize', data);
    return { success: true, ...result };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Manejar análisis de sentimiento
async function handleAnalyzeSentiment(data) {
  try {
    const usageResult = await trackUsage();
    if (usageResult.usage && usageResult.usage.requestsToday > 50) {
      return { success: false, error: 'Daily limit exceeded' };
    }
    
    const result = await makeAPIRequest('/ai/analyze-sentiment', data);
    return { success: true, ...result };
    
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