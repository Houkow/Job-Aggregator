 const express = require('express')
const router = express.Router()

const CHATBOT_URL = process.env.CHATBOT_URL || 'http://localhost:5000'

/**
 * POST /api/chatbot
 *
 * Reçoit le message du front Next.js et le forward
 * au serveur FastAPI Python (port 5000).
 *
 * Body attendu :
 *   { message: string, history: Array<{role: string, content: string}> }
 *
 * Réponse retournée au front :
 *   { reply, redirect, url?, offers, filters }
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Le champ message est requis' })
    }

    // Forward vers FastAPI Python
    const response = await fetch(`${CHATBOT_URL}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim(), history }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[chatbot.routes] Erreur FastAPI :', errText)
      return res.status(502).json({ message: 'Le service chatbot est indisponible' })
    }

    const data = await response.json()
    return res.status(200).json(data)

  } catch (err) {
    // FastAPI down ou réseau KO
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'Le service chatbot est actuellement hors ligne'
      })
    }
    next(err)
  }
})

module.exports = router 