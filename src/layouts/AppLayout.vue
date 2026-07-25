<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)

const nav = computed(() => {
  const items = [
    { name: 'dashboard', label: 'Overview', to: { name: 'dashboard' } },
    { name: 'pos', label: 'Sell', to: { name: 'pos' } },
    { name: 'sales', label: 'Receipts', to: { name: 'sales' } },
    { name: 'products', label: 'Catalog', to: { name: 'products' } },
    { name: 'inventory', label: 'Stock', to: { name: 'inventory' } },
  ]
  if (auth.isOwner) {
    items.push({ name: 'expenses', label: 'Expenses', to: { name: 'expenses' } })
  }
  return items
})

const pageTitle = computed(() => {
  const map = {
    dashboard: 'Overview',
    pos: 'Sell',
    sales: 'Receipts',
    products: 'Catalog',
    inventory: 'Stock',
    expenses: 'Expenses',
  }
  return map[route.name] || 'MercyOutfit'
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

function closeMobile() {
  mobileOpen.value = false
}
</script>

<template>
  <div class="min-h-screen lg:grid lg:grid-cols-[220px_1fr]">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-ink/40 lg:hidden"
      @click="closeMobile"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-line bg-mist transition-transform duration-200 lg:static lg:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="border-b border-line px-5 py-5">
        <p class="font-display text-[1.35rem] leading-none text-ink">MercyOutfit</p>
        <p class="mt-1.5 text-[13px] text-stone">Shop desk</p>
      </div>

      <nav class="flex-1 px-2 py-4">
        <router-link
          v-for="item in nav"
          :key="item.name"
          :to="item.to"
          class="mb-0.5 flex items-center border-l-2 border-transparent px-3 py-2 text-[15px] text-stone transition-colors hover:text-ink"
          :class="
            route.name === item.name
              ? 'border-teal bg-teal-soft/60 font-semibold text-ink'
              : 'font-medium'
          "
          @click="closeMobile"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="border-t border-line px-5 py-4">
        <p class="truncate text-[15px] font-semibold text-ink">{{ auth.displayName }}</p>
        <p class="mt-0.5 text-[13px] capitalize text-stone">{{ auth.user?.role || 'staff' }}</p>
        <button
          type="button"
          class="mt-3 text-[13px] font-medium text-teal underline-offset-2 hover:underline"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </aside>

    <div class="flex min-h-screen min-w-0 flex-col">
      <header class="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center border border-line text-ink lg:hidden"
          aria-label="Open menu"
          @click="mobileOpen = true"
        >
          <span class="text-base leading-none">☰</span>
        </button>
        <h1 class="min-w-0 flex-1 truncate font-display text-xl text-ink sm:text-[1.4rem]">
          {{ pageTitle }}
        </h1>
        <p class="hidden text-[13px] capitalize text-stone sm:block">
          {{ auth.user?.role }}
        </p>
      </header>

      <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
