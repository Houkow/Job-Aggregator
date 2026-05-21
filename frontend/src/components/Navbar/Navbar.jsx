'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef(null)

  const navLinks = [
    { label: 'Explorer', href: '/explorer' },
    ...(user?.role === 'user' || user?.role === 'admin'
      ? [
          { label: 'Mes offres', href: '/mes-offres' },
          { label: 'Mon profil', href: '/profil' },
        ]
      : []),
    ...(user?.role === 'employer' || user?.role === 'admin'
      ? [{ label: 'Poster une offre', href: '/poster-offre' }]
      : []),
    ...(user?.role === 'admin'
      ? [{ label: 'Admin', href: '/admin' }]
      : []),
  ]

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar)
    } else {
      const stored = localStorage.getItem('userAvatar')
      if (stored) setAvatarUrl(stored)
    }
  }, [user, user?.avatar])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
    setMenuOpen(false)
  }

  const isActive = (href) => pathname === href

  return (
    <>
    <a href="#main-content" className={styles.skipLink} onClick={(e) => { e.preventDefault(); const el = document.getElementById("main-content"); if (el) { el.focus(); el.scrollIntoView(); } }}>Aller au contenu principal</a>
    <nav className={styles.navbar} role="navigation" aria-label="Navigation principale">
      <div className={styles.inner}>
        <button
          className={styles.logo}
          onClick={() => router.push('/')}
          aria-label="Retour à l'accueil"
        >
          JobSearch
        </button>

        {isAuthenticated && (
          <div className={styles.links}>
            {navLinks.map((link) => (
              <button
                key={link.href}
                className={`${styles.link} ${isActive(link.href) ? styles.linkActive : ''}`}
                onClick={() => router.push(link.href)}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.right} ref={menuRef}>
          <button
            className={styles.avatar}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menu utilisateur"
            aria-expanded={menuOpen}
          >
            {user?.avatar || avatarUrl ? (
              <img src={user?.avatar || avatarUrl} alt={user?.email} className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitial}>
                {user?.email?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </button>

          {menuOpen && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownUser}>
                <p className={styles.dropdownEmail}>{user?.email}</p>
                <p className={styles.dropdownRole}>
                  {user?.role === 'admin'
                    ? 'Administrateur'
                    : user?.role === 'employer'
                    ? 'Employeur'
                    : 'Candidat'}
                </p>
              </div>
              <div className={styles.dropdownDivider} />

              <button
                className={styles.dropdownItem}
                onClick={() => { toggleTheme(); setMenuOpen(false) }}
                role="menuitem"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {theme === 'light'
                    ? <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    : <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
                  }
                </svg>
                Mode {theme === 'light' ? 'sombre' : 'clair'}
              </button>

              {(user?.role === 'user' || user?.role === 'admin') && (
                <button
                  className={styles.dropdownItem}
                  onClick={() => { router.push('/profil'); setMenuOpen(false) }}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                  </svg>
                  Paramètres
                </button>
              )}

              {(user?.role === 'employer' || user?.role === 'admin') && (
                <button
                  className={styles.dropdownItem}
                  onClick={() => { router.push('/poster-offre'); setMenuOpen(false) }}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Poster une offre
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  className={styles.dropdownItem}
                  onClick={() => { router.push('/admin'); setMenuOpen(false) }}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Administration
                </button>
              )}

              <div className={styles.dropdownDivider} />

              <button
                className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                onClick={handleLogout}
                role="menuitem"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
    </>
  )
}