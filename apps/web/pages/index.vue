<template>
  <main class="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300">
    <!-- Subtle dot grid background for technical depth -->
    <div class="fixed inset-0 pointer-events-none opacity-20 dark:opacity-[0.03]" style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 16px 16px;"></div>
    
    <div class="max-w-md mx-auto relative z-10 px-4 py-8 space-y-6">
      
      <!-- Compact Header -->
      <header class="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-2 rounded-md shadow-sm transition-colors duration-300">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full">
            <div class="w-1.5 h-1.5 rounded-full" :class="overallDotClass"></div>
            <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ systemHealthLabel }}</span>
          </div>
          <h1 class="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-slate-700 pl-3">Aquaguard IoT</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Updated {{ timeAgoText }}</div>
          <div class="flex items-center gap-1 border-l border-gray-100 dark:border-slate-700 pl-2 ml-1">
            <NuxtLink to="/alerts" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 relative" title="Alerts">
              <BellIcon class="w-3.5 h-3.5" />
              <!-- Optional Notification dot for danger overall -->
              <span v-if="systemHealthLabel !== 'Normal'" class="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </NuxtLink>
            <NuxtLink to="/logs" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1" title="Logs">
              <ActivityIcon class="w-3.5 h-3.5" />
            </NuxtLink>
            <NuxtLink to="/config" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1" title="Settings">
              <SettingsIcon class="w-3.5 h-3.5" />
            </NuxtLink>
            <button 
              @click="exportCsv" 
              class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 relative" 
              :disabled="isExporting"
              title="Export CSV" 
              aria-label="Export Data"
            >
              <DownloadIcon class="w-3.5 h-3.5" :class="{ 'animate-bounce opacity-50': isExporting }" />
            </button>
            <button @click="toggleColorMode" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1" title="Toggle Theme" aria-label="Toggle Dark Mode">
              <component :is="colorMode.value === 'dark' ? SunIcon : MoonIcon" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>
      
      <!-- Intelligent System Insight Box -->
      <div v-if="latest" 
           class="px-4 py-4 rounded-md border flex flex-col gap-3 shadow-sm transition-all duration-300"
           :class="alertClasses">
        <div class="flex items-start gap-3">
          <div class="shrink-0 mt-0.5 p-1.5 rounded-full" :class="alertIconBgClass">
             <svg v-if="latest.overall_status === 'normal'" class="w-3.5 h-3.4" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
             </svg>
             <svg v-else class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
             </svg>
          </div>
          <div class="space-y-1 min-w-0">
            <h2 class="text-[11px] font-bold uppercase tracking-widest leading-none flex items-center gap-2">
               {{ alertTitle }}
               <span v-if="latest.overall_status !== 'normal'" class="w-1 h-1 rounded-full bg-current opacity-40"></span>
               <span v-if="latest.overall_status !== 'normal'" class="text-[9px] lowercase font-medium opacity-70">Requires attention</span>
            </h2>
            <p class="text-[13px] font-medium leading-relaxed tracking-tight">
               {{ insightText }}
            </p>
          </div>
        </div>
        
        <!-- Suggested Action (Only for non-normal) -->
        <div v-if="latest.overall_status !== 'normal'" 
             class="mt-1 pl-10 flex flex-col gap-1 border-t border-current/10 pt-3">
          <span class="text-[9px] font-bold uppercase tracking-tighter opacity-60">Suggested Action</span>
          <p class="text-[12px] font-semibold flex items-center gap-1.5">
            <svg class="w-3 h-3 opacity-70" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
            </svg>
            {{ suggestedAction }}
          </p>
        </div>
      </div>

      <!-- Compact 2-Col Sensor Grid -->
      <section class="grid grid-cols-2 gap-3" aria-label="Sensor metrics">
        <CompactSensorRow 
          label="pH Level" 
          :value="latest?.ph" 
          unit="pH" 
          :status="latest?.ph_status"
          :status-text="statusLabel(latest?.ph_status)"
        />
        <CompactSensorRow 
          label="TDS" 
          :value="latest?.tds" 
          unit="ppm" 
          :status="latest?.tds_status"
          :status-text="statusLabel(latest?.tds_status)"
        />
        <CompactSensorRow 
          label="Turbidity" 
          :value="latest?.turbidity" 
          unit="NTU" 
          :status="latest?.turbidity_status"
          :status-text="statusLabel(latest?.turbidity_status)"
        />
        <CompactSensorRow 
          label="Water Level" 
          :value="latest?.water_level" 
          unit="%" 
          :status="latest?.water_level_status"
          :status-text="statusLabel(latest?.water_level_status)"
        />
      </section>

      <!-- Lifecycle Information Compact Row -->
      <section class="grid grid-cols-2 gap-3" aria-label="System lifecycle details">
        <div class="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-sm flex flex-col justify-center gap-0.5 transition-colors duration-300">
           <div class="flex items-center justify-between">
             <span class="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide">Crop Age</span>
             <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-sm">{{ cropLifecycle }}</span>
           </div>
           <span class="text-sm font-bold text-gray-800 dark:text-gray-100">{{ cropAge }} <span class="text-[10px] font-medium opacity-60">Days</span></span>
        </div>
        <div class="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-sm flex flex-col justify-center gap-0.5 transition-colors duration-300">
           <div class="flex items-center justify-between">
             <span class="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide">Fish Age</span>
             <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-sm">{{ fishLifecycle }}</span>
           </div>
           <span class="text-sm font-bold text-gray-800 dark:text-gray-100">{{ fishAge }} <span class="text-[10px] font-medium opacity-60">Days</span></span>
        </div>
      </section>

      <!-- Prominent Chart Section -->
      <section class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-4 space-y-4 shadow-sm flex-1 flex flex-col transition-colors duration-300">
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest leading-none">Historical Trend</div>
            
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Velocity:</span>
              <span class="text-[10px] font-bold uppercase tracking-tight flex items-center gap-1" :class="trendColor">
                <svg v-if="trendDirection === 'up'" class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                <svg v-else-if="trendDirection === 'down'" class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                {{ trendLabel }}
              </span>
            </div>
          </div>
          
          <div class="flex items-center justify-between border-t border-gray-100 dark:border-slate-800/50 pt-3">
            <!-- Time Range Selector (Pill Style) -->
            <div class="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-full gap-0.5 border border-gray-200 dark:border-slate-700 transition-colors duration-300">
              <button v-for="tr in timeRanges" :key="tr.value"
                @click="selectedTime = tr.value"
                class="text-[9px] px-2.5 py-1 font-bold rounded-full tracking-wider transition-all"
                :class="selectedTime === tr.value ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
              >
                {{ tr.label }}
              </button>
            </div>
            
            <!-- Metric Selector -->
            <div class="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-sm gap-0.5 border border-gray-200 dark:border-slate-700 transition-colors duration-300">
              <button v-for="opt in options" :key="opt.value"
                @click="selected = opt.value"
                class="text-[9px] px-2 py-1 font-bold rounded-sm tracking-wider transition-colors"
                :class="selected === opt.value ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white border border-gray-200/50 dark:border-slate-600/50' : 'text-gray-500 dark:text-gray-400'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="h-56 mt-2 relative">
          <ClientOnly>
            <MinimalChart :history="history" :parameter="selected" />
          </ClientOnly>
        </div>
      </section>

    </div>
  </main>
