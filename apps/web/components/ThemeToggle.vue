<template>
  <button
    type="button"
    class="relative p-1 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    :title="isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'"
    aria-label="Toggle theme"
    @click="toggleColorMode"
  >
    <span class="relative block h-3.5 w-3.5">
      <svg
        class="pointer-events-none absolute inset-0 h-3.5 w-3.5 transition-all duration-150"
        :class="isDarkMode ? 'scale-100 opacity-100' : 'scale-75 opacity-0'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <svg
        class="pointer-events-none absolute inset-0 h-3.5 w-3.5 transition-all duration-150"
        :class="isDarkMode ? 'scale-75 opacity-0' : 'scale-100 opacity-100'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </span>
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
