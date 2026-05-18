// routes/profile.routes.js
const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware')

router.get('/', authMiddleware, (req, res) => {
  res.json({ data: { email: req.user.email } })
})

router.put('/', authMiddleware, (req, res) => {
  // sauvegarder en base plus tard
  res.json({ message: 'Profil mis à jour' })
})

module.exports = router