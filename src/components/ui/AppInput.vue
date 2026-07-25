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
  maxlength: [Number, String],
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-ink">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      class="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone/60 focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:bg-canvas disabled:opacity-70"
      :class="{ 'border-danger focus:border-danger focus:ring-danger/20': error }"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="mt-1 block text-xs text-danger">{{ error }}</span>
    <span v-else-if="hint" class="mt-1 block text-xs text-stone">{{ hint }}</span>
  </label>
</template>
