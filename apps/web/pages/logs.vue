<template>
  <main class="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300">
    <!-- Subtle dot grid background -->
    <div class="fixed inset-0 pointer-events-none opacity-20 dark:opacity-[0.03]" style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 16px 16px;"></div>

    <div class="mx-auto relative z-10 px-4 py-8 space-y-6 transition-all duration-500" :class="isDesktopLayout ? 'max-w-6xl' : 'max-w-md'">
      <!-- Header -->
      <header class="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-2 rounded-md shadow-sm transition-colors duration-300">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <ChevronLeftIcon class="w-5 h-5" />
          </NuxtLink>
          <h1 class="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-slate-700 pl-3">Event Logs</h1>
        </div>
        <div class="flex items-center gap-3">
          <button @click="toggleLayoutMode" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1" :title="isDesktopLayout ? 'Switch to Mobile View' : 'Switch to Desktop View'">
            <component :is="isDesktopLayout ? SmartphoneIcon : MonitorIcon" class="w-3.5 h-3.5" />
          </button>
          <button @click="toggleColorMode" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1">
            <component :is="colorMode?.value === 'dark' ? SunIcon : MoonIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <!-- Logs Card -->
      <section class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-6 space-y-6 shadow-sm transition-colors duration-300">
        <div class="space-y-1">
          <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">System Logs</h2>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">Chronological history of all system events.</p>
        </div>

        <div v-if="loading && events.length === 0" class="text-[11px] text-gray-500 dark:text-gray-400 text-center py-8">
          Loading logs...
        </div>

        <div v-else-if="error && events.length === 0" class="text-[11px] text-red-500 dark:text-red-400 text-center py-8">
          Failed to load logs.
        </div>

        <div v-else-if="events.length === 0" class="text-[11px] text-gray-500 dark:text-gray-400 text-center py-8">
          No logs recorded yet.
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="evt in events" :key="evt.id" class="flex flex-col gap-1 border-l-2 pl-3 pb-1 relative" :class="borderColorClass(evt.type)">
            <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border border-white dark:border-slate-900" :class="dotColorClass(evt.type)"></div>
            <div class="flex flex-wrap items-baseline justify-between gap-x-2">
              <span class="text-[11px] font-bold tracking-widest uppercase" :class="titleColorClass(evt.type)">
                {{ evt.metric }} {{ evt.type }}
              </span>
              <span class="text-[9px] text-gray-400 dark:text-gray-500 font-mono" :title="new Date(evt.timestamp).toLocaleString()">{{ timeAgo(evt.timestamp) }}</span>
            </div>
            <div class="text-[12px] font-mono text-gray-800 dark:text-gray-200 mt-1">Value: {{ evt.value }}</div>
            <p class="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{{ evt.message }}</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSystemEvents } from '~/composables/useSupabaseData'
import { ChevronLeft as ChevronLeftIcon, Sun as SunIcon, Moon as MoonIcon, Monitor as MonitorIcon, Smartphone as SmartphoneIcon } from 'lucide-vue-next'
import { useColorMode } from '#imports'

const colorMode = useColorMode()
const { isDesktopLayout, toggleLayoutMode } = useLayoutMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Fetch up to 50 events for the logs page
const { events, loading, error } = useSystemEvents(50)

function borderColorClass(type) {
  if (type === 'danger') return 'border-red-400 dark:border-red-800'
  if (type === 'warning') return 'border-amber-400 dark:border-amber-800'
  return 'border-emerald-400 dark:border-emerald-800' // recovery/normal
}

function dotColorClass(type) {
  if (type === 'danger') return 'bg-red-500'
  if (type === 'warning') return 'bg-amber-500'
  return 'bg-emerald-500'
}

function titleColorClass(type) {
  if (type === 'danger') return 'text-red-600 dark:text-red-400'
  if (type === 'warning') return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

const now = ref(Date.now())
let timer
onMounted(() => {
  timer = setInterval(() => { now.value = Date.now() }, 60000)
})
onUnmounted(() => {
  clearInterval(timer)
})

function timeAgo(dateString) {
  const diff = now.value - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>
