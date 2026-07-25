<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/api/reports'
import { formatMoney } from '@/utils/format'
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
    error.value = err.response?.data?.detail || 'Could not load overview.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      :title="`Hi, ${auth.displayName}`"
      subtitle="What the floor looks like today."
    />

    <ErrorBanner v-if="error" class="mb-6" :message="error" />
    <LoadingBlock v-if="loading" />

    <template v-else-if="summary">
      <!-- Metrics as a ledger strip, not floating cards -->
      <div class="border border-line bg-surface">
        <div
          class="grid sm:grid-cols-3"
          :class="auth.isOwner ? 'xl:grid-cols-6' : ''"
        >
          <StatCard
            label="Today"
            :value="formatMoney(summary.today_sales_total)"
            tone="teal"
            hint="Sales so far"
          />
          <StatCard
            label="This month"
            :value="formatMoney(summary.month_revenue)"
            hint="Revenue"
          />
          <StatCard
            label="Low stock"
            :value="summary.low_stock_count"
            :tone="summary.low_stock_count > 0 ? 'warn' : 'success'"
            hint="Need attention"
          />
          <template v-if="auth.isOwner">
            <StatCard
              label="Gross profit"
              :value="formatMoney(summary.month_gross_profit)"
              tone="success"
            />
            <StatCard
              label="Expenses"
              :value="formatMoney(summary.month_expenses)"
            />
            <StatCard
              label="Net"
              :value="formatMoney(summary.month_net_profit)"
              tone="teal"
            />
          </template>
        </div>
      </div>

      <div class="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div class="mb-4 flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <h3 class="font-display text-lg text-ink">Last 14 days</h3>
            <span class="text-[13px] text-stone">Daily sales</span>
          </div>
          <div v-if="!trend.length" class="py-10 text-center text-[15px] text-stone">
            No sales in this window.
          </div>
          <div v-else class="flex h-40 items-end gap-1">
            <div
              v-for="day in trend"
              :key="day.day"
              class="flex flex-1 flex-col items-center justify-end"
            >
              <div
                class="w-full bg-teal"
                :style="{ height: `${Math.max(6, (Number(day.total) / maxTrend) * 100)}%` }"
                :title="`${day.day}: ${formatMoney(day.total)}`"
              />
              <span class="mt-2 truncate text-[10px] text-stone">
                {{ new Date(day.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }}
              </span>
            </div>
          </div>
        </section>

        <section>
          <div class="mb-4 flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <h3 class="font-display text-lg text-ink">Best sellers</h3>
            <span class="text-[13px] text-stone">30 days</span>
          </div>
          <div v-if="!bestSellers.length" class="py-10 text-center text-[15px] text-stone">
            No sales yet.
          </div>
          <ol v-else class="divide-y divide-line border border-line bg-surface">
            <li
              v-for="(item, i) in bestSellers.slice(0, 8)"
              :key="item.variant__id"
              class="flex items-center gap-3 px-3 py-2.5"
            >
              <span class="w-5 text-[13px] tabular-nums text-stone">{{ i + 1 }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-[15px] font-medium text-ink">
                  {{ item.variant__product__name }}
                </p>
                <p class="truncate text-[13px] text-stone">
                  {{ [item.variant__size, item.variant__color].filter(Boolean).join(' · ') || '—' }}
                </p>
              </div>
              <span class="text-[14px] font-semibold tabular-nums text-ink">
                {{ item.units_sold }}
              </span>
            </li>
          </ol>
        </section>
      </div>
    </template>
  </div>
</template>
