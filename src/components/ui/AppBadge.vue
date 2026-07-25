<script setup>
defineProps({
  tone: { type: String, default: 'neutral' },
})

const tones = {
  neutral: 'bg-mist text-stone border-line',
  teal: 'bg-teal-soft text-teal border-teal/25',
  success: 'bg-success-soft text-success border-success/25',
  warn: 'bg-warn-soft text-warn border-warn/25',
  danger: 'bg-danger-soft text-danger border-danger/25',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[12px] font-medium"
    :class="tones[tone]"
  >
    <slot />
  </span>
</template>
