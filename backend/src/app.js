const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

//const aiRoutes = require('./routes/ai')

const app = express()

app.use(helmet())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  credentials: true,
}))

//app.use('/api/ai', aiRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

module.exports = app