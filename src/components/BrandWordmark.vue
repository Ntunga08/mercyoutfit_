<script setup>
defineProps({
  size: { type: String, default: 'md' }, // sm | md | lg
  stacked: { type: Boolean, default: false },
  showMark: { type: Boolean, default: true },
  onDark: { type: Boolean, default: true },
})

const sizes = {
  sm: { mark: 'h-9 w-9', mercy: 'text-base', outfit: 'text-2xl' },
  md: { mark: 'h-12 w-12', mercy: 'text-xl', outfit: 'text-3xl' },
  lg: { mark: 'h-16 w-16', mercy: 'text-3xl sm:text-4xl', outfit: 'text-5xl sm:text-6xl' },
}
</script>

<template>
  <div
    class="inline-flex items-center gap-3"
    :class="stacked ? 'flex-col gap-3 text-center' : ''"
  >
    <img
      v-if="showMark"
      src="/logo-mark.svg"
      alt=""
      class="shrink-0 object-contain"
      :class="sizes[size].mark"
    />
    <div :class="stacked ? '' : 'leading-none'">
      <p
        class="font-display font-extrabold tracking-[0.14em] uppercase"
        :class="[sizes[size].mercy, onDark ? 'text-gold-gradient' : 'text-teal']"
      >
        MERCY
      </p>
      <p
        class="font-script leading-none"
        :class="[sizes[size].outfit, onDark ? 'text-teal-bright' : 'text-teal']"
        style="margin-top: -0.12em"
      >
        Outfit
      </p>
    </div>
  </div>
</template>
