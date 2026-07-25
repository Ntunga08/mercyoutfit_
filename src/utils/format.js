export function formatMoney(value) {
  const n = Number(value ?? 0)
  if (Number.isNaN(n)) return '—'
  return `TSh ${Math.round(n).toLocaleString('en-TZ')}`
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

export function segmentLabel(segment) {
  const map = {
    all: 'All opted-in',
    recent_30: 'Purchased last 30 days',
    repeat: 'Repeat customers (2+)',
  }
  return map[segment] || segment
}

export function apiErrorMessage(err, fallback = 'Something went wrong.') {
  const data = err?.response?.data
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.join(' ')
  if (data.detail) return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
  return Object.values(data).flat().join(' ') || fallback
}
