const express = require('express')
const router = express.Router()
const { exec } = require('child_process')
const path = require('path')

router.post('/', (req, res) => {
  // Chemin absolu vers le script python
  const scriptPath = path.join(__dirname, '../../main/feature/ingest/api.py')
  
  exec(`python3 ${scriptPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Erreur ingestion :', err)
      console.error('stderr:', stderr)
      return res.status(500).json({ message: 'Erreur lors de l ingestion' })
    }
    console.log(stdout)
    res.status(200).json({ message: 'Ingestion lancée avec succès' })
  })
})

module.exports = router