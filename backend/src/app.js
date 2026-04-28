const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middlewares globaux
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
const authRoutes = require('./routes/auth.routes')
const offersRoutes = require('./routes/offers.routes')
const adminRoutes = require('./routes/admin.routes')
const ingestRoutes = require('./routes/ingest.routes')

app.use('/api/auth', authRoutes)
app.use('/api/offers', offersRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ingest', ingestRoutes)

// Route test
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Serveur opérationnel' })
})

// Middleware erreurs
const errorMiddleware = require('./middleware/error.middleware')
app.use(errorMiddleware)

module.exports = app