<script setup>
defineProps({
  title: String,
  subtitle: String,
})
</script>

<template>
  <div class="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 v-if="title" class="font-display text-[1.55rem] leading-tight text-ink">{{ title }}</h2>
      <p v-if="subtitle" class="mt-1 max-w-xl text-[15px] text-stone">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
