<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BrandWordmark from '@/components/BrandWordmark.vue'
import BrandContacts from '@/components/BrandContacts.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)

const nav = computed(() => {
  const items = [
    { name: 'dashboard', label: 'Dashboard', to: { name: 'dashboard' } },
    { name: 'pos', label: 'POS', to: { name: 'pos' } },
    { name: 'sales', label: 'Sales', to: { name: 'sales' } },
    { name: 'inventory', label: 'Inventory', to: { name: 'inventory' } },
  ]
  if (auth.isOwner) {
    items.push(
      { name: 'products', label: 'Products', to: { name: 'products' } },
      { name: 'expenses', label: 'Expenses', to: { name: 'expenses' } },
      { name: 'staff', label: 'Staff', to: { name: 'staff' } },
      { name: 'marketing', label: 'Marketing', to: { name: 'marketing' } },
    )
  }
  return items
})

const pageTitle = computed(() => {
  const map = {
    dashboard: 'Dashboard',
    pos: 'New Sale',
    sales: 'Sales History',
    inventory: 'Inventory',
    products: 'Products',
    expenses: 'Expenses',
    staff: 'Staff',
    marketing: 'Marketing',
  }
  return map[route.name] || 'MERCY Outfit'
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen lg:flex">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-black/70 lg:hidden"
      @click="mobileOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy text-white transition-transform duration-300 lg:static lg:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="border-b border-teal/20 px-5 py-5">
        <BrandWordmark size="md" />
        <p class="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-teal-bright/80">
          Shop desk
        </p>
      </div>

      <nav class="flex-1 space-y-1 px-3 py-5">
        <router-link
          v-for="item in nav"
          :key="item.name"
          :to="item.to"
          class="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
          :class="{
            'bg-teal text-navy shadow-[0_0_20px_rgb(227_200_74_/_0.25)] hover:bg-teal-bright hover:text-navy':
              route.name === item.name,
          }"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="space-y-3 border-t border-teal/20 p-4">
        <div>
          <p class="truncate text-sm font-semibold">{{ auth.displayName }}</p>
          <p class="mt-0.5 text-xs capitalize text-white/50">{{ auth.user?.role }}</p>
        </div>
        <BrandContacts compact />
        <button
          type="button"
          class="w-full rounded-xl border border-teal/40 px-3 py-2 text-sm text-teal-bright transition hover:bg-teal/15"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </aside>

    <div class="flex min-h-screen flex-1 flex-col lg:min-w-0">
      <header class="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line lg:hidden"
          @click="mobileOpen = true"
        >
          ☰
        </button>
        <h1 class="min-w-0 flex-1 truncate font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
          {{ pageTitle }}
        </h1>
        <span class="hidden rounded-full border border-teal/30 bg-teal-soft px-3 py-1 text-xs font-semibold capitalize text-teal sm:inline">
          {{ auth.user?.role }}
        </span>
      </header>

      <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
