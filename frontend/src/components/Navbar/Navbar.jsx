'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef(null)

  const navLinks = [
    { label: 'Explorer', href: '/explorer' },
    { label: 'Mes offres', href: '/mes-offres' },
    { label: 'Mon profil', href: '/profil' },
  ]

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
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </button>

          {menuOpen && (
            <div className={styles.dropdown} role="menu">
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
  )
}