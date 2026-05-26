// const express = require('express')
// const router = express.Router()
// const { exec } = require('child_process')
// const path = require('path')

// router.post('/', (req, res) => {

//   console.log('Route ingestion appelée')

//   const scriptPath = path.resolve(
//     __dirname,
//     '../../../main/feature/ingest/api.py'
//   )

//   console.log('Script path :', scriptPath)

//   const pythonPath = path.resolve(
//     __dirname,
//     '../../../main/feature/ingest/venv/bin/python'
//   )

//   console.log('Python path :', pythonPath)

//   const command = `${pythonPath} ${scriptPath}`

//   console.log('Commande exécutée :', command)

//   const cwd = path.resolve(__dirname, '../../../main/feature/ingest')
//   exec(command, { cwd }, (err, stdout, stderr) => {

//     console.log('Exec callback déclenché')

//     if (err) {
//       console.error('Erreur ingestion :', err)
//       console.error('stderr :', stderr)

//       return res.status(500).json({
//         message: 'Erreur lors de l ingestion',
//         error: stderr || err.message
//       })
//     }

//     console.log('stdout :', stdout)

//     res.status(200).json({
//       message: 'Ingestion lancée avec succès',
//       output: stdout
//     })
//   })
// })

// module.exports = router
const express = require('express')
const router = express.Router()

const CHATBOT_URL = process.env.CHATBOT_URL || 'http://chatbot-api:5000'

router.post('/', async (req, res) => {
  console.log('Route ingestion appelée')
  try {
    const response = await fetch(`${CHATBOT_URL}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ message: 'Erreur lors de l ingestion', error: err })
    }

    const data = await response.json()
    res.status(200).json({ message: 'Ingestion lancée avec succès', output: data })
  } catch (err) {
    console.error('Erreur ingestion :', err)
    res.status(500).json({ message: 'Erreur lors de l ingestion', error: err.message })
  }
})

module.exports = router