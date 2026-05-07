const express = require('express')
const router = express.Router()
const { register, login, logout } = require('../controllers/auth.controller')
const { authRateLimitMiddleware } = require('../middleware/rateLimit.middleware')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/register', authRateLimitMiddleware, register)

router.post('/login', authRateLimitMiddleware, login)

router.post('/logout', authMiddleware, logout)

module.exports = router