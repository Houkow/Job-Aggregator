'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { savedApi } from '@/lib/api'
import Navbar from '@/components/Navbar/Navbar'
import Chatbot from '@/components/Chatbot/Chatbot'
import { STATUS_LABELS, STATUS_COLORS } from '@/types/index'
import styles from './mes-offres.module.css'

export default function MesOffresPage() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSaved()
  }, [])

  const fetchSaved = async () => {
    setLoading(true)
    try {
      const data = await savedApi.getAll()
      setOffers(data.saved_offers || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (offerId) => {
    try {
      await savedApi.remove(offerId)
      setOffers((prev) => prev.filter((o) => o.id !== offerId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusChange = async (offerId, status) => {
    try {
      await savedApi.updateStatus(offerId, status)
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status } : o))
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mes offres sauvegardées</h1>
          <p className={styles.sub}>
            {offers.length} offre{offers.length !== 1 ? 's' : ''} dans votre sélection
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingList}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            <p>Aucune offre sauvegardée</p>
            <span>Explorez les offres et sauvegardez celles qui vous intéressent</span>
            <button className={styles.exploreBtn} onClick={() => router.push('/explorer')}>
              Explorer les offres
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {offers.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.cardInfo}>
                    <h2 className={styles.cardTitle}>{item.title || 'Offre'}</h2>
                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2"/>
                          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        </svg>
                        {item.company || '—'}
                      </span>
                      <span className={styles.metaItem}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {item.formatted_places || '—'}
                      </span>
                      <span className={styles.metaItem}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Sauvegardée{' '}
                        {item.publish_date
                          ? `il y a ${Math.floor((Date.now() - new Date(item.publish_date)) / 86400000)} jour(s)`
                          : 'récemment'}
                      </span>
                    </div>

                    <div className={styles.tags}>
                      <select
                        className={styles.statusSelect}
                        value={item.status || 'saved'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        style={{ color: STATUS_COLORS[item.status || 'saved'] }}
                        aria-label="Changer le statut de candidature"
                      >
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>

                      {item.salary_min && (
                        <span className={`${styles.tag} ${styles.tagSalary}`}>
                          {item.salary_min}{item.salary_max ? ` - ${item.salary_max}` : ''}€
                        </span>
                      )}

                      {(item.contract_types || []).slice(0, 1).map((c) => (
                        <span key={c} className={`${styles.tag} ${styles.tagContract}`}>{c}</span>
                      ))}

                      {(item.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => router.push(`/explorer/${item.id}`)}
                    aria-label="Voir l'offre"
                    title="Voir l'offre"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => handleRemove(item.id)}
                    aria-label="Supprimer l'offre"
                    title="Supprimer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Chatbot />
    </main>
  )
}