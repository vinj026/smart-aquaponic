<template>
  <main class="min-h-screen bg-[#FAFAFA] dark:bg-black text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300">
    <div class="fixed inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.04]" style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 16px 16px;"></div>

    <div class="mx-auto relative z-10 px-4 py-8 space-y-6 transition-all duration-500" :class="isDesktopLayout ? 'max-w-4xl' : 'max-w-md'">
      <!-- Header -->
      <header class="flex items-center justify-between bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-md shadow-sm transition-colors duration-300">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <ChevronLeftIcon class="w-5 h-5" />
          </NuxtLink>
          <h1 class="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-neutral-800 pl-3">Active Alerts</h1>
        </div>
        <div class="flex items-center gap-3">
          <button @click="toggleLayoutMode" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1" :title="isDesktopLayout ? 'Beralih ke tampilan seluler' : 'Beralih ke tampilan desktop'">
            <component :is="isDesktopLayout ? SmartphoneIcon : MonitorIcon" class="w-3.5 h-3.5" />
          </button>
          <button @click="toggleColorMode" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1">
            <component :is="colorMode?.value === 'dark' ? SunIcon : MoonIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <!-- Alerts List -->
      <section class="space-y-4">
        <div v-if="loading && !latest" class="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-md p-8 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300">
          <p class="text-xs text-gray-500 dark:text-gray-400">Memuat peringatan terbaru...</p>
        </div>

        <div v-else-if="error && !latest" class="bg-white dark:bg-neutral-950 border border-red-200 dark:border-red-900/50 rounded-md p-8 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300">
          <h2 class="text-xs md:text-sm font-medium text-red-700 dark:text-red-300 mb-1">Alerts Unavailable</h2>
          <p class="text-xs text-red-600 dark:text-red-400">Pembacaan sensor terbaru tidak dapat dimuat.</p>
        </div>

        <div v-else-if="activeAlerts.length === 0" class="bg-white dark:bg-neutral-950 border border-emerald-200 dark:border-emerald-900/30 rounded-md p-8 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300">
          <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-3">
            <CheckCircleIcon class="w-5 h-5 text-emerald-500" />
          </div>
          <h2 class="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Sistem Sehat</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">Semua parameter sensor beroperasi dalam batas optimal. Tidak ada peringatan yang perlu ditindaklanjuti saat ini.</p>
        </div>

        <div v-for="alert in activeAlerts" :key="alert.id" class="bg-white dark:bg-neutral-950 border rounded-md p-5 shadow-sm transition-colors duration-300 relative overflow-hidden" :class="alert.severity === 'danger' ? 'border-red-200 dark:border-red-900/50' : 'border-amber-200 dark:border-amber-900/50'">
          <!-- Background tint stripe -->
          <div class="absolute left-0 top-0 bottom-0 w-1" :class="alert.severity === 'danger' ? 'bg-red-500' : 'bg-amber-500'"></div>
          
          <div class="flex items-center gap-2 mb-3">
            <AlertTriangleIcon v-if="alert.severity === 'danger'" class="w-4 h-4 text-red-500" />
            <AlertCircleIcon v-else class="w-4 h-4 text-amber-500" />
            <span class="text-[10px] font-bold uppercase tracking-widest" :class="alert.severity === 'danger' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'">
              {{ alert.title }}
            </span>
            <span class="ml-auto text-[10px] px-2 py-0.5 rounded font-mono font-bold" :class="alert.severity === 'danger' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'">
              {{ alert.currentValue }}
            </span>
          </div>

          <div class="space-y-3">
            <div>
              <div class="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-0.5">Diagnosis</div>
              <p class="text-xs text-gray-800 dark:text-gray-200 leading-snug">{{ alert.diagnosis }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-neutral-900/50 rounded p-3 border border-gray-100 dark:border-neutral-800">
              <div class="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ToolIcon class="w-3 h-3" /> Tindakan Diperlukan
              </div>
              <p class="text-xs text-gray-700 dark:text-gray-300 font-medium leading-snug">{{ alert.action }}</p>
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
      title: 'pH Level — ' + (l.ph_status === 'danger' ? 'Danger' : 'Warning'),
      severity: l.ph_status,
      currentValue: `${l.ph} pH`,
      diagnosis: l.ph > 7.5 ? 'pH sistem terlalu basa. Hal ini dapat menyebabkan nutrient lockout dan kekurangan nutrisi tanaman.' : 'pH asam terdeteksi. Keasaman tinggi dapat membuat ikan stres dan merusak koloni bakteri.',
      action: 'Sesuaikan pH menggunakan buffer encer dan uji ulang dalam 30 menit.'
    })
  }

  // Check TDS
  if (l.tds_status !== 'normal') {
    alerts.push({
      id: 'tds',
      title: 'Nutrisi (TDS) — ' + (l.tds_status === 'danger' ? 'Danger' : 'Warning'),
      severity: l.tds_status,
      currentValue: `${l.tds} ppm`,
      diagnosis: l.tds > 1000 ? 'Konsentrasi nutrisi terlalu tinggi. Risiko pembakaran akar dan penumpukan racun.' : 'Kadar nutrisi tidak mencukupi untuk siklus pertumbuhan tanaman yang optimal.',
      action: 'Tambahkan air bersih atau sesuaikan dosis nutrisi segera.'
    })
  }

  // Check Turbidity
  if (l.turbidity_status !== 'normal') {
    alerts.push({
      id: 'turbidity',
      title: 'Kejernihan Air — ' + (l.turbidity_status === 'danger' ? 'Danger' : 'Warning'),
      severity: l.turbidity_status,
      currentValue: `${l.turbidity} NTU`,
      diagnosis: 'Kejernihan air buruk. Padatan tersuspensi dapat menyumbat pompa sistem atau menandakan limbah berlebih.',
      action: 'Periksa filter mekanis dan kurangi pemberian pakan ikan sementara.'
    })
  }

  // Check Water Level
  if (l.water_level_status !== 'normal') {
    alerts.push({
      id: 'water',
      title: 'Volume Air — ' + (l.water_level_status === 'danger' ? 'Danger' : 'Warning'),
      severity: l.water_level_status,
      currentValue: `${l.water_level}%`,
      diagnosis: 'Volume air sangat rendah. Pompa celup berisiko berjalan kering.',
      action: 'Pengisian air segera diperlukan untuk mencegah kerusakan perangkat keras.'
    })
  }

  return alerts
})
</script>
