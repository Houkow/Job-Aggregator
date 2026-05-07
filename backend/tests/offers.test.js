const request = require('supertest')
const app = require('../src/app')

describe('OFFERS - GET /api/offers', () => {
    it('devrait retourner 200 et une liste d offres', async () => {
        const res = await request(app)
            .get('/api/offers')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('offers')
        expect(Array.isArray(res.body.offers)).toBe(true)
    })

    it('devrait retourner 200 avec un filtre de recherche', async () => {
        const res = await request(app)
            .get('/api/offers?search=developpeur')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('offers')
    })

    it('devrait retourner 200 avec un filtre de localisation', async () => {
        const res = await request(app)
            .get('/api/offers?location=Paris')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('offers')
    })
})

describe('OFFERS - GET /api/offers/:id', () => {
    it('devrait retourner 404 si offre introuvable', async () => {
        const res = await request(app)
            .get('/api/offers/99999')
        expect(res.statusCode).toBe(404)
    })
})