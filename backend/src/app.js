const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const aiRoutes = require('./routes/ai')

const app = express()

app.use(helmet())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  credentials: true,
}))

app.use('/api/ai', aiRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Email Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      generateReply: '/api/ai/generate-reply',
      summarize: '/api/ai/summarize-email',
      analyzeSentiment: '/api/ai/detect-sentiment'
    }
  });
});

module.exports = app