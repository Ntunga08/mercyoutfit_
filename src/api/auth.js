import api from './axios'

export function login(username, password) {
  return api.post('auth/login/', { username, password })
}

export function fetchMe() {
  return api.get('auth/me/')
}

export const staffApi = {
  list: () => api.get('auth/staff/'),
  create: (data) => api.post('auth/staff/', data),
}
