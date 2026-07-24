<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form @submit.prevent="handleLogin" class="bg-white w-80 p-8 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center text-gray-900">MercyOutfit</h1>
      <p class="text-center text-gray-500 mb-6">Shop Management</p>

      <label class="block text-sm text-gray-700 mt-4 mb-1">Username</label>
      <input v-model="username" type="text" required
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />

      <label class="block text-sm text-gray-700 mt-4 mb-1">Password</label>
      <input v-model="password" type="password" required
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />

      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>

      <button type="submit" :disabled="loading"
        class="w-full mt-6 bg-gray-900 text-white py-2 rounded hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition">
        {{ loading ? 'Logging in...' : 'Log In' }}
      </button>
    </form>
  </div>
</template>