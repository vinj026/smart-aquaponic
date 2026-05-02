<template>
  <div 
    class="flex flex-col p-3 border rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300"
    :class="cardClasses"
  >
    <!-- Top: Label & Status -->
    <div class="flex items-center justify-between mb-1.5">
      <div class="flex items-center gap-1.5">
        <div v-if="$slots.icon" class="text-gray-400 w-3.5 h-3.5 flex items-center justify-center">
          <slot name="icon" />
        </div>
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{{ label }}</span>
      </div>

      <div 
        v-if="statusText" 
        class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
        :class="statusClasses"
      >
        {{ statusText }}
      </div>
    </div>

    <!-- Bottom: Value & Unit -->
    <div class="flex items-baseline gap-1 mt-1">
      <span class="text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight leading-none">
        <template v-if="value == null">—</template>
        <template v-else>{{ value }}</template>
      </span>
      <span v-if="unit" class="text-[11px] font-medium text-gray-400">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String, null], default: null },
  unit: { type: String, default: '' },
  status: { type: String, default: '' },
  statusText: { type: String, default: '' },
})

const cardClasses = computed(() => {
  if (props.status === 'danger') return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
  if (props.status === 'warning') return 'bg-amber-50 dark:bg-yellow-950/20 border-amber-200 dark:border-yellow-900/50'
  return 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
})

const statusClasses = computed(() => {
  if (props.status === 'danger') return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50'
  if (props.status === 'warning') return 'bg-amber-100 dark:bg-yellow-900/40 text-amber-800 dark:text-yellow-400 border border-amber-200 dark:border-yellow-800/50'
  if (props.status === 'normal') return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
  return 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700/50'
})
</script>
