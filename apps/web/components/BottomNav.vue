<template>
  <nav class="fixed bottom-4 left-4 right-4 z-20 max-w-md mx-auto h-12 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full shadow-lg px-2 flex items-center justify-between transition-colors duration-300">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex-1 flex justify-center py-2 relative outline-none"
      :class="isActive(item.to) ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors'"
    >
      <div class="relative flex items-center justify-center p-1" :class="isActive(item.to) ? 'bg-gray-100 dark:bg-slate-800 rounded-full px-4' : ''">
        <svg viewBox="0 0 24 24" class="w-4 h-4" aria-hidden="true">
          <path :d="item.path" fill="currentColor" />
        </svg>
        <span v-if="item.badge" class="absolute top-0 right-0 w-2 h-2 bg-red-500 border border-white dark:border-slate-900 rounded-full"></span>
        <span v-if="isActive(item.to)" class="ml-1.5 text-[10px] font-bold tracking-wide uppercase">{{ item.label }}</span>
      </div>
    </NuxtLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  severity: { type: String, default: '' },
})

const route = useRoute()
const isActive = (to) => route.path === to
const hasAlert = computed(() => props.severity === 'warning' || props.severity === 'danger')

const items = [
  {
    to: '/',
    label: 'Home',
    path: 'M4 11.1 12 4l8 7.1v8.2c0 .4-.3.7-.7.7h-4.1v-5.1H8.8V20H4.7a.7.7 0 0 1-.7-.7v-8.2Z',
  },
  {
    to: '/logs',
    label: 'Logs',
    path: 'M5 20a1 1 0 0 1-1-1V5a1 1 0 0 1 2 0v13h13a1 1 0 1 1 0 2H5Zm4-4a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1Zm4 0a1 1 0 0 1-1-1V7a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1Zm4 0a1 1 0 0 1-1-1v-6a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1Z',
  },
  {
    to: '/alerts',
    label: 'Alerts',
    badge: hasAlert.value,
    path: 'M12 22a2.2 2.2 0 0 0 2.1-1.5H9.9A2.2 2.2 0 0 0 12 22Zm7.4-5.7c-1.3-1.2-2-2.8-2-5.6 0-2.7-1.7-5-4.4-5.6V4a1 1 0 1 0-2 0v1.1c-2.7.6-4.4 2.9-4.4 5.6 0 2.8-.7 4.4-2 5.6-.4.4-.6.8-.6 1.3 0 1 .8 1.7 1.8 1.7h12.4c1 0 1.8-.7 1.8-1.7 0-.5-.2-.9-.6-1.3Z',
  },
  {
    to: '/config',
    label: 'Config',
    path: 'M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Zm8.6 3.8c0-.5 0-1-.1-1.5l2-1.5-2-3.4-2.3 1a8 8 0 0 0-2.5-1.5L15.4 2h-6.8l-.3 3.1a8 8 0 0 0-2.5 1.5l-2.3-1-2 3.4 2 1.5a9.7 9.7 0 0 0 0 3l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 2.5 1.5l.3 3.1h6.8l.3-3.1a8 8 0 0 0 2.5-1.5l2.3 1 2-3.4-2-1.5c.1-.5.1-1 .1-1.5Z',
  },
]
</script>
