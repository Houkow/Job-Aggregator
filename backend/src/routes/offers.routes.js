const express = require('express')
const router = express.Router()
const { getAllOffers, getOfferById, saveOffer, getSavedOffers, removeSavedOffer, updateSavedOfferStatus } = require('../controllers/offers.controller')
const authMiddleware = require('../middleware/auth.middleware')
const { rateLimitMiddleware } = require('../middleware/rateLimit.middleware')

router.patch('/save/:id/status', authMiddleware, updateSavedOfferStatus)

router.get('/', rateLimitMiddleware, getAllOffers)

router.get('/saved', authMiddleware, getSavedOffers)

router.get('/:id', rateLimitMiddleware, getOfferById)

router.post('/save/:id', authMiddleware, saveOffer)

router.delete('/save/:id', authMiddleware, removeSavedOffer)

module.exports = router