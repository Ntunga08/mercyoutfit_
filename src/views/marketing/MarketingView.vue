<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { customersApi, campaignsApi } from '@/api/marketing'
import { formatDateTime, segmentLabel, apiErrorMessage } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'

const tab = ref('customers')
const loading = ref(true)
const error = ref('')
const customers = ref([])
const campaigns = ref([])

const composeOpen = ref(false)
const detailOpen = ref(false)
const saving = ref(false)
const sending = ref(false)
const formError = ref('')
const selected = ref(null)

const form = reactive({
  message: '',
  segment: 'all',
})

const messageLen = computed(() => form.message.length)
const messageOver = computed(() => messageLen.value > 160)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [cRes, campRes] = await Promise.all([customersApi.list(), campaignsApi.list()])
    customers.value = cRes.data
    campaigns.value = campRes.data
  } catch (err) {
    error.value = apiErrorMessage(err, 'Failed to load marketing data.')
  } finally {
    loading.value = false
  }
}

async function toggleOptIn(customer) {
  try {
    await customersApi.update(customer.id, { opted_in: !customer.opted_in })
    await load()
  } catch (err) {
    error.value = apiErrorMessage(err, 'Could not update opt-in.')
  }
}

function openCompose() {
  Object.assign(form, { message: '', segment: 'all' })
  formError.value = ''
  composeOpen.value = true
}

async function createCampaign() {
  if (messageOver.value) {
    formError.value = 'Message must be 160 characters or fewer.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    await campaignsApi.create({
      message: form.message,
      segment: form.segment,
    })
    composeOpen.value = false
    tab.value = 'campaigns'
    await load()
  } catch (err) {
    formError.value = apiErrorMessage(err, 'Could not create campaign.')
  } finally {
    saving.value = false
  }
}

async function openDetail(campaign) {
  try {
    const res = await campaignsApi.get(campaign.id)
    selected.value = res.data
    detailOpen.value = true
  } catch (err) {
    error.value = apiErrorMessage(err, 'Could not load campaign.')
  }
}

async function sendCampaign(campaign) {
  if (!confirm('Send this SMS campaign now?')) return
  sending.value = true
  error.value = ''
  try {
    const res = await campaignsApi.send(campaign.id)
    error.value = ''
    alert(res.data.detail || `Sent: ${res.data.sent}, failed: ${res.data.failed}`)
    await load()
    if (selected.value?.id === campaign.id) {
      const detail = await campaignsApi.get(campaign.id)
      selected.value = detail.data
    }
  } catch (err) {
    error.value = apiErrorMessage(err, 'Send failed.')
  } finally {
    sending.value = false
  }
}

