<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const { fetch: refreshSession } = useUserSession()
const { csrf, headerName } = useCsrf()

const redirect = computed(() => (route.query.redirect as string) || '/')
const state = reactive({ name: '', email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: state
    })
    await refreshSession()
    navigateTo(redirect.value)
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || 'Could not create your account'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <Logo class="h-7 w-auto" />
          <span class="text-lg font-bold text-highlighted">Customeow</span>
        </div>
        <p class="text-sm text-muted mt-1">
          Create an account to reach a human agent when you need one.
        </p>
      </template>

      <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
        <UFormField label="Name">
          <UInput
            v-model="state.name"
            placeholder="Jane Doe"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField label="Email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="you@example.com"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password" hint="At least 8 characters">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full"
          />
        </UFormField>

        <p v-if="errorMsg" class="text-sm text-error">
          {{ errorMsg }}
        </p>

        <UButton
          type="submit"
          block
          :loading="loading"
          label="Create account"
        />
      </form>

      <template #footer>
        <p class="text-sm text-muted text-center">
          Already have an account?
          <ULink :to="`/login?redirect=${encodeURIComponent(redirect)}`" class="text-primary">Log in</ULink>
        </p>
      </template>
    </UCard>
  </div>
</template>
