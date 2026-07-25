import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access') || null,
    refreshToken: localStorage.getItem('refresh') || null,
    user: null,
    ready: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    isOwner: (state) => state.user?.role === 'owner',
    displayName: (state) => state.user?.username || 'Staff',
  },

  actions: {
    setTokens(access, refresh) {
      this.accessToken = access
      if (refresh !== undefined) this.refreshToken = refresh
      if (access) localStorage.setItem('access', access)
      else localStorage.removeItem('access')
      if (refresh) localStorage.setItem('refresh', refresh)
      else if (refresh === null) localStorage.removeItem('refresh')
    },

    async login(username, password) {
      const res = await authApi.login(username, password)
      this.setTokens(res.data.access, res.data.refresh)
      await this.fetchMe()
    },

    async fetchMe() {
      const res = await authApi.fetchMe()
      this.user = res.data
      return this.user
    },

    async init() {
      if (!this.accessToken) {
        this.ready = true
        return
      }
      try {
        await this.fetchMe()
      } catch {
        this.logout()
      } finally {
        this.ready = true
      }
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
    },
  },
})