</template>

<script setup>
import { Sun as SunIcon, Moon as MoonIcon, Download as DownloadIcon, Settings as SettingsIcon, Activity as ActivityIcon, Bell as BellIcon } from 'lucide-vue-next'
import { useLatestReading, useReadingHistory, useSystemEvents, useLifecycleConfig } from '~/composables/useSupabaseData'
import CompactSensorRow from '~/components/CompactSensorRow.vue'
import MinimalChart from '~/components/MinimalChart.vue'

const colorMode = useColorMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const isExporting = ref(false)
async function exportCsv() {
  if (isExporting.value) return
  isExporting.value = true
  
  // Simulate a bit of processing for UX
  await new Promise(r => setTimeout(r, 800))

  const rows = history.value
  if (!rows || rows.length === 0) return

  const headers = ['Timestamp', 'pH', 'pH Status', 'TDS', 'TDS Status', 'Turbidity', 'Turbidity Status', 'Water Level', 'Water Level Status', 'Overall Status']
  const csv = [
    headers.join(','),
    ...rows.map(r => [
      new Date(r.timestamp).toISOString(),
      r.ph, r.ph_status,
      r.tds, r.tds_status,
      r.turbidity, r.turbidity_status,
      r.water_level, r.water_level_status,
      r.overall_status
    ].join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('download', `aquaguard-export-${Date.now()}.csv`)
  a.click()
  window.URL.revokeObjectURL(url)
  isExporting.value = false
}

const { reading } = useLatestReading()
const { config } = useLifecycleConfig()

const selectedTime = ref(60) // Default 1H (60 minutes)
const timeRanges = [
  { label: '1H', value: 60 },
  { label: '6H', value: 360 },
  { label: '24H', value: 1440 },
  { label: '7D', value: 10080 },
]

const { history } = useReadingHistory(selectedTime)
const { events } = useSystemEvents(5)

const latest = computed(() => reading.value)

const selected = ref('turbidity')
const options = [
  { label: 'Turb', value: 'turbidity' },
  { label: 'pH', value: 'ph' },
  { label: 'TDS', value: 'tds' },
  { label: 'Wtr', value: 'water_level' },
]

const now = ref(Date.now())
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const timeAgoText = computed(() => {
  const ts = latest.value?.timestamp
  if (!ts) return '—'
  const diff = Math.floor((now.value - ts) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return 'long ago'
})

const systemHealthLabel = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'Critical'
  if (s === 'warning') return 'Warning'
  return 'Healthy'
})

// Lifecycle Logic
const cropAge = computed(() => {
  if (!config.value.crop_start_date) return 0
  const start = new Date(config.value.crop_start_date)
  const diffTime = now.value - start.getTime()
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
})

const fishAge = computed(() => {
  if (!config.value.fish_start_date) return 0
  const start = new Date(config.value.fish_start_date)
  const diffTime = now.value - start.getTime()
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
})

const cropLifecycle = computed(() => {
  const a = cropAge.value
  if (a === 0) return 'Not Set'
  if (a < 7) return 'Seedling'
  if (a < 21) return 'Vegetative'
  if (a < 30) return 'Maturing'
  return 'Near Harvest'
})

const fishLifecycle = computed(() => {
  const a = fishAge.value
  if (a === 0) return 'Not Set'
  if (a < 14) return 'Fry'
  if (a < 30) return 'Fingerling'
  if (a < 60) return 'Grow-out'
  return 'Harvestable'
})

function statusLabel(status) {
  if (!status) return 'None'
  if (status === 'normal') return 'Normal'
  if (status === 'warning') return 'Warn'
  if (status === 'danger') return 'Alert'
  return String(status)
}

const insightText = computed(() => {
  const l = latest.value
  const h = history.value
  if (!l) return 'Initializing system context...'
  
  // 1. Advanced Correlation & Trend Detection
  if (h.length >= 5) {
    const lastFive = h.slice(-5)
    const tdsTrend = lastFive[4].tds - lastFive[0].tds
    
    // pH High + TDS High + Turbidity Up = Overfeeding
    if (l.ph_status !== 'normal' && l.ph > 7.5 && l.tds > 700 && tdsTrend > 0 && l.turbidity_status !== 'normal') {
      return 'Potential overfeeding detected. High pH and rising TDS levels correlated with poor clarity suggest excess organic waste.'
    }
    
    // Rising TDS Trend
    if (tdsTrend > 100 && l.tds_status === 'normal') {
      return 'Nutrient levels (TDS) are rising rapidly. Monitor closely to avoid potential root burn.'
    }
  }

  // 2. Critical Sensor Alerts
  if (l.ph_status !== 'normal') {
    return l.ph > 7.5 ? 'System pH is too alkaline. This can lead to nutrient lockout and plant deficiencies.' : 'Acidic pH detected. High acidity can stress fish and damage bacterial colonies.'
  }
  if (l.tds_status !== 'normal') {
    return l.tds > 1000 ? 'Nutrient concentration is excessively high. Risk of root burn and toxic buildup.' : 'Nutrient levels are insufficient for optimal plant growth cycles.'
  }
  if (l.turbidity_status !== 'normal') {
    return 'Water clarity is poor. Suspended solids may clog system pumps or indicate excess waste.'
  }
  if (l.water_level_status !== 'normal') {
    return 'Water volume is critically low. Submersible pumps are at risk of running dry.'
  }
  
  // 3. Lifecycle Context (if sensors are normal)
  if (cropLifecycle.value === 'Near Harvest') {
    return `Crop has reached the ${cropLifecycle.value} phase. Nutrient uptake will slow down as metabolic activity shifts.`
  }
  if (cropLifecycle.value === 'Vegetative') {
    return `Crop is in active ${cropLifecycle.value} growth. Maintaining current normal conditions is ideal for biomass production.`
  }
  
  return 'All aquatic parameters are within optimal ranges for a balanced ecosystem.'
})

const suggestedAction = computed(() => {
  const l = latest.value
  if (!l) return null
  
  if (l.ph_status !== 'normal') return 'Adjust pH using diluted buffers and retest in 30 mins.'
  if (l.tds_status !== 'normal') return 'Top up with fresh water or adjust nutrient dosing.'
  if (l.turbidity_status !== 'normal') return 'Inspect mechanical filters and reduce fish feeding.'
  if (l.water_level_status !== 'normal') return 'Immediate water replenishment required.'
  
  // Lifecycle suggestions
  if (cropLifecycle.value === 'Near Harvest') return 'Prepare harvesting tools and monitor final yield quality.'
  if (fishLifecycle.value === 'Grow-out') return 'Ensure feeding rates support the primary grow-out phase.'

  return 'Continue monitoring routine schedule.'
})

const overallDotClass = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'bg-red-500 animate-pulse'
  if (s === 'warning') return 'bg-yellow-500'
  return 'bg-emerald-500' 
})

