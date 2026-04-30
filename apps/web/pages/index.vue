<template>
  <main class="min-h-screen bg-[#FAFAFA] text-gray-800 font-sans relative overflow-x-hidden">
    <!-- Subtle dot grid background for technical depth -->
    <div class="fixed inset-0 pointer-events-none opacity-40" style="background-image: radial-gradient(#d1d5db 1px, transparent 1px); background-size: 16px 16px;"></div>
    
    <div class="max-w-md mx-auto relative z-10 px-4 py-6 space-y-4">
      
      <!-- Compact Header -->
      <header class="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm">
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full" :class="overallDotClass"></div>
          <h1 class="text-[11px] font-bold uppercase tracking-wider text-gray-900">Aquaguard IoT</h1>
        </div>
        <div class="text-[10px] text-gray-400 font-medium">Live sync: {{ lastUpdatedText }}</div>
      </header>
      
      <!-- System Alert Banner (Only shows if warning/danger) -->
      <div v-if="latest && latest.overall_status !== 'normal'" 
           class="px-3 py-2 rounded-md border flex items-center gap-2 text-xs font-medium"
           :class="alertClasses">
        <span class="truncate">{{ insightText }}</span>
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

      <!-- General Info Compact Row -->
      <section class="grid grid-cols-2 gap-3" aria-label="System details">
        <div class="px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm flex items-center justify-between">
           <span class="text-[10px] uppercase text-gray-500 font-medium">Crop Age</span>
           <span class="text-xs font-bold text-gray-800">14 Days</span>
        </div>
        <div class="px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm flex items-center justify-between">
           <span class="text-[10px] uppercase text-gray-500 font-medium">Fish Age</span>
           <span class="text-xs font-bold text-gray-800">38 Days</span>
        </div>
      </section>

      <!-- Prominent Chart Section -->
      <section class="bg-white border border-gray-200 rounded-md p-4 space-y-4 shadow-sm flex-1 flex flex-col">
        <div class="flex items-center justify-between">
          <div class="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Historical Trend</div>
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
import { useLatestReading, useReadingHistory } from '~/composables/useFirebaseData'

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

const lastUpdatedText = computed(() => {
  const ts = latest.value?.timestamp
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

function statusLabel(status) {
  if (!status) return 'None'
  if (status === 'normal') return 'Normal'
  if (status === 'warning') return 'Warn'
  if (status === 'danger') return 'Alert'
  return String(status)
}

const insightText = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'Critical conditions detected in system components.'
  if (s === 'warning') return 'Some parameters require attention soon.'
  if (s === 'normal') return 'All systems operating nominally.'
  return 'Initializing dashboard context...'
})

const overallDotClass = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'bg-red-500 animate-pulse outline outline-1 outline-offset-1 outline-red-200'
  if (s === 'warning') return 'bg-yellow-500 outline outline-1 outline-offset-1 outline-yellow-200'
  return 'bg-emerald-500' // normal layout
})

const alertClasses = computed(() => {
  const s = latest.value?.overall_status
  if (s === 'danger') return 'bg-red-50 text-red-600 border-red-200'
  if (s === 'warning') return 'bg-yellow-50 text-yellow-600 border-yellow-200'
  return 'bg-gray-50 text-gray-500 border-gray-200'
})
</script>
