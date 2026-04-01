<template>
  <Transition name="banner">
    <div v-if="visible" :class="['alert-banner', `alert-banner--${type}`]">
      <span class="alert-banner__text">
        <slot />
      </span>
      <button v-if="closable" class="alert-banner__close" @click="$emit('close')">&times;</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  type?: 'success' | 'error' | 'info'
  closable?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'error',
  closable: true,
})

defineEmits<{ (e: 'close'): void }>()
</script>

<style scoped>
.alert-banner {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.alert-banner--error {
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid #FECACA;
}

.alert-banner--success {
  background: var(--success-bg);
  color: var(--accent-700);
  border: 1px solid var(--accent-100);
}

.alert-banner--info {
  background: var(--info-bg);
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
}

.alert-banner__text {
  flex: 1;
}

.alert-banner__close {
  font-size: 18px;
  line-height: 1;
  margin-left: 12px;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.alert-banner__close:hover {
  opacity: 1;
}

/* 动画 */
.banner-enter-active {
  transition: all 250ms ease-out;
}

.banner-leave-active {
  transition: all 200ms ease-in;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
