<template>
  <div class="step-indicator">
    <!-- 步骤 1 -->
    <div class="step" :class="stepClass(1)">
      <div class="step__circle">
        <svg v-if="current > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span v-else>1</span>
      </div>
      <span class="step__label">验证身份</span>
    </div>

    <!-- 连接线 -->
    <div class="step__line">
      <div class="step__line-fill" :style="{ width: current >= 2 ? '100%' : '0%' }"></div>
    </div>

    <!-- 步骤 2 -->
    <div class="step" :class="stepClass(2)">
      <div class="step__circle">
        <svg v-if="current > 2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span v-else>2</span>
      </div>
      <span class="step__label">设置密码</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  current: number
}

const props = defineProps<Props>()

function stepClass(n: number) {
  if (props.current > n) return 'step--done'
  if (props.current === n) return 'step--active'
  return 'step--pending'
}
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step__circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 250ms ease;
}

.step--active .step__circle {
  background: var(--primary-500);
  color: #fff;
  box-shadow: 0 0 0 4px var(--primary-50);
}

.step--done .step__circle {
  background: var(--primary-500);
  color: #fff;
}

.step--pending .step__circle {
  background: #fff;
  border: 2px solid var(--gray-300);
  color: var(--gray-500);
}

.step__label {
  font-size: 12px;
  white-space: nowrap;
}

.step--active .step__label {
  color: var(--primary-500);
  font-weight: 500;
}

.step--done .step__label {
  color: var(--primary-500);
}

.step--pending .step__label {
  color: var(--gray-500);
}

.step__line {
  flex: 1;
  height: 2px;
  background: var(--gray-200);
  margin: 0 12px;
  margin-bottom: 22px;
  border-radius: 1px;
  overflow: hidden;
}

.step__line-fill {
  height: 100%;
  background: var(--primary-500);
  transition: width 400ms ease;
}
</style>
