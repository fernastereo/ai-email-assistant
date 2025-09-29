const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/ai'

class ApiService {
  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`)
    }
  }

  async generateReply(emailContent, tone = 'formal', customPrompt = '') {
    return this.makeRequest('/generate-reply', { emailContent, tone, customPrompt })
  }

  async summarizeEmail(emailContent) {
    return this.makeRequest('/summarize-email', { emailContent })
  }

  async detectSentiment(emailContent) {
    return this.makeRequest('/detect-sentiment', { emailContent })
  }
}

export default new ApiService()
