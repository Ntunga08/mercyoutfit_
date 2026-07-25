<script setup>
defineProps({
  message: { type: String, default: 'Something went wrong.' },
})
</script>

<template>
  <div class="border border-danger/30 bg-danger-soft px-4 py-3 text-[14px] text-danger">
    {{ message }}
  </div>
</template>
