<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { stockApi, movementsApi } from '@/api/inventory'
import { formatMoney, apiErrorMessage } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'

const loading = ref(true)
const error = ref('')
const stock = ref([])
const search = ref('')
const onlyLow = ref(false)

const modalOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  variant: null,
  variantName: '',
  quantity: '',
  note: '',
})

const filtered = computed(() => {
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
    const res = await stockApi.list()
    stock.value = res.data
  } catch (err) {
    error.value = apiErrorMessage(err, 'Failed to load inventory.')
  } finally {
    loading.value = false
  }
}

function openRestock(row) {
  Object.assign(form, {
    variant: row.variant,
    variantName: row.variant_name,
    quantity: '',
    note: '',
  })
  formError.value = ''
  modalOpen.value = true
}

async function submitRestock() {
  saving.value = true
  formError.value = ''
  try {
    await movementsApi.create({
      variant: form.variant,
      change: Number(form.quantity),
      reason: 'restock',
      note: form.note || '',
    })
    modalOpen.value = false
    await load()
  } catch (err) {
    formError.value = apiErrorMessage(err, 'Could not restock.')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Inventory" subtitle="Stock levels with low-stock alerts. Restock per row." />

    <div class="mb-5 flex flex-wrap items-center gap-3">
      <div class="min-w-[200px] flex-1">
        <AppInput v-model="search" placeholder="Filter variants…" />
      </div>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="onlyLow" type="checkbox" class="rounded border-line text-teal" />
        Low stock only
      </label>
    </div>

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <LoadingBlock v-if="loading" />

    <EmptyState
      v-else-if="!filtered.length"
      title="No stock rows"
      description="Stock appears after the first sale or restock for a variant."
    />

    <div v-else class="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-mist text-xs uppercase tracking-wide text-stone">
            <tr>
              <th class="px-4 py-3 font-semibold">Variant</th>
              <th class="px-4 py-3 font-semibold">Qty</th>
              <th class="px-4 py-3 font-semibold">Threshold</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filtered" :key="row.id" class="border-t border-line hover:bg-mist/50">
              <td class="px-4 py-3 font-medium">{{ row.variant_name }}</td>
              <td class="px-4 py-3 tabular-nums">{{ row.quantity }}</td>
              <td class="px-4 py-3 text-stone">{{ row.low_stock_threshold }}</td>
              <td class="px-4 py-3">
                <AppBadge :tone="row.is_low ? 'warn' : 'success'">{{ row.is_low ? 'Low' : 'OK' }}</AppBadge>
              </td>
              <td class="px-4 py-3 text-right">
                <AppButton size="sm" variant="soft" @click="openRestock(row)">Restock</AppButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :open="modalOpen" title="Restock" size="sm" @close="modalOpen = false">
      <form class="space-y-4" @submit.prevent="submitRestock">
        <p class="text-sm text-stone">{{ form.variantName }}</p>
        <AppInput v-model="form.quantity" label="Quantity to add" type="number" required min="1" />
        <AppInput v-model="form.note" label="Note" placeholder="Optional" />
        <ErrorBanner v-if="formError" :message="formError" />
        <div class="flex justify-end gap-2">
          <AppButton type="button" variant="ghost" @click="modalOpen = false">Cancel</AppButton>
          <AppButton type="submit" :loading="saving">Save restock</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
