<script setup lang="ts">
defineProps<{
  invocation: { output?: { articles: { id: string, title: string, slug: string, excerpt: string }[] } }
}>()
</script>

<template>
  <div v-if="invocation.output?.articles?.length" class="flex flex-col gap-2 my-2">
    <ULink
      v-for="article in invocation.output.articles"
      :key="article.id"
      :to="`/help/${article.slug}`"
      class="flex items-start gap-2.5 rounded-lg ring ring-default p-3 hover:bg-elevated/50 transition-colors"
    >
      <UIcon name="i-lucide-file-text" class="size-4 text-primary shrink-0 mt-0.5" />
      <div class="min-w-0">
        <p class="text-sm font-medium text-highlighted">{{ article.title }}</p>
        <p class="text-xs text-muted line-clamp-1">{{ article.excerpt }}</p>
      </div>
    </ULink>
  </div>
</template>
