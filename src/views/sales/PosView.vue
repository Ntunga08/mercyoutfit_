<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { productsApi } from '@/api/products'
import { stockApi } from '@/api/inventory'
import { salesApi } from '@/api/sales'
import { formatMoney, apiErrorMessage } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'

const loading = ref(true)
const error = ref('')
const success = ref('')
const search = ref('')
const products = ref([])
const stockMap = ref({})
const cart = ref([])
const submitting = ref(false)

const checkout = reactive({
  customer_name: '',
  customer_phone: '',
  payment_method: 'cash',
})

const catalog = computed(() => {
  const q = search.value.trim().toLowerCase()
  const rows = []
  for (const product of products.value.filter((p) => p.is_active)) {
    for (const variant of product.variants || []) {
      const stock = stockMap.value[variant.id]
      const qty = stock?.quantity ?? 0
      const row = {
        product,
        variant,
        qty,
        isLow: stock?.is_low ?? false,
        label: `${product.name} · ${[variant.size, variant.color].filter(Boolean).join(' · ') || 'Standard'}`,
      }
      const hay = `${row.label} ${product.category_name || ''} ${variant.sku || ''}`.toLowerCase()
      if (!q || hay.includes(q)) rows.push(row)
    }
  }
  return rows
})

const cartTotal = computed(() =>
  cart.value.reduce((sum, line) => sum + Number(line.variant.selling_price) * line.quantity, 0),
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [prodRes, stockRes] = await Promise.all([productsApi.list(), stockApi.list()])
    products.value = prodRes.data
    const map = {}
    for (const s of stockRes.data) map[s.variant] = s
    stockMap.value = map
  } catch (err) {
    error.value = apiErrorMessage(err, 'Could not load catalog.')
  } finally {
    loading.value = false
  }
}

function addToCart(row) {
  success.value = ''
  error.value = ''
  if (row.qty <= 0) {
    error.value = `Not enough stock for ${row.label}: only 0 left.`
    return
  }
  const existing = cart.value.find((c) => c.variant.id === row.variant.id)
  if (existing) {
    if (existing.quantity >= row.qty) {
      error.value = `Not enough stock for ${row.label}: only ${row.qty} left.`
      return
    }
    existing.quantity += 1
  } else {
    cart.value.push({ variant: row.variant, label: row.label, quantity: 1, max: row.qty })
  }
}

function bump(line, delta) {
  error.value = ''
  const next = line.quantity + delta
  if (next <= 0) {
    cart.value = cart.value.filter((c) => c.variant.id !== line.variant.id)
    return
  }
  const available = stockMap.value[line.variant.id]?.quantity ?? line.max
  if (next > available) {
    error.value = `Not enough stock for ${line.label}: only ${available} left.`
    return
  }
  line.quantity = next
}

function clearCart() {
  cart.value = []
  checkout.customer_name = ''
  checkout.customer_phone = ''
  checkout.payment_method = 'cash'
}

async function checkoutSale() {
  if (!cart.value.length) return
  submitting.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await salesApi.create({
      customer_name: checkout.customer_name || '',
      customer_phone: checkout.customer_phone || '',
      payment_method: checkout.payment_method,
      items_input: cart.value.map((line) => ({
        variant: line.variant.id,
        quantity: line.quantity,
      })),
    })
    success.value = `Sale #${res.data.id} recorded · ${formatMoney(res.data.total)}`
    clearCart()
    await load()
  } catch (err) {
    error.value = apiErrorMessage(err, 'Sale failed.')
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="New sale" subtitle="Search, add to cart, take payment." />

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <div v-if="success" class="mb-4 rounded-xl border border-success/20 bg-success-soft px-4 py-3 text-sm text-success">
      {{ success }}
    </div>

    <LoadingBlock v-if="loading" />

    <div v-else class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <section>
        <div class="mb-4">
          <AppInput v-model="search" placeholder="Search by name, category, size, color, SKU…" />
        </div>
        <EmptyState
          v-if="!catalog.length"
          title="Nothing to sell"
          description="Ask the owner to add products and restock inventory."
        />
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="row in catalog"
            :key="row.variant.id"
            type="button"
            class="rounded-2xl border border-line bg-surface p-4 text-left shadow-sm transition hover:border-teal disabled:opacity-50"
            :disabled="row.qty <= 0"
            @click="addToCart(row)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-xs font-semibold text-teal">{{ row.product.category_name }}</p>
                <p class="mt-1 font-semibold text-ink">{{ row.product.name }}</p>
                <p class="text-sm text-stone">
                  {{ [row.variant.size, row.variant.color].filter(Boolean).join(' · ') || 'Standard' }}
                </p>
              </div>
              <AppBadge :tone="row.qty <= 0 ? 'danger' : row.isLow ? 'warn' : 'success'">
                {{ row.qty }} left
              </AppBadge>
            </div>
            <p class="mt-3 font-display text-xl">{{ formatMoney(row.variant.selling_price) }}</p>
          </button>
        </div>
      </section>

      <aside class="h-fit rounded-2xl border border-line bg-surface p-5 shadow-sm xl:sticky xl:top-24">
        <h3 class="font-display text-xl">Cart</h3>
        <div v-if="!cart.length" class="py-10 text-center text-sm text-stone">Tap a variant to add it.</div>
        <ul v-else class="mt-4 divide-y divide-line">
          <li v-for="line in cart" :key="line.variant.id" class="py-3">
            <div class="flex justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{{ line.label }}</p>
                <p class="text-xs text-stone">{{ formatMoney(line.variant.selling_price) }} each</p>
              </div>
              <p class="text-sm font-semibold text-teal">
                {{ formatMoney(Number(line.variant.selling_price) * line.quantity) }}
              </p>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <button type="button" class="h-8 w-8 rounded-lg border border-line font-bold" @click="bump(line, -1)">−</button>
              <span class="min-w-8 text-center text-sm font-semibold">{{ line.quantity }}</span>
              <button type="button" class="h-8 w-8 rounded-lg border border-line font-bold" @click="bump(line, 1)">+</button>
            </div>
          </li>
        </ul>

        <div class="mt-5 space-y-3 border-t border-line pt-4">
          <AppInput v-model="checkout.customer_name" label="Customer name" placeholder="Optional" />
          <AppInput v-model="checkout.customer_phone" label="Phone" placeholder="Optional — grows SMS list" />
          <AppSelect v-model="checkout.payment_method" label="Payment">
            <option value="cash">Cash</option>
            <option value="mpesa">M-Pesa</option>
            <option value="tigopesa">Tigo Pesa</option>
            <option value="airtel">Airtel Money</option>
            <option value="bank">Bank</option>
          </AppSelect>
        </div>

        <div class="mt-5">
          <p class="text-xs uppercase tracking-wide text-stone">Total</p>
          <p class="font-display text-3xl">{{ formatMoney(cartTotal) }}</p>
        </div>

        <div class="mt-4 flex gap-2">
          <AppButton variant="ghost" block :disabled="!cart.length" @click="clearCart">Clear</AppButton>
          <AppButton block :disabled="!cart.length" :loading="submitting" @click="checkoutSale">Complete sale</AppButton>
        </div>
      </aside>
    </div>
  </div>
</template>