const alertTitle = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'Critical Alert'
  if (s === 'warning') return 'System Warning'
  return 'System Status'
})

const alertTitleClass = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'text-red-700'
  if (s === 'warning') return 'text-yellow-700'
  return 'text-emerald-700'
})

const alertIconBgClass = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'bg-red-100/50 text-red-600'
  if (s === 'warning') return 'bg-yellow-100/50 text-yellow-600'
  return 'bg-emerald-100/50 text-emerald-600'
})

const alertClasses = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
  if (s === 'warning') return 'bg-yellow-50/50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50'
  return 'bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
})

const trendDirection = computed(() => {
  if (!history.value || history.value.length < 2) return 'stable'
  const current = history.value[history.value.length - 1][selected.value]
  const previous = history.value[history.value.length - 2][selected.value]
  if (Math.abs(current - previous) < 0.01) return 'stable'
  return current > previous ? 'up' : 'down'
})

const trendLabel = computed(() => {
  const d = trendDirection.value
  if (d === 'up') return 'Increasing'
  if (d === 'down') return 'Decreasing'
  return 'Stable'
})

const trendColor = computed(() => {
  const d = trendDirection.value
  if (d === 'stable') return 'text-gray-400 dark:text-gray-500'
  return 'text-blue-600 dark:text-blue-400'
})
</script>
