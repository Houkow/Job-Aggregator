const pool = require('../config/db')

const getAllOffers = async (req, res, next) => {
    try {
        const { search, location, contract_type, salary_min, page = 1, limit = 20 } = req.query
        const offset = (page - 1) * limit
        let conditions = []
        let values = []
        let i = 1

        if (search) {
            conditions.push(`(title ILIKE $${i} OR description ILIKE $${i})`)
            values.push(`%${search}%`)
            i++
        }

        if (location) {
            conditions.push(`formatted_places ILIKE $${i}`)
            values.push(`%${location}%`)
            i++
        }

        if (contract_type) {
            conditions.push(`$${i} = ANY(contract_types)`)
            values.push(contract_type)
            i++
        }

        if (salary_min) {
            conditions.push(`salary_min >= $${i}`)
            values.push(salary_min)
            i++
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const offersQuery = await pool.query(
            `SELECT * FROM offers ${where} ORDER BY publish_date DESC LIMIT $${i} OFFSET $${i + 1}`,
            [...values, limit, offset]
        )

        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM offers ${where}`,
            values
        )

        res.status(200).json({
            offers: offersQuery.rows,
            total: parseInt(countQuery.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        })

    } catch (err) {
        next(err)
    }
}

const getOfferById = async (req, res, next) => {
    try {
        const { id } = req.params

        const offer = await pool.query(
            'SELECT * FROM offers WHERE id = $1', [id]
        )

        if (offer.rows.length === 0) {
            return res.status(404).json({ message: 'Offre introuvable' })
        }

        res.status(200).json({ offer: offer.rows[0] })

    } catch (err) {
        next(err)
    }
}

const saveOffer = async (req, res, next) => {
    try {
        const { id } = req.params
        const user_id = req.user.id

        await pool.query(
            'INSERT INTO saved_offers (user_id, offer_id) VALUES ($1, $2)',
            [user_id, id]
        )

        res.status(200).json({ message: 'Offre sauvegardée' })

    } catch (err) {
        next(err)
    }
}

const getSavedOffers = async (req, res, next) => {
    try {
        const user_id = req.user.id

        const saved = await pool.query(
            `SELECT offers.* FROM offers 
             JOIN saved_offers ON offers.id = saved_offers.offer_id 
             WHERE saved_offers.user_id = $1`,
            [user_id]
        )

        res.status(200).json({ saved_offers: saved.rows })

    } catch (err) {
        next(err)
    }
}

module.exports = { getAllOffers, getOfferById, saveOffer, getSavedOffers }