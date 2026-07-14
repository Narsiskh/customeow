<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface MessagePart {
  type: string
  text?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: MessagePart[]
  isAgentReply?: boolean
}

interface ChatData {
  id: string
  title?: string | null
  status: 'open' | 'pending' | 'resolved'
  messages: ChatMessage[]
}

const route = useRoute()
const toast = useToast()
const { csrf, headerName } = useCsrf()

const { data: chat, refresh } = await useFetch<ChatData>(`/api/admin/chats/${route.params.id}`, {
  key: `admin-chat-${route.params.id}`
})

const replyText = ref('')
const sending = ref(false)

function getText(message: ChatMessage) {
  return message.parts?.find(p => p.type === 'text')?.text ?? ''
}

async function sendReply() {
  if (!replyText.value.trim()) return
  sending.value = true
  try {
    await $fetch(`/api/admin/chats/${route.params.id}/reply`, {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: { text: replyText.value }
    })
    replyText.value = ''
    await refresh()
  } catch {
    toast.add({ description: 'Failed to send reply', icon: 'i-lucide-alert-circle', color: 'error' })
  } finally {
    sending.value = false
  }
}

async function markResolved() {
  try {
    await $fetch(`/api/admin/chats/${route.params.id}/resolve`, {
      method: 'POST',
      headers: { [headerName]: csrf }
    })
    await refresh()
    toast.add({ description: 'Marked as resolved', icon: 'i-lucide-check-circle' })
  } catch {
    toast.add({ description: 'Failed to resolve', icon: 'i-lucide-alert-circle', color: 'error' })
  }
}

const { pause } = useIntervalFn(async () => {
  if (chat.value?.status !== 'pending') return

  try {
    const fresh = await $fetch<ChatData>(`/api/chats/${chat.value.id}`)
    const existingIds = new Set(chat.value.messages.map(m => m.id))
    const newOnes = fresh.messages.filter(m => !existingIds.has(m.id) && m.role !== 'user')

    if (newOnes.length) {
      chat.value.messages = [
        ...chat.value.messages,
        ...newOnes.map(m => ({ id: m.id, role: m.role, parts: m.parts, isAgentReply: m.isAgentReply }))
      ]
    }
    if (fresh.status !== chat.value.status) {
      chat.value.status = fresh.status
    }
  } catch {
    // silent — don't toast-spam on background polling failures
  }
}, 4000)

onUnmounted(() => pause())
</script>

<template>
  <UContainer v-if="chat" class="py-8 max-w-2xl flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-highlighted">
          {{ chat.title || 'Untitled' }}
        </h1>
        <UBadge size="sm" variant="subtle" :color="chat.status === 'resolved' ? 'success' : 'warning'">
          {{ chat.status }}
        </UBadge>
      </div>
      <UButton
        v-if="chat.status !== 'resolved'"
        label="Mark resolved"
        icon="i-lucide-check-circle"
        color="neutral"
        variant="subtle"
        size="sm"
        @click="markResolved"
      />
    </div>

    <div class="flex flex-col gap-3 rounded-lg ring ring-default p-4 max-h-[60vh] overflow-y-auto">
      <div
        v-for="message in chat.messages"
        :key="message.id"
        class="flex flex-col"
        :class="message.role === 'user' ? 'items-start' : 'items-end'"
      >
        <span class="text-xs text-muted mb-0.5">
          {{ message.role === 'user' ? 'Customer' : (message.isAgentReply ? 'Agent' : 'AI') }}
        </span>
        <p
          class="rounded-lg px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap"
          :class="message.role === 'user' ? 'bg-elevated' : (message.isAgentReply ? 'bg-primary text-inverted' : 'bg-elevated/50')"
        >
          {{ getText(message) }}
        </p>
      </div>
    </div>

    <div class="flex gap-2">
      <UTextarea
        v-model="replyText"
        autoresize
        :rows="1"
        placeholder="Write a reply..."
        class="flex-1"
        @keydown.enter.exact.prevent="sendReply"
      />
      <UButton label="Send" :loading="sending" @click="sendReply" />
    </div>
  </UContainer>

  <UContainer v-else class="py-8">
    <UError :error="{ statusMessage: 'Chat not found', statusCode: 404 }" />
  </UContainer>
</template>
