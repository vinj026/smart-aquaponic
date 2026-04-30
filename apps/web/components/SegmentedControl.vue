<template>
  <div
    class="segmented-control"
    role="tablist"
    aria-label="Chart parameter"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="segment-button pressable"
      :class="{ 'is-active': opt.value === modelValue }"
      role="tab"
      :aria-selected="opt.value === modelValue"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.segmented-control {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 2px;
  border-radius: var(--radius-pill);
  background: var(--color-canvas-secondary, #f5f5f5);
  border: 1px solid var(--color-border, #e5e5e5);
}

.segment-button {
  min-width: 76px;
  min-height: 36px;
  padding: 0 var(--space-sm);
  border: 0;
  border-radius: var(--radius-pill);
  color: var(--color-ink-tertiary);
  background: transparent;
  cursor: pointer;
  font-size: var(--type-body-size);
  font-weight: 400;
  line-height: var(--type-body-line);
  letter-spacing: var(--type-body-tracking);
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.segment-button.is-active {
  color: var(--color-ink);
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-weight: 600;
}
</style>
