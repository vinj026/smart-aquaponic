<template>
  <main class="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300">
    <!-- Subtle dot grid background for technical depth -->
    <div class="fixed inset-0 pointer-events-none opacity-20 dark:opacity-[0.03]" style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 16px 16px;"></div>
    
    <div class="mx-auto relative z-10 px-4 py-8 space-y-6 transition-all duration-500" :class="isDesktopLayout ? 'max-w-4xl' : 'max-w-md'">
      
      <!-- Compact Header -->
      <header class="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-2 rounded-md shadow-sm transition-colors duration-300">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full">
            <div class="w-1.5 h-1.5 rounded-full" :class="overallDotClass"></div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ systemHealthLabel }}</span>
          </div>
          <h1 v-if="isDesktopLayout" class="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-slate-700 pl-3 tracking-[0.2em]">Aquaguard IoT</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-[10px] text-gray-400 dark:text-gray-500 font-medium hidden sm:block">Updated {{ timeAgoText }}</div>
          <div class="flex items-center gap-1 border-l border-gray-100 dark:border-slate-700 pl-2 ml-1">
            <NuxtLink to="/alerts" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 relative" title="Alerts">
              <BellIcon class="w-3.5 h-3.5" />
              <span v-if="systemHealthLabel !== 'Healthy'" class="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
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
            >
              <DownloadIcon class="w-3.5 h-3.5" :class="{ 'animate-bounce opacity-50': isExporting }" />
            </button>
            <button @click="toggleLayoutMode" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1" :title="isDesktopLayout ? 'Switch to Mobile View' : 'Switch to Desktop View'">
              <component :is="isDesktopLayout ? SmartphoneIcon : MonitorIcon" class="w-3.5 h-3.5" />
            </button>
            <button @click="toggleColorMode" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1">
              <component :is="colorMode.value === 'dark' ? SunIcon : MoonIcon" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Stack -->
      <div :class="isDesktopLayout ? 'lg:flex lg:flex-row lg:gap-6 lg:items-start' : 'flex flex-col gap-6'">
        
        <!-- Left Wrapper: Insight + Sensors + Chart -->
        <div :class="isDesktopLayout ? 'w-full lg:w-2/3 flex flex-col gap-6' : 'contents'">
        
        <!-- Intelligent System Insight Box -->
        <div class="">
          <div v-if="latest" 
               class="px-4 py-4 rounded-md border flex flex-col gap-3 shadow-sm transition-all duration-300"
               :class="alertClasses">
            <div class="flex items-start gap-3">
              <div class="shrink-0 mt-0.5 p-1.5 rounded-full" :class="alertIconBgClass">
                 <svg v-if="latest.overall_status === 'normal'" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                 </svg>
                 <svg v-else class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                 </svg>
              </div>
              <div class="space-y-1 min-w-0">
                <h2 class="text-xs md:text-sm font-medium uppercase tracking-widest leading-none flex items-center gap-2 text-current opacity-80">
                   {{ alertTitle }}
                   <span v-if="latest.overall_status !== 'normal'" class="w-1 h-1 rounded-full bg-current opacity-40"></span>
                   <span v-if="latest.overall_status !== 'normal'" class="text-xs lowercase font-medium opacity-80">Requires attention</span>
                </h2>
                <p class="text-xs font-medium leading-relaxed tracking-tight">
                   {{ insightText }}
                </p>
              </div>
            </div>
            
            <!-- Suggested Action (Only for non-normal) -->
            <div v-if="latest.overall_status !== 'normal'" 
                 class="mt-1 pl-10 flex flex-col gap-1 border-t border-current/20 pt-3">
              <span class="text-xs font-bold uppercase tracking-tighter opacity-80">Suggested Action</span>
              <p class="text-xs font-semibold flex items-center gap-1.5">
                <svg class="w-3 h-3 opacity-70 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                </svg>
                {{ suggestedAction }}
              </p>
            </div>
          </div>
          <div v-else-if="latestError" class="px-4 py-4 rounded-md border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 flex flex-col gap-2 shadow-sm min-h-[100px]">
            <h2 class="text-xs md:text-sm font-medium uppercase tracking-widest text-red-600 dark:text-red-400">Live Data Unavailable</h2>
            <p class="text-xs leading-relaxed text-red-700 dark:text-red-300">
              The latest sensor reading could not be loaded. Realtime sync will retry automatically when the connection recovers.
            </p>
          </div>
          <!-- Skeleton Loader -->
          <div v-else class="px-4 py-4 rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-sm animate-pulse min-h-[100px]">
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0"></div>
              <div class="space-y-2 w-full mt-1">
                <div class="h-3 w-1/3 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div class="h-3 w-full bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div class="h-3 w-2/3 bg-gray-200 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Sensors -->
        <section class="space-y-4">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-[11px] md:text-xs font-medium uppercase tracking-widest text-gray-500">Live Sensors</h2>
            <span class="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded uppercase tracking-tighter">Realtime</span>
          </div>
          <div v-if="latest" class="grid grid-cols-2 gap-3">
            <CompactSensorRow 
              label="pH Level" :value="latest?.ph" unit="pH" 
              :status="latest?.ph_status" :status-text="statusLabel(latest?.ph_status)"
            />
            <CompactSensorRow 
              label="Nutrients (TDS)" :value="latest?.tds" unit="ppm" 
              :status="latest?.tds_status" :status-text="statusLabel(latest?.tds_status)"
            />
            <CompactSensorRow 
              label="Water Clarity" :value="latest?.turbidity" unit="NTU" 
              :status="latest?.turbidity_status" :status-text="statusLabel(latest?.turbidity_status)"
            />
            <CompactSensorRow 
              label="Water Level" :value="latest?.water_level" unit="%" 
              :status="latest?.water_level_status" :status-text="statusLabel(latest?.water_level_status)"
            />
          </div>
          <div v-else-if="latestError" class="rounded-md border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 p-4 text-xs text-red-700 dark:text-red-300 shadow-sm">
            Sensor cards are unavailable because the latest reading request failed.
          </div>
          <div v-else class="grid grid-cols-2 gap-3">
            <div v-for="i in 4" :key="i" class="h-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md animate-pulse"></div>
          </div>
        </section>

        <!-- Lifecycle (Mobile Only - between sensors and chart) -->
        <section v-if="!isDesktopLayout" class="grid grid-cols-2 gap-3" aria-label="System lifecycle details">
          <div class="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-sm flex flex-col justify-center gap-0.5 transition-colors duration-300">
             <div class="flex items-center justify-between">
               <span class="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide">Crop Age</span>
               <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-sm">{{ cropLifecycle }}</span>
             </div>
             <div class="flex items-baseline gap-1 mt-1">
               <span class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-none">{{ cropAge }}</span>
               <span class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Days</span>
             </div>
          </div>
          <div class="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-sm flex flex-col justify-center gap-0.5 transition-colors duration-300">
             <div class="flex items-center justify-between">
               <span class="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide">Fish Age</span>
               <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-sm">{{ fishLifecycle }}</span>
             </div>
             <div class="flex items-baseline gap-1 mt-1">
               <span class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-none">{{ fishAge }}</span>
               <span class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Days</span>
             </div>
          </div>
        </section>

        <!-- Historical Trends Section -->
        <section class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-4 space-y-4 shadow-sm transition-colors duration-300">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <h2 class="text-[11px] md:text-xs font-medium uppercase tracking-widest text-gray-500">Historical Trends</h2>
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[10px] font-medium text-gray-400">Realtime sync active</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/50 px-2 py-1 rounded border border-gray-100 dark:border-slate-700/50">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Trend:</span>
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

          <div class="flex flex-wrap items-center justify-between gap-2 border-t border-gray-50 dark:border-slate-800/50 pt-3">
            <div class="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-md border border-gray-200 dark:border-slate-700">
              <button v-for="tr in timeRanges" :key="tr.value"
                @click="selectedTime = tr.value"
                class="text-[10px] px-2.5 py-1 font-bold rounded-md tracking-wider transition-all"
                :class="selectedTime === tr.value ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              >{{ tr.label }}</button>
            </div>
            <div class="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-md border border-gray-200 dark:border-slate-700">
              <button v-for="opt in options" :key="opt.value"
                @click="selected = opt.value"
                class="text-[10px] px-2.5 py-1 font-bold rounded-md tracking-wider transition-colors"
                :class="selected === opt.value ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
              >{{ opt.label }}</button>
            </div>
          </div>

          <div class="h-64 w-full relative">
            <div v-if="historyError && history.length === 0" class="flex h-full items-center justify-center rounded-md border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/10 px-4 text-center text-xs font-medium text-red-700 dark:text-red-300">
              Historical data could not be loaded right now.
            </div>
            <div v-else-if="historyLoading && history.length === 0" class="flex h-full items-center justify-center text-xs text-gray-400 font-medium uppercase tracking-widest">
              Loading chart data...
            </div>
            <ClientOnly v-else>
              <MinimalChart :history="history" :parameter="selected" />
            </ClientOnly>
          </div>
        </section>

        </div>

        <!-- Right Wrapper: Lifecycle + Activity -->
        <div :class="isDesktopLayout ? 'w-full lg:w-1/3 flex flex-col gap-6' : 'contents'">

        <!-- Lifecycle Information Grid (Desktop Only) -->
        <section v-if="isDesktopLayout" class="grid grid-cols-2 gap-3" aria-label="System lifecycle details">
          <div class="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-sm flex flex-col justify-center gap-0.5 transition-colors duration-300">
             <div class="flex items-center justify-between">
               <span class="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide">Crop Age</span>
               <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-sm">{{ cropLifecycle }}</span>
             </div>
             <div class="flex items-baseline gap-1 mt-1">
               <span class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-none">{{ cropAge }}</span>
               <span class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Days</span>
             </div>
          </div>
          <div class="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-sm flex flex-col justify-center gap-0.5 transition-colors duration-300">
             <div class="flex items-center justify-between">
               <span class="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide">Fish Age</span>
               <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-sm">{{ fishLifecycle }}</span>
             </div>
             <div class="flex items-baseline gap-1 mt-1">
               <span class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-none">{{ fishAge }}</span>
               <span class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Days</span>
             </div>
          </div>
        </section>

        <!-- Recent Activity Feed -->
        <section class="space-y-4">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-[11px] md:text-xs font-medium uppercase tracking-widest text-gray-500">Recent Activity</h2>
            <NuxtLink to="/logs" class="text-[10px] font-bold text-emerald-500 hover:underline">View All</NuxtLink>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm transition-colors duration-300">
            <div v-if="eventsLoading && events.length === 0" class="p-8 text-center">
              <p class="text-xs text-gray-400 italic">Loading recent events...</p>
            </div>
            <div v-else-if="eventsError && events.length === 0" class="p-8 text-center">
              <p class="text-xs text-red-500 italic">Recent activity could not be loaded.</p>
            </div>
            <div v-else-if="events.length === 0" class="p-8 text-center">
              <p class="text-xs text-gray-400 italic">No recent events logged</p>
            </div>
            <div v-else class="divide-y divide-gray-50 dark:divide-slate-800">
              <div v-for="event in events" :key="event.id" class="px-4 py-3 space-y-1.5 group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-default">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider" :class="getEventTagClass(event.type)">{{ event.type }}</span>
                  <span class="text-[10px] font-mono text-gray-400 group-hover:text-gray-500">{{ formatEventTime(event.timestamp) }}</span>
                </div>
                <p class="text-xs leading-snug font-medium text-gray-700 dark:text-gray-300">{{ event.message }}</p>
              </div>
            </div>
          </div>
        </section>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup>
