<template>
  <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5">
    <path v-if="kind === 'danger'" fill="currentColor" d="M12 2.5 22 20H2L12 2.5Zm0 5.8a.9.9 0 0 0-.9.9v4.4a.9.9 0 1 0 1.8 0V9.2a.9.9 0 0 0-.9-.9Zm0 8.3a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
    <path v-else-if="kind === 'warning'" fill="currentColor" d="M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4Zm0 4.4c.5 0 .9.4.9.9v5.1a.9.9 0 1 1-1.8 0V8.1c0-.5.4-.9.9-.9Zm0 10.1a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z" />
    <path v-else fill="currentColor" d="M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4Zm-1.1 12.5-3.1-3.1 1.2-1.2 1.9 1.9 4.4-4.4 1.2 1.2-5.6 5.6Z" />
  </svg>
</template>

<script setup>
defineProps({
  kind: { type: String, default: 'default' },
})
</script>
