import api from './axios'

export const salesApi = {
  list: () => api.get('sales/'),
  get: (id) => api.get(`sales/${id}/`),
  create: (data) => api.post('sales/', data),
}
