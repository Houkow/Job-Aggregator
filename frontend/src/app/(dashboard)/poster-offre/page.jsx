'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { recruiterApi } from '@/lib/api'
import Navbar from '@/components/Navbar/Navbar'
import Chatbot from '@/components/Chatbot/Chatbot'
import styles from './poster-offre.module.css'

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance']

export default function PosterOffrePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [myOffers, setMyOffers] = useState([])
  const [loadingOffers, setLoadingOffers] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    company_name: '',
    location: '',
    contract_types: [],
    salary_min: '',
    salary_max: '',
    salary_currency: 'EUR',
  })

  useEffect(() => {
    if (user && user.role !== 'employer' && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    fetchMyOffers()
  }, [])

  const fetchMyOffers = async () => {
    setLoadingOffers(true)
    try {
      const data = await recruiterApi.getMy()
      setMyOffers(data.offers || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingOffers(false)
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setSuccess(false)
  }

  const handleContractToggle = (type) => {
    setForm((prev) => ({
      ...prev,
      contract_types: prev.contract_types.includes(type)
        ? prev.contract_types.filter((t) => t !== type)
        : [...prev.contract_types, type],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.company_name || !form.description) {
      setError('Veuillez remplir au moins le titre, l\'entreprise et la description.')
      return
    }
    if (form.contract_types.length === 0) {
      setError('Veuillez sélectionner au moins un type de contrat.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await recruiterApi.create({
        ...form,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      })
      setSuccess(true)
      setForm({
        title: '',
        description: '',
        company_name: '',
        location: '',
        contract_types: [],
        salary_min: '',
        salary_max: '',
        salary_currency: 'EUR',
      })
      fetchMyOffers()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette offre ?')) return
    try {
      await recruiterApi.delete(id)
      setMyOffers((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Poster une offre</h1>
          <p className={styles.sub}>Publiez une offre d'emploi visible par tous les candidats</p>
        </div>

        <div className={styles.layout}>
          {/* Formulaire */}
          <div className={styles.formCol}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Informations du poste</h2>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="title">Titre du poste *</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className={styles.input}
                    placeholder="Ex: Développeur Full Stack React/Node.js"
                    value={form.title}
                    onChange={handleChange}
                    aria-required="true"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="company_name">Entreprise *</label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    className={styles.input}
                    placeholder="Nom de votre entreprise"
                    value={form.company_name}
                    onChange={handleChange}
                    aria-required="true"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="location">Localisation</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    className={styles.input}
                    placeholder="Ex: Paris, France / Remote"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Type de contrat *</label>
                  <div className={styles.contractGroup}>
                    {CONTRACT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`${styles.contractBtn} ${form.contract_types.includes(type) ? styles.contractBtnActive : ''}`}
                        onClick={() => handleContractToggle(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="salary_min">Salaire min (k€)</label>
                    <input
                      id="salary_min"
                      name="salary_min"
                      type="number"
                      className={styles.input}
                      placeholder="Ex: 40"
                      value={form.salary_min}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="salary_max">Salaire max (k€)</label>
                    <input
                      id="salary_max"
                      name="salary_max"
                      type="number"
                      className={styles.input}
                      placeholder="Ex: 60"
                      value={form.salary_max}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Description</h2>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="description">Description du poste *</label>
                  <textarea
                    id="description"
                    name="description"
                    className={styles.textarea}
                    placeholder="Décrivez le poste, les missions, le profil recherché..."
                    value={form.description}
                    onChange={handleChange}
                    rows={8}
                    aria-required="true"
                  />
                </div>
              </section>

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
                  Offre publiée avec succès !
                </div>
              )}

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
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Publier l'offre
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Mes offres */}
          <div className={styles.offersCol}>
            <h2 className={styles.offersTitle}>Mes offres publiées</h2>

            {loadingOffers ? (
              <div className={styles.loadingList}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : myOffers.length === 0 ? (
              <div className={styles.empty}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
                <p>Aucune offre publiée</p>
              </div>
            ) : (
              <div className={styles.offerList}>
                {myOffers.map((offer) => (
                  <div key={offer.id} className={styles.offerCard}>
                    <div className={styles.offerInfo}>
                      <h3 className={styles.offerTitle}>{offer.title}</h3>
                      <p className={styles.offerCompany}>{offer.company_name}</p>
                      <div className={styles.offerMeta}>
                        {offer.location && (
                          <span className={styles.offerMetaItem}>{offer.location}</span>
                        )}
                        {(offer.contract_types || []).map((c) => (
                          <span key={c} className={styles.offerBadge}>{c}</span>
                        ))}
                        <span className={`${styles.offerStatus} ${styles[`status_${offer.status}`]}`}>
                          {offer.status === 'pending' ? 'En attente' : offer.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                        </span>
                      </div>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(offer.id)}
                      aria-label="Supprimer l'offre"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Chatbot />
    </main>
  )
}