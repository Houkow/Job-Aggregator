const express = require('express')
const router = express.Router()
const { exec } = require('child_process')
const path = require('path')

router.post('/', (req, res) => {

  console.log('Route ingestion appelée')

  const scriptPath = path.resolve(
    __dirname,
    '../../../main/feature/ingest/api.py'
  )

  console.log('Script path :', scriptPath)

  const pythonPath = path.resolve(
    __dirname,
    '../../../main/feature/ingest/venv/bin/python'
  )

  console.log('Python path :', pythonPath)

  const command = `${pythonPath} ${scriptPath}`

  console.log('Commande exécutée :', command)

  const cwd = path.resolve(__dirname, '../../../main/feature/ingest')
  exec(command, { cwd }, (err, stdout, stderr) => {

    console.log('Exec callback déclenché')

    if (err) {
      console.error('Erreur ingestion :', err)
      console.error('stderr :', stderr)

      return res.status(500).json({
        message: 'Erreur lors de l ingestion',
        error: stderr || err.message
      })
    }

    console.log('stdout :', stdout)

    res.status(200).json({
      message: 'Ingestion lancée avec succès',
      output: stdout
    })
  })
})

module.exports = router