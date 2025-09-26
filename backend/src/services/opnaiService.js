const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

class OpenAIService {
  async generateEmailReply(emialContent, tone = 'formal', customPrompt = '') {
    const tonePrompts = {
      formal: 'You are a professional email writer. You are given an email and you need to write a reply to it.',
      casual: 'You are a casual email writer. You are given an email and you need to write a reply to it.',
      concise: 'You are a concise email writer. You are given an email and you need to write a reply to it.',
      persuasive: 'You are a persuasive email writer. You are given an email and you need to write a reply to it.',
      urgent: 'You are an urgent email writer. You are given an email and you need to write a reply to it.',
      positive: 'You are a positive email writer. You are given an email and you need to write a reply to it.',
      negative: 'You are a negative email writer. You are given an email and you need to write a reply to it.',
      neutral: 'You are a neutral email writer. You are given an email and you need to write a reply to it.',
    }

    const systemPrompt = `
      You are an intelligent email assistant. ${tonePrompts[tone.toLowerCase()] || tonePrompts.formal}
      ${customPrompt ? `Aditional instructions: ${customPrompt}` : ''}
    
      Rules:
      - Respond in the same language as the original email
      - Keep the tone appropriate for the context
      - Do not include invented information
      - Be concise but complete
      `
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Email to respond: ${emailContent}` },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      return completion.choices[0].message.content
    } catch (error) {
      throw new Error(`Error generating email reply ${error.message}`)
    }
  }

  async summarizeEmail(emailContent) {
    const systemPrompt = `
      Resume this email in 3-5 key points using bullet points.
      Include: main topic, required actions, names, important dates, and tone of the message.
      Respond in the same language as the original email.
    `

    try{
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: emailContent },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      return completion.choices[0].message.content
    } catch (error) {
      throw new Error(`Error summarizing email ${error.message}`)
    }
  }

  async detectSentiment(emailContent) {
    const systemPrompt = `
      Analyze the sentiment and urgency of this email.
      Respond only with a JSON in this format:
      {"sentiment": "positive|negative|neutral", "urgency": "high|medium|low", "tone": "formal|casual|aggressive|friendly"}
    `

    try{
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: emailContent },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      return completion.choices[0].message.content
    } catch (error) {
      throw new Error(`Error summarizing email ${error.message}`)
    }
  }
}

module.exports = new OpenAIService()