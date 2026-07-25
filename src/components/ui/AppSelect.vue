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
    <span v-if="label" class="mb-1 block text-[13px] font-medium text-ink">{{ label }}</span>
    <select
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      class="w-full rounded-sm border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none transition focus:border-teal focus:ring-1 focus:ring-teal disabled:bg-mist"
      :class="{ 'border-danger': error }"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot />
    </select>
    <span v-if="error" class="mt-1 block text-[13px] text-danger">{{ error }}</span>
  </label>
</template>
