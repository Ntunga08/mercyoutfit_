import { useAuthStore } from '@/stores/auth'

export function requiresAuth() {
  const auth = useAuthStore()
  if (!auth.accessToken) return { name: 'login' }
}

export function requiresOwner() {
  const auth = useAuthStore()
  if (!auth.isOwner) return { name: 'dashboard' }
}

export function guestOnly() {
  const auth = useAuthStore()
  if (auth.accessToken) return { name: 'dashboard' }
}
