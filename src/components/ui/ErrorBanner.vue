<script setup>
defineProps({ message: { type: String, default: 'Something went wrong.' } })
</script>

<template>
  <div class="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
    {{ message }}
  </div>
</template>
