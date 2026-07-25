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
  primary: 'bg-teal text-white hover:bg-teal-bright',
  secondary: 'bg-ink text-white hover:bg-ink-soft',
  ghost: 'bg-surface text-ink border border-line hover:bg-mist',
  danger: 'bg-danger text-white hover:opacity-90',
  soft: 'bg-teal-soft text-teal hover:bg-teal-soft/80',
}

const sizes = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2 text-[15px]',
  lg: 'px-5 py-2.5 text-base',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variants[variant], sizes[size], block && 'w-full']"
  >
    <span
      v-if="loading"
      class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
    <slot />
  </button>
</template>