function statusTone(status) {
  if (status === 'sent') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'sending') return 'warn'
  return 'neutral'
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Marketing SMS" subtitle="Owner-only. Contacts grow from POS phones. Max 160 chars per message.">
      <template #actions>
        <AppButton @click="openCompose">Compose campaign</AppButton>
      </template>
    </PageHeader>

    <div class="mb-5 inline-flex rounded-xl border border-line bg-surface p-1">
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
        :class="tab === 'customers' ? 'bg-teal text-white' : 'text-stone hover:text-ink'"
        @click="tab = 'customers'"
      >
        Customers
      </button>
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
        :class="tab === 'campaigns' ? 'bg-teal text-white' : 'text-stone hover:text-ink'"
        @click="tab = 'campaigns'"
      >
        Campaigns
      </button>
    </div>

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <LoadingBlock v-if="loading" />

    <template v-else-if="tab === 'customers'">
      <EmptyState
        v-if="!customers.length"
        title="No customers yet"
        description="Add a phone on POS sales — contacts appear here automatically."
      />
      <div v-else class="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-mist text-xs uppercase tracking-wide text-stone">
              <tr>
                <th class="px-4 py-3 font-semibold">Name</th>
                <th class="px-4 py-3 font-semibold">Phone</th>
                <th class="px-4 py-3 font-semibold">Purchases</th>
                <th class="px-4 py-3 font-semibold">Last purchase</th>
                <th class="px-4 py-3 font-semibold">Opt-in</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in customers" :key="c.id" class="border-t border-line hover:bg-mist/50">
                <td class="px-4 py-3 font-medium">{{ c.name || '—' }}</td>
                <td class="px-4 py-3 font-mono text-xs">{{ c.phone }}</td>
                <td class="px-4 py-3">{{ c.total_purchases }}</td>
                <td class="px-4 py-3 text-stone">{{ formatDateTime(c.last_purchase_at) }}</td>
                <td class="px-4 py-3">
                  <button type="button" @click="toggleOptIn(c)">
                    <AppBadge :tone="c.opted_in ? 'success' : 'danger'">
                      {{ c.opted_in ? 'Opted in' : 'Opted out' }}
                    </AppBadge>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-else>
      <EmptyState
        v-if="!campaigns.length"
        title="No campaigns"
        description="Compose a draft, pick a segment, then send."
      >
        <AppButton @click="openCompose">Compose campaign</AppButton>
      </EmptyState>
      <div v-else class="space-y-3">
        <article
          v-for="camp in campaigns"
          :key="camp.id"
          class="rounded-2xl border border-line bg-surface p-4 shadow-sm"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <AppBadge :tone="statusTone(camp.status)">{{ camp.status }}</AppBadge>
                <AppBadge tone="teal">{{ segmentLabel(camp.segment) }}</AppBadge>
                <span class="text-xs text-stone">{{ formatDateTime(camp.created_at) }}</span>
              </div>
              <p class="mt-2 text-sm text-ink">{{ camp.message }}</p>
              <p class="mt-1 text-xs text-stone">
                {{ camp.recipient_count }} recipients
                <span v-if="camp.sent_at"> · sent {{ formatDateTime(camp.sent_at) }}</span>
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <AppButton size="sm" variant="ghost" @click="openDetail(camp)">Details</AppButton>
              <AppButton
                v-if="camp.status === 'draft'"
                size="sm"
                :loading="sending"
                @click="sendCampaign(camp)"
              >
                Send SMS
              </AppButton>
            </div>
          </div>
        </article>
      </div>
    </template>

    <AppModal :open="composeOpen" title="Compose SMS campaign" @close="composeOpen = false">
      <form class="space-y-4" @submit.prevent="createCampaign">
        <AppSelect v-model="form.segment" label="Segment" required>
          <option value="all">All opted-in</option>
          <option value="recent_30">Purchased last 30 days</option>
          <option value="repeat">Repeat customers (2+)</option>
        </AppSelect>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium">Message</span>
          <textarea
            v-model="form.message"
            rows="4"
            maxlength="160"
            required
            class="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            :class="{ 'border-danger': messageOver }"
          />
          <span class="mt-1 block text-xs" :class="messageLen >= 140 ? 'text-warn' : 'text-stone'">
            {{ messageLen }} / 160 characters
          </span>
        </label>
        <ErrorBanner v-if="formError" :message="formError" />
        <div class="flex justify-end gap-2">
          <AppButton type="button" variant="ghost" @click="composeOpen = false">Cancel</AppButton>
          <AppButton type="submit" :loading="saving" :disabled="!form.message || messageOver">
            Save draft
          </AppButton>
        </div>
      </form>
    </AppModal>

    <AppModal
      :open="detailOpen"
      :title="selected ? `Campaign #${selected.id}` : ''"
      size="lg"
      @close="detailOpen = false"
    >
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <AppBadge :tone="statusTone(selected.status)">{{ selected.status }}</AppBadge>
          <AppBadge tone="teal">{{ segmentLabel(selected.segment) }}</AppBadge>
        </div>
        <p class="rounded-xl bg-mist p-3 text-sm">{{ selected.message }}</p>
        <div v-if="selected.status === 'draft'" class="flex justify-end">
          <AppButton :loading="sending" @click="sendCampaign(selected)">Send SMS</AppButton>
        </div>
        <div class="overflow-hidden rounded-xl border border-line">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-mist text-xs uppercase text-stone">
              <tr>
                <th class="px-3 py-2">Phone</th>
                <th class="px-3 py-2">Name</th>
                <th class="px-3 py-2">Status</th>
                <th class="px-3 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in selected.recipients" :key="r.id" class="border-t border-line">
                <td class="px-3 py-2 font-mono text-xs">{{ r.customer_phone }}</td>
                <td class="px-3 py-2">{{ r.customer_name || '—' }}</td>
                <td class="px-3 py-2"><AppBadge :tone="statusTone(r.status)">{{ r.status }}</AppBadge></td>
                <td class="px-3 py-2 text-xs text-danger">{{ r.error_message || '—' }}</td>
              </tr>
              <tr v-if="!selected.recipients?.length">
                <td colspan="4" class="px-3 py-6 text-center text-stone">No recipients yet (send to populate).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppModal>
  </div>
</template>