import { Sun as SunIcon, Moon as MoonIcon, Download as DownloadIcon, Settings as SettingsIcon, Activity as ActivityIcon, Bell as BellIcon, Monitor as MonitorIcon, Smartphone as SmartphoneIcon } from 'lucide-vue-next'
import { useLatestReading, useReadingHistory, useSystemEvents, useLifecycleConfig } from '~/composables/useSupabaseData'
import CompactSensorRow from '~/components/CompactSensorRow.vue'
import MinimalChart from '~/components/MinimalChart.vue'
import { format } from 'date-fns'

const colorMode = useColorMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// State & Data
const { isDesktopLayout, toggleLayoutMode } = useLayoutMode()
const isExporting = ref(false)
const selectedTime = ref(60) // Minutes
const selected = ref('turbidity')
const now = ref(Date.now())

// Supabase Composables
const { reading: latest, error: latestError } = useLatestReading()
const { history, loading: historyLoading, error: historyError } = useReadingHistory(selectedTime)
const { events, loading: eventsLoading, error: eventsError } = useSystemEvents(6)
const { config } = useLifecycleConfig()

// Constants
const timeRanges = [
  { label: '1H', value: 60 },
  { label: '6H', value: 360 },
  { label: '24H', value: 1440 },
]

const options = [
  { label: 'Turb', value: 'turbidity' },
  { label: 'pH', value: 'ph' },
  { label: 'TDS', value: 'tds' },
  { label: 'Wtr', value: 'water_level' },
]

