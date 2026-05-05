const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur serveur' }))
    throw new Error(error.message || `Erreur ${res.status}`)
  }

  return res.json()
}

// Auth
export const authApi = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request('/api/auth/me'),
}

// Offres
export const offersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/offers${query ? `?${query}` : ''}`)
  },
  getOne: (id) => request(`/api/offers/${id}`),
  ingest: () => request('/api/offers/ingest', { method: 'POST' }),
}

// Offres sauvegardées
export const savedApi = {
  getAll: () => request('/api/saved'),
  save: (offerId) =>
    request('/api/saved', {
      method: 'POST',
      body: JSON.stringify({ offerId }),
    }),
  remove: (offerId) =>
    request(`/api/saved/${offerId}`, { method: 'DELETE' }),
  updateStatus: (offerId, status) =>
    request(`/api/saved/${offerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// Profil
export const profileApi = {
  get: () => request('/api/profile'),
  update: (data) =>
    request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadCV: (file) => {
    const form = new FormData()
    form.append('cv', file)
    return request('/api/profile/cv', {
      method: 'POST',
      headers: {},
      body: form,
    })
  },
}

// Admin
export const adminApi = {
  getUsers: () => request('/api/admin/users'),
  updateUser: (id, data) =>
    request(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteUser: (id) =>
    request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  getOffers: () => request('/api/admin/offers'),
  deleteOffer: (id) =>
    request(`/api/admin/offers/${id}`, { method: 'DELETE' }),
}