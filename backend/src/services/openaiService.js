const OpenAI = require('openai')
const { cleanEmailContent, buildReplyPrompt, buildSummarizePrompt, buildSentimentPrompt } = require('./emailPrompts')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

class OpenAIService {
  async generateEmailReply(emailContent, tone = 'formal', customPrompt = '', senderName = null, length = 'medium') {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: buildReplyPrompt(tone, customPrompt, senderName, length, cleanEmailContent(emailContent)) },
          { role: 'user', content: cleanEmailContent(emailContent) },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })
      return completion.choices[0].message.content
    } catch (error) {
      throw new Error(`Error generating email reply: ${error.message}`)
    }
  }

  async summarizeEmail(emailContent) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: buildSummarizePrompt(cleanEmailContent(emailContent)) },
          { role: 'user', content: cleanEmailContent(emailContent) },
        ],
        temperature: 0.5,
        max_tokens: 400,
      })
      return completion.choices[0].message.content
    } catch (error) {
      throw new Error(`Error summarizing email: ${error.message}`)
    }
  }

  async detectSentiment(emailContent) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: buildSentimentPrompt() },
          { role: 'user', content: cleanEmailContent(emailContent) },
        ],
        temperature: 0.3,
        max_tokens: 100,
      })
      return completion.choices[0].message.content
    } catch (error) {
      throw new Error(`Error detecting sentiment: ${error.message}`)
    }
  }
}

module.exports = new OpenAIService()