// Lifecycle Timer
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 5000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Computed Properties
const timeAgoText = computed(() => {
  const ts = latest.value?.timestamp
  if (!ts) return '—'
  const diff = Math.floor((now.value - new Date(ts).getTime()) / 1000)
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

function parseStoredDate(dateString) {
  return new Date(`${dateString}T00:00:00`)
}

const cropAge = computed(() => {
  if (!config.value.crop_start_date) return 0
  const start = parseStoredDate(config.value.crop_start_date)
  const diffTime = now.value - start.getTime()
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
})

const fishAge = computed(() => {
  if (!config.value.fish_start_date) return 0
  const start = parseStoredDate(config.value.fish_start_date)
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

const alertClasses = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'bg-white dark:bg-slate-900 border-red-500 border-2 text-red-700 dark:text-red-400'
  if (s === 'warning') return 'bg-white dark:bg-slate-900 border-yellow-500 border-2 text-yellow-700 dark:text-yellow-400'
  return 'bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
})

const alertIconBgClass = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'bg-red-100/50 text-red-600'
  if (s === 'warning') return 'bg-yellow-100/50 text-yellow-600'
  return 'bg-emerald-100/50 text-emerald-600'
})

const alertTitle = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'Critical Alert'
  if (s === 'warning') return 'System Warning'
  return 'System Healthy'
})

