const openaiService = require('../services/opnaiService')

class AIController {
  async generateReply(req, res) {
    try {
      const { emailContent, tone, customPrompt } = req.body

      if(!emailContent){
        return res.status(400).json({ error: 'Email content is required' })
      }

      const reply = await openaiService.generateEmailReply(emailContent, tone, customPrompt)

      res.json({
        success: true,
        reply,
        metadata: { tone, timestamp: new Date().toISOString() }
      })
    } catch (error) {
      console.error('Error generating reply:', error)
      res.status(500).json({ error: 'Failed to generate reply. ' + error.message })
    }
  }

  async summarizeEmail(req, res) {
    try {
      const { emailContent } = req.body

      if(!emailContent){
        return res.status(400).json({ error: 'Email content is required' })
      }

      const summary = await openaiService.summarizeEmail(emailContent)

      res.json({
        success: true,
        summary,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error generating summary:', error)
      res.status(500).json({ error: 'Failed to generate summary' })
    }
  }

  async detectSentiment(req, res) {
    try {
      const { emailContent } = req.body

      if(!emailContent){
        return res.status(400).json({ error: 'Email content is required' })
      }

      const analysis = await openaiService.detectSentiment(emailContent)

      res.json({
        success: true,
        analysis,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Detect sentiment error:', error)
      res.status(500).json({ error: 'Failed to detect sentiment' })
    }
  }
}

module.exports = new AIController()