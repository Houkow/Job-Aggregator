const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email déjà utilisé' })
    }
    const roleMap = { user: 1, admin: 2, employer: 3 }
    const role_id = roleMap[role] || 1
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await pool.query(
      'INSERT INTO users (email, password, role_id) VALUES ($1, $2, $3) RETURNING id, email, role_id',
      [email, hashedPassword, role_id]
    )
    res.status(201).json({
      message: 'Inscription réussie',
      user: newUser.rows[0]
    })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password)
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    // ← ICI le changement : role en string dans le JWT
    const roleMap = { 1: 'user', 2: 'admin', 3: 'employer' }
    const token = jwt.sign(
      { id: user.rows[0].id, role: roleMap[user.rows[0].role_id] },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      role: user.rows[0].role_id,
      email: user.rows[0].email,
    })
  } catch (err) {
    next(err)
  }
}

const logout = (req, res) => {
  res.status(200).json({ message: 'Déconnexion réussie' })
}

module.exports = { register, login, logout }