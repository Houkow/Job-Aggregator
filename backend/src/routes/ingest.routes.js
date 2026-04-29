const express = require('express')
const router = express.Router()
const { exec } = require('child_process')

router.post('/', (req, res) => {
    exec('python3 ../data/ingestion/main.py', (err, stdout, stderr) => {
        if (err) {
            console.error('Erreur ingestion :', err)
            return res.status(500).json({ message: 'Erreur lors de l ingestion' })
        }
        console.log(stdout)
        res.status(200).json({ message: 'Ingestion lancée avec succès' })
    })
})

module.exports = router