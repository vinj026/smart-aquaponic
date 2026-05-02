<template>
  <main class="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300">
    <div class="fixed inset-0 pointer-events-none opacity-20 dark:opacity-[0.03]" style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 16px 16px;"></div>

    <div class="mx-auto relative z-10 px-4 py-8 space-y-6 transition-all duration-500" :class="isDesktopLayout ? 'max-w-6xl' : 'max-w-md'">
      <!-- Header -->
      <header class="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-2 rounded-md shadow-sm transition-colors duration-300">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <ChevronLeftIcon class="w-5 h-5" />
          </NuxtLink>
          <h1 class="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-slate-700 pl-3">Active Alerts</h1>
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

      <!-- Alerts List -->
      <section class="space-y-4">
        <div v-if="loading && !latest" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-8 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300">
          <p class="text-[11px] text-gray-500 dark:text-gray-400">Loading latest alerts...</p>
        </div>

        <div v-else-if="error && !latest" class="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-md p-8 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300">
          <h2 class="text-sm font-bold text-red-700 dark:text-red-300 mb-1">Alerts Unavailable</h2>
          <p class="text-[11px] text-red-600 dark:text-red-400">The latest sensor reading could not be loaded.</p>
        </div>

        <div v-else-if="activeAlerts.length === 0" class="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/30 rounded-md p-8 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300">
          <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-3">
            <CheckCircleIcon class="w-5 h-5 text-emerald-500" />
          </div>
          <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">System is Healthy</h2>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">All sensor parameters are operating within optimal limits. No actionable alerts at this time.</p>
        </div>

        <div v-for="alert in activeAlerts" :key="alert.id" class="bg-white dark:bg-slate-900 border rounded-md p-5 shadow-sm transition-colors duration-300 relative overflow-hidden" :class="alert.severity === 'danger' ? 'border-red-200 dark:border-red-900/50' : 'border-amber-200 dark:border-amber-900/50'">
          <!-- Background tint stripe -->
          <div class="absolute left-0 top-0 bottom-0 w-1" :class="alert.severity === 'danger' ? 'bg-red-500' : 'bg-amber-500'"></div>
          
          <div class="flex items-center gap-2 mb-3">
            <AlertTriangleIcon v-if="alert.severity === 'danger'" class="w-4 h-4 text-red-500" />
            <AlertCircleIcon v-else class="w-4 h-4 text-amber-500" />
            <span class="text-[11px] font-bold uppercase tracking-widest" :class="alert.severity === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">
              {{ alert.title }}
            </span>
            <span class="ml-auto text-[10px] px-2 py-0.5 rounded font-mono font-bold" :class="alert.severity === 'danger' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'">
              {{ alert.currentValue }}
            </span>
          </div>

          <div class="space-y-3">
            <div>
              <div class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">Diagnosis</div>
              <p class="text-[12px] text-gray-800 dark:text-gray-200 leading-snug">{{ alert.diagnosis }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-slate-800/50 rounded p-3 border border-gray-100 dark:border-slate-800">
              <div class="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ToolIcon class="w-3 h-3" /> Action Required
              </div>
              <p class="text-[12px] text-gray-700 dark:text-gray-300 font-medium leading-snug">{{ alert.action }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useLatestReading } from '~/composables/useSupabaseData'
import { ChevronLeft as ChevronLeftIcon, Sun as SunIcon, Moon as MoonIcon, AlertTriangle as AlertTriangleIcon, AlertCircle as AlertCircleIcon, CheckCircle as CheckCircleIcon, PenTool as ToolIcon, Monitor as MonitorIcon, Smartphone as SmartphoneIcon } from 'lucide-vue-next'
import { useColorMode } from '#imports'

const colorMode = useColorMode()
const { isDesktopLayout, toggleLayoutMode } = useLayoutMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const { reading, loading, error } = useLatestReading()
const latest = computed(() => reading.value)

const activeAlerts = computed(() => {
  const alerts = []
  const l = latest.value
  if (!l) return alerts

  // Check pH
  if (l.ph_status !== 'normal') {
    alerts.push({
      id: 'ph',
      title: 'pH Level ' + l.ph_status,
      severity: l.ph_status,
      currentValue: `${l.ph} pH`,
      diagnosis: l.ph > 7.5 ? 'System pH is too alkaline. This can lead to nutrient lockout and plant deficiencies.' : 'Acidic pH detected. High acidity can stress fish and damage bacterial colonies.',
      action: 'Adjust pH using diluted buffers and retest in 30 mins.'
    })
  }

  // Check TDS
  if (l.tds_status !== 'normal') {
    alerts.push({
      id: 'tds',
      title: 'Nutrient (TDS) ' + l.tds_status,
      severity: l.tds_status,
      currentValue: `${l.tds} ppm`,
      diagnosis: l.tds > 1000 ? 'Nutrient concentration is excessively high. Risk of root burn and toxic buildup.' : 'Nutrient levels are insufficient for optimal plant growth cycles.',
      action: 'Top up with fresh water or adjust nutrient dosing immediately.'
    })
  }

  // Check Turbidity
  if (l.turbidity_status !== 'normal') {
    alerts.push({
      id: 'turbidity',
      title: 'Water Clarity ' + l.turbidity_status,
      severity: l.turbidity_status,
      currentValue: `${l.turbidity} NTU`,
      diagnosis: 'Water clarity is poor. Suspended solids may clog system pumps or indicate excess waste.',
      action: 'Inspect mechanical filters and temporarily reduce fish feeding.'
    })
  }

  // Check Water Level
  if (l.water_level_status !== 'normal') {
    alerts.push({
      id: 'water',
      title: 'Water Volume ' + l.water_level_status,
      severity: l.water_level_status,
      currentValue: `${l.water_level}%`,
      diagnosis: 'Water volume is critically low. Submersible pumps are at risk of running dry.',
      action: 'Immediate water replenishment required to prevent hardware damage.'
    })
  }

  return alerts
})
</script>
