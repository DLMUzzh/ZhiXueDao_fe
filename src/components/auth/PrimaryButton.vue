<template>
  <button
    class="primary-btn"
    :class="{ 'primary-btn--loading': loading }"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <svg
      v-if="loading"
      class="primary-btn__spinner"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    <span>{{ loading ? loadingText : text }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  text: string
  loadingText?: string
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  loadingText: '处理中…',
  loading: false,
  disabled: false,
})

defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped>
.primary-btn {
  width: 100%;
  height: 48px;
  background: var(--primary-500);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 2px;
}

.primary-btn:hover:not(:disabled) {
  background: var(--primary-600);
}

.primary-btn:active:not(:disabled) {
  background: var(--primary-700);
  transform: scale(0.99);
}

.primary-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-200);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-btn--loading {
  pointer-events: none;
}

.primary-btn__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
