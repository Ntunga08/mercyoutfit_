<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { categoriesApi, productsApi, variantsApi } from '@/api/products'
import { formatMoney } from '@/utils/format'
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
const search = ref('')
const products = ref([])
const categories = ref([])

const productModal = ref(false)
const variantModal = ref(false)
const categoryModal = ref(false)
const saving = ref(false)
const formError = ref('')

const productForm = reactive({
  id: null,
  name: '',
  category: '',
  description: '',
  is_active: true,
  imageFile: null,
})

const variantForm = reactive({
  product: '',
  size: '',
  color: '',
  sku: '',
  cost_price: '',
  selling_price: '',
})

const categoryForm = reactive({ name: '' })

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return products.value
  return products.value.filter((p) => {
    const hay = `${p.name} ${p.category_name || ''} ${p.description || ''}`.toLowerCase()
    return hay.includes(q)
  })
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [prodRes, catRes] = await Promise.all([productsApi.list(), categoriesApi.list()])
    products.value = prodRes.data
    categories.value = catRes.data
  } catch (err) {
    error.value = 'Failed to load products.'
  } finally {
    loading.value = false
  }
}

function openCreateProduct() {
  Object.assign(productForm, {
    id: null,
    name: '',
    category: categories.value[0] ? String(categories.value[0].id) : '',
    description: '',
    is_active: true,
    imageFile: null,
  })
  formError.value = ''
  productModal.value = true
}

function openEditProduct(product) {
  Object.assign(productForm, {
    id: product.id,
    name: product.name,
    category: String(product.category),
    description: product.description || '',
    is_active: product.is_active,
    imageFile: null,
  })
  formError.value = ''
  productModal.value = true
}

function openVariant(product) {
  Object.assign(variantForm, {
    product: product.id,
    size: '',
    color: '',
    sku: '',
    cost_price: '',
    selling_price: '',
  })
  formError.value = ''
  variantModal.value = true
}

function onImageChange(e) {
  productForm.imageFile = e.target.files?.[0] || null
}

async function saveProduct() {
  saving.value = true
  formError.value = ''
  try {
    const payload = new FormData()
    payload.append('name', productForm.name)
    payload.append('category', productForm.category)
    payload.append('description', productForm.description)
    payload.append('is_active', productForm.is_active)
    if (productForm.imageFile) payload.append('image', productForm.imageFile)

    if (productForm.id) {
      await productsApi.update(productForm.id, payload)
    } else {
      await productsApi.create(payload)
    }
    productModal.value = false
    await load()
  } catch (err) {
    formError.value = extractError(err) || 'Could not save product.'
  } finally {
    saving.value = false
  }
}

async function saveVariant() {
  saving.value = true
  formError.value = ''
  try {
    await variantsApi.create({
      product: Number(variantForm.product),
      size: variantForm.size || null,
      color: variantForm.color || null,
      sku: variantForm.sku || null,
      cost_price: variantForm.cost_price,
      selling_price: variantForm.selling_price,
    })
    variantModal.value = false
    await load()
  } catch (err) {
    formError.value = extractError(err) || 'Could not add variant.'
  } finally {
    saving.value = false
  }
}

async function saveCategory() {
  saving.value = true
  formError.value = ''
  try {
    await categoriesApi.create({ name: categoryForm.name })
    categoryModal.value = false
    categoryForm.name = ''
    await load()
  } catch (err) {
    formError.value = extractError(err) || 'Could not create category.'
  } finally {
    saving.value = false
  }
}

async function toggleActive(product) {
  try {
    await productsApi.update(product.id, { is_active: !product.is_active })
    await load()
  } catch {
    error.value = 'Could not update product status.'
  }
}

