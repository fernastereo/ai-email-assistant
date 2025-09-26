let sidebarOpen = false
let sidebarFrame = null

function createSidebar() {
  if (sidebarFrame) return

  sidebarFrame = document.createElement('iframe')
  sidebarFrame.src = chrome.runtime.getURL('sidebar.html')
  sidebarFrame.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    border: none;
    z-index: 10000;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    background-color: #f0f0f0;
  `

  document.body.appendChild(sidebarFrame)
}

function toggleSidebar(){
  if (!sidebarFrame) createSidebar()

  if (sidebarOpen){
    sidebarFrame.style.transform = 'translateX(100%)'
    sidebarOpen = false
  } else {
    sidebarFrame.style.transform = 'translateX(0)'
    sidebarOpen = true
  }
}

function extractEmailContent(){
  if(window.location.hostname === 'mail.google.com'){
    const emailBody = document.querySelector('[role="listitem"] [dir="ltr"]')
    return emailBody ? emailBody.innerText : ''
  }

  if(window.location.hostname.includes('outlook')){
    const emailBody = document.querySelector('[role="main"] [dir="ltr"]')
    return emailBody ? emailBody.innerText : ''
  }

  return ''
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'openSidebar':
      toggleSidebar();
      sendResponse({ success: true });
      break;
    case 'getEmailContent':
      const content = extractEmailContent();
      sendResponse({ content });
      break;
    case 'insertReply':
      insertReplyIntoEmail(message.reply);
      sendResponse({ success: true });
      break;
  }
});

function insertReplyIntoEmail(replyText){
  const gmailCompose = document.querySelector('[role="textbox"][aria-label*="Mensaje"]')
  if(gmailCompose){
    gmailCompose.innerHTML = replyText
    return
  }

  const outlookCompose = document.querySelector('[role="textbox"][aria-label*="Message body"]')
  if(outlookCompose){
    outlookCompose.innerHTML = replyText
    return
  }
}