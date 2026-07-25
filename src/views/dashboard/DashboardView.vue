<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/api/reports'
import { formatMoney, apiErrorMessage } from '@/utils/format'
import StatCard from '@/components/ui/StatCard.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const summary = ref(null)
const bestSellers = ref([])
const trend = ref([])

const maxTrend = computed(() => {
  const totals = trend.value.map((d) => Number(d.total || 0))
  return Math.max(...totals, 1)
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [sumRes, bestRes, trendRes] = await Promise.all([
      reportsApi.summary(),
      reportsApi.bestSellers(30),
      reportsApi.dailyTrend(14),
    ])
    summary.value = sumRes.data
    bestSellers.value = bestRes.data
    trend.value = trendRes.data
  } catch (err) {
    error.value = apiErrorMessage(err, 'Could not load dashboard.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader :title="`Hello, ${auth.displayName}`" subtitle="Today’s sales pulse and stock health." />
    <ErrorBanner v-if="error" class="mb-6" :message="error" />
    <LoadingBlock v-if="loading" />

    <template v-else-if="summary">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Today’s sales" :value="formatMoney(summary.today_sales_total)" tone="teal" />
        <StatCard label="Month revenue" :value="formatMoney(summary.month_revenue)" />
        <StatCard
          label="Low stock items"
          :value="summary.low_stock_count"
          :tone="summary.low_stock_count > 0 ? 'warn' : 'success'"
        />
        <template v-if="auth.isOwner">
          <StatCard label="Gross profit" :value="formatMoney(summary.month_gross_profit)" tone="success" />
          <StatCard label="Month expenses" :value="formatMoney(summary.month_expenses)" />
          <StatCard label="Net profit" :value="formatMoney(summary.month_net_profit)" tone="teal" />
        </template>
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div class="mb-5 flex items-baseline justify-between">
            <h3 class="font-display text-lg text-ink">Daily sales trend</h3>
            <span class="text-xs text-stone">Last 14 days</span>
          </div>
          <div v-if="!trend.length" class="py-10 text-center text-sm text-stone">No sales in this window.</div>
          <div v-else class="flex h-44 items-end gap-1.5">
            <div v-for="day in trend" :key="day.day" class="flex flex-1 flex-col items-center justify-end">
              <div
                class="w-full rounded-t-md bg-teal"
                :style="{ height: `${Math.max(8, (Number(day.total) / maxTrend) * 100)}%` }"
                :title="`${day.day}: ${formatMoney(day.total)}`"
              />
              <span class="mt-2 truncate text-[10px] text-stone">
                {{ new Date(day.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }}
              </span>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div class="mb-5 flex items-baseline justify-between">
            <h3 class="font-display text-lg text-ink">Best sellers</h3>
            <span class="text-xs text-stone">Last 30 days</span>
          </div>
          <div v-if="!bestSellers.length" class="py-10 text-center text-sm text-stone">No sales yet.</div>
          <ul v-else class="space-y-2">
            <li
              v-for="(item, i) in bestSellers.slice(0, 8)"
              :key="item.variant__id"
              class="flex items-center gap-3 rounded-xl bg-mist px-3 py-2.5"
            >
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-soft text-xs font-bold text-teal">
                {{ i + 1 }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ item.variant__product__name }}</p>
                <p class="truncate text-xs text-stone">
                  {{ [item.variant__size, item.variant__color].filter(Boolean).join(' · ') || '—' }}
                </p>
              </div>
              <span class="text-sm font-semibold text-teal">{{ item.units_sold }} sold</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>
