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
          <h1 class="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-slate-700 pl-3">System Config</h1>
        </div>
        <div class="flex items-center gap-3">
          <button @click="toggleLayoutMode" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1" :title="isDesktopLayout ? 'Switch to Mobile View' : 'Switch to Desktop View'">
            <component :is="isDesktopLayout ? SmartphoneIcon : MonitorIcon" class="w-3.5 h-3.5" />
          </button>
          <button @click="toggleColorMode" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1">
            <component :is="colorMode.value === 'dark' ? SunIcon : MoonIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div :class="isDesktopLayout ? 'grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-6 items-start' : 'space-y-6'">
      <!-- Config Form Card -->
      <section class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-6 space-y-6 shadow-sm transition-colors duration-300">
        <div v-if="configError" class="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 px-3 py-2 text-[11px] text-red-700 dark:text-red-300">
          Failed to load lifecycle configuration.
        </div>

        <div class="space-y-1">
          <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Lifecycle Settings</h2>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">Set the start dates for your biological cycles to ensure accurate tracking.</p>
        </div>

        <div class="space-y-4">
          <!-- Crop Start Date -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block">Crop Planting Date</label>
            <input 
              v-model="form.crop_start_date" 
              type="date" 
              class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <!-- Fish Start Date -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block">Fish Stocking Date</label>
            <input 
              v-model="form.fish_start_date" 
              type="date" 
              class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <div class="pt-4">
          <button 
            @click="handleSave" 
            :disabled="saving || configLoading"
            class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-2.5 rounded-md text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {{ saving ? 'Saving Changes...' : configLoading ? 'Loading Configuration...' : 'Save Configuration' }}
          </button>
        </div>
      </section>

      <!-- Info Box -->
      <div class="p-4 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex gap-3">
        <InfoIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p class="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400 font-medium">
          The system uses these dates to calculate the "Age" of your plants and fish, which directly influences the intelligent diagnosis and suggested actions.
        </p>
      </div>
      </div>

      <!-- Sensor Thresholds Section -->
      <section class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-[11px] font-bold uppercase tracking-widest text-gray-500">Sensor Thresholds</h2>
          <span class="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded uppercase tracking-tighter">System Wide</span>
        </div>

        <div v-if="thresholdsError" class="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 px-3 py-2 text-[11px] text-red-700 dark:text-red-300">
          Failed to load sensor thresholds.
        </div>

        <div v-else-if="thresholdsLoading && thresholds.length === 0" class="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-4 text-[11px] text-gray-500 dark:text-gray-400 text-center">
          Loading sensor thresholds...
        </div>

        <div v-for="t in thresholds" :key="t.id" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-4 shadow-sm space-y-4 transition-colors duration-300">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
            <span class="text-xs font-bold">{{ t.label }}</span>
            <span class="text-[10px] font-mono text-gray-400">{{ t.unit }}</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Normal Range</label>
              <div class="flex items-center gap-2">
                <input v-model.number="t.min_normal" type="number" step="0.1" @change="handleThresholdChange(t)" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono" />
                <span class="text-gray-300">—</span>
                <input v-model.number="t.max_normal" type="number" step="0.1" @change="handleThresholdChange(t)" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Safety (Warning) Range</label>
              <div class="flex items-center gap-2">
                <input v-model.number="t.min_warning" type="number" step="0.1" @change="handleThresholdChange(t)" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono" />
                <span class="text-gray-300">—</span>
                <input v-model.number="t.max_warning" type="number" step="0.1" @change="handleThresholdChange(t)" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

  </main>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useLifecycleConfig, useThresholds } from '~/composables/useSupabaseData'
import { ChevronLeft as ChevronLeftIcon, Sun as SunIcon, Moon as MoonIcon, Info as InfoIcon, Monitor as MonitorIcon, Smartphone as SmartphoneIcon } from 'lucide-vue-next'

const colorMode = useColorMode()
const { isDesktopLayout, toggleLayoutMode } = useLayoutMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const { config, loading: configLoading, error: configError, updateConfig } = useLifecycleConfig()
const saving = ref(false)

const form = reactive({
  crop_start_date: '',
  fish_start_date: ''
})

// Sync form with config when loaded
watch(config, (newVal) => {
  form.crop_start_date = newVal.crop_start_date || ''
  form.fish_start_date = newVal.fish_start_date || ''
}, { immediate: true })

const { thresholds, loading: thresholdsLoading, error: thresholdsError, updateThreshold, fetchThresholds } = useThresholds()

async function handleSave() {
  saving.value = true

  try {
    const { error } = await updateConfig({
      crop_start_date: form.crop_start_date,
      fish_start_date: form.fish_start_date
    })

    if (error) {
      alert('Failed to save config: ' + error.message)
    }
  } finally {
    saving.value = false
  }
}

async function handleThresholdChange(t) {
  const updates = {
    min_normal: t.min_normal,
    max_normal: t.max_normal,
    min_warning: t.min_warning,
    max_warning: t.max_warning
  }

  if (!Object.values(updates).every(Number.isFinite)) {
    alert('Threshold values must be valid numbers.')
    await fetchThresholds()
    return
  }

  const { error } = await updateThreshold(t.id, {
    ...updates
  })
  if (error) alert('Failed to update threshold: ' + error.message)
}
</script>
