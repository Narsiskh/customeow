<script setup lang="ts">
const props = defineProps<{ status: 'open' | 'pending' | 'resolved' }>()

const meta = {
  open: { color: 'warning' as const, label: 'Awaiting reply' },
  pending: { color: 'info' as const, label: 'With an agent' },
  resolved: { color: 'success' as const, label: 'Resolved' }
}
</script>

<template>
  <UBadge :color="meta[props.status].color" variant="subtle" size="sm">
    {{ meta[props.status].label }}
  </UBadge>
</template>
