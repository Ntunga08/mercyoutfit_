<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: Boolean,
  loading: Boolean,
  block: Boolean,
})

const variants = {
  primary: 'bg-teal text-navy hover:bg-teal-bright',
  secondary: 'bg-navy text-teal-bright hover:bg-navy-soft',
  ghost: 'bg-surface text-ink border border-line hover:bg-mist',
  danger: 'bg-danger text-white hover:opacity-90',
  soft: 'bg-teal-soft text-teal hover:bg-[#f5ebc8]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variants[variant], sizes[size], block && 'w-full']"
  >
    <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
    <slot />
  </button>
</template>
