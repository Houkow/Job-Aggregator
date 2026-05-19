const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middlewares globaux
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
const authRoutes = require('./routes/auth.routes')
const offersRoutes = require('./routes/offers.routes')
const adminRoutes = require('./routes/admin.routes')
const ingestRoutes = require('./routes/ingest.routes')
const chatbotRoutes = require('./routes/chatbot.routes')

app.use('/api/auth', authRoutes)
app.use('/api/offers', offersRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ingest', ingestRoutes)
app.use('/api/chatbot', chatbotRoutes)

// Route test
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Serveur opérationnel' })
})

// Middleware erreurs
const errorMiddleware = require('./middleware/error.middleware')
app.use(errorMiddleware)

const profileRoutes = require('./routes/profile.routes')
app.use('/api/profile', profileRoutes)

const recruiterRoutes = require('./routes/recruiter.routes')
app.use('/api/recruiter', recruiterRoutes)

module.exports = app