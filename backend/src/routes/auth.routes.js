const express = require('express')
const router = express.Router()

router.post('/register', (req, res) => {
    res.status(201).json({ message: 'Inscription réussie (mock)' })
})

router.post('/login', (req, res) => {
    res.status(200).json({ token: 'mock-token-123', message: 'Connexion réussie (mock)' })
})

router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Déconnexion réussie (mock)' })
})

module.exports = router