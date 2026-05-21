'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { offersApi, savedApi } from '@/lib/api'
import Navbar from '@/components/Navbar/Navbar'
import JobCard from '@/components/JobCard/JobCard'
import Chatbot from '@/components/Chatbot/Chatbot'
import styles from './explorer.module.css'

const CONTRACT_TYPES = ['Tous', 'CDI', 'CDD', 'Stage', 'Alternance', 'Freelance']
const EXPERIENCE_LEVELS = ['Tous niveaux', 'Junior (0-2 ans)', 'Confirmé (2-5 ans)', 'Senior (5+ ans)']
const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'salary_desc', label: 'Salaire décroissant' },
  { value: 'salary_asc', label: 'Salaire croissant' },
]

const CONTRACT_MAP = {
  'CDI': 'permanent',
  'CDD': 'fixedTerm',
  'Stage': 'internship',
  'Alternance': 'apprenticeship',
  'Freelance': 'freelance',
  'Temps partiel': 'partTime',
}

export default function ExplorerPage() {
  const searchParams = useSearchParams()
  const [offers, setOffers] = useState([])
  const [recommended, setRecommended] = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '', // Récupère "Paris"
    contract: searchParams.get('contract_type') || 'Tous', // Récupère le type de contrat si existant
    experience: searchParams.get('experience') || 'Tous niveaux',
    sort: 'recent',
  })

  // 2. CRUCIAL : Met à jour les champs si l'utilisateur utilise le chatbot 
  // alors qu'il se trouve déjà sur la page /explorer
  useEffect(() => {
    const loc = searchParams.get('location') || '';
    const contract = searchParams.get('contract_type') || 'Tous';
    
    // Si l'URL contient une localisation ou un contrat, on ouvre automatiquement le volet des filtres pour l'afficher à l'écran
    if (loc || contract !== 'Tous') {
      setFiltersOpen(true);
    }

    setFilters({
      q: searchParams.get('q') || '',
      location: loc,
      contract: contract,
      experience: searchParams.get('experience') || 'Tous niveaux',
      sort: 'recent',
    });
  }, [searchParams]);

  const fetchOffers = useCallback(async () => {
  setLoading(true)

  try {
    const params = {}

    if (filters.q) params.search = filters.q
    if (filters.location) params.location = filters.location

    if (filters.contract !== 'Tous') {
      params.contract_type =
        CONTRACT_MAP[filters.contract] || filters.contract
    }

    if (filters.experience !== 'Tous niveaux') {
      params.experience = filters.experience
    }

    if (filters.sort) {
      params.sort = filters.sort
    }

    params.page = page
    params.limit = 20

    const [offersData, savedData] = await Promise.allSettled([
      offersApi.getAll(params),
      savedApi.getAll(),
    ])

    if (offersData.status === 'fulfilled') {
      setOffers(offersData.value.offers || [])
      setRecommended((offersData.value.offers || []).slice(0, 5))
      setTotal(offersData.value.total || 0)
    }

    if (savedData.status === 'fulfilled') {
      setSavedIds(new Set((savedData.value.saved_offers || []).map((s) => s.id)))
    }

  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}, [filters, page])

  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  const handleSave = async (offerId) => {
    try {
      if (savedIds.has(offerId)) {
        await savedApi.remove(offerId)
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.delete(offerId)
          return next
        })
      } else {
        await savedApi.save(offerId)
        setSavedIds((prev) => new Set(prev).add(offerId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleFilterChange = (key, value) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const visibleRecommended = recommended.slice(carouselIndex, carouselIndex + 3)

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.content}>
        {/* Offres recommandées */}
        {recommended.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Nos offres sélectionnées pour vous</h2>
                <p className={styles.sectionSub}>
                  Des opportunités choisies en fonction de votre profil et de vos préférences
                </p>
              </div>
              <button className={styles.seeAll} onClick={() => handleFilterChange('q', '')}>
                Voir tout →
              </button>
            </div>

            <div className={styles.carousel}>
              {visibleRecommended.map((offer) => (
                <div key={offer.id} className={styles.carouselCard}>
                  <div className={styles.carouselImg}>
                    <div className={styles.carouselLocation}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {offer.formatted_places || 'France'}
                    </div>
                  </div>
                  <div className={styles.carouselInfo}>
                    <h3 className={styles.carouselTitle}>{offer.title}</h3>
                    <p className={styles.carouselCompany}>{offer.company_name}</p>
                    <div className={styles.carouselMeta}>
                      <span className={styles.contractBadge}>
                        {(offer.contract_types || [])[0] || 'CDI'}
                      </span>
                      <span className={styles.carouselDate}>
                        {offer.publish_date
                          ? `Il y a ${Math.floor((Date.now() - new Date(offer.publish_date)) / 86400000)} jours`
                          : 'Récent'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {recommended.length > 3 && (
                <button
                  className={styles.carouselNext}
                  onClick={() =>
                    setCarouselIndex((i) =>
                      i + 3 >= recommended.length ? 0 : i + 3
                    )
                  }
                  aria-label="Offres suivantes"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              )}
            </div>
          </section>
        )}

        {/* Toutes les offres */}
        <section className={styles.section}>
          <div className={styles.allHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Toutes les offres</h2>
              <p className={styles.offerCount}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                {total} opportunité{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Barre de recherche + filtres */}
          <div className={styles.filterBox}>
            <div className={styles.searchRow}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Rechercher un poste, entreprise, compétence..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  aria-label="Rechercher des offres"
                />
              </div>
              <div className={styles.searchMeta}>
                <button
                  className={`${styles.filterToggle} ${filtersOpen ? styles.filterToggleActive : ''}`}
                  onClick={() => setFiltersOpen((p) => !p)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                    <line x1="11" y1="18" x2="13" y2="18"/>
                  </svg>
                  Filtres
                </button>
                <div className={styles.sortWrap}>
                  <span className={styles.sortLabel}>Trier par :</span>
                  <select
                    className={styles.sortSelect}
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    aria-label="Trier les offres"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filtersOpen && (
              <div className={styles.filtersRow}>
                <div className={styles.filterField}>
                  <label className={styles.filterLabel}>Localisation</label>
                  <input
                    className={styles.filterInput}
                    type="text"
                    placeholder="Ex: Paris, Lyon..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
                <div className={styles.filterField}>
                  <label className={styles.filterLabel}>Type de contrat</label>
                  <select
                    className={styles.filterInput}
                    value={filters.contract}
                    onChange={(e) => handleFilterChange('contract', e.target.value)}
                  >
                    {CONTRACT_TYPES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.filterField}>
                  <label className={styles.filterLabel}>Expérience</label>
                  <select
                    className={styles.filterInput}
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  >
                    {EXPERIENCE_LEVELS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Liste des offres */}
          {loading ? (
            <div className={styles.loadingList}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className={styles.empty}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>Aucune offre trouvée</p>
              <span>Essayez de modifier vos filtres</span>
            </div>
          ) : (
            <div className={styles.offerList}>
              {offers.map((offer) => (
                <JobCard
                  key={offer.id}
                  offer={offer}
                  saved={savedIds.has(offer.id)}
                  onSave={() => handleSave(offer.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Précédent
              </button>
              <span className={styles.pageInfo}>
                Page {page} / {Math.ceil(total / 20)}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
              >
                Suivant →
              </button>
            </div>
          )}
        </section>
      </div>

      <Chatbot />
    </main>
  )
}