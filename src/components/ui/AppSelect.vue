<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: String,
  required: Boolean,
  disabled: Boolean,
  error: String,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-ink">{{ label }}</span>
    <select
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      class="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:bg-canvas"
      :class="{ 'border-danger': error }"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot />
    </select>
    <span v-if="error" class="mt-1 block text-xs text-danger">{{ error }}</span>
  </label>
</template>
