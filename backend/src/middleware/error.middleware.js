const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack)

    const status = err.status || 500
    const message = err.message || 'Erreur interne du serveur'

    res.status(status).json({
        error: {
            message,
            status
        }
    })
}

module.exports = errorMiddleware