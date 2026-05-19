'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import styles from './Chatbot.module.css'

const SUGGESTIONS = [
  'Trouver un stage React à Paris',
  'Offres en CDI remote',
  'Emplois data science Lyon',
]

export default function Chatbot() {
  const router = useRouter()
  const { token } = useAuth()

  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)

  // history envoyée à l'API : [{role, content}]
  const [history, setHistory] = useState([])

  // messages affichés dans le chat : [{id, role, text, time, offers}]
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Bonjour ! Je suis Jobby, votre assistant de recherche d'emploi. Dites-moi quel type de poste vous recherchez !",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  const sendMessage = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    // Ajout du message utilisateur à l'affichage
    const userMsg = { id: Date.now(), role: 'user', text: content, time: now }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Historique pour l'API (format OpenAI)
    const updatedHistory = [
      ...history,
      { role: 'user', content },
    ]

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/chatbot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            message: content,
            history,               // historique avant ce message
          }),
        }
      )

      const data = await res.json()

      const botTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

      // Ajout de la réponse du bot à l'affichage
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
          time: botTime,
          offers: data.offers || [],
          redirect: data.redirect || false,
          url: data.url || null,
        },
      ])

      // Mise à jour de l'historique avec les deux nouveaux messages
      setHistory([
        ...updatedHistory,
        { role: 'assistant', content: data.reply || '' },
      ])

      // Redirection si le chatbot a trouvé assez d'infos
      if (data.redirect && data.url) {
        setTimeout(() => {
          setOpen(false)
          router.push(data.url)
        }, 1800)
      }

    } catch {
      const errTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Une erreur est survenue. Veuillez réessayer.',
          time: errTime,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
        aria-expanded={open}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Fenêtre chat */}
      {open && (
        <div
          className={styles.window}
          role="dialog"
          aria-label="Assistant Jobby"
          aria-modal="false"
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.botAvatar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <p className={styles.botName}>Jobby</p>
                <p className={styles.botStatus}>
                  <span className={styles.statusDot} />
                  En ligne
                </p>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages} role="log" aria-live="polite" aria-label="Messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.msgAvatar}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                )}

                <div className={styles.msgContent}>
                  <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
                    {msg.text}
                  </div>

                  {/* Offres suggérées */}
                  {msg.offers && msg.offers.length > 0 && (
                    <div className={styles.offerSuggestions}>
                      {msg.offers.map((offer) => (
                        <div
                          key={offer.id}
                          className={styles.offerChip}
                          onClick={() => router.push(`/explorer/${offer.id}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && router.push(`/explorer/${offer.id}`)}
                        >
                          <div className={styles.offerChipInfo}>
                            <span className={styles.offerChipTitle}>{offer.title}</span>
                            <span className={styles.offerChipCompany}>{offer.company}</span>
                          </div>
                          {offer.contractType && (
                            <span className={styles.offerChipBadge}>{offer.contractType}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Indicateur de redirection */}
                  {msg.redirect && msg.url && (
                    <div className={styles.redirectHint}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="5 12 12 5 19 12"/>
                        <polyline points="12 19 12 5"/>
                      </svg>
                      Redirection en cours...
                    </div>
                  )}

                  <span className={styles.msgTime}>{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className={styles.msgRow}>
                <div className={styles.msgAvatar}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions initiales */}
          {messages.length === 1 && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className={styles.suggestion}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Décrivez votre recherche..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label="Message à envoyer"
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Envoyer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}