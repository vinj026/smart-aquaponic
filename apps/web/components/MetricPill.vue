<template>
  <article class="metric-item surface-card" :class="statusClass">
    <div class="metric-topline">
      <div class="metric-icon" aria-hidden="true">
        <slot name="icon" />
      </div>
    </div>

    <div class="metric-copy">
      <p class="metric-label">{{ label }}</p>
      <div class="metric-value-row" aria-live="polite">
        <div class="metric-value mono-number">
          <span v-if="value == null">—</span>
          <span v-else>{{ value }}</span>
        </div>
        <div v-if="unit" class="type-subhead metric-unit">{{ unit }}</div>
      </div>
      <div v-if="statusText" class="metric-status">
        {{ statusText }}
      </div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String, null], default: null },
  unit: { type: String, default: '' },
  status: { type: String, default: '' },
  statusText: { type: String, default: '' },
})

const statusClass = computed(() => {
  if (props.status === 'danger') return 'is-danger'
  if (props.status === 'warning') return 'is-warning'
  if (props.status === 'normal') return 'is-normal'
  return ''
})
</script>

<style scoped>
.metric-item {
  display: flex;
  min-height: 174px;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-xl);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  background: white;
  border: 1px solid var(--color-border, #eaeaea);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.metric-icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: var(--radius-md);
  color: var(--color-accent);
  background: var(--color-accent-bg, #f3f4f6);
}

.metric-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
}

.metric-copy {
  min-width: 0;
}

.metric-label {
  margin: 0;
  color: var(--color-ink-secondary);
  font-size: var(--type-caption-size);
  font-weight: 500;
  line-height: var(--type-caption-line);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-xxs);
  margin-top: var(--space-xxs);
  margin-bottom: 6px;
}

.metric-value {
  color: var(--color-ink);
  font-size: 44px;
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}

.metric-unit {
  color: var(--color-ink-tertiary);
  font-size: 14px;
  font-weight: 500;
}

.metric-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  color: var(--color-ink-secondary);
  background: var(--color-surface, #f9fafb);
  font-size: var(--type-footnote-size);
  font-weight: 500;
  line-height: 1.2;
}

.metric-item.is-normal .metric-icon {
  color: var(--color-success);
  background: var(--color-success-bg, #ecfdf5);
}

.metric-item.is-warning .metric-icon {
  color: var(--color-warning);
  background: var(--color-warning-bg, #fffbeb);
}

.metric-item.is-danger .metric-icon {
  color: var(--color-danger);
  background: var(--color-danger-bg, #fef2f2);
}

.metric-item.is-normal .metric-status {
  color: var(--color-success);
  background: var(--color-success-bg, #ecfdf5);
}

.metric-item.is-warning .metric-status {
  color: var(--color-warning);
  background: var(--color-warning-bg, #fffbeb);
}

.metric-item.is-danger .metric-status {
  color: var(--color-danger);
  background: var(--color-danger-bg, #fef2f2);
}
</style>
