<script setup>
import { BRAND } from '@/constants/brand'

defineProps({
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex flex-wrap gap-2" :class="compact ? '' : 'gap-3'">
    <a
      :href="BRAND.whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 rounded-full border border-teal/50 bg-black/40 px-3 py-1.5 text-xs text-teal-bright backdrop-blur transition hover:border-teal-bright hover:bg-teal/10"
      :class="compact ? 'px-2.5 py-1 text-[11px]' : 'sm:px-4 sm:py-2 sm:text-sm'"
    >
      <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#25D366] text-[9px] font-bold text-white">W</span>
      {{ BRAND.phoneDisplay }}
    </a>
    <a
      :href="BRAND.instagramUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 rounded-full border border-teal/50 bg-black/40 px-3 py-1.5 text-xs text-teal-bright backdrop-blur transition hover:border-teal-bright hover:bg-teal/10"
      :class="compact ? 'px-2.5 py-1 text-[11px]' : 'sm:px-4 sm:py-2 sm:text-sm'"
    >
      <span class="font-display text-[11px] font-bold text-teal-bright">IG</span>
      {{ BRAND.instagram }}
    </a>
  </div>
</template>
