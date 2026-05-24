const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const { rateLimit } = require('express-rate-limit')
require('dotenv').config()

const aiRoutes = require('./routes/ai')
const { clerkAuth } = require('./middlewares/auth')

const app = express()

app.use(helmet())
app.use(compression())
app.use(clerkAuth)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  credentials: true,
}))

const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  limit: 20,                       // 20 requests por IP por día
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: 'Daily limit exceeded. Maximum 20 requests per day.' },
})

app.use('/api/ai', aiLimiter)
app.use('/api/ai', aiRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'OK', 'message': 'API is running', timestamp: new Date().toISOString() })
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