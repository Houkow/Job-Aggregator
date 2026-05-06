'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar/Navbar'
import Chatbot from '@/components/Chatbot/Chatbot'
import styles from './page.module.css'

export default function Home() {
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/explorer?q=${encodeURIComponent(search.trim())}`)
    } else {
      router.push('/explorer')
    }
  }

  return (
    <main className={styles.main}>
      <Navbar />
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="12"/>
          </svg>
        </div>
        <h1 className={styles.title}>Trouvez votre emploi idéal</h1>
        <p className={styles.subtitle}>
          Discutez avec notre assistant pour découvrir les meilleures opportunités
        </p>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Que cherchez-vous ? (ex: Développeur React à Paris)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un emploi"
          />
          <button className={styles.searchBtn} type="submit" aria-label="Lancer la recherche">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>

        <div className={styles.cards}>
          <button className={styles.card} onClick={() => router.push('/explorer')}>
            <div className={styles.cardIcon} style={{ background: '#e8f0fe' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b8dee" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <span className={styles.cardTitle}>Explorer</span>
            <span className={styles.cardSub}>Découvrir toutes les offres</span>
          </button>

          <button className={styles.card} onClick={() => router.push('/mes-offres')}>
            <div className={styles.cardIcon} style={{ background: '#f3e8ff' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9f6ef5" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <span className={styles.cardTitle}>Mes offres</span>
            <span className={styles.cardSub}>Offres sauvegardées et postulées</span>
          </button>

          <button className={styles.card} onClick={() => router.push('/profil')}>
            <div className={styles.cardIcon} style={{ background: '#e8fdf5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34c78a" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className={styles.cardTitle}>Mon profil</span>
            <span className={styles.cardSub}>Gérer mes informations et CV</span>
          </button>
        </div>
      </div>

      <Chatbot />
    </main>
  )
}