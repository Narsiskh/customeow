<script setup lang="ts">
const { clear } = useUserSession()

function logout() {
  clear()
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="border-b border-default px-4 py-3 flex items-center justify-between">
      <NuxtLink to="/admin/escalations" class="font-bold text-highlighted">
        Customeow Admin
      </NuxtLink>
      <UButton label="Log out" icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" @click="logout" />
    </div>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
