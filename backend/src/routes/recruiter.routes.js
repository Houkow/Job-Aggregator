// routes/recruiter.routes.js
const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const authMiddleware = require('../middleware/auth.middleware')
const roleMiddleware = require('../middleware/role.middleware')

// Créer une offre
router.post('/', authMiddleware, roleMiddleware('employer', 'admin'), async (req, res, next) => {
  try {
    const { title, description, company_name, contract_types, location, salary_min, salary_max, salary_currency } = req.body
    const offer = await pool.query(
      `INSERT INTO recruiter_offers 
      (recruiter_id, title, description, company_name, contract_types, location, salary_min, salary_max, salary_currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.user.id, title, description, company_name, contract_types, location, salary_min, salary_max, salary_currency]
    )
    res.status(201).json({ offer: offer.rows[0] })
  } catch (err) {
    next(err)
  }
})

// Mes offres postées
router.get('/my', authMiddleware, roleMiddleware('employer', 'admin'), async (req, res, next) => {
  try {
    const offers = await pool.query(
      'SELECT * FROM recruiter_offers WHERE recruiter_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.status(200).json({ offers: offers.rows })
  } catch (err) {
    next(err)
  }
})

// Supprimer une offre
router.delete('/:id', authMiddleware, roleMiddleware('employer', 'admin'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM recruiter_offers WHERE id = $1 AND recruiter_id = $2', [req.params.id, req.user.id])
    res.status(200).json({ message: 'Offre supprimée' })
  } catch (err) {
    next(err)
  }
})

module.exports = router