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
      <div class="absolute inset-0 bg-navy/50 backdrop-blur-sm" @click="emit('close')" />
      <div
        class="relative z-10 w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-navy/20"
        :class="widths[size]"
      >
        <div class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <h2 class="font-display text-xl text-ink">{{ title }}</h2>
          <button type="button" class="rounded-lg px-2 py-1 text-stone hover:bg-canvas hover:text-ink" @click="emit('close')">
            ✕
          </button>
        </div>
        <div class="max-h-[75vh] overflow-y-auto px-5 py-4">
          <slot />
        </div>
        <div v-if="$slots.footer" class="border-t border-line bg-mist px-5 py-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
