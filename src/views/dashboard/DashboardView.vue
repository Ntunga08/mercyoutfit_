<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold">Welcome, {{ auth.user?.username }}</h1>
    <p class="text-gray-500">Role: {{ auth.user?.role }}</p>
    <button @click="handleLogout" class="mt-4 bg-red-600 text-white px-4 py-2 rounded">Logout</button>
  </div>
</template>