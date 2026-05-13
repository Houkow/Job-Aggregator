const rateLimit = require('express-rate-limit')

const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: 'Trop de requêtes, réessayez dans 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
})

const authRateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: 'Trop de tentatives de connexion, réessayez dans 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
})

module.exports = { rateLimitMiddleware, authRateLimitMiddleware }