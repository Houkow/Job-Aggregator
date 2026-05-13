const express = require('express')
const router = express.Router()
const { getAllUsers, deleteUser, updateUserRole, getOffersToModerate, updateOfferStatus } = require('../controllers/admin.controller')
const authMiddleware = require('../middleware/auth.middleware')
const roleMiddleware = require('../middleware/role.middleware')

router.use(authMiddleware, roleMiddleware('admin'))

router.get('/users', getAllUsers)

router.delete('/users/:id', deleteUser)

router.patch('/users/:id/role', updateUserRole)

router.get('/offers', getOffersToModerate)

router.patch('/offers/:id/status', updateOfferStatus)

module.exports = router