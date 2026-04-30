<template>
  <div class="rounded-xl border p-4 shadow-sm" :class="cardClass">
    <div class="text-sm font-medium text-slate-600">
      {{ title }}
    </div>

    <div class="mt-3 text-3xl font-semibold text-slate-900">
      <span v-if="value == null">—</span>
      <template v-else>
        {{ value }}
        <span v-if="unit" class="ml-1 text-base font-medium text-slate-600">{{ unit }}</span>
      </template>
    </div>

    <div class="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
      :class="badgeClass"
    >
      <span class="h-2 w-2 rounded-full" :class="dotClass" />
      {{ status || 'unknown' }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String, null], default: null },
  unit: { type: String, default: '' },
  status: { type: String, default: '' },
})

const colorMap = {
  normal: {
    card: 'border-green-200 bg-white shadow-sm',
    badge: 'border-green-200 bg-green-50 text-green-700',
    dot: 'bg-green-500',
  },
  warning: {
    card: 'border-yellow-200 bg-white shadow-sm',
    badge: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    dot: 'bg-yellow-500',
  },
  danger: {
    card: 'border-red-200 bg-white shadow-sm',
    badge: 'border-red-200 bg-red-50 text-red-700',
    dot: 'bg-red-500',
  },
}

const theme = computed(() => colorMap[props.status] || {
  card: 'border-slate-200 bg-white shadow-sm',
  badge: 'border-slate-200 bg-slate-50 text-slate-700',
  dot: 'bg-slate-500',
})

const cardClass = computed(() => theme.value.card)
const badgeClass = computed(() => theme.value.badge)
const dotClass = computed(() => theme.value.dot)
</script>

