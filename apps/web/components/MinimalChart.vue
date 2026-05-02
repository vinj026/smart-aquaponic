<template>
  <div class="w-full h-full relative group cursor-crosshair" :key="parameter" ref="containerRef" @mousemove="onMouseMove" @mouseleave="onMouseLeave" @touchstart="onTouch" @touchmove="onTouch">
    <div v-if="!hasData" class="flex items-center justify-center h-full text-[10px] text-gray-400 font-medium uppercase tracking-widest">Loading data...</div>
    
    <template v-else>
      <!-- Y-Axis Labels (HTML Overlay) -->
      <div class="absolute inset-y-0 left-0 flex flex-col justify-between pointer-events-none z-10 py-2" :style="{ width: `${chartLeft}px` }">
        <span v-for="(label, i) in yAxisLabels" :key="'y'+i" 
          class="text-[10px] font-mono font-bold text-gray-500 dark:text-slate-400 text-right pr-1.5 leading-none"
          :style="{ position: 'absolute', top: `${(label.y / 150) * 100}%`, right: '4px', transform: 'translateY(-50%)' }">
          {{ label.text }}
        </span>
      </div>

      <!-- Main Chart SVG -->
      <svg class="w-full h-full overflow-visible" viewBox="0 0 320 150" preserveAspectRatio="none">
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.08" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Horizontal grid lines -->
        <line v-for="(label, i) in yAxisLabels" :key="'yg'+i"
          :x1="chartLeft" :y1="label.y" :x2="width" :y2="label.y"
          stroke="currentColor" class="text-gray-100 dark:text-slate-800/50" stroke-width="1" stroke-dasharray="1 4"
          vector-effect="non-scaling-stroke"
        />

        <!-- Area fill -->
        <path :d="fillPath" :fill="`url(#${gradientId})`" class="text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-300" />

        <!-- Main Smooth Line -->
        <path :d="linePath" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" class="text-gray-700 dark:text-gray-300 pointer-events-none transition-all duration-300" />

        <!-- Hover Crosshair -->
        <g v-if="hoverIndex !== null && hoverPoint" class="pointer-events-none">
          <line :x1="hoverPoint.x" y1="0" :x2="hoverPoint.x" y2="135" stroke="currentColor" class="text-gray-200 dark:text-slate-700/80" stroke-width="1" stroke-dasharray="2 3" vector-effect="non-scaling-stroke" />
        </g>
      </svg>

      <!-- X-Axis Labels (HTML Overlay) -->
      <div class="absolute bottom-0 left-0 right-0 h-4 pointer-events-none z-10" :style="{ left: `${chartLeft}px` }">
        <span v-for="(tl, i) in xAxisLabels" :key="'x'+i"
          class="absolute text-[10px] font-mono font-bold text-gray-500 dark:text-slate-400 bottom-0"
          :style="{ left: `${((tl.x - chartLeft) / (width - chartLeft)) * 100}%`, transform: tl.anchor === 'middle' ? 'translateX(-50%)' : tl.anchor === 'end' ? 'translateX(-100%)' : 'none' }">
          {{ tl.text }}
        </span>
      </div>

      <!-- Latest Point HTML Overlay -->
      <div v-if="hoverIndex === null"
           class="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30"
           :style="{ left: `${((latestPoint.x - chartLeft) / (width - chartLeft)) * (100 - (chartLeft/width*100)) + (chartLeft/width*100)}%`, top: `${(latestPoint.y / 150) * 100}%` }">
        <div class="w-1.5 h-1.5 bg-gray-700 dark:bg-gray-300 rounded-full relative z-10"></div>
        <div class="w-4 h-4 bg-gray-700 dark:bg-gray-300 opacity-20 rounded-full animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <!-- Hover Point HTML Overlay -->
      <div v-if="hoverIndex !== null && hoverPoint"
           class="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-40"
           :style="{ left: `${((hoverPoint.x - chartLeft) / (width - chartLeft)) * (100 - (chartLeft/width*100)) + (chartLeft/width*100)}%`, top: `${(hoverPoint.y / 150) * 100}%` }">
        <div class="w-2 h-2 bg-gray-800 dark:bg-white rounded-full shadow-sm ring-[2.5px] ring-white dark:ring-slate-900"></div>
      </div>

      <!-- Minimalist Tooltip -->
      <div v-if="hoverIndex !== null && hoverPoint"
           class="absolute pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+8px)] bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-slate-700 shadow-sm rounded px-2 py-1 z-50 flex flex-col items-center min-w-max"
           :style="{ left: `${((hoverPoint.x - chartLeft) / (width - chartLeft)) * (100 - (chartLeft/width*100)) + (chartLeft/width*100)}%`, top: `${(hoverPoint.y / 150) * 100}%` }">
        <span class="text-[11px] font-bold tracking-tight">{{ hoverValueFormatted }}<span class="text-[9px] font-medium opacity-50 ml-0.5">{{ unit }}</span></span>
        <span class="text-[8px] font-medium opacity-50">{{ hoverTimeFormatted }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { format } from 'date-fns'

const props = defineProps({
  history: { type: Array, default: () => [] },
  parameter: { type: String, required: true }
})

const containerRef = ref(null)
const hoverIndex = ref(null)

const unit = computed(() => {
  switch (props.parameter) {
    case 'ph': return 'pH'
    case 'tds': return 'ppm'
    case 'turbidity': return 'NTU'
    case 'water_level': return '%'
    default: return ''
  }
})

// Layout constants
const width = 320
const height = 150
const chartLeft = 32  // increased for Y-axis labels
const chartBottom = 130 // moved up slightly to give X-axis labels more room
const chartHeight = chartBottom - 10  // usable chart area

// Dynamic bounds based on actual data with padding
function getFallbackBounds() {
  switch (props.parameter) {
    case 'ph': return { min: 6.0, max: 8.0 }
    case 'tds': return { min: 400, max: 800 }
    case 'turbidity': return { min: 0, max: 15 }
    case 'water_level': return { min: 30, max: 100 }
    default: return { min: 0, max: 100 }
  }
}

const bounds = computed(() => {
  const vals = values.value
  if (vals.length === 0) return getFallbackBounds()
  if (vals.length === 1) {
    const fallback = getFallbackBounds()
    const single = vals[0]
    const basePadding = Math.max((fallback.max - fallback.min) * 0.1, Math.abs(single) * 0.05, 1)
    return { min: single - basePadding, max: single + basePadding }
  }

  const dataMin = Math.min(...vals)
  const dataMax = Math.max(...vals)
  const range = dataMax - dataMin || 1
  const pad = range * 0.1 // 10% padding
  return { min: dataMin - pad, max: dataMax + pad }
})

function getY(value) {
  const { min, max } = bounds.value
  const range = max - min
  const clamped = Math.max(min, Math.min(max, value))
  return 10 + (1 - (clamped - min) / range) * (chartHeight - 10)
}

const rows = computed(() => {
  if (!Array.isArray(props.history)) return []
  if (props.history.length <= 100) return props.history
  const step = props.history.length / 100
  return Array.from({ length: 100 }, (_, i) => props.history[Math.floor(i * step)])
})

const values = computed(() => rows.value.map(r => Number(r?.[props.parameter])).filter(val => !isNaN(val)))
const hasData = computed(() => values.value.length > 0)

const points = computed(() => {
  if (!hasData.value) return []
  const span = Math.max(1, values.value.length - 1)
  const chartWidth = width - chartLeft
  return values.value.map((value, index) => ({
    x: chartLeft + (index / span) * chartWidth,
    y: getY(value),
    pct: index / span,
    val: value,
    row: rows.value[index]
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
  return `${linePath.value} L ${last.x} ${chartBottom} L ${first.x} ${chartBottom} Z`
})

const latestPoint = computed(() => points.value[points.value.length - 1] || { x: chartLeft, y: 10 })
const gradientId = computed(() => `mini-chart-grad-${props.parameter}`)

// Y-axis labels (3 ticks: max, mid, min)
const yAxisLabels = computed(() => {
  const { min, max } = bounds.value
  const mid = (min + max) / 2
  const fmt = (v) => {
    let valStr = ''
    if (Math.abs(v) >= 100) valStr = Math.round(v).toString()
    else {
      // For smaller values, max 1 decimal point if not integer
      const rounded = Math.round(v * 10) / 10
      valStr = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1)
    }
    return `${valStr} ${unit.value}`
  }
  return [
    { y: 10,             text: fmt(max) },
    { y: chartHeight / 2, text: fmt(mid) },
    { y: chartHeight,   text: fmt(min) },
  ]
})

const yLabelX = computed(() => chartLeft - 4)

// X-axis time labels (start, middle, end)
const xAxisLabels = computed(() => {
  const pts = points.value
  if (pts.length === 0) return []
  const fmt = (row) => {
    if (!row?.timestamp) return ''
    return format(new Date(row.timestamp), 'HH:mm')
  }
  if (pts.length === 1) {
    return [
      { x: pts[0].x, text: fmt(pts[0].row), anchor: 'middle' },
    ]
  }
  const first = pts[0]
  const mid = pts[Math.floor(pts.length / 2)]
  const last = pts[pts.length - 1]
  return [
    { x: first.x, text: fmt(first.row), anchor: 'start' },
    { x: mid.x,   text: fmt(mid.row),   anchor: 'middle' },
    { x: last.x,  text: fmt(last.row),  anchor: 'end' },
  ]
})

function formatValue(value) {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value) >= 100) return Math.round(value).toString()
  return value.toFixed(2)
}

function onMouseMove(e) {
  if (!hasData.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  let x = e.clientX - rect.left
  x = Math.max(0, Math.min(x, rect.width))
  const pct = x / rect.width
  const idx = Math.round(pct * (points.value.length - 1))
  hoverIndex.value = Math.max(0, Math.min(idx, points.value.length - 1))
}

function onTouch(e) {
  if (e.touches.length > 0) {
    const rect = containerRef.value.getBoundingClientRect()
    let x = e.touches[0].clientX - rect.left
    x = Math.max(0, Math.min(x, rect.width))
    const pct = x / rect.width
    const idx = Math.round(pct * (points.value.length - 1))
    hoverIndex.value = Math.max(0, Math.min(idx, points.value.length - 1))
  }
}

function onMouseLeave() {
  hoverIndex.value = null
}

const hoverPoint = computed(() => {
  if (hoverIndex.value === null || !points.value[hoverIndex.value]) return null
  return points.value[hoverIndex.value]
})

const hoverValueFormatted = computed(() => hoverPoint.value ? formatValue(hoverPoint.value.val) : '')
const hoverTimeFormatted = computed(() => {
  if (!hoverPoint.value || !hoverPoint.value.row.timestamp) return ''
  return format(new Date(hoverPoint.value.row.timestamp), 'HH:mm:ss')
})
</script>
