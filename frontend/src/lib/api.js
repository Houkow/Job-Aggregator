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
  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),
}

// Offres
export const offersApi = {
  getAll: (params = {}) => {
    const backendParams = {}
    if (params.search)       backendParams.search        = params.search
    if (params.q)            backendParams.search        = params.q
    if (params.location)     backendParams.location      = params.location
    if (params.contract_type && params.contract_type !== 'Tous')
                             backendParams.contract_type = params.contract_type
    if (params.contract && params.contract !== 'Tous')
                             backendParams.contract_type = params.contract
    if (params.salary_min)   backendParams.salary_min    = params.salary_min
    if (params.page)         backendParams.page          = params.page
    if (params.limit)        backendParams.limit         = params.limit

    const query = new URLSearchParams(backendParams).toString()
    return request(`/api/offers${query ? `?${query}` : ''}`)
  },
  getOne: (id) => request(`/api/offers/${id}`),
  ingest: () => request('/api/ingest', { method: 'POST' }),
}

// Offres sauvegardées
export const savedApi = {
  getAll: () => request('/api/offers/saved'),
  save: (offerId) =>
    request(`/api/offers/save/${offerId}`, { method: 'POST' }),
  remove: (offerId) =>
    request(`/api/offers/save/${offerId}`, { method: 'DELETE' }),
  updateStatus: (offerId, status) =>
    request(`/api/offers/save/${offerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// Admin
export const adminApi = {
  getUsers: () => request('/api/admin/users'),
  deleteUser: (id) =>
    request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  updateUser: (id, data) =>
    request(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getOffers: () => request('/api/admin/offers'),
  updateOfferStatus: (id, status) =>
    request(`/api/admin/offers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteOffer: (id) =>
    request(`/api/admin/offers/${id}`, { method: 'DELETE' }),
}

// Profile
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

// Recruiter
export const recruiterApi = {
  create: (data) =>
    request('/api/recruiter', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMy: () => request('/api/recruiter/my'),
  delete: (id) =>
    request(`/api/recruiter/${id}`, { method: 'DELETE' }),
}