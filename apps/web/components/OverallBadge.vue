<template>
  <div class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold" :class="badgeClass">
    <span class="h-2 w-2 rounded-full" :class="dotClass" />
    <span class="uppercase tracking-wide">{{ overallText }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  status: { type: String, default: '' },
})

const map = {
  normal: {
    badge: 'border-green-200 bg-green-100 text-green-800',
    dot: 'bg-green-500',
    text: 'all normal',
  },
  warning: {
    badge: 'border-yellow-200 bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
    text: 'warning',
  },
  danger: {
    badge: 'border-red-200 bg-red-100 text-red-800',
    dot: 'bg-red-500',
    text: 'danger',
  },
}

const theme = computed(() => map[props.status] || {
  badge: 'border-slate-200 bg-slate-100 text-slate-700',
  dot: 'bg-slate-500',
  text: props.status || 'unknown',
})

const badgeClass = computed(() => theme.value.badge)
const dotClass = computed(() => theme.value.dot)
const overallText = computed(() => theme.value.text)
</script>

