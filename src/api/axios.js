import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/',
})

let refreshPromise = null

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const auth = useAuthStore()

    if (error.response?.status !== 401 || original._retry || original.url?.includes('auth/login')) {
      return Promise.reject(error)
    }

    if (!auth.refreshToken) {
      auth.logout()
      return Promise.reject(error)
    }

    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${api.defaults.baseURL}auth/login/refresh/`, {
            refresh: auth.refreshToken,
          })
          .then((res) => {
            auth.setTokens(res.data.access, auth.refreshToken)
            return res.data.access
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const access = await refreshPromise
      original.headers.Authorization = `Bearer ${access}`
      return api(original)
    } catch (refreshError) {
      auth.logout()
      return Promise.reject(refreshError)
    }
  },
)

export default api
