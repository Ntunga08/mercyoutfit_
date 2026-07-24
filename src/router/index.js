import { createRouter, createWebHistory } from 'vue-router'
import { requiresAuth } from './guards'
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const redirect = requiresAuth()
    if (redirect) return redirect
  }
})

export default router