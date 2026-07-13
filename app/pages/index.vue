<script setup lang="ts">
const input = ref('')
const loading = ref(false)
const chatId = crypto.randomUUID()

const { user } = useUserSession()

const greeting = computed(() => {
  const hour = new Date().getHours()
  let timeGreeting = 'Good evening'
  if (hour < 12) timeGreeting = 'Good morning'
  else if (hour < 18) timeGreeting = 'Good afternoon'
  const name = user.value?.name?.split(' ')[0] || user.value?.username
  return name ? `${timeGreeting}, ${name}` : timeGreeting
})

const {
  dropzoneRef, dragging, open, files, uploading,
  uploadedFiles, removeFile, clearFiles
} = useFileUploadWithStatus(chatId)

const { csrf, headerName } = useCsrf()

async function createChat(prompt: string) {
  input.value = prompt
  loading.value = true

  const parts: Array<{ type: string, text?: string, mediaType?: string, url?: string }> = [{ type: 'text', text: prompt }]
  if (uploadedFiles.value.length > 0) parts.push(...uploadedFiles.value)

  const chat = await $fetch('/api/chats', {
    method: 'POST',
    headers: { [headerName]: csrf },
    body: { id: chatId, message: { role: 'user', parts } }
  })

  refreshNuxtData('chats')
  navigateTo(`/chat/${chat?.id}`)
}

async function onSubmit() {
  await createChat(input.value)
  clearFiles()
}

// Common support intents replace dev-tool prompts
const quickChats = [
  { label: 'Track my order', icon: 'i-lucide-package' },
  { label: 'I want to return or exchange an item', icon: 'i-lucide-rotate-ccw' },
  { label: 'Update my billing information', icon: 'i-lucide-credit-card' },
  { label: 'Report a problem with my order', icon: 'i-lucide-alert-triangle' },
  { label: 'I need to speak with a person', icon: 'i-lucide-headset' }
]

// Surfaced help articles — pull from your KB API
const { data: articles } = await useFetch('/api/kb/popular', { key: 'kb-popular' })
</script>

<template>
  <UDashboardPanel id="home" class="min-h-0" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <Navbar />
    </template>

    <template #body>
      <div ref="dropzoneRef" class="flex flex-1">
        <DragDropOverlay :show="dragging" />

        <UContainer class="flex-1 flex flex-col justify-center gap-6 py-8 max-w-2xl">
          <div>
            <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
              {{ greeting }}
            </h1>
            <p class="text-muted mt-1">
              How can we help you today?
            </p>
          </div>

          <UChatPrompt
            v-model="input"
            :status="loading ? 'streaming' : 'ready'"
            :disabled="uploading"
            placeholder="Describe your issue, or attach a screenshot..."
            class="[view-transition-name:chat-prompt]"
            variant="subtle"
            :ui="{ base: 'px-1.5' }"
            @submit="onSubmit"
          >
            <template v-if="files.length > 0" #header>
              <ChatFiles :files="files" @remove="removeFile" />
            </template>

            <template #footer>
              <ChatFileUploadButton :open="open" />
              <UChatPromptSubmit color="neutral" size="sm" :disabled="uploading" />
            </template>
          </UChatPrompt>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="quickChat in quickChats"
              :key="quickChat.label"
              :icon="quickChat.icon"
              :label="quickChat.label"
              size="sm"
              color="neutral"
              variant="outline"
              class="rounded-full"
              @click="createChat(quickChat.label)"
            />
          </div>

          <div v-if="articles?.length" class="mt-4">
            <p class="text-sm font-medium text-muted mb-2">
              Popular help articles
            </p>
            <div class="grid sm:grid-cols-2 gap-2">
              <ULink
                v-for="article in articles"
                :key="article.id"
                :to="`/help/${article.slug}`"
                class="flex items-start gap-2.5 rounded-lg ring ring-default p-3 hover:bg-elevated/50 transition-colors"
              >
                <UIcon name="i-lucide-file-text" class="size-4 text-muted shrink-0 mt-0.5" />
                <span class="text-sm text-highlighted">{{ article.title }}</span>
              </ULink>
            </div>
          </div>
        </UContainer>
      </div>
    </template>
  </UDashboardPanel>
</template>
