<script setup>
defineProps({ title: String, description: String })
</script>

<template>
  <div class="rounded-2xl border border-dashed border-line bg-mist px-6 py-12 text-center">
    <p class="font-display text-xl text-ink">{{ title }}</p>
    <p v-if="description" class="mx-auto mt-2 max-w-md text-sm text-stone">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5"><slot /></div>
  </div>
</template>
