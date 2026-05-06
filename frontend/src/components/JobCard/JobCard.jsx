'use client'

import { useRouter } from 'next/navigation'
import styles from './JobCard.module.css'

export default function JobCard({ offer, saved, onSave }) {
  const router = useRouter()

  const daysAgo = offer.createdAt
    ? Math.floor((Date.now() - new Date(offer.createdAt)) / 86400000)
    : null

  const handleSave = (e) => {
    e.stopPropagation()
    onSave()
  }

  return (
    <div
      className={styles.card}
      onClick={() => router.push(`/explorer/${offer.id}`)}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/explorer/${offer.id}`)}
      aria-label={`Offre : ${offer.title} chez ${offer.company}`}
    >
      <div className={styles.main}>
        <div className={styles.logo}>
          {offer.companyLogo ? (
            <img src={offer.companyLogo} alt={offer.company} className={styles.logoImg} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          )}
        </div>

        <div className={styles.info}>
          <h3 className={styles.title}>{offer.title}</h3>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
              {offer.company}
            </span>
            <span className={styles.metaItem}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {offer.location || 'Non précisé'}
            </span>
            {daysAgo !== null && (
              <span className={styles.metaItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {daysAgo === 0 ? "Aujourd'hui" : `Il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          <div className={styles.tags}>
            {offer.contractType && (
              <span className={`${styles.tag} ${styles.tagContract}`}>
                {offer.contractType}
              </span>
            )}
            {offer.salary && (
              <span className={`${styles.tag} ${styles.tagSalary}`}>
                {offer.salary}
              </span>
            )}
            {offer.experience && (
              <span className={`${styles.tag} ${styles.tagExp}`}>
                {offer.experience}
              </span>
            )}
            {(offer.skills || []).slice(0, 3).map((skill) => (
              <span key={skill} className={styles.tag}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
        onClick={handleSave}
        aria-label={saved ? "Retirer des favoris" : "Sauvegarder l'offre"}
        title={saved ? "Retirer des favoris" : "Sauvegarder"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
  )
}