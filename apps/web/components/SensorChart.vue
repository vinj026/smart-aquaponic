<template>
  <article class="chart-card surface-card">
    <div class="chart-heading">
      <div class="chart-heading-copy">
        <h3 class="type-title-2 chart-title">{{ title }}</h3>
        <div v-if="subtitle" class="type-caption chart-subtitle">{{ subtitle }}</div>
      </div>
      <div v-if="unit" class="type-caption chart-unit">{{ unit }}</div>
    </div>

    <div v-if="!hasData" class="type-subhead chart-empty">No data yet</div>
    <div v-else class="chart-frame" :key="parameter">
      <svg class="line-chart" viewBox="0 0 360 240" role="img" :aria-label="`${title} line chart`">
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0" />
          </linearGradient>
        </defs>

        <g class="grid-lines">
          <line v-for="x in verticalGrid" :key="`x-${x}`" :x1="x" y1="24" :x2="x" y2="190" />
          <line v-for="y in horizontalGrid" :key="`y-${y}`" x1="42" :y1="y" x2="336" :y2="y" />
        </g>

        <path class="area-fill" :d="fillPath" :fill="`url(#${gradientId})`" />
        <path class="chart-line" :d="linePath" pathLength="1" />

        <circle class="latest-dot" :cx="latestPoint.x" :cy="latestPoint.y" r="8" />
        <circle class="latest-pulse" :cx="latestPoint.x" :cy="latestPoint.y" r="8" />

        <g class="axis-labels">
          <text x="10" y="32">{{ maxLabel }}</text>
          <text x="10" y="190">{{ minLabel }}</text>
          <text
            v-for="label in xLabels"
            :key="label.text"
            :x="label.x"
            y="226"
            text-anchor="middle"
          >
            {{ label.text }}
          </text>
        </g>
      </svg>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  history: { type: Array, default: () => [] },
  parameter: { type: String, required: true },
  unit: { type: String, default: '' },
})

const width = 360
const height = 240
const pad = { top: 24, right: 24, bottom: 50, left: 42 }
const chartWidth = width - pad.left - pad.right
const chartHeight = height - pad.top - pad.bottom

const rows = computed(() => Array.isArray(props.history) ? props.history.slice(-20) : [])
const values = computed(() => rows.value.map((r) => Number(r?.[props.parameter])).filter(Number.isFinite))
const hasData = computed(() => values.value.length > 1)

const minValue = computed(() => Math.min(...values.value))
const maxValue = computed(() => Math.max(...values.value))
const domain = computed(() => {
  const min = minValue.value
  const max = maxValue.value
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 }
  if (min === max) {
    const defaultMin = Math.max(0, min - 1)
    return { min: defaultMin, max: max + 1 }
  }
  const padValue = (max - min) * 0.16
  const computedMin = min - padValue
  return { min: Math.max(0, computedMin), max: max + padValue }
})

const points = computed(() => {
  const span = Math.max(1, values.value.length - 1)
  const range = domain.value.max - domain.value.min
  return values.value.map((value, index) => ({
    x: pad.left + (index / span) * chartWidth,
    y: pad.top + (1 - (value - domain.value.min) / range) * chartHeight,
    value,
    row: rows.value[index],
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
  return `${linePath.value} L ${last.x} ${pad.top + chartHeight} L ${first.x} ${pad.top + chartHeight} Z`
})

const latestPoint = computed(() => points.value[points.value.length - 1] || { x: pad.left, y: pad.top })
const verticalGrid = computed(() => [pad.left, pad.left + chartWidth / 3, pad.left + (chartWidth / 3) * 2, pad.left + chartWidth])
const horizontalGrid = computed(() => [pad.top, pad.top + chartHeight / 2, pad.top + chartHeight])
const gradientId = computed(() => `chart-gradient-${props.parameter}`)

const minLabel = computed(() => formatValue(domain.value.min))
const maxLabel = computed(() => formatValue(domain.value.max))

const xLabels = computed(() => {
  const pts = points.value
  if (!pts.length) return []
  const indexes = [0, Math.floor((pts.length - 1) * 0.33), Math.floor((pts.length - 1) * 0.66), pts.length - 1]
  const uniqueLabels = []
  const seenTexts = new Set()
  
  for (const index of [...new Set(indexes)]) {
    const text = formatTime(pts[index].row?.timestamp)
    if (!seenTexts.has(text)) {
      seenTexts.add(text)
      uniqueLabels.push({ x: pts[index].x, text })
    }
  }
  
  return uniqueLabels
})

function formatValue(value) {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value) >= 100) return Math.round(value).toString()
  return value.toFixed(1)
}

function formatTime(ts) {
  if (!ts) return '--:--'
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.chart-card {
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  background: #ffffff;
  border: 1px solid var(--color-border, #eaeaea);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.chart-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.chart-title,
.chart-subtitle {
  margin: 0;
}

.chart-title {
  color: var(--color-ink);
}

.chart-subtitle,
.chart-unit,
.chart-empty {
  color: var(--color-ink-tertiary);
}

.chart-subtitle {
  margin-top: var(--space-xxs);
}

.chart-frame {
  min-height: 320px;
  margin-top: var(--space-md);
  animation: chart-fade 0.24s ease-out both;
}

.line-chart {
  width: 100%;
  height: 320px;
  overflow: visible;
}

.grid-lines line {
  stroke: rgba(0, 0, 0, 0.05);
  stroke-width: 1;
}

.area-fill {
  opacity: 1;
}

.chart-line {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: line-draw 0.6s ease-out both;
}

.latest-dot {
  fill: rgba(255, 255, 255, 0.92);
  stroke: var(--color-accent);
  stroke-width: 2;
}

.latest-pulse {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2;
  transform-origin: center;
  animation: pulse-dot 1.8s ease-out infinite;
}

.axis-labels {
  fill: var(--color-ink-quaternary);
  font-size: 12px;
  font-weight: 400;
}

.chart-empty {
  padding: var(--space-section) 0;
  text-align: center;
}

@keyframes line-draw {
  from {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }

  to {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
  }
}

@keyframes pulse-dot {
  0% {
    opacity: 0.65;
    transform: scale(1);
  }

  80%,
  100% {
    opacity: 0;
    transform: scale(2.3);
  }
}

@keyframes chart-fade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
