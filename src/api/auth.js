import api from './axios'

export function fetchStaffList() {
  return api.get('auth/staff/')
}

export function createStaff(data) {
  return api.post('auth/staff/', data)
}