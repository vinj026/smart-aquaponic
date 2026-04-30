<template>
  <main class="min-h-screen bg-[#FAFAFA] text-gray-800 font-sans relative overflow-x-hidden">
    <!-- Subtle dot grid background for technical depth -->
    <div class="fixed inset-0 pointer-events-none opacity-20" style="background-image: radial-gradient(#d1d5db 1px, transparent 1px); background-size: 16px 16px;"></div>
    
    <div class="max-w-md mx-auto relative z-10 px-4 py-8 space-y-6">
      
      <!-- Compact Header -->
      <header class="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full">
            <div class="w-1.5 h-1.5 rounded-full" :class="overallDotClass"></div>
            <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500">{{ systemHealthLabel }}</span>
          </div>
          <h1 class="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-l border-gray-100 pl-3">Aquaguard IoT</h1>
        </div>
        <div class="text-[10px] text-gray-400 font-medium">Updated {{ timeAgoText }}</div>
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
        <div class="px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm flex flex-col justify-center gap-0.5">
           <div class="flex items-center justify-between">
             <span class="text-[10px] uppercase text-gray-500 font-medium tracking-wide">Crop Age</span>
             <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">{{ cropLifecycle }}</span>
           </div>
           <span class="text-sm font-bold text-gray-800">{{ cropAge }} <span class="text-[10px] font-medium opacity-60">Days</span></span>
        </div>
        <div class="px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm flex flex-col justify-center gap-0.5">
           <div class="flex items-center justify-between">
             <span class="text-[10px] uppercase text-gray-500 font-medium tracking-wide">Fish Age</span>
             <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm">{{ fishLifecycle }}</span>
           </div>
           <span class="text-sm font-bold text-gray-800">{{ fishAge }} <span class="text-[10px] font-medium opacity-60">Days</span></span>
        </div>
      </section>

      <!-- Prominent Chart Section -->
      <section class="bg-white border border-gray-200 rounded-md p-4 space-y-4 shadow-sm flex-1 flex flex-col">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-0.5">
            <div class="text-[11px] font-bold text-gray-700 uppercase tracking-widest leading-none">Historical Trend</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Velocity:</span>
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
          <div class="flex bg-gray-100 p-0.5 rounded-sm gap-0.5 border border-gray-200">
            <button v-for="opt in options" :key="opt.value"
              @click="selected = opt.value"
              class="text-[10px] px-2.5 py-1 font-medium rounded-sm uppercase tracking-wide transition-colors"
              :class="selected === opt.value ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500'"
            >
              {{ opt.label }}
            </button>
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
import CompactSensorRow from '~/components/CompactSensorRow.vue'
import MinimalChart from '~/components/MinimalChart.vue'
import { useLatestReading, useReadingHistory } from '~/composables/useSupabaseData'

const { reading } = useLatestReading()
const { history } = useReadingHistory(20)

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
// Note: Hardcoding initial values for demonstration, ideally synced from DB
const cropAge = ref(32)
const fishAge = ref(38)

const cropLifecycle = computed(() => {
  const a = cropAge.value
  if (a < 7) return 'Seedling'
  if (a < 21) return 'Vegetative'
  if (a < 30) return 'Maturing'
  return 'Near Harvest'
})

const fishLifecycle = computed(() => {
  const a = fishAge.value
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
  if (!l) return 'Initializing system context...'
  
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
  
  // If sensors are normal, let's look at lifecycle context.
  if (cropLifecycle.value === 'Near Harvest') {
    return `Crop has reached the ${cropLifecycle.value} phase. Nutrient uptake will slow down.`
  }
  if (cropLifecycle.value === 'Vegetative') {
    return `Crop is in active ${cropLifecycle.value} growth. Maintaining current normal conditions is ideal.`
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
  if (s === 'danger') return 'bg-red-50/50 text-red-700 border-red-200'
  if (s === 'warning') return 'bg-yellow-50/50 text-yellow-700 border-yellow-200'
  return 'bg-emerald-50/30 text-emerald-700 border-emerald-100'
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
  if (d === 'stable') return 'text-gray-400'
  // Color depends on parameter. some 'up' is good, some bad. 
  // For now just using neutral blue for movement or gray for stable
  return 'text-blue-600'
})
</script>
