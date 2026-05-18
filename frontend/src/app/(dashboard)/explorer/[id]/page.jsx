'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { offersApi, savedApi } from '@/lib/api'
import Navbar from '@/components/Navbar/Navbar'
import Chatbot from '@/components/Chatbot/Chatbot'
import styles from './offer.module.css'

export default function OfferDetailPage({ params }) {
  const { id } = use(params) // ← unwrap la Promise
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchOffer()
  }, [id])

  const fetchOffer = async () => {
    setLoading(true)
    try {
      const data = await offersApi.getOne(id)
      setOffer(data.offer)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (saved) {
        await savedApi.remove(id)
        setSaved(false)
      } else {
        await savedApi.save(id)
        setSaved(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // reste du code identique...

  const daysAgo = offer?.publish_date
    ? Math.floor((Date.now() - new Date(offer.publish_date)) / 86400000)
    : null

  if (loading) {
    return (
      <main className={styles.main}>
        <Navbar />
        <div className={styles.loadingWrap}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </main>
    )
  }

  if (!offer) {
    return (
      <main className={styles.main}>
        <Navbar />
        <div className={styles.notFound}>
          <p>Offre introuvable</p>
          <button onClick={() => router.push('/explorer')}>
            Retour aux offres
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.content}>
        {/* Bouton retour */}
        <button className={styles.backBtn} onClick={() => router.push('/explorer')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Retour aux offres
        </button>

        <div className={styles.layout}>
          {/* Colonne principale */}
          <div className={styles.main_col}>

            {/* Header offre */}
            <div className={styles.header}>
              <div className={styles.headerTop}>
                <div className={styles.companyLogo}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                </div>
                <div className={styles.headerInfo}>
                  <h1 className={styles.title}>{offer.title}</h1>
                  <p className={styles.company}>{offer.company_name}</p>
                </div>
              </div>

              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {offer.formatted_places || 'Non précisé'}
                </span>

                {daysAgo !== null && (
                  <span className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {daysAgo === 0 ? "Aujourd'hui" : `Il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`}
                  </span>
                )}

                <span className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                  {offer.source || 'WeLoveDevs'}
                </span>
              </div>

              <div className={styles.tags}>
                {(offer.contract_types || []).map((c) => (
                  <span key={c} className={`${styles.tag} ${styles.tagContract}`}>{c}</span>
                ))}
                {offer.salary_min && (
                  <span className={`${styles.tag} ${styles.tagSalary}`}>
                    {offer.salary_min}{offer.salary_max ? ` - ${offer.salary_max}` : ''}k€
                  </span>
                )}
                {offer.profession && (
                  <span className={`${styles.tag} ${styles.tagProfession}`}>
                    {offer.profession}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Description du poste</h2>
              {offer.description ? (
                <div
                  className={styles.description}
                  dangerouslySetInnerHTML={{ __html: offer.description }}
                />
              ) : (
                <p className={styles.noDesc}>Aucune description disponible pour cette offre.</p>
              )}
            </div>

            {/* Compétences */}
            {offer.skills && offer.skills.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Compétences requises</h2>
                <div className={styles.skills}>
                  {offer.skills.map((skill) => (
                    <span key={skill} className={styles.skill}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className={styles.sidebar}>
            <div className={styles.sideCard}>
              <button
                className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
                onClick={handleSave}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {saved ? 'Sauvegardée' : 'Sauvegarder'}
              </button>

              <div className={styles.sideInfo}>
                <div className={styles.sideRow}>
                  <span className={styles.sideLabel}>Entreprise</span>
                  <span className={styles.sideValue}>{offer.company_name || '—'}</span>
                </div>
                <div className={styles.sideRow}>
                  <span className={styles.sideLabel}>Localisation</span>
                  <span className={styles.sideValue}>{offer.formatted_places || '—'}</span>
                </div>
                <div className={styles.sideRow}>
                  <span className={styles.sideLabel}>Contrat</span>
                  <span className={styles.sideValue}>{(offer.contract_types || []).join(', ') || '—'}</span>
                </div>
                {offer.salary_min && (
                  <div className={styles.sideRow}>
                    <span className={styles.sideLabel}>Salaire</span>
                    <span className={styles.sideValue}>
                      {offer.salary_min}{offer.salary_max ? ` - ${offer.salary_max}` : ''}k€
                    </span>
                  </div>
                )}
                <div className={styles.sideRow}>
                  <span className={styles.sideLabel}>Source</span>
                  <span className={styles.sideValue}>{offer.source || 'WeLoveDevs'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </main>
  )
}