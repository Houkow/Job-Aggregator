const express = require('express')
const router = express.Router()
const { exec } = require('child_process')
const path = require('path')

router.post('/', (req, res) => {

  const scriptPath = path.resolve(
    __dirname,
    '../../../main/feature/ingest/api.py'
  )

  const pythonPath = path.resolve(
    __dirname,
    '../../../main/feature/ingest/venv/bin/python'
  )

  exec(`${pythonPath} ${scriptPath}`, (err, stdout, stderr) => {

    if (err) {
      console.error('Erreur ingestion :', err)
      console.error('stderr:', stderr)
      return res.status(500).json({
        message: 'Erreur lors de l ingestion'
      })
    }

    console.log(stdout)

    res.status(200).json({
      message: 'Ingestion lancée avec succès'
    })
  })
})

module.exports = router