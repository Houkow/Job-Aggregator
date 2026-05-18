'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { adminApi, offersApi } from '@/lib/api'
import Navbar from '@/components/Navbar/Navbar'
import styles from './admin.module.css'

const TABS = [
  { id: 'users', label: 'Utilisateurs' },
  { id: 'offers', label: 'Offres' },
  { id: 'ingest', label: 'Ingestion' },
]

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [offers, setOffers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [ingestResult, setIngestResult] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    if (tab === 'users') fetchUsers()
    if (tab === 'offers') fetchOffers()
  }, [tab])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await adminApi.getUsers()
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchOffers = async () => {
    setLoadingOffers(true)
    try {
      const data = await adminApi.getOffers()
      setOffers(data.offers || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingOffers(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await adminApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleRoleChange = async (id, role) => {
    try {
      await adminApi.updateUser(id, { role })
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteOffer = async (id) => {
    if (!confirm('Supprimer cette offre ?')) return
    try {
      await adminApi.deleteOffer(id)
      setOffers((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleIngest = async () => {
    setIngesting(true)
    setIngestResult(null)
    try {
      const data = await offersApi.ingest()
      setIngestResult({
        success: true,
        message: data.message || `${data.count || 0} offres importées avec succès.`,
      })
    } catch (err) {
      setIngestResult({ success: false, message: err.message })
    } finally {
      setIngesting(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredOffers = offers.filter(
    (o) =>
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.company?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Administration</h1>
          <p className={styles.sub}>Gérez les utilisateurs, les offres et les imports</p>
        </div>

        {/* Stats rapides */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#eff6ff' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p className={styles.statValue}>{users.length}</p>
              <p className={styles.statLabel}>Utilisateurs</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#f0fdf4' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <div>
              <p className={styles.statValue}>{offers.length}</p>
              <p className={styles.statLabel}>Offres</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#faf5ff' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p className={styles.statValue}>
                {users.filter((u) => u.role === 'admin').length}
              </p>
              <p className={styles.statLabel}>Admins</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fff7ed' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div>
              <p className={styles.statValue}>
                {offers.filter((o) => {
                  const d = new Date(o.createdAt)
                  return Date.now() - d < 86400000 * 7
                }).length}
              </p>
              <p className={styles.statLabel}>Offres cette semaine</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => { setTab(t.id); setSearch('') }}
              role="tab"
              aria-selected={tab === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab !== 'ingest' && (
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder={tab === 'users' ? 'Rechercher un utilisateur...' : 'Rechercher une offre...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher"
            />
          </div>
        )}

        {/* Tab: Users */}
        {tab === 'users' && (
          <div className={styles.tableWrap}>
            {loadingUsers ? (
              <div className={styles.loadingList}>
                {[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : (
              <table className={styles.table} role="table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Inscrit le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar}>
                            {u.avatar
                              ? <img src={u.avatar} alt={u.name} />
                              : u.name?.[0]?.toUpperCase() || '?'
                            }
                          </div>
                          <span>{u.name || '—'}</span>
                        </div>
                      </td>
                      <td className={styles.emailCell}>{u.email}</td>
                      <td>
                        <select
                          className={styles.roleSelect}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          aria-label={`Rôle de ${u.name}`}
                        >
                          <option value="user">Candidat</option>
                          <option value="employer">Employeur</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className={styles.dateCell}>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteUser(u.id)}
                          aria-label={`Supprimer ${u.name}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Offers */}
        {tab === 'offers' && (
          <div className={styles.tableWrap}>
            {loadingOffers ? (
              <div className={styles.loadingList}>
                {[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : (
              <table className={styles.table} role="table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Entreprise</th>
                    <th>Localisation</th>
                    <th>Contrat</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map((o) => (
                    <tr key={o.id}>
                      <td className={styles.titleCell}>{o.title}</td>
                      <td>{o.company}</td>
                      <td>{o.location || '—'}</td>
                      <td>
                        {o.contractType && (
                          <span className={styles.contractBadge}>{o.contractType}</span>
                        )}
                      </td>
                      <td className={styles.dateCell}>
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteOffer(o.id)}
                          aria-label={`Supprimer l'offre ${o.title}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Ingest */}
        {tab === 'ingest' && (
          <div className={styles.ingestWrap}>
            <div className={styles.ingestCard}>
              <div className={styles.ingestIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <h2 className={styles.ingestTitle}>Importer les offres WeLoveDevs</h2>
              <p className={styles.ingestSub}>
                Déclenchez manuellement l'ingestion des offres depuis l'API WeLoveDevs.
                Les données seront normalisées avant stockage.
              </p>

              {ingestResult && (
                <div
                  className={ingestResult.success ? styles.ingestSuccess : styles.ingestError}
                  role="status"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {ingestResult.success
                      ? <polyline points="20 6 9 17 4 12"/>
                      : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                    }
                  </svg>
                  {ingestResult.message}
                </div>
              )}

              <button
                className={styles.ingestBtn}
                onClick={handleIngest}
                disabled={ingesting}
                aria-busy={ingesting}
              >
                {ingesting ? (
                  <>
                    <span className={styles.spinner} />
                    Importation en cours...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 .49-3.96"/>
                    </svg>
                    Lancer l'importation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}