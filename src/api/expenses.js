import api from './axios'

export const expensesApi = {
  list: () => api.get('expenses/'),
  create: (data) => api.post('expenses/', data),
  update: (id, data) => api.patch(`expenses/${id}/`, data),
  remove: (id) => api.delete(`expenses/${id}/`),
}
