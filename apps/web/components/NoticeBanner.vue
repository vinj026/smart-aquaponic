<template>
  <div class="notice-banner surface-card" :class="severityClass" role="status" aria-live="polite">
    <div class="notice-icon" aria-hidden="true">
      <IconStatus :kind="normalizedSeverity" />
    </div>

    <p class="type-subhead notice-text">
      {{ text }}
    </p>
  </div>
</template>

<script setup>
import IconStatus from '~/components/icons/IconStatus.vue'

const props = defineProps({
  severity: { type: String, default: '' },
  text: { type: String, required: true },
})

const normalizedSeverity = computed(() => {
  if (props.severity === 'danger') return 'danger'
  if (props.severity === 'warning') return 'warning'
  if (props.severity === 'normal') return 'normal'
  return 'default'
})

const severityClass = computed(() => `is-${normalizedSeverity.value}`)
</script>

<style scoped>
.notice-banner {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-left: 4px solid var(--color-accent);
  border-radius: var(--radius-md);
  color: var(--color-accent);
  background: var(--color-accent-light);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.notice-icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  place-items: center;
  animation: icon-pop 0.35s ease-out both;
}

.notice-text {
  margin: 0;
  color: currentColor;
  font-weight: 600;
}

.notice-banner.is-normal {
  color: var(--color-success);
  border-left-color: var(--color-success);
  background: var(--color-success-bg);
}

.notice-banner.is-warning {
  color: var(--color-warning);
  border-left-color: var(--color-warning);
  background: var(--color-warning-bg);
}

.notice-banner.is-danger {
  color: var(--color-danger);
  border-left-color: var(--color-danger);
  background: var(--color-danger-bg);
}

@keyframes icon-pop {
  from {
    opacity: 0;
    transform: scale(0.72);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
