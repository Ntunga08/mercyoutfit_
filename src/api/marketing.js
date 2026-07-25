import api from './axios'

export const customersApi = {
  list: () => api.get('marketing/customers/'),
  update: (id, data) => api.patch(`marketing/customers/${id}/`, data),
}

export const campaignsApi = {
  list: () => api.get('marketing/campaigns/'),
  get: (id) => api.get(`marketing/campaigns/${id}/`),
  create: (data) => api.post('marketing/campaigns/', data),
  send: (id) => api.post(`marketing/campaigns/${id}/send/`),
}
