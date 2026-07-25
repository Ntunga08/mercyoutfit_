const currency = new Intl.NumberFormat('en-TZ', {
  style: 'currency',
  currency: 'TZS',
  maximumFractionDigits: 0,
})

export function formatMoney(value) {
  const n = Number(value ?? 0)
  if (Number.isNaN(n)) return '—'
  return currency.format(n)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function variantLabel(variant) {
  if (!variant) return '—'
  if (typeof variant === 'string') return variant
  const parts = [variant.product_name || variant.name, variant.size, variant.color].filter(Boolean)
  return parts.join(' · ') || `Variant #${variant.id}`
}

export function paymentLabel(method) {
  const map = {
    cash: 'Cash',
    mpesa: 'M-Pesa',
    tigopesa: 'Tigo Pesa',
    airtel: 'Airtel Money',
    bank: 'Bank',
  }
  return map[method] || method
}

export function expenseCategoryLabel(category) {
  const map = {
    rent: 'Rent',
    restock: 'Restock',
    transport: 'Transport',
    utilities: 'Utilities',
    salary: 'Salary',
    other: 'Other',
  }
  return map[category] || category
}
