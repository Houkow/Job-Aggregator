const request = require('supertest')
const app = require('../src/app')

describe('AUTH - POST /api/auth/register', () => {
    it('devrait retourner 201 si inscription réussie', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@test.com',
                password: 'motdepasse123'
            })
        expect(res.statusCode).toBe(201)
    })

    it('devrait retourner 400 si email manquant', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                password: 'motdepasse123'
            })
        expect(res.statusCode).toBe(400)
    })
z
    it('devrait retourner 400 si mot de passe manquant', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@test.com'
            })
        expect(res.statusCode).toBe(400)
    })
})

describe('AUTH - POST /api/auth/login', () => {
    it('devrait retourner 200 et un token si connexion réussie', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'motdepasse123'
            })
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('token')
    })

    it('devrait retourner 401 si mauvais mot de passe', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'mauvaismdp'
            })
        expect(res.statusCode).toBe(401)
    })
})