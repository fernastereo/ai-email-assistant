// Shared prompts and content utilities for all AI providers
const { franc } = require('franc')

const TONE_DESCRIPTIONS = {
  formal:     'professional and respectful',
  casual:     'friendly and relaxed',
  concise:    'brief and to the point (3-4 sentences max)',
  persuasive: 'convincing and motivating',
  urgent:     'direct and urgent',
  positive:   'warm and optimistic',
  negative:   'firm and assertive',
  neutral:    'balanced and objective',
}

/**
 * Removes legal disclaimers, signatures, forward headers, and download links
 * that pollute the email content before sending to the model.
 */
function cleanEmailContent(raw) {
  let text = raw

  // Remove legal disclaimer blocks (common in corporate emails)
  text = text.replace(/AVISO LEGAL[\s\S]*?(El contenido[\s\S]*?prohibido[\s\S]*?legales\.?)/gi, '')
  text = text.replace(/LEGAL NOTICE[\s\S]*?/gi, '')

  // Remove forwarded/replied email thread separators but keep the From: line (useful to identify sender)
  text = text.replace(/^-{3,}.*?Mensaje original.*?-{3,}/gim, '')
  text = text.replace(/^(Para|To|Enviado|Sent|Asunto|Subject):.*$/gim, '')

  // Remove download/drive/photo action links
  text = text.replace(/^(Descargar|Agregar a Drive|Guardar en Fotos)\s*$/gim, '')

  // Remove [Mensaje acortado] and similar Gmail truncation notices
  text = text.replace(/\[Mensaje acortado\].*$/gim, '')
  text = text.replace(/\[Message clipped\].*$/gim, '')

  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, '')

  // Remove email addresses
  text = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '')

  // Remove phone numbers and addresses (Carrera X # Y-Z patterns)
  text = text.replace(/Carrera\s+\d+.*$/gim, '')

  // Collapse excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

// ISO 639-3 → human-readable name for the most common languages
const ISO_TO_LANGUAGE = {
  eng: 'English', spa: 'Spanish', deu: 'German', fra: 'French',
  por: 'Portuguese', ita: 'Italian', nld: 'Dutch', pol: 'Polish',
  rus: 'Russian', zho: 'Chinese', jpn: 'Japanese', kor: 'Korean',
  ara: 'Arabic', hin: 'Hindi', tur: 'Turkish', swe: 'Swedish',
  nor: 'Norwegian', dan: 'Danish', fin: 'Finnish', cat: 'Catalan',
}

function detectLanguage(text) {
  const iso = franc(text, { minLength: 20 })
  return ISO_TO_LANGUAGE[iso] || null
}

const LENGTH_INSTRUCTIONS = {
  short:  'Keep the reply SHORT: 2-3 sentences maximum.',
  medium: 'Keep the reply MEDIUM length: 1-2 short paragraphs.',
  long:   'Write a DETAILED reply: 3-4 paragraphs, covering all relevant points thoroughly.',
}

function buildReplyPrompt(tone, customPrompt, senderName, length, emailContent) {
  const toneDesc = TONE_DESCRIPTIONS[tone?.toLowerCase()] || TONE_DESCRIPTIONS.formal
  const lengthInstruction = LENGTH_INSTRUCTIONS[length] || LENGTH_INSTRUCTIONS.medium
  const detectedLanguage = emailContent ? detectLanguage(emailContent) : null
  const languageInstruction = detectedLanguage
    ? `- Write the entire reply in ${detectedLanguage} — that is the language of the email`
    : `- Write the entire reply in the same language as the email`
  const greetingInstruction = senderName
    ? `- Start with a greeting to the sender using their name "${senderName}"`
    : `- Start with a generic greeting appropriate to the tone and language`

  return `You are an intelligent email assistant helping the user (the RECIPIENT) write a reply.

Your task:
- Write a reply FROM the perspective of the person who RECEIVED this email, responding back to the sender
- ${languageInstruction}
${greetingInstruction}
- ${lengthInstruction}
- Do NOT repeat or summarize what the sender already said
- Do NOT impersonate the original sender
- Use a ${toneDesc} tone
- Be concise and natural — no invented facts
- Do NOT sign the reply — no name, no closing signature, no sign-off
- Do NOT infer or assume the recipient's name or gender
- Do not include a subject line${customPrompt ? `\n- Additional instructions: ${customPrompt}` : ''}`
}

function buildSummarizePrompt(emailContent) {
  const detectedLanguage = emailContent ? detectLanguage(emailContent) : null
  const languageInstruction = detectedLanguage
    ? `Respond in ${detectedLanguage}.`
    : `Respond in the same language as the email.`

  return `Summarize this email in 3-5 bullet points.
Include: main topic, any required actions, key names or dates, and the overall tone.
${languageInstruction}
Be concise — each bullet point should be one sentence.`
}

function buildSentimentPrompt() {
  return `Analyze the sentiment and urgency of this email.
Respond ONLY with valid JSON in exactly this format, no extra text:
{"sentiment": "positive|negative|neutral", "urgency": "high|medium|low", "tone": "formal|casual|aggressive|friendly"}`
}

module.exports = { cleanEmailContent, detectLanguage, buildReplyPrompt, buildSummarizePrompt, buildSentimentPrompt }
