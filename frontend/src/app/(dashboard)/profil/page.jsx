'use client'

import { useState, useEffect, useRef } from 'react'
import { profileApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar/Navbar'
import Chatbot from '@/components/Chatbot/Chatbot'
import styles from './profil.module.css'

export default function ProfilPage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    currentJob: '',
    experience: '',
    education: '',
    skills: '',
  })
  const [cvFile, setCvFile] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [cvName, setCvName] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const cvInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const data = await profileApi.get()
      const p = data.data || {}
      setForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        email: p.email || user?.email || '',
        phone: p.phone || '',
        city: p.city || '',
        currentJob: p.currentJob || '',
        experience: p.experience || '',
        education: p.education || '',
        skills: p.skills || '',
      })
      if (p.avatar) setAvatar(p.avatar.startsWith('http') ? p.avatar : 'http://localhost:4000' + p.avatar)
      if (p.cvName) setCvName(p.cvName)
    } catch (err) {
      console.error(err)
      setForm((prev) => ({ ...prev, email: user?.email || '' }))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setSuccess(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleCvChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier CV ne doit pas dépasser 5 MB.')
      return
    }
    setCvFile(file)
    setCvName(file.name)
  }

  const handleCvDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier CV ne doit pas dépasser 5 MB.')
      return
    }
    setCvFile(file)
    setCvName(file.name)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await profileApi.update(form)
      if (cvFile) await profileApi.uploadCV(cvFile)
      if (avatarFile) {
        const res = await profileApi.uploadAvatar(avatarFile)
        const fullUrl = res.avatar.startsWith('http') ? res.avatar : 'http://localhost:4000' + res.avatar
        setAvatar(fullUrl)
        updateUser({ avatar: fullUrl })
        localStorage.setItem('userAvatar', fullUrl)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main id="main-content" tabIndex="-1" className={styles.main}>
        <Navbar />
        <div className={styles.loadingWrap}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mon profil</h1>
          <p className={styles.sub}>Gérez vos informations personnelles et votre CV</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Avatar */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Photo de profil
            </h2>
            <div className={styles.avatarRow}>
              <div className={styles.avatarWrap}>
                {avatar ? (
                  <img src={avatar} alt="Photo de profil" className={styles.avatarImg} />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleAvatarChange}
                aria-label="Changer la photo de profil"
              />
              <button
                type="button"
                className={styles.changePhotoBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Changer la photo
              </button>
            </div>
          </section>

          {/* Infos personnelles */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Informations personnelles
            </h2>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="lastName">Nom</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={styles.input}
                  placeholder="Votre nom"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="firstName">Prénom</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={styles.input}
                  placeholder="Votre prénom"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="votre.email@exemple.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="phone">Téléphone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={styles.input}
                  placeholder="+33 6 00 00 00 00"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="city">Ville</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className={styles.input}
                  placeholder="Paris, France"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Expérience */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
              Expérience professionnelle
            </h2>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="currentJob">Poste actuel / recherché</label>
              <input
                id="currentJob"
                name="currentJob"
                type="text"
                className={styles.input}
                placeholder="Ex: Développeur Full Stack"
                value={form.currentJob}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="experience">Expérience</label>
              <textarea
                id="experience"
                name="experience"
                className={styles.textarea}
                placeholder="Décrivez votre parcours professionnel..."
                value={form.experience}
                onChange={handleChange}
                rows={5}
              />
            </div>
          </section>

          {/* Formation */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              Formation
            </h2>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="education">Diplômes et formations</label>
              <textarea
                id="education"
                name="education"
                className={styles.textarea}
                placeholder="Décrivez votre parcours académique..."
                value={form.education}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </section>

          {/* Compétences */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Compétences
            </h2>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="skills">Technologies et compétences clés</label>
              <textarea
                id="skills"
                name="skills"
                className={styles.textarea}
                placeholder="Ex: React, Node.js, TypeScript, Docker..."
                value={form.skills}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </section>

          {/* CV */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Curriculum Vitae
            </h2>
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className={styles.hiddenInput}
              onChange={handleCvChange}
              aria-label="Importer votre CV"
            />
            <div
              className={`${styles.dropzone} ${cvName ? styles.dropzoneActive : ''}`}
              onClick={() => cvInputRef.current?.click()}
              onDrop={handleCvDrop}
              onDragOver={(e) => e.preventDefault()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && cvInputRef.current?.click()}
              aria-label="Zone de dépôt du CV"
            >
              {cvName ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p className={styles.dropzoneFile}>{cvName}</p>
                  <span className={styles.dropzoneSub}>Cliquez pour changer</span>
                </>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className={styles.dropzoneText}>
                    Glissez votre CV ici ou cliquez pour le sélectionner
                  </p>
                  <span className={styles.dropzoneSub}>PDF, DOC ou DOCX — Maximum 5 MB</span>
                </>
              )}
            </div>
          </section>

          {/* Messages */}
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

          {success && (
            <div className={styles.successMsg} role="status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Profil sauvegardé avec succès !
            </div>
          )}

          {/* Submit */}
          <div className={styles.submitRow}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Sauvegarder le profil
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Chatbot />
    </main>
  )
}