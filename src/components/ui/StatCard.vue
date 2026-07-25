<script setup>
defineProps({
  label: String,
  value: [String, Number],
  hint: String,
  tone: { type: String, default: 'default' },
})

const tones = {
  default: 'border-line',
  teal: 'border-teal/30 bg-teal-soft/40',
  warn: 'border-warn/30 bg-warn-soft',
  success: 'border-success/30 bg-success-soft',
}
</script>

<template>
  <div class="rounded-2xl border bg-surface p-5 shadow-sm shadow-ink/5" :class="tones[tone]">
    <p class="text-xs font-semibold uppercase tracking-wide text-stone">{{ label }}</p>
    <p class="mt-2 font-display text-2xl text-ink sm:text-3xl">{{ value }}</p>
    <p v-if="hint" class="mt-2 text-sm text-stone">{{ hint }}</p>
  </div>
</template>
