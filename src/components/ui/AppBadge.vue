<script setup>
defineProps({
  tone: { type: String, default: 'neutral' },
})

const tones = {
  neutral: 'bg-canvas text-stone',
  teal: 'bg-teal-soft text-teal',
  success: 'bg-success-soft text-success',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
}
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="tones[tone]">
    <slot />
  </span>
</template>