const insightText = computed(() => {
  const l = latest.value
  const h = history.value
  if (!l) return 'Initializing system context...'
  
  if (h.length >= 5) {
    const lastFive = h.slice(-5)
    const tdsTrend = lastFive[4].tds - lastFive[0].tds
    if (l.ph > 7.5 && l.tds > 700 && tdsTrend > 0 && l.turbidity_status !== 'normal') {
      return 'Potential overfeeding detected. High pH and rising TDS levels correlated with poor clarity suggest excess organic waste.'
    }
  }

  if (l.ph_status !== 'normal') return l.ph > 7.5 ? 'System pH is too alkaline. Risk of nutrient lockout.' : 'Acidic pH detected. High acidity can stress fish.'
  if (l.tds_status !== 'normal') return l.tds > 1000 ? 'Nutrient concentration is excessively high. Risk of root burn.' : 'Nutrient levels are insufficient for optimal growth.'
  if (l.turbidity_status !== 'normal') return 'Water clarity is poor. Inspect mechanical filters and reduce feeding.'
  if (l.water_level_status !== 'normal') return 'Water volume is critically low. Submersible pumps are at risk.'
  
  return 'All aquatic parameters are within optimal ranges for a balanced ecosystem.'
})

const suggestedAction = computed(() => {
  const l = latest.value
  if (!l || l.overall_status === 'normal') return 'Continue monitoring routine schedule.'
  if (l.ph_status !== 'normal') return 'Adjust pH using diluted buffers and retest.'
  if (l.tds_status !== 'normal') return 'Top up with fresh water or adjust nutrient dosing.'
  if (l.turbidity_status !== 'normal') return 'Clean filters and reduce fish feeding.'
  if (l.water_level_status !== 'normal') return 'Immediate water replenishment required.'
  return 'Inspect system sensors and physical components.'
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

const overallDotClass = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'bg-red-500 animate-pulse'
  if (s === 'warning') return 'bg-yellow-500'
  return 'bg-emerald-500' 
})

// Methods
function statusLabel(status) {
  if (!status) return 'None'
  if (status === 'normal') return 'Normal'
  if (status === 'warning') return 'Warn'
  if (status === 'danger') return 'Alert'
  return String(status)
}

async function exportCsv() {
  if (isExporting.value) return
  isExporting.value = true

  try {
    await new Promise(r => setTimeout(r, 800))

    const rows = history.value
    if (!rows || rows.length === 0) return

    const headers = ['Timestamp', 'pH', 'TDS', 'Turbidity', 'Water Level', 'Status']
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        new Date(r.timestamp).toISOString(),
        r.ph, r.tds, r.turbidity, r.water_level, r.overall_status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `aquaguard-data-${Date.now()}.csv`)
    a.click()
    window.URL.revokeObjectURL(url)
  } finally {
    isExporting.value = false
  }
}

const getEventTagClass = (type) => {
  if (type === 'danger') return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (type === 'warning') return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
}

const formatEventTime = (timestamp) => {
  if (!timestamp) return ''
  return format(new Date(timestamp), 'HH:mm')
}
</script>
