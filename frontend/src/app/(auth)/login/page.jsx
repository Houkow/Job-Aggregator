'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import styles from './login.module.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      const data = await authApi.login(form.email, form.password)
      login(data.token, data.user)
      router.push('/')
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="12"/>
            </svg>
          </div>
          <h1 className={styles.title}>JobSearch</h1>
        </div>

        <h2 className={styles.heading}>Connexion</h2>
        <p className={styles.sub}>Content de vous voir !</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              placeholder="votre@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              aria-required="true"
            />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            className={styles.btn}
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <span className={styles.spinner} /> : 'Se connecter'}
          </button>
        </form>

        <p className={styles.footer}>
          Pas encore de compte ?{' '}
          <button className={styles.link} onClick={() => router.push('/register')}>
            S'inscrire
          </button>
        </p>
      </div>
    </main>
  )
}