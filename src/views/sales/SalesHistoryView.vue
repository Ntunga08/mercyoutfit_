<script setup>
import { computed, onMounted, ref } from 'vue'
import { salesApi } from '@/api/sales'
import { formatDateTime, formatMoney, paymentLabel } from '@/utils/format'
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

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return sales.value
  return sales.value.filter((s) => {
    const hay = `${s.id} ${s.cashier_name} ${s.customer_name || ''} ${s.payment_method}`.toLowerCase()
    return hay.includes(q)
  })
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await salesApi.list()
    sales.value = res.data
  } catch {
    error.value = 'Failed to load sales.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Sales history" subtitle="Immutable receipts from the floor." />

    <div class="mb-5">
      <AppInput v-model="search" placeholder="Search by ID, cashier, customer…" />
    </div>

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <LoadingBlock v-if="loading" />

    <EmptyState
      v-else-if="!filtered.length"
      title="No sales yet"
      description="Completed POS transactions will appear here."
    />

    <div v-else class="overflow-hidden border border-line bg-surface">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-mist text-[13px] text-stone">
            <tr>
              <th class="px-4 py-3 font-semibold">Sale</th>
              <th class="px-4 py-3 font-semibold">When</th>
              <th class="px-4 py-3 font-semibold">Cashier</th>
              <th class="px-4 py-3 font-semibold">Customer</th>
              <th class="px-4 py-3 font-semibold">Payment</th>
              <th class="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sale in filtered"
              :key="sale.id"
              class="cursor-pointer border-t border-line/80 hover:bg-mist/60"
              @click="selected = sale"
            >
              <td class="px-4 py-3 font-semibold text-teal">#{{ sale.id }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-stone">{{ formatDateTime(sale.created_at) }}</td>
              <td class="px-4 py-3">{{ sale.cashier_name }}</td>
              <td class="px-4 py-3">{{ sale.customer_name || '—' }}</td>
              <td class="px-4 py-3">
                <AppBadge tone="teal">{{ paymentLabel(sale.payment_method) }}</AppBadge>
              </td>
              <td class="px-4 py-3 font-semibold tabular-nums">{{ formatMoney(sale.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal
      :open="Boolean(selected)"
      :title="selected ? `Sale #${selected.id}` : ''"
      @close="selected = null"
    >
      <div v-if="selected" class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p class="text-[13px] text-stone">Cashier</p>
            <p class="font-medium text-ink">{{ selected.cashier_name }}</p>
          </div>
          <div>
            <p class="text-[13px] text-stone">When</p>
            <p class="font-medium text-ink">{{ formatDateTime(selected.created_at) }}</p>
          </div>
          <div>
            <p class="text-[13px] text-stone">Customer</p>
            <p class="font-medium text-ink">
              {{ selected.customer_name || '—' }}
              <span v-if="selected.customer_phone" class="text-stone"> · {{ selected.customer_phone }}</span>
            </p>
          </div>
          <div>
            <p class="text-[13px] text-stone">Payment</p>
            <p class="font-medium text-ink">{{ paymentLabel(selected.payment_method) }}</p>
          </div>
        </div>

        <ul class="divide-y divide-line border border-line">
          <li
            v-for="item in selected.items"
            :key="item.id"
            class="flex items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div>
              <p class="font-medium text-ink">{{ item.variant_name }}</p>
              <p class="text-stone">{{ item.quantity }} × {{ formatMoney(item.unit_price) }}</p>
            </div>
            <p class="font-semibold text-teal">{{ formatMoney(item.subtotal) }}</p>
          </li>
        </ul>

        <div class="flex items-center justify-between border border-line bg-mist px-4 py-3">
          <span class="text-sm font-semibold text-teal">Total</span>
          <span class="font-display text-2xl text-ink">{{ formatMoney(selected.total) }}</span>
        </div>
      </div>
    </AppModal>
  </div>
</template>
