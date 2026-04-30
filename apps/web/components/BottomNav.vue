<template>
  <nav class="fixed bottom-4 left-4 right-4 z-20 max-w-md mx-auto h-12 bg-white border border-gray-200 rounded-full shadow-sm px-2 flex items-center justify-between">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="flex-1 flex justify-center py-2 relative"
      :class="item.active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600 transition-colors'"
    >
      <div class="relative flex items-center justify-center p-1" :class="item.active ? 'bg-gray-100 rounded-full px-4' : ''">
        <svg viewBox="0 0 24 24" class="w-4 h-4" aria-hidden="true">
          <path :d="item.path" fill="currentColor" />
        </svg>
        <span v-if="item.badge" class="absolute top-0 right-0 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
        <span v-if="item.active" class="ml-1.5 text-[10px] font-bold tracking-wide uppercase">{{ item.label }}</span>
      </div>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  severity: { type: String, default: '' },
})

const hasAlert = computed(() => props.severity === 'warning' || props.severity === 'danger')

const items = computed(() => [
  {
    key: 'overview',
    label: 'Home',
    active: true,
    path: 'M4 11.1 12 4l8 7.1v8.2c0 .4-.3.7-.7.7h-4.1v-5.1H8.8V20H4.7a.7.7 0 0 1-.7-.7v-8.2Z',
  },
  {
    key: 'stats',
    label: 'Logs',
    active: false,
    path: 'M5 20a1 1 0 0 1-1-1V5a1 1 0 0 1 2 0v13h13a1 1 0 1 1 0 2H5Zm4-4a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1Zm4 0a1 1 0 0 1-1-1V7a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1Zm4 0a1 1 0 0 1-1-1v-6a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1Z',
  },
  {
    key: 'alerts',
    label: 'Alerts',
    active: false,
    badge: hasAlert.value,
    path: 'M12 22a2.2 2.2 0 0 0 2.1-1.5H9.9A2.2 2.2 0 0 0 12 22Zm7.4-5.7c-1.3-1.2-2-2.8-2-5.6 0-2.7-1.7-5-4.4-5.6V4a1 1 0 1 0-2 0v1.1c-2.7.6-4.4 2.9-4.4 5.6 0 2.8-.7 4.4-2 5.6-.4.4-.6.8-.6 1.3 0 1 .8 1.7 1.8 1.7h12.4c1 0 1.8-.7 1.8-1.7 0-.5-.2-.9-.6-1.3Z',
  },
  {
    key: 'settings',
    label: 'Config',
    active: false,
    path: 'M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Zm8.6 3.8c0-.5 0-1-.1-1.5l2-1.5-2-3.4-2.3 1a8 8 0 0 0-2.5-1.5L15.4 2h-6.8l-.3 3.1a8 8 0 0 0-2.5 1.5l-2.3-1-2 3.4 2 1.5a9.7 9.7 0 0 0 0 3l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 2.5 1.5l.3 3.1h6.8l.3-3.1a8 8 0 0 0 2.5-1.5l2.3 1 2-3.4-2-1.5c.1-.5.1-1 .1-1.5Z',
  },
])
</script>
