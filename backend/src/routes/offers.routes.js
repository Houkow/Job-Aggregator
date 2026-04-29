const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({ offers: [], total: 0, message: 'Liste des offres (mock)' })
})

router.get('/:id', (req, res) => {
    res.status(200).json({
        id: req.params.id,
        title: 'Développeur Full Stack (mock)',
        company_name: 'Entreprise mock',
        location_lat: 48.8566,
        location_lng: 2.3522,
        formatted_places: 'Paris, France',
        contract_types: ['CDI'],
        salary_min: 35000,
        salary_max: 45000,
        salary_currency: 'EUR',
        description: 'Description mock',
        publish_date: new Date(),
    })
})

router.post('/save/:id', (req, res) => {
    res.status(200).json({ message: 'Offre sauvegardée (mock)' })
})

router.get('/saved', (req, res) => {
    res.status(200).json({ saved_offers: [], message: 'Offres sauvegardées (mock)' })
})

module.exports = router