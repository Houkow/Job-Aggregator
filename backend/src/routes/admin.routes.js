const express = require('express')
const router = express.Router()

router.get('/users', (req, res) => {
    res.status(200).json({ users: [], message: 'Liste des utilisateurs (mock)' })
})

router.delete('/users/:id', (req, res) => {
    res.status(200).json({ message: `Utilisateur ${req.params.id} supprimé (mock)` })
})

router.patch('/users/:id/role', (req, res) => {
    res.status(200).json({ message: `Rôle de l'utilisateur ${req.params.id} modifié (mock)` })
})

router.get('/offers', (req, res) => {
    res.status(200).json({ offers: [], message: 'Liste des offres à modérer (mock)' })
})

router.patch('/offers/:id/status', (req, res) => {
    res.status(200).json({ message: `Statut de l'offre ${req.params.id} modifié (mock)` })
})

module.exports = router