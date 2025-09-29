// content-script.js - Script simplificado para Gmail/Outlook
// UBICACIÓN: public/content-script.js

console.log('🤖 AI Email Assistant content script loaded');

class EmailAssistantContent {
  constructor() {
    this.currentProvider = this.detectEmailProvider();
    this.floatingButton = null;
    this.init();
  }

  init() {
    console.log('Initializing on:', this.currentProvider?.name || 'unknown site');
    
    if (!this.currentProvider) {
      console.log('Not on supported email provider');
      return;
    }

    // Esperar a que la página cargue
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setup();
      });
    } else {
      this.setup();
    }
  }

  setup() {
    // Inyectar botón flotante después de que cargue Gmail
    setTimeout(() => {
      this.injectFloatingButton();
    }, 3000);

    // Escuchar mensajes
    this.setupMessageListeners();
  }

  detectEmailProvider() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('mail.google.com')) {
      return {
        id: 'gmail',
        name: 'Gmail',
        selectors: {
          emailBody: [
            '[data-message-id] [dir="ltr"]',
            '.ii.gt [dir="ltr"]',
            '[role="listitem"] [dir="ltr"]',
            '.adn.ads [dir="ltr"]'
          ],
          composeBox: [
            '[contenteditable="true"][aria-label*="Cuerpo del mensaje"]',
            '[contenteditable="true"][aria-label*="Message body"]',
            '[contenteditable="true"][role="textbox"]'
          ],
          replyButton: '[data-tooltip*="Responder"], [aria-label*="Reply"]'
        }
      };
    }
    
    if (hostname.includes('outlook.live.com') || hostname.includes('outlook.office.com')) {
      return {
        id: 'outlook',
        name: 'Outlook',
        selectors: {
          emailBody: [
            '[role="main"] [dir="ltr"]',
            '.rps_1f6b [dir="ltr"]'
          ],
          composeBox: [
            '[role="textbox"][aria-label*="Message body"]',
            '[contenteditable="true"]'
          ],
          replyButton: '[aria-label*="Reply"]'
        }
      };
    }
    
    return null;
  }

  injectFloatingButton() {
    // Verificar si ya existe
    const existing = document.getElementById('ai-email-assistant-btn');
    if (existing) {
      existing.remove();
    }

    // Crear botón flotante
    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'ai-email-assistant-btn';
    this.floatingButton.innerHTML = '🤖';
    this.floatingButton.title = 'AI Email Assistant - Click to open';
    
    // Estilos del botón
    this.floatingButton.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      width: 50px !important;
      height: 50px !important;
      background: linear-gradient(135deg, #4285F4, #34A853) !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      z-index: 999999 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      font-size: 20px !important;
      transition: all 0.3s ease !important;
      border: none !important;
      user-select: none !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

    // Eventos del botón
    this.floatingButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showPopupHint();
    });

    this.floatingButton.addEventListener('mouseenter', () => {
      this.floatingButton.style.transform = 'scale(1.1)';
      this.floatingButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    });

    this.floatingButton.addEventListener('mouseleave', () => {
      this.floatingButton.style.transform = 'scale(1)';
      this.floatingButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });

    document.body.appendChild(this.floatingButton);
    console.log('✅ Floating button injected');
    
    // Mostrar mensaje temporal
    this.showTemporaryMessage('🤖 AI Email Assistant ready!');
  }

  showPopupHint() {
    this.showTemporaryMessage('💡 Click the extension icon in the toolbar to open AI Email Assistant');
  }

  extractEmailContent() {
    if (!this.currentProvider) {
      console.log('No provider detected');
      return '';
    }

    const selectors = this.currentProvider.selectors.emailBody;
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        if (element && element.innerText && element.innerText.trim().length > 20) {
          let text = element.innerText.trim();
          
          // Limpiar texto común de Gmail/Outlook
          text = text.replace(/^(From:|To:|Subject:|Date:|De:|Para:|Asunto:|Fecha:).*$/gm, '');
          text = text.replace(/\n{3,}/g, '\n\n');
          text = text.replace(/^\s*\n/gm, '');
          
          if (text.length > 20) {
            console.log('✅ Email content extracted:', text.substring(0, 100) + '...');
            return text.substring(0, 3000); // Límite de caracteres
          }
        }
      }
    }

    console.log('❌ No email content found');
    return '';
  }

  insertReplyText(replyText) {
    if (!this.currentProvider || !replyText) {
      console.log('Cannot insert: no provider or text');
      return false;
    }

    console.log('🔄 Attempting to insert reply...');

    const selectors = this.currentProvider.selectors.composeBox;
    
    // Buscar compose box activo
    for (const selector of selectors) {
      const composeBoxes = document.querySelectorAll(selector);
      
      for (const composeBox of composeBoxes) {
        if (composeBox && this.isElementVisible(composeBox)) {
          console.log('📝 Found active compose box');
          this.setTextInEditor(composeBox, replyText);
          return true;
        }
      }
    }

    // Si no encuentra compose box, intentar abrir respuesta
    console.log('🔍 No compose box found, trying to open reply...');
    const replyButton = document.querySelector(this.currentProvider.selectors.replyButton);
    
    if (replyButton) {
      replyButton.click();
      console.log('📧 Clicked reply button, waiting...');
      
      // Esperar y volver a intentar
      setTimeout(() => {
        for (const selector of selectors) {
          const composeBox = document.querySelector(selector);
          if (composeBox && this.isElementVisible(composeBox)) {
            console.log('📝 Found compose box after reply click');
            this.setTextInEditor(composeBox, replyText);
            return;
          }
        }
        console.log('❌ Still no compose box found');
      }, 2000);
      
      return true;
    }

    console.log('❌ Could not insert reply');
    return false;
  }

  isElementVisible(element) {
    return element.offsetParent !== null && 
           getComputedStyle(element).display !== 'none' &&
           getComputedStyle(element).visibility !== 'hidden';
  }

  setTextInEditor(element, text) {
    console.log('✍️ Setting text in editor...');
    
    try {
      // Enfocar el elemento
      element.focus();
      element.click();
      
      // Limpiar contenido existente
      if (element.innerHTML !== undefined) {
        element.innerHTML = '';
      }
      
      // Insertar texto con formato
      const textWithBreaks = text.replace(/\n/g, '<br>').replace(/\r/g, '');
      
      if (element.innerHTML !== undefined) {
        element.innerHTML = textWithBreaks;
      } else {
        element.textContent = text;
      }
      
      // Disparar eventos para que el editor detecte el cambio
      const events = ['input', 'change', 'keyup', 'paste'];
      events.forEach(eventType => {
        const event = new Event(eventType, { 
          bubbles: true, 
          cancelable: true 
        });
        element.dispatchEvent(event);
      });
      
      // Evento especial para Gmail
      element.dispatchEvent(new KeyboardEvent('keydown', { 
        key: 'Enter', 
        bubbles: true 
      }));
      
      console.log('✅ Text inserted successfully');
      
    } catch (error) {
      console.error('❌ Error inserting text:', error);
    }
  }

  setupMessageListeners() {
    // Escuchar mensajes del popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Content script received:', message.type);
      
      try {
        switch (message.type) {
          case 'GET_EMAIL_CONTENT':
            const content = this.extractEmailContent();
            const response = {
              success: true,
              content,
              provider: this.currentProvider?.id,
              hasContent: content.length > 10
            };
            console.log('📤 Sending email content:', response);
            sendResponse(response);
            break;

          case 'INSERT_REPLY':
            const success = this.insertReplyText(message.reply);
            sendResponse({ success });
            
            if (success) {
              this.showTemporaryMessage('✅ Reply inserted successfully!');
            } else {
              this.showTemporaryMessage('❌ Could not insert reply. Try opening compose first.');
            }
            break;

          case 'PING':
            sendResponse({ success: true, provider: this.currentProvider?.id });
            break;

          default:
            console.log('❓ Unknown message type:', message.type);
            sendResponse({ success: false, error: 'Unknown message type' });
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
  }

  showTemporaryMessage(message) {
    // Remover mensaje anterior si existe
    const existing = document.getElementById('ai-assistant-temp-message');
    if (existing) {
      existing.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.id = 'ai-assistant-temp-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      background: #333 !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
      max-width: 300px !important;
      word-wrap: break-word !important;
      animation: slideIn 0.3s ease !important;
    `;

    // CSS para animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.transform = 'translateX(100%)';
        messageDiv.style.opacity = '0';
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
          }
        }, 300);
      }
    }, 4000);
  }
}

// Inicializar
try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new EmailAssistantContent();
    });
  } else {
    new EmailAssistantContent();
  }
} catch (error) {
  console.error('❌ Error initializing AI Email Assistant:', error);
}