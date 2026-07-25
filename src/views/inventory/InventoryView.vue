<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { stockApi, movementsApi } from '@/api/inventory'
import { variantsApi } from '@/api/products'
import { formatDateTime, formatMoney } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'

const loading = ref(true)
const error = ref('')
const stock = ref([])
const movements = ref([])
const variants = ref([])
const tab = ref('stock')
const search = ref('')
const onlyLow = ref(false)

const modalOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  variant: '',
  change: '',
  reason: 'restock',
  note: '',
})

const filteredStock = computed(() => {
  let rows = stock.value
  if (onlyLow.value) rows = rows.filter((s) => s.is_low)
  const q = search.value.trim().toLowerCase()
  if (q) rows = rows.filter((s) => (s.variant_name || '').toLowerCase().includes(q))
  return rows
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [stockRes, moveRes, varRes] = await Promise.all([
      stockApi.list(),
      movementsApi.list(),
      variantsApi.list(),
    ])
    stock.value = stockRes.data
    movements.value = moveRes.data
    variants.value = varRes.data
  } catch {
    error.value = 'Failed to load inventory.'
  } finally {
    loading.value = false
  }
}

function openRestock() {
  Object.assign(form, {
    variant: variants.value[0] ? String(variants.value[0].id) : '',
    change: '',
    reason: 'restock',
    note: '',
  })
  formError.value = ''
  modalOpen.value = true
}

async function submitMovement() {
  saving.value = true
  formError.value = ''
  try {
    let change = Number(form.change)
    if (form.reason === 'damage' && change > 0) change = -change
    await movementsApi.create({
      variant: Number(form.variant),
      change,
      reason: form.reason,
      note: form.note || '',
    })
    modalOpen.value = false
    await load()
  } catch (err) {
    const data = err.response?.data
    formError.value =
      (Array.isArray(data) ? data.join(' ') : Object.values(data || {}).flat().join(' ')) ||
      'Could not record movement.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Inventory"
      subtitle="Stock levels and movement history. Prefer movements for restock and damage."
    >
      <template #actions>
        <AppButton @click="openRestock">Record movement</AppButton>
      </template>
    </PageHeader>

    <div class="mb-5 flex flex-wrap items-center gap-3">
      <div class="inline-flex border border-line bg-surface p-0.5">
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-semibold transition"
          :class="tab === 'stock' ? 'bg-teal text-white' : 'text-stone hover:text-ink'"
          @click="tab = 'stock'"
        >
          Stock
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-semibold transition"
          :class="tab === 'movements' ? 'bg-teal text-white' : 'text-stone hover:text-ink'"
          @click="tab = 'movements'"
        >
          Movements
        </button>
      </div>
      <div v-if="tab === 'stock'" class="flex flex-1 flex-wrap items-center gap-3">
        <div class="min-w-[200px] flex-1">
          <AppInput v-model="search" placeholder="Filter stock…" />
        </div>
        <label class="flex items-center gap-2 text-sm text-ink">
          <input v-model="onlyLow" type="checkbox" class="rounded border-line text-teal" />
          Low stock only
        </label>
      </div>
    </div>

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <LoadingBlock v-if="loading" />

    <template v-else-if="tab === 'stock'">
      <EmptyState
        v-if="!filteredStock.length"
        title="No stock rows"
        description="Stock appears after the first sale or movement for a variant."
      />
      <div v-else class="overflow-hidden border border-line bg-surface">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-mist text-[13px] text-stone">
              <tr>
                <th class="px-4 py-3 font-semibold">Variant</th>
                <th class="px-4 py-3 font-semibold">Qty</th>
                <th class="px-4 py-3 font-semibold">Threshold</th>
                <th class="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filteredStock"
                :key="row.id"
                class="border-t border-line/80 hover:bg-mist/50"
              >
                <td class="px-4 py-3 font-medium text-ink">{{ row.variant_name }}</td>
                <td class="px-4 py-3 tabular-nums">{{ row.quantity }}</td>
                <td class="px-4 py-3 tabular-nums text-stone">{{ row.low_stock_threshold }}</td>
                <td class="px-4 py-3">
                  <AppBadge :tone="row.is_low ? 'warn' : 'success'">
                    {{ row.is_low ? 'Low' : 'OK' }}
                  </AppBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-else>
      <EmptyState
        v-if="!movements.length"
        title="No movements yet"
        description="Restocks, sales, and corrections will show here."
      />
      <div v-else class="overflow-hidden border border-line bg-surface">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-mist text-[13px] text-stone">
              <tr>
                <th class="px-4 py-3 font-semibold">When</th>
                <th class="px-4 py-3 font-semibold">Variant</th>
                <th class="px-4 py-3 font-semibold">Change</th>
                <th class="px-4 py-3 font-semibold">Reason</th>
                <th class="px-4 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in movements"
                :key="m.id"
                class="border-t border-line/80 hover:bg-mist/50"
              >
                <td class="px-4 py-3 whitespace-nowrap text-stone">{{ formatDateTime(m.created_at) }}</td>
                <td class="px-4 py-3">
                  {{ variants.find((v) => v.id === m.variant)?.sku || `#${m.variant}` }}
                </td>
                <td
                  class="px-4 py-3 font-semibold tabular-nums"
                  :class="m.change >= 0 ? 'text-success' : 'text-danger'"
                >
                  {{ m.change >= 0 ? `+${m.change}` : m.change }}
                </td>
                <td class="px-4 py-3 capitalize">{{ m.reason }}</td>
                <td class="px-4 py-3 text-stone">{{ m.note || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <AppModal :open="modalOpen" title="Record stock movement" @close="modalOpen = false">
      <form class="space-y-4" @submit.prevent="submitMovement">
        <AppSelect v-model="form.variant" label="Variant" required>
          <option value="" disabled>Select variant</option>
          <option v-for="v in variants" :key="v.id" :value="String(v.id)">
            #{{ v.id }} · {{ [v.size, v.color].filter(Boolean).join(' / ') || 'Standard' }}
            · {{ formatMoney(v.selling_price) }}
          </option>
        </AppSelect>
        <AppSelect v-model="form.reason" label="Reason" required>
          <option value="restock">Restock</option>
          <option value="damage">Damage</option>
          <option value="correction">Correction</option>
          <option value="sale">Sale (manual)</option>
        </AppSelect>
        <AppInput
          v-model="form.change"
          label="Quantity change"
          type="number"
          required
          :hint="form.reason === 'damage' ? 'Positive numbers are recorded as removals.' : 'Use positive to add, negative to remove.'"
        />
        <AppInput v-model="form.note" label="Note" placeholder="Optional" />
        <ErrorBanner v-if="formError" :message="formError" />
        <div class="flex justify-end gap-2 pt-2">
          <AppButton type="button" variant="ghost" @click="modalOpen = false">Cancel</AppButton>
          <AppButton type="submit" :loading="saving">Save movement</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
