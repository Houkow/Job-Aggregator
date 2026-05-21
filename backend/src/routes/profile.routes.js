const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const authMiddleware = require('../middleware/auth.middleware')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, req.user.id + '_' + file.fieldname + ext)
  }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const user_id = req.user.id
    const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user_id])
    const profile = result.rows[0] || {}
    res.json({
      data: {
        email: req.user.email,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        currentJob: profile.current_job || '',
        experience: profile.experience || '',
        education: profile.education || '',
        skills: profile.skills || '',
        avatar: profile.avatar || null,
        cvName: profile.cv_name || '',
      }
    })
  } catch (err) { next(err) }
})

router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const user_id = req.user.id
    const { firstName, lastName, phone, city, currentJob, experience, education, skills, avatar } = req.body
    await pool.query(
      'INSERT INTO profiles (user_id, first_name, last_name, phone, city, current_job, experience, education, skills, avatar, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) ON CONFLICT (user_id) DO UPDATE SET first_name=$2, last_name=$3, phone=$4, city=$5, current_job=$6, experience=$7, education=$8, skills=$9, avatar=$10, updated_at=NOW()',
      [user_id, firstName, lastName, phone, city, currentJob, experience, education, skills, avatar]
    )
    res.json({ message: 'Profil mis a jour' })
  } catch (err) { next(err) }
})

router.post('/cv', authMiddleware, upload.single('cv'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier recu' })
    const user_id = req.user.id
    const cvName = req.file.originalname
    await pool.query(
      'INSERT INTO profiles (user_id, cv_name, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (user_id) DO UPDATE SET cv_name=$2, updated_at=NOW()',
      [user_id, cvName]
    )
    res.json({ message: 'CV uploade', cvName })
  } catch (err) { next(err) }
})

router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier recu' })
    const user_id = req.user.id
    const avatarUrl = '/uploads/' + req.file.filename
    await pool.query(
      'INSERT INTO profiles (user_id, avatar, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (user_id) DO UPDATE SET avatar=$2, updated_at=NOW()',
      [user_id, avatarUrl]
    )
    res.json({ message: 'Avatar uploade', avatar: avatarUrl })
  } catch (err) { next(err) }
})

module.exports = router