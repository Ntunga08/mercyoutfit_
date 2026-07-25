<script setup>
defineProps({
  label: String,
  value: [String, Number],
  hint: String,
  tone: { type: String, default: 'default' },
})
</script>

<template>
  <div class="border-b border-line py-4 pr-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:pr-6">
    <p class="text-[13px] text-stone">{{ label }}</p>
    <p
      class="mt-1 font-display text-[1.65rem] leading-none tracking-tight text-ink"
      :class="{
        'text-teal': tone === 'teal',
        'text-warn': tone === 'warn',
        'text-success': tone === 'success',
      }"
    >
      {{ value }}
    </p>
    <p v-if="hint" class="mt-2 text-[13px] text-stone">{{ hint }}</p>
  </div>
</template>
