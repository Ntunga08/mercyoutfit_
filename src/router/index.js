import { createRouter, createWebHistory } from 'vue-router'
import { requiresAuth, requiresOwner, guestOnly } from './guards'
import AppLayout from '@/layouts/AppLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/dashboard/DashboardView.vue') },
      { path: 'pos', name: 'pos', component: () => import('@/views/sales/PosView.vue') },
      { path: 'sales', name: 'sales', component: () => import('@/views/sales/SalesHistoryView.vue') },
      { path: 'inventory', name: 'inventory', component: () => import('@/views/inventory/InventoryView.vue') },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/views/products/ProductsView.vue'),
        meta: { requiresOwner: true },
      },
      {
        path: 'expenses',
        name: 'expenses',
        component: () => import('@/views/expenses/ExpensesView.vue'),
        meta: { requiresOwner: true },
      },
      {
        path: 'staff',
        name: 'staff',
        component: () => import('@/views/staff/StaffView.vue'),
        meta: { requiresOwner: true },
      },
      {
        path: 'marketing',
        name: 'marketing',
        component: () => import('@/views/marketing/MarketingView.vue'),
        meta: { requiresOwner: true },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  if (to.meta.guest) {
    const redirect = guestOnly()
    if (redirect) return redirect
  }
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    const redirect = requiresAuth()
    if (redirect) return redirect
  }
  if (to.matched.some((r) => r.meta.requiresOwner)) {
    const redirect = requiresOwner()
    if (redirect) return redirect
  }
})

export default router
