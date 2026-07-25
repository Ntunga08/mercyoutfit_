<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import BrandWordmark from '@/components/BrandWordmark.vue'
import BrandContacts from '@/components/BrandContacts.vue'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push({ name: 'dashboard' })
  } catch {
    error.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-black">
    <!-- Storefront backdrop -->
    <img
      src="/storefront.png"
      alt=""
      class="absolute inset-0 h-full w-full object-cover object-center"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/55" />
    <div
      class="pointer-events-none absolute inset-0"
      style="
        background:
          radial-gradient(ellipse 50% 40% at 30% 25%, rgb(227 200 74 / 0.18), transparent 55%),
          radial-gradient(ellipse 40% 35% at 70% 80%, rgb(184 150 42 / 0.12), transparent 50%);
      "
    />

    <div class="relative z-10 grid min-h-screen lg:grid-cols-2">
      <!-- Brand panel -->
      <section class="flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <BrandWordmark size="lg" stacked class="self-start lg:self-center lg:pt-8" />

        <div class="max-w-lg space-y-6 lg:self-center">
          <div>
            <p class="font-display text-xs font-semibold uppercase tracking-[0.28em] text-teal-bright">
              Boutique shop desk
            </p>
            <h1 class="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Welcome to
              <span class="text-gold-gradient"> MERCY Outfit</span>
            </h1>
            <p class="mt-3 text-base text-white/65">
              Dark floors. Gold light. One place for sales, stock, and the till.
            </p>
          </div>
          <BrandContacts />
        </div>
      </section>

      <!-- Sign-in card -->
      <section class="flex items-end justify-center px-4 pb-10 sm:items-center sm:px-8 lg:pb-0">
        <form
          class="w-full max-w-md rounded-2xl border border-teal/35 bg-black/70 p-7 shadow-[0_0_40px_rgb(184_150_42_/_0.15)] backdrop-blur-md sm:p-8"
          @submit.prevent="handleLogin"
        >
          <h2 class="font-display text-2xl font-bold text-white">Staff sign in</h2>
          <p class="mt-1 text-sm text-white/55">Use your MERCY Outfit account.</p>

          <div class="mt-7 space-y-4">
            <label class="block">
              <span class="mb-1.5 block text-sm font-medium text-teal-bright/90">Username</span>
              <input
                v-model="username"
                type="text"
                required
                autocomplete="username"
                class="w-full rounded-xl border border-teal/30 bg-black/50 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-bright focus:ring-2 focus:ring-teal/30"
              />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-sm font-medium text-teal-bright/90">Password</span>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                class="w-full rounded-xl border border-teal/30 bg-black/50 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-bright focus:ring-2 focus:ring-teal/30"
              />
            </label>
          </div>

          <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>

          <AppButton type="submit" class="mt-6" block :loading="loading">
            {{ loading ? 'Signing in…' : 'Continue' }}
          </AppButton>

          <div class="mt-6 border-t border-white/10 pt-5 lg:hidden">
            <BrandContacts compact />
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
