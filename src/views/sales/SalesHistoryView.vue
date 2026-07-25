<script setup>
import { computed, onMounted, ref } from 'vue'
import { salesApi } from '@/api/sales'
import { formatDateTime, formatMoney, paymentLabel, apiErrorMessage } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import AppInput from '@/components/ui/AppInput.vue'

const loading = ref(true)
const error = ref('')
const sales = ref([])
const search = ref('')
const selected = ref(null)
const period = ref('all') // all | today | week | month

const periods = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' },
]

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function periodRange(id) {
  const now = new Date()
  const today = startOfDay(now)

  if (id === 'today') {
    return { from: today, to: null }
  }

  if (id === 'week') {
    // Monday-start week
    const day = today.getDay() // 0 Sun … 6 Sat
    const mondayOffset = day === 0 ? -6 : 1 - day
    const from = new Date(today)
    from.setDate(today.getDate() + mondayOffset)
    return { from, to: null }
  }

  if (id === 'month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from, to: null }
  }

  return { from: null, to: null }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const { from } = periodRange(period.value)

  return sales.value.filter((s) => {
    const created = new Date(s.created_at)
    if (from && created < from) return false

    if (!q) return true
    const hay = `${s.id} ${s.cashier_name} ${s.customer_name || ''} ${s.customer_phone || ''} ${s.payment_method}`.toLowerCase()
    return hay.includes(q)
  })
})

const filteredTotal = computed(() =>
  filtered.value.reduce((sum, s) => sum + Number(s.total || 0), 0),
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await salesApi.list()
    sales.value = res.data
  } catch (err) {
    error.value = apiErrorMessage(err, 'Failed to load sales.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Sales history" subtitle="Append-only receipts. No edit or delete." />

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
        <button
          v-for="p in periods"
          :key="p.id"
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
          :class="period === p.id ? 'bg-teal text-white' : 'text-stone hover:text-ink'"
          @click="period = p.id"
        >
          {{ p.label }}
        </button>
      </div>
      <p v-if="!loading" class="text-sm text-stone">
        {{ filtered.length }} sale{{ filtered.length === 1 ? '' : 's' }}
        · <span class="font-semibold text-ink">{{ formatMoney(filteredTotal) }}</span>
      </p>
    </div>

    <div class="mb-5">
      <AppInput v-model="search" placeholder="Search by ID, cashier, customer, phone…" />
    </div>

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <LoadingBlock v-if="loading" />
    <EmptyState
      v-else-if="!filtered.length"
      title="No sales in this period"
      description="Try another filter or clear the search."
    />

    <div v-else class="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div class="max-h-[min(65vh,560px)] overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="sticky top-0 z-10 bg-mist text-xs uppercase tracking-wide text-stone shadow-[0_1px_0_0_var(--color-line)]">
            <tr>
              <th class="px-4 py-3 font-semibold">Sale</th>
              <th class="px-4 py-3 font-semibold">When</th>
              <th class="px-4 py-3 font-semibold">Cashier</th>
              <th class="px-4 py-3 font-semibold">Customer</th>
              <th class="px-4 py-3 font-semibold">Phone</th>
              <th class="px-4 py-3 font-semibold">Payment</th>
              <th class="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sale in filtered"
              :key="sale.id"
              class="cursor-pointer border-t border-line hover:bg-mist/60"
              @click="selected = sale"
            >
              <td class="px-4 py-3 font-semibold text-teal">#{{ sale.id }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-stone">{{ formatDateTime(sale.created_at) }}</td>
              <td class="px-4 py-3">{{ sale.cashier_name }}</td>
              <td class="px-4 py-3">{{ sale.customer_name || '—' }}</td>
              <td class="px-4 py-3 font-mono text-xs">{{ sale.customer_phone || '—' }}</td>
              <td class="px-4 py-3"><AppBadge tone="teal">{{ paymentLabel(sale.payment_method) }}</AppBadge></td>
              <td class="px-4 py-3 font-semibold">{{ formatMoney(sale.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :open="Boolean(selected)" :title="selected ? `Sale #${selected.id}` : ''" @close="selected = null">
      <div v-if="selected" class="space-y-4">
        <div class="grid gap-3 text-sm sm:grid-cols-2">
          <div><p class="text-xs text-stone">Cashier</p><p class="font-medium">{{ selected.cashier_name }}</p></div>
          <div><p class="text-xs text-stone">When</p><p class="font-medium">{{ formatDateTime(selected.created_at) }}</p></div>
          <div>
            <p class="text-xs text-stone">Customer</p>
            <p class="font-medium">{{ selected.customer_name || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-stone">Phone</p>
            <p class="font-mono text-sm">{{ selected.customer_phone || '—' }}</p>
          </div>
        </div>
        <ul class="divide-y divide-line rounded-xl border border-line">
          <li v-for="item in selected.items" :key="item.id" class="flex justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p class="font-medium">{{ item.variant_name }}</p>
              <p class="text-stone">{{ item.quantity }} × {{ formatMoney(item.unit_price) }}</p>
            </div>
            <p class="font-semibold text-teal">{{ formatMoney(item.subtotal) }}</p>
          </li>
        </ul>
        <div class="flex items-center justify-between rounded-xl bg-teal-soft px-4 py-3">
          <span class="text-sm font-semibold text-teal">Total</span>
          <span class="font-display text-2xl">{{ formatMoney(selected.total) }}</span>
        </div>
      </div>
    </AppModal>
  </div>
</template>
