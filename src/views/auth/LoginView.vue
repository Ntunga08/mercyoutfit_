<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'

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
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Brand panel: flat wine field, no glow stacks -->
    <section class="relative flex flex-col justify-between bg-teal px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-14">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.12]"
        style="
          background-image: repeating-linear-gradient(
            -18deg,
            transparent,
            transparent 11px,
            rgba(255, 255, 255, 0.55) 11px,
            rgba(255, 255, 255, 0.55) 12px
          );
        "
      />
      <p class="relative font-display text-3xl tracking-tight">MercyOutfit</p>
      <div class="relative max-w-sm pb-4">
        <h1 class="font-display text-4xl leading-[1.15] sm:text-5xl">
          The desk behind the rack.
        </h1>
        <p class="mt-4 text-[17px] leading-relaxed text-white/85">
          Stock, sales, and the day’s numbers — kept simple for the people who open the shop.
        </p>
      </div>
    </section>

    <section class="flex items-center justify-center bg-canvas px-6 py-12">
      <form class="w-full max-w-[360px]" @submit.prevent="handleLogin">
        <h2 class="font-display text-2xl text-ink">Sign in</h2>
        <p class="mt-1 text-[15px] text-stone">Use your staff username and password.</p>

        <div class="mt-8 space-y-4">
          <AppInput v-model="username" label="Username" required autocomplete="username" />
          <AppInput
            v-model="password"
            label="Password"
            type="password"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="mt-3 text-sm text-danger">{{ error }}</p>

        <AppButton type="submit" class="mt-7" block :loading="loading">
          {{ loading ? 'Signing in…' : 'Continue' }}
        </AppButton>
      </form>
    </section>
  </div>
</template>
