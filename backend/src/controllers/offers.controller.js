const pool = require('../config/db')

const getAllOffers = async (req, res, next) => {
    try {
        const {
            search,
            location,
            contract_type,
            salary_min,
            experience,
            sort,
            page = 1,
            limit = 20
        } = req.query

        const offset = (page - 1) * limit

        let conditions = []
        let values = []
        let i = 1

        // Recherche texte
        if (search) {
            conditions.push(`(title ILIKE $${i} OR description ILIKE $${i})`)
            values.push(`%${search}%`)
            i++
        }

        // Ville / localisation
        if (location) {
            conditions.push(`formatted_places ILIKE $${i}`)
            values.push(`%${location}%`)
            i++
        }

        // Contract type
        if (contract_type) {
            conditions.push(`
                EXISTS (
                    SELECT 1
                    FROM unnest(contract_types) ct
                    WHERE ct ILIKE $${i}
                )
            `)

            values.push(`%${contract_type}%`)
            i++
        }

        // Salaire minimum
        if (salary_min) {
            conditions.push(`salary_min >= $${i}`)
            values.push(salary_min)
            i++
        }

        // Expérience
        if (experience && experience !== 'Tous niveaux') {

            const expKeywords = {
                'Junior (0-2 ans)': [
                    'junior',
                    'débutant',
                    '0-2',
                    'entry'
                ],

                'Confirmé (2-5 ans)': [
                    'confirmé',
                    'confirme',
                    '2-5',
                    'intermédiaire',
                    'intermediate',
                    'mid'
                ],

                'Senior (5+ ans)': [
                    'senior',
                    '5 ans',
                    '5+',
                    'expert'
                ]
            }

            const keywords = expKeywords[experience] || []

            if (keywords.length > 0) {

                const expConditions = keywords
                    .map(() => `title ILIKE $${i++}`)
                    .join(' OR ')

                conditions.push(`(${expConditions})`)

                keywords.forEach(keyword => {
                    values.push(`%${keyword}%`)
                })
            }
        }

        // WHERE
        const where =
            conditions.length > 0
                ? `WHERE ${conditions.join(' AND ')}`
                : ''

        // SORT
        let orderBy = 'ORDER BY publish_date DESC'

        if (sort === 'salary_desc') {
            orderBy = 'ORDER BY salary_min DESC NULLS LAST'
        }

        if (sort === 'salary_asc') {
            orderBy = 'ORDER BY salary_min ASC NULLS LAST'
        }

        // QUERY OFFERS
        const offersQuery = await pool.query(
            `
            SELECT *
            FROM offers
            ${where}
            ${orderBy}
            LIMIT $${i}
            OFFSET $${i + 1}
            `,
            [...values, limit, offset]
        )

        // QUERY COUNT
        const countQuery = await pool.query(
            `
            SELECT COUNT(*)
            FROM offers
            ${where}
            `,
            values
        )

        return res.status(200).json({
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

const removeSavedOffer = async (req, res, next) => {
    try {
        const { id } = req.params
        const user_id = req.user.id
        await pool.query(
            'DELETE FROM saved_offers WHERE user_id = $1 AND offer_id = $2',
            [user_id, id]
        )
        res.status(200).json({ message: 'Offre retirée des favoris' })
    } catch (err) {
        next(err)
    }
}

const updateSavedOfferStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body
        const user_id = req.user.id

        if (!['saved', 'in_progress', 'sent', 'interview', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' })
        }

        await pool.query(
            'UPDATE saved_offers SET status = $1 WHERE user_id = $2 AND offer_id = $3',
            [status, user_id, id]
        )
        res.status(200).json({ message: 'Statut mis à jour' })
    } catch (err) {
        next(err)
    }
}

module.exports = { getAllOffers, getOfferById, saveOffer, getSavedOffers, removeSavedOffer, updateSavedOfferStatus }