const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
app.use((req, res, next) => { console.log('>>> REQUEST:', req.method, req.path); next() })

// Middlewares globaux
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}))

app.use((req, res, next) => {
  if (req.path.includes('/profile/avatar') || req.path.includes('/profile/cv')) return next()
  express.json({ limit: '10mb' })(req, res, next)
})
app.use((req, res, next) => {
  if (req.path.includes('/profile/avatar') || req.path.includes('/profile/cv')) return next()
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, next)
})

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
const authRoutes     = require('./routes/auth.routes')
const offersRoutes   = require('./routes/offers.routes')
const adminRoutes    = require('./routes/admin.routes')
const ingestRoutes   = require('./routes/ingest.routes')
const chatbotRoutes  = require('./routes/chatbot.routes')
const profileRoutes  = require('./routes/profile.routes')
const recruiterRoutes = require('./routes/recruiter.routes')

app.use('/api/auth',      authRoutes)
app.use('/api/offers',    offersRoutes)
app.use('/api/admin',     adminRoutes)
app.use('/api/ingest', (req, res, next) => { console.log('INGEST HIT', req.method, req.path); next() }, ingestRoutes)
app.use('/api/chatbot',   chatbotRoutes)
app.use('/api/profile',   profileRoutes)
app.use('/api/recruiter', recruiterRoutes)

// Route test
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Serveur opérationnel' })
})

// Middleware erreurs (doit être en dernier)
const errorMiddleware = require('./middleware/error.middleware')
app.use(errorMiddleware)

module.exports = app