<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const { fetch: refreshSession, openInPopup } = useUserSession()
const { csrf, headerName } = useCsrf()

const redirect = computed(() => (route.query.redirect as string) || '/')
const state = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: state
    })
    await refreshSession()
    navigateTo(redirect.value)
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || 'Invalid email or password'
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
          Log in to chat with a human agent and track your requests.
        </p>
      </template>

      <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
        <UFormField label="Email">
          <UInput v-model="state.email" type="email" placeholder="you@example.com" required class="w-full" />
        </UFormField>

        <UFormField label="Password">
          <UInput v-model="state.password" type="password" placeholder="••••••••" required class="w-full" />
        </UFormField>

        <p v-if="errorMsg" class="text-sm text-error">
          {{ errorMsg }}
        </p>

        <UButton type="submit" block :loading="loading" label="Log in" />
      </form>

      <template #footer>
        <UButton
          block
          color="neutral"
          variant="outline"
          icon="i-simple-icons-github"
          label="Continue with GitHub"
          @click="openInPopup('/auth/github')"
        />

        <p class="text-sm text-muted text-center mt-3">
          Don't have an account?
          <ULink :to="`/register?redirect=${encodeURIComponent(redirect)}`" class="text-primary">Sign up</ULink>
        </p>

        <p class="text-sm text-center mt-1">
          <ULink to="/" class="text-muted">Continue without an account</ULink>
        </p>
      </template>
    </UCard>
  </div>
</template>
