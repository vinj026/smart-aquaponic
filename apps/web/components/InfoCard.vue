<template>
  <article class="info-card surface-card">
    <div class="info-copy">
      <p class="type-caption info-label">{{ label }}</p>
      <h2 class="type-title-1 info-title">{{ value }}</h2>
      <p class="type-subhead info-subtitle">{{ title }}</p>
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" :style="{ width: `${normalizedProgress}%` }" />
      </div>
    </div>

    <div class="info-art" aria-hidden="true">
      <slot name="icon" />
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  title: { type: String, required: true },
  value: { type: String, required: true },
  progress: { type: [Number, String], default: 0 },
})

const normalizedProgress = computed(() => {
  const n = Number(props.progress)
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, n))
})
</script>

<style scoped>
.info-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 140px;
  overflow: hidden;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: #ffffff;
  border: 1px solid var(--color-border, #eaeaea);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.info-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.info-label,
.info-subtitle {
  color: var(--color-ink-secondary);
}

.info-label,
.info-title,
.info-subtitle {
  margin: 0;
}

.info-title {
  margin-top: var(--space-xxs);
  color: var(--color-ink);
  font-size: 34px;
  line-height: 1;
  letter-spacing: -0.5px;
}

.info-subtitle {
  margin-top: var(--space-xxs);
}

.info-art {
  display: grid;
  position: absolute;
  right: -10px;
  bottom: -12px;
  width: 112px;
  height: 112px;
  flex: 0 0 auto;
  place-items: center;
  color: var(--color-accent);
  opacity: 0.18;
  transform: rotate(-8deg) scale(2.2);
}

.progress-track {
  width: 100%;
  height: 4px;
  margin-top: var(--space-md);
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: rgba(0, 0, 0, 0.05);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--color-accent);
}
</style>
