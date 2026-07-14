<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface Escalation {
  id: string
  chatId: string
  chatTitle: string
  customerName: string
  reason: string | null
  status: 'pending' | 'claimed' | 'resolved'
}

const { data: escalations, refresh } = await useFetch<Escalation[]>('/api/admin/escalations', { key: 'admin-escalations' })

function statusColor(status: string) {
  return status === 'pending' ? 'warning' : status === 'claimed' ? 'info' : 'success'
}
</script>

<template>
  <UContainer class="py-8 max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-highlighted">
        Talk-to-human requests
      </h1>
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="() => refresh()"
      />
    </div>

    <p v-if="!escalations?.length" class="text-muted text-sm">
      No open requests right now.
    </p>

    <div class="flex flex-col gap-2">
      <NuxtLink
        v-for="e in escalations"
        :key="e.id"
        :to="`/admin/chats/${e.chatId}`"
        class="flex items-center justify-between rounded-lg ring ring-default p-4 hover:bg-elevated/50 transition-colors"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-highlighted truncate">
            {{ e.chatTitle }}
          </p>
          <p class="text-xs text-muted truncate">
            {{ e.customerName }} · {{ e.reason || 'No reason given' }}
          </p>
        </div>
        <UBadge :color="statusColor(e.status)" variant="subtle" size="sm">
          {{ e.status }}
        </UBadge>
      </NuxtLink>
    </div>
  </UContainer>
</template>
