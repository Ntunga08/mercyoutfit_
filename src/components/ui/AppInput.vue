<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  error: String,
  hint: String,
  autocomplete: String,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-[13px] font-medium text-ink">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="w-full rounded-sm border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none transition placeholder:text-stone/50 focus:border-teal focus:ring-1 focus:ring-teal disabled:bg-mist disabled:opacity-70"
      :class="{ 'border-danger focus:border-danger focus:ring-danger': error }"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="mt-1 block text-[13px] text-danger">{{ error }}</span>
    <span v-else-if="hint" class="mt-1 block text-[13px] text-stone">{{ hint }}</span>
  </label>
</template>
