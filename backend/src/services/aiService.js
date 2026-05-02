const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase()

const providers = {
  openai: './openaiService',
  deepseek: './deepseekService',
  groq: './groqService',
}

if (!providers[provider]) {
  throw new Error(`Unknown AI_PROVIDER: "${provider}". Valid values: ${Object.keys(providers).join(', ')}`)
}

const service = require(providers[provider])

console.log(`AI provider: ${provider}`)

module.exports = service
