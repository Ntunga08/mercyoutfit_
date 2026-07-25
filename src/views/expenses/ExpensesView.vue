<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { expensesApi } from '@/api/expenses'
import { expenseCategoryLabel, formatDateTime, formatMoney, apiErrorMessage } from '@/utils/format'
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
const expenses = ref([])
const search = ref('')
const modalOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({ description: '', category: 'other', amount: '' })

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return expenses.value
  return expenses.value.filter((e) => `${e.description} ${e.category}`.toLowerCase().includes(q))
})

const total = computed(() => filtered.value.reduce((sum, e) => sum + Number(e.amount || 0), 0))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await expensesApi.list()
    expenses.value = res.data
  } catch (err) {
    error.value = apiErrorMessage(err, 'Failed to load expenses.')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, { description: '', category: 'other', amount: '' })
  formError.value = ''
  modalOpen.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    await expensesApi.create({
      description: form.description,
      category: form.category,
      amount: form.amount,
    })
    modalOpen.value = false
    await load()
  } catch (err) {
    formError.value = apiErrorMessage(err, 'Could not save expense.')
  } finally {
    saving.value = false
  }
}

async function remove(expense) {
  if (!confirm(`Delete “${expense.description}”?`)) return
  try {
    await expensesApi.remove(expense.id)
    await load()
  } catch (err) {
    error.value = apiErrorMessage(err, 'Could not delete expense.')
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Expenses" subtitle="Owner-only shop costs.">
      <template #actions>
        <AppButton @click="openCreate">Add expense</AppButton>
      </template>
    </PageHeader>

    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-[220px] flex-1"><AppInput v-model="search" placeholder="Search expenses…" /></div>
      <div class="rounded-xl border border-line bg-surface px-4 py-2 text-sm">
        <span class="text-stone">Total · </span>
        <span class="font-semibold">{{ formatMoney(total) }}</span>
      </div>
    </div>

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <LoadingBlock v-if="loading" />
    <EmptyState v-else-if="!filtered.length" title="No expenses" description="Track rent, utilities, salary, and more.">
      <AppButton @click="openCreate">Add expense</AppButton>
    </EmptyState>

    <div v-else class="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-mist text-xs uppercase tracking-wide text-stone">
            <tr>
              <th class="px-4 py-3 font-semibold">When</th>
              <th class="px-4 py-3 font-semibold">Description</th>
              <th class="px-4 py-3 font-semibold">Category</th>
              <th class="px-4 py-3 font-semibold">Amount</th>
              <th class="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filtered" :key="expense.id" class="border-t border-line hover:bg-mist/50">
              <td class="px-4 py-3 whitespace-nowrap text-stone">{{ formatDateTime(expense.created_at) }}</td>
              <td class="px-4 py-3 font-medium">{{ expense.description }}</td>
              <td class="px-4 py-3"><AppBadge tone="teal">{{ expenseCategoryLabel(expense.category) }}</AppBadge></td>
              <td class="px-4 py-3 font-semibold">{{ formatMoney(expense.amount) }}</td>
              <td class="px-4 py-3 text-right">
                <AppButton size="sm" variant="ghost" @click="remove(expense)">Delete</AppButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :open="modalOpen" title="Add expense" size="sm" @close="modalOpen = false">
      <form class="space-y-4" @submit.prevent="save">
        <AppInput v-model="form.description" label="Description" required />
        <AppSelect v-model="form.category" label="Category" required>
          <option value="rent">Rent</option>
          <option value="restock">Restock</option>
          <option value="transport">Transport</option>
          <option value="utilities">Utilities</option>
          <option value="salary">Salary</option>
          <option value="other">Other</option>
        </AppSelect>
        <AppInput v-model="form.amount" label="Amount" type="number" required />
        <ErrorBanner v-if="formError" :message="formError" />
        <div class="flex justify-end gap-2">
          <AppButton type="button" variant="ghost" @click="modalOpen = false">Cancel</AppButton>
          <AppButton type="submit" :loading="saving">Save</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
