<script setup>
import { onMounted, reactive, ref } from 'vue'
import { staffApi } from '@/api/auth'
import { apiErrorMessage } from '@/utils/format'
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
const staff = ref([])
const modalOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  username: '',
  email: '',
  phone_number: '',
  password: '',
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await staffApi.list()
    staff.value = res.data
  } catch (err) {
    error.value = apiErrorMessage(err, 'Failed to load staff.')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, { username: '', email: '', phone_number: '', password: '' })
  formError.value = ''
  modalOpen.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    await staffApi.create({
      username: form.username,
      email: form.email || '',
      phone_number: form.phone_number || '',
      password: form.password,
    })
    modalOpen.value = false
    await load()
  } catch (err) {
    formError.value = apiErrorMessage(err, 'Could not create cashier.')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Staff" subtitle="Owner-only. Create cashier accounts (no public signup).">
      <template #actions>
        <AppButton @click="openCreate">Add cashier</AppButton>
      </template>
    </PageHeader>

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <LoadingBlock v-if="loading" />

    <EmptyState
      v-else-if="!staff.length"
      title="No cashiers yet"
      description="Create a cashier account so someone can run the POS."
    >
      <AppButton @click="openCreate">Add cashier</AppButton>
    </EmptyState>

    <div v-else class="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-mist text-xs uppercase tracking-wide text-stone">
            <tr>
              <th class="px-4 py-3 font-semibold">Username</th>
              <th class="px-4 py-3 font-semibold">Email</th>
              <th class="px-4 py-3 font-semibold">Phone</th>
              <th class="px-4 py-3 font-semibold">Role</th>
              <th class="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in staff" :key="user.id" class="border-t border-line hover:bg-mist/50">
              <td class="px-4 py-3 font-medium">{{ user.username }}</td>
              <td class="px-4 py-3 text-stone">{{ user.email || '—' }}</td>
              <td class="px-4 py-3 font-mono text-xs">{{ user.phone_number || '—' }}</td>
              <td class="px-4 py-3"><AppBadge tone="teal">{{ user.role }}</AppBadge></td>
              <td class="px-4 py-3">
                <AppBadge :tone="user.is_active ? 'success' : 'neutral'">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </AppBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :open="modalOpen" title="Add cashier" size="sm" @close="modalOpen = false">
      <form class="space-y-4" @submit.prevent="save">
        <AppInput v-model="form.username" label="Username" required />
        <AppInput v-model="form.email" label="Email" type="email" />
        <AppInput v-model="form.phone_number" label="Phone" />
        <AppInput v-model="form.password" label="Password" type="password" required hint="Min 6 characters" />
        <ErrorBanner v-if="formError" :message="formError" />
        <div class="flex justify-end gap-2">
          <AppButton type="button" variant="ghost" @click="modalOpen = false">Cancel</AppButton>
          <AppButton type="submit" :loading="saving">Create</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
