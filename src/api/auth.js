import api from './axios'

export function login(username, password) {
  return api.post('auth/login/', { username, password })
}

export function refreshToken(refresh) {
  return api.post('auth/login/refresh/', { refresh })
}

export function fetchMe() {
  return api.get('auth/me/')
}
