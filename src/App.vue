<template>
  <!-- Toast 容器 -->
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="['toast', `toast--${t.type}`]"
      >
        <span>{{ t.message }}</span>
        <button class="toast__close" @click="removeToast(t.id)">&times;</button>
      </div>
    </TransitionGroup>
  </div>

  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useToast } from './composables/useToast'

const { toasts, remove: removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  min-width: 280px;
  max-width: 420px;
}

.toast--success {
  background: var(--success-bg);
  color: var(--accent-700);
  border: 1px solid var(--accent-100);
}

.toast--error {
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid #FECACA;
}

.toast--warning {
  background: var(--warning-bg);
  color: #B45309;
  border: 1px solid #FED7AA;
}

.toast--info {
  background: var(--info-bg);
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
}

.toast__close {
  margin-left: auto;
  font-size: 18px;
  line-height: 1;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.toast__close:hover {
  opacity: 1;
}

/* Toast 动画 */
.toast-enter-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 200ms ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
