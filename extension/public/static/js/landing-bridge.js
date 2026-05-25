// Runs on replie.email — bridges Clerk session to extension storage.
// Sends REPLIE_GET_TOKEN to the React app and forwards the response to background.js.

function requestToken() {
  window.postMessage({ type: 'REPLIE_GET_TOKEN' }, '*');
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data?.type === 'REPLIE_TOKEN_RESPONSE') {
    const { token, email } = event.data;
    if (token) {
      chrome.runtime.sendMessage({ type: 'CLERK_SESSION_SYNC', token, email });
    }
  }

  if (event.data?.type === 'REPLIE_SESSION_CLEARED') {
    chrome.runtime.sendMessage({ type: 'CLERK_SESSION_CLEAR' });
  }
});

// Retry multiple times — Clerk + React may take a few seconds to initialize.
[300, 1000, 2500, 5000].forEach((delay) => setTimeout(requestToken, delay));
