<template>
  <button
    type="button"
    class="inline-flex items-center justify-center p-1 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    :title="isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'"
    aria-label="Toggle theme"
    @click="toggleColorMode"
  >
    <svg
      class="pointer-events-none h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
      <path d="M12 3v18" />
      <path d="M12 7a5 5 0 0 1 0 10" />
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()
const isDarkMode = computed(() => colorMode.value === 'dark')

function toggleColorMode() {
  const nextMode = isDarkMode.value ? 'light' : 'dark'
  colorMode.preference = nextMode

  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', nextMode === 'dark')
    localStorage.setItem('nuxt-color-mode', nextMode)
  }
}
</script>
