import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access') || null,
    refreshToken: localStorage.getItem('refresh') || null,
    user: null,
  }),
  actions: {
    async login(username, password) {
      const res = await axios.post('http://127.0.0.1:8000/api/auth/login/', { username, password })
      this.accessToken = res.data.access
      this.refreshToken = res.data.refresh
      localStorage.setItem('access', this.accessToken)
      localStorage.setItem('refresh', this.refreshToken)
      await this.fetchMe()
    },
    async fetchMe() {
      const api = (await import('@/api/axios')).default
      const res = await api.get('auth/me/')
      this.user = res.data
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
    },
  },
  getters: {
    isOwner: (state) => state.user?.role === 'owner',
  },
})