<template>
  <main class="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300">
    <!-- Subtle dot grid background -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.04]" style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 16px 16px;"></div>

    <div class="mx-auto relative z-10 px-4 py-8 space-y-6 transition-all duration-500" :class="isDesktopLayout ? 'max-w-4xl' : 'max-w-md'">
      <!-- Header -->
      <header class="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-md shadow-sm transition-colors duration-300">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <ChevronLeftIcon class="w-5 h-5" />
          </NuxtLink>
          <h1 class="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-slate-700 pl-3">Konfigurasi Sistem</h1>
        </div>
        <div class="flex items-center gap-3">
          <button @click="toggleLayoutMode" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1" :title="isDesktopLayout ? 'Beralih ke tampilan seluler' : 'Beralih ke tampilan desktop'">
            <component :is="isDesktopLayout ? SmartphoneIcon : MonitorIcon" class="w-3.5 h-3.5" />
          </button>
          <button @click="toggleColorMode" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1">
            <component :is="colorMode.value === 'dark' ? SunIcon : MoonIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div class="space-y-6">
        <!-- Config Form Card -->
        <section class="space-y-4 border-b border-gray-200 dark:border-slate-700 pb-6">
          <div v-if="configError" class="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            Gagal memuat konfigurasi siklus hidup.
          </div>

          <div class="space-y-1">
            <h2 class="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">Pengaturan Siklus Hidup</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
              Tanggal ini digunakan untuk menghitung umur tanaman dan ikan, yang secara langsung mempengaruhi diagnosis cerdas dan tindakan yang disarankan.
            </p>
          </div>

          <div class="grid gap-4" :class="isDesktopLayout ? 'grid-cols-2' : 'grid-cols-1'">
            <!-- Crop Start Date -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 block">Tanggal tanam</label>
              <input 
                v-model="form.crop_start_date" 
                type="date" 
                class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <!-- Fish Start Date -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 block">Tanggal tebar ikan</label>
              <input 
                v-model="form.fish_start_date" 
                type="date" 
                class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div class="flex justify-end">
            <button 
              @click="handleSave" 
              :disabled="saving || configLoading"
              class="inline-flex w-auto items-center justify-center rounded-md border border-gray-300 dark:border-slate-700 bg-transparent px-6 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
            >
              <span v-if="saveSuccess">✓ Tersimpan</span>
              <span v-else>{{ saving ? 'Menyimpan...' : configLoading ? 'Memuat...' : 'Simpan konfigurasi' }}</span>
            </button>
          </div>
        </section>

        <!-- Sensor Thresholds Section -->
        <section class="space-y-4">
          <div class="space-y-1 px-1">
            <h2 class="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">Batas Sensor</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Batas ini menentukan kapan pembacaan sensor ditandai sebagai peringatan atau bahaya.
            </p>
          </div>

          <div v-if="thresholdsError" class="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            Gagal memuat batas sensor.
          </div>

          <div v-else-if="thresholdsLoading && thresholds.length === 0" class="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Memuat batas sensor...
          </div>

          <div class="grid gap-4" :class="isDesktopLayout ? 'grid-cols-2' : 'grid-cols-1'">
            <div v-for="t in thresholds" :key="t.id" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md p-4 shadow-sm space-y-4 transition-colors duration-300">
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-2">
                <span class="text-[10px] font-bold">{{ t.label }}</span>
                <span class="text-[10px] font-mono text-gray-500 dark:text-gray-400">{{ t.unit }}</span>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tighter">Rentang normal</label>
                  <div class="flex items-center gap-2">
                    <input v-model.number="t.min_normal" type="number" step="0.1" :placeholder="`e.g. ${t.min_normal}`" @change="handleThresholdChange(t)" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-gray-900 dark:text-gray-100" />
                    <span class="text-gray-400 dark:text-gray-500">—</span>
                    <input v-model.number="t.max_normal" type="number" step="0.1" :placeholder="`e.g. ${t.max_normal}`" @change="handleThresholdChange(t)" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-gray-900 dark:text-gray-100" />
                  </div>
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-tighter">Rentang aman</label>
                  <div class="flex items-center gap-2">
                    <input v-model.number="t.min_warning" type="number" step="0.1" :placeholder="`e.g. ${t.min_warning}`" @change="handleThresholdChange(t)" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-gray-900 dark:text-gray-100" />
                    <span class="text-gray-400 dark:text-gray-500">—</span>
                    <input v-model.number="t.max_warning" type="number" step="0.1" :placeholder="`e.g. ${t.max_warning}`" @change="handleThresholdChange(t)" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-gray-900 dark:text-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import { useLifecycleConfig, useThresholds } from '~/composables/useSupabaseData'
import { ChevronLeft as ChevronLeftIcon, Sun as SunIcon, Moon as MoonIcon, Monitor as MonitorIcon, Smartphone as SmartphoneIcon } from 'lucide-vue-next'

const colorMode = useColorMode()
const { isDesktopLayout, toggleLayoutMode } = useLayoutMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const { config, loading: configLoading, error: configError, updateConfig } = useLifecycleConfig()
const saving = ref(false)
const saveSuccess = ref(false)
let saveSuccessTimer = null

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

function validateThresholdUpdates(updates) {
  const values = Object.values(updates)
  if (!values.every(Number.isFinite)) return 'Nilai batas harus berupa angka yang valid.'
  if (values.some(value => value < 0)) return 'Nilai batas tidak boleh negatif.'
  if (updates.min_normal > updates.max_normal) return 'Minimum normal harus lebih kecil atau sama dengan maksimum normal.'
  if (updates.min_warning > updates.max_warning) return 'Minimum aman harus lebih kecil atau sama dengan maksimum aman.'
  if (updates.min_warning > updates.min_normal || updates.max_warning < updates.max_normal) {
    return 'Rentang aman harus mencakup seluruh rentang normal.'
  }
  return null
}

async function handleSave() {
  saving.value = true
  saveSuccess.value = false

  try {
    const { error } = await updateConfig({
      crop_start_date: form.crop_start_date,
      fish_start_date: form.fish_start_date
    })

    if (error) {
      alert('Gagal menyimpan konfigurasi: ' + error.message)
      return
    }

    saveSuccess.value = true
    if (saveSuccessTimer) clearTimeout(saveSuccessTimer)
    saveSuccessTimer = setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  if (saveSuccessTimer) clearTimeout(saveSuccessTimer)
})

async function handleThresholdChange(t) {
  const updates = {
    min_normal: t.min_normal,
    max_normal: t.max_normal,
    min_warning: t.min_warning,
    max_warning: t.max_warning
  }

  const validationError = validateThresholdUpdates(updates)
  if (validationError) {
    alert(validationError)
    await fetchThresholds()
    return
  }

  const { error } = await updateThreshold(t.id, {
    ...updates
  })
  if (error) alert('Gagal memperbarui batas: ' + error.message)
}
</script>
