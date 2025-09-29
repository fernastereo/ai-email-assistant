import React, { useState, useEffect } from 'react';
import apiService from './services/api';
import ChromeUtils from './utils/chrome';

function App() {
  const [emailContent, setEmailContent] = useState('Hola, espero que estés bien. Quería consultarte sobre el proyecto que discutimos la semana pasada.');
  const [selectedTone, setSelectedTone] = useState('formal');
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('');
  const [activeTab, setActiveTab] = useState('reply');

  const tones = ['formal', 'casual', 'concise', 'persuasive'];

  const getCurrentEmailContent = async () => {
    if (ChromeUtils.isExtension()) {
      const tab = await ChromeUtils.getCurrentTab();
      if (tab && (tab.url.includes('mail.google.com') || tab.url.includes('outlook'))) {
        const response = await ChromeUtils.sendMessageToTab(tab.id, {
          type: 'GET_EMAIL_CONTENT'
        });
        
        if (response.success && response.content) {
          setEmailContent(response.content);
        }
      }
    }
  };
  
  const handleInsertReply = async (replyText) => {
    if (ChromeUtils.isExtension()) {
      const tab = await ChromeUtils.getCurrentTab();
      const response = await ChromeUtils.sendMessageToTab(tab.id, {
        type: 'INSERT_REPLY',
        reply: replyText
      });
      
      if (response.success) {
        window.close(); // Cerrar popup
      }
    }
  };
  
  useEffect(() => {
    checkBackend();
    getCurrentEmailContent(); 
  }, []);

  const checkBackend = async () => {
    try {
      await apiService.healthCheck();
      setBackendStatus('✅ Backend connected');
    } catch (error) {
      setBackendStatus('❌ Backend offline');
    }
  };

  const handleGenerateReply = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.generateReply(emailContent, selectedTone, customPrompt);
      setResult(response.reply);
    } catch (error) {
      setError('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.summarizeEmail(emailContent);
      setResult(response.summary);
    } catch (error) {
      setError('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleAnalyzeSentiment = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.detectSentiment(emailContent);
      setResult(JSON.stringify(response.analysis, null, 2));
    } catch (error) {
      setError('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>AI Email Assistant</h1>
    </div>
  );
}

export default App;