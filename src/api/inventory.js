import api from './axios'

export const stockApi = {
  list: () => api.get('stock/'),
  get: (id) => api.get(`stock/${id}/`),
  update: (id, data) => api.patch(`stock/${id}/`, data),
}

export const movementsApi = {
  list: () => api.get('movements/'),
  create: (data) => api.post('movements/', data),
}
