<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  open: Boolean,
  title: String,
  size: { type: String, default: 'md' },
})

const emit = defineEmits(['close'])

const widths = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function onKey(e) {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div class="absolute inset-0 bg-ink/45" @click="emit('close')" />
      <div
        class="relative z-10 w-full border border-line bg-surface"
        :class="widths[size]"
      >
        <div class="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 class="font-display text-lg text-ink">{{ title }}</h2>
          <button
            type="button"
            class="px-1 text-stone hover:text-ink"
            aria-label="Close"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>
        <div class="max-h-[75vh] overflow-y-auto px-5 py-4">
          <slot />
        </div>
        <div v-if="$slots.footer" class="border-t border-line bg-mist px-5 py-3">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
