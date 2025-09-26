const express = require('express')
const aiController = require('../controllers/aiController')
const router = express.Router()

router.post('/generate-reply', aiController.generateReply)
router.post('/summarize-email', aiController.summarizeEmail)
router.post('/detect-sentiment', aiController.detectSentiment)

module.exports = router