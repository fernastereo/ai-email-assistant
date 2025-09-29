const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/ai'

interface GenerateReplyResponse {
  success: boolean;
  reply: string;
  metadata: {
    tone: string;
    timestamp: string;
  };
}

interface SummarizeEmailResponse {
  success: boolean;
  summary: string;
  timestamp: string;
}

interface DetectSentimentResponse {
  success: boolean;
  analysis: string;
  timestamp: string;
}

class ApiService {
  async makeRequest<T>(endpoint: string, data: unknown): Promise<T> {
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

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      } else {
        throw new Error('API request failed: Unknown error');
      }
    }
  }

  async generateReply(emailContent: string, tone: string = 'formal', customPrompt: string = ''): Promise<GenerateReplyResponse> {
    return this.makeRequest('/generate-reply', { emailContent, tone, customPrompt })
  }

  async summarizeEmail(emailContent: string): Promise<SummarizeEmailResponse> {
    return this.makeRequest('/summarize-email', { emailContent })
  }

  async detectSentiment(emailContent: string): Promise<DetectSentimentResponse> {
    return this.makeRequest('/detect-sentiment', { emailContent })
  }
}

export default new ApiService()
