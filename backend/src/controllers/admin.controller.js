const pool = require('../config/db')

const getAllUsers = async (req, res, next) => {
    try {
        const users = await pool.query(
            'SELECT id, email, role_id, is_active, created_at FROM users ORDER BY created_at DESC'
        )

        res.status(200).json({ users: users.rows })

    } catch (err) {
        next(err)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params

        const user = await pool.query(
            'SELECT * FROM users WHERE id = $1', [id]
        )

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable' })
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id])

        res.status(200).json({ message: 'Utilisateur supprimé' })

    } catch (err) {
        next(err)
    }
}

const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params
        const { role_id } = req.body

        const user = await pool.query(
            'SELECT * FROM users WHERE id = $1', [id]
        )

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable' })
        }

        await pool.query(
            'UPDATE users SET role_id = $1 WHERE id = $2',
            [role_id, id]
        )

        res.status(200).json({ message: 'Rôle mis à jour' })

    } catch (err) {
        next(err)
    }
}

const getOffersToModerate = async (req, res, next) => {
    try {
        const offers = await pool.query(
            `SELECT * FROM recruiter_offers WHERE status = 'pending' ORDER BY created_at DESC`
        )

        res.status(200).json({ offers: offers.rows })

    } catch (err) {
        next(err)
    }
}

const updateOfferStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' })
        }

        const offer = await pool.query(
            'SELECT * FROM recruiter_offers WHERE id = $1', [id]
        )

        if (offer.rows.length === 0) {
            return res.status(404).json({ message: 'Offre introuvable' })
        }

        await pool.query(
            'UPDATE recruiter_offers SET status = $1 WHERE id = $2',
            [status, id]
        )

        res.status(200).json({ message: `Offre ${status}` })

    } catch (err) {
        next(err)
    }
}

module.exports = { getAllUsers, deleteUser, updateUserRole, getOffersToModerate, updateOfferStatus }