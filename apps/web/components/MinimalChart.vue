<template>
  <div class="w-full h-full relative" :key="parameter">
    <div v-if="!hasData" class="flex items-center justify-center h-full text-xs text-gray-400">No data</div>
    <svg v-else class="w-full h-full overflow-visible" viewBox="0 0 300 150" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.15" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Very subtle horizontal grid -->
      <line x1="0" y1="0" x2="300" y2="0" stroke="currentColor" stroke-opacity="0.05" stroke-width="1" />
      <line x1="0" y1="75" x2="300" y2="75" stroke="currentColor" stroke-opacity="0.05" stroke-width="1" />
      <line x1="0" y1="150" x2="300" y2="150" stroke="currentColor" stroke-opacity="0.05" stroke-width="1" />

      <!-- Area fill & Line path -->
      <path :d="fillPath" :fill="`url(#${gradientId})`" class="text-emerald-500" />
      <path :d="linePath" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" class="text-emerald-500" />

      <!-- Highlighting latest point -->
      <g class="text-emerald-500">
        <circle :cx="latestPoint.x" :cy="latestPoint.y" r="6" fill="currentColor" fill-opacity="0.15" />
        <circle :cx="latestPoint.x" :cy="latestPoint.y" r="3" fill="currentColor" class="animate-pulse" />
      </g>
      
      <!-- Value Label at latest point -->
      <text :x="latestValueLabelPos.x" :y="latestValueLabelPos.y" dy="-14" text-anchor="middle" class="text-[12px] font-black fill-emerald-600 dark:fill-emerald-400 font-mono drop-shadow-sm">{{ latestValueFormatted }}</text>
      
      <!-- Min/Max labels -->
      <text x="0" y="10" class="text-[9px] fill-gray-400 font-mono uppercase tracking-tighter">Peak: {{ maxLabel }}</text>
      <text x="0" y="148" class="text-[9px] fill-gray-400 font-mono uppercase tracking-tighter">Floor: {{ minLabel }}</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  history: { type: Array, default: () => [] },
  parameter: { type: String, required: true }
})

const width = 300
const height = 150
const pad = { top: 10, bottom: 10, left: 0, right: 0 }
const chartWidth = width
const chartHeight = height - pad.top - pad.bottom

const rows = computed(() => {
  if (!Array.isArray(props.history)) return []
  // For better performance, we limit to 100 points for the SVG visualization
  // but we pick them evenly spread across the dataset
  if (props.history.length <= 100) return props.history
  const step = props.history.length / 100
  return Array.from({ length: 100 }, (_, i) => props.history[Math.floor(i * step)])
})
const values = computed(() => rows.value.map(r => Number(r?.[props.parameter])).filter(val => !isNaN(val)))
const hasData = computed(() => values.value.length > 1)

const minValue = computed(() => Math.min(...values.value))
const maxValue = computed(() => Math.max(...values.value))

const domain = computed(() => {
  const min = minValue.value
  const max = maxValue.value
  if (!Number.isFinite(min)) return { min: 0, max: 1 }
  if (min === max) {
    return { min: Math.max(0, min - 1), max: max + 1 }
  }
  const padding = (max - min) * 0.1
  return { min: Math.max(0, min - padding), max: max + padding }
})

const points = computed(() => {
  if (!hasData.value) return []
  const span = Math.max(1, values.value.length - 1)
  const range = domain.value.max - domain.value.min
  return values.value.map((value, index) => ({
    x: (index / span) * chartWidth,
    y: pad.top + (1 - (value - domain.value.min) / range) * chartHeight
  }))
})

const linePath = computed(() => {
  const pts = points.value
  if (pts.length < 2) return ''
  return pts.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const prev = pts[index - 1]
    const cpX = (prev.x + point.x) / 2
    return `${path} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`
  }, '')
})

const fillPath = computed(() => {
  const pts = points.value
  if (pts.length < 2) return ''
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${linePath.value} L ${last.x} ${height} L ${first.x} ${height} Z`
})

const latestPoint = computed(() => points.value[points.value.length - 1] || { x: 0, y: 0 })
const latestValueFormatted = computed(() => {
  const val = values.value[values.value.length - 1]
  return val != null ? formatValue(val) : ''
})

const latestValueLabelPos = computed(() => {
  const p = latestPoint.value
  return {
    x: Math.min(Math.max(p.x, 20), 280),
    y: p.y
  }
})

const gradientId = computed(() => `mini-chart-grad-${props.parameter}`)

function formatValue(value) {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value) >= 100) return Math.round(value).toString()
  return value.toFixed(1)
}

const minLabel = computed(() => formatValue(domain.value.min))
const maxLabel = computed(() => formatValue(domain.value.max))
</script>
