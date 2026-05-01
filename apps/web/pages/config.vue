<template>
  <main class="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300 pb-24">
    <!-- Subtle dot grid background -->
    <div class="fixed inset-0 pointer-events-none opacity-20 dark:opacity-[0.03]" style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 16px 16px;"></div>

    <div class="max-w-md mx-auto relative z-10 px-4 py-8 space-y-6">
      <!-- Header -->
      <header class="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-2 rounded-md shadow-sm transition-colors duration-300">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <ChevronLeftIcon class="w-5 h-5" />
          </NuxtLink>
          <h1 class="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-slate-700 pl-3">System Config</h1>
        </div>
        <div class="flex items-center gap-3">
          <button @click="toggleColorMode" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1">
            <component :is="colorMode.value === 'dark' ? SunIcon : MoonIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <!-- Config Form Card -->
      <section class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-6 space-y-6 shadow-sm transition-colors duration-300">
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
            :disabled="saving"
            class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-2.5 rounded-md text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {{ saving ? 'Saving Changes...' : 'Save Configuration' }}
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

    <!-- Reusing the BottomNav (To be added later) -->
    <BottomNav severity="normal" />
  </main>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useLifecycleConfig } from '~/composables/useSupabaseData'
import { ChevronLeft as ChevronLeftIcon, Sun as SunIcon, Moon as MoonIcon, Info as InfoIcon } from 'lucide-vue-next'
import BottomNav from '~/components/BottomNav.vue'

const colorMode = useColorMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const { config, updateConfig } = useLifecycleConfig()
const saving = ref(false)

const form = reactive({
  crop_start_date: '',
  fish_start_date: ''
})

// Sync form with config when loaded
watch(config, (newVal) => {
  if (newVal.crop_start_date) form.crop_start_date = newVal.crop_start_date
  if (newVal.fish_start_date) form.fish_start_date = newVal.fish_start_date
}, { immediate: true })

async function handleSave() {
  saving.value = true
  const { error } = await updateConfig({
    crop_start_date: form.crop_start_date,
    fish_start_date: form.fish_start_date
  })
  
  if (error) {
    alert('Failed to save config: ' + error.message)
  } else {
    // Show success state (could use a toast later)
    setTimeout(() => {
      saving.value = false
    }, 500)
  }
}
</script>