function extractError(err) {
  const data = err.response?.data
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.join(' ')
  return Object.values(data).flat().join(' ')
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Product catalog"
      subtitle="Categories, styles, and sellable variants."
    >
      <template #actions>
        <AppButton variant="ghost" @click="categoryModal = true; formError = ''; categoryForm.name = ''">
          New category
        </AppButton>
        <AppButton @click="openCreateProduct">Add product</AppButton>
      </template>
    </PageHeader>

    <div class="mb-5">
      <AppInput v-model="search" placeholder="Search products…" />
    </div>

    <ErrorBanner v-if="error" class="mb-4" :message="error" />
    <LoadingBlock v-if="loading" />

    <EmptyState
      v-else-if="!filtered.length"
      title="No products yet"
      description="Add a category, then create your first piece."
    >
      <AppButton @click="openCreateProduct">Add product</AppButton>
    </EmptyState>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="product in filtered"
        :key="product.id"
        class="overflow-hidden border border-line bg-surface"
      >
        <div class="relative aspect-[4/3] bg-canvas">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-ink text-3xl font-display text-white/80"
          >
            {{ product.name.slice(0, 1) }}
          </div>
          <div class="absolute left-3 top-3">
            <AppBadge :tone="product.is_active ? 'success' : 'neutral'">
              {{ product.is_active ? 'Active' : 'Inactive' }}
            </AppBadge>
          </div>
        </div>

        <div class="p-4">
          <p class="text-[13px] font-medium text-teal">
            {{ product.category_name || 'Uncategorized' }}
          </p>
          <h3 class="mt-1 font-display text-xl text-ink">{{ product.name }}</h3>
          <p v-if="product.description" class="mt-1 line-clamp-2 text-sm text-stone">
            {{ product.description }}
          </p>

          <div class="mt-4 space-y-2">
            <div
              v-for="v in product.variants"
              :key="v.id"
              class="flex items-center justify-between bg-mist px-3 py-2 text-sm"
            >
              <span class="text-ink">
                {{ [v.size, v.color].filter(Boolean).join(' · ') || 'Standard' }}
                <span v-if="v.sku" class="text-stone"> · {{ v.sku }}</span>
              </span>
              <span class="font-semibold text-teal">{{ formatMoney(v.selling_price) }}</span>
            </div>
            <p v-if="!product.variants?.length" class="text-xs text-stone">No variants yet.</p>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <AppButton size="sm" variant="soft" @click="openVariant(product)">Add variant</AppButton>
            <AppButton size="sm" variant="ghost" @click="openEditProduct(product)">Edit</AppButton>
            <AppButton size="sm" variant="ghost" @click="toggleActive(product)">
              {{ product.is_active ? 'Deactivate' : 'Activate' }}
            </AppButton>
          </div>
        </div>
      </article>
    </div>

    <!-- Product modal -->
    <AppModal
      :open="productModal"
      :title="productForm.id ? 'Edit product' : 'New product'"
      @close="productModal = false"
    >
      <form class="space-y-4" @submit.prevent="saveProduct">
        <AppInput v-model="productForm.name" label="Name" required />
        <AppSelect v-model="productForm.category" label="Category" required>
          <option value="" disabled>Select category</option>
          <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
        </AppSelect>
        <label class="block">
          <span class="mb-1 block text-[13px] font-medium text-ink">Description</span>
          <textarea
            v-model="productForm.description"
            rows="3"
            class="w-full rounded-sm border border-line bg-surface px-3 py-2 text-[15px] outline-none focus:border-teal focus:ring-1 focus:ring-teal"
          />
        </label>
        <label class="flex items-center gap-2 text-sm text-ink">
          <input v-model="productForm.is_active" type="checkbox" class="rounded border-line text-teal" />
          Active in catalog
        </label>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-ink">Image</span>
          <input type="file" accept="image/*" class="text-sm text-stone" @change="onImageChange" />
        </label>
        <ErrorBanner v-if="formError" :message="formError" />
        <div class="flex justify-end gap-2 pt-2">
          <AppButton type="button" variant="ghost" @click="productModal = false">Cancel</AppButton>
          <AppButton type="submit" :loading="saving">Save</AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Variant modal -->
    <AppModal :open="variantModal" title="Add variant" @close="variantModal = false">
      <form class="space-y-4" @submit.prevent="saveVariant">
        <div class="grid gap-4 sm:grid-cols-2">
          <AppInput v-model="variantForm.size" label="Size" placeholder="M" />
          <AppInput v-model="variantForm.color" label="Color" placeholder="Navy" />
        </div>
        <AppInput v-model="variantForm.sku" label="SKU" placeholder="Optional" />
        <div class="grid gap-4 sm:grid-cols-2">
          <AppInput v-model="variantForm.cost_price" label="Cost price" type="number" required />
          <AppInput v-model="variantForm.selling_price" label="Selling price" type="number" required />
        </div>
        <ErrorBanner v-if="formError" :message="formError" />
        <div class="flex justify-end gap-2 pt-2">
          <AppButton type="button" variant="ghost" @click="variantModal = false">Cancel</AppButton>
          <AppButton type="submit" :loading="saving">Add variant</AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Category modal -->
    <AppModal :open="categoryModal" title="New category" size="sm" @close="categoryModal = false">
      <form class="space-y-4" @submit.prevent="saveCategory">
        <AppInput v-model="categoryForm.name" label="Category name" required />
        <ErrorBanner v-if="formError" :message="formError" />
        <div class="flex justify-end gap-2 pt-2">
          <AppButton type="button" variant="ghost" @click="categoryModal = false">Cancel</AppButton>
          <AppButton type="submit" :loading="saving">Create</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
