// Modèles de données qui correspondent à l'API backend

export const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance']

export const EXPERIENCE_LEVELS = [
  'Tous niveaux',
  'Junior (0-2 ans)',
  'Confirmé (2-5 ans)',
  'Senior (5+ ans)',
]

export const APPLICATION_STATUS = {
  SAVED: 'saved',
  IN_PROGRESS: 'in_progress',
  SENT: 'sent',
  INTERVIEW: 'interview',
  REJECTED: 'rejected',
}

export const STATUS_LABELS = {
  saved: 'Sauvegardée',
  in_progress: 'En cours',
  sent: 'Candidature envoyée',
  interview: 'Entretien planifié',
  rejected: 'Refusée',
}

export const STATUS_COLORS = {
  saved: '#6b7280',
  in_progress: '#3b82f6',
  sent: '#8b5cf6',
  interview: '#10b981',
  rejected: '#ef4444',
}