<template>
  <div class="code-input">
    <div class="code-input__row">
      <!-- 验证码输入 -->
      <div class="code-input__field-wrapper" :class="{ 'code-input__field-wrapper--error': !!errorMsg, 'code-input__field-wrapper--focused': focused }">
        <span class="code-input__icon">
          <!-- ShieldCheck -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </span>
        <input
          type="text"
          inputmode="numeric"
          maxlength="6"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          class="code-input__field"
          @input="onInput"
          @focus="focused = true"
          @blur="focused = false"
          @keydown.enter="$emit('enter')"
        />
      </div>

      <!-- 获取验证码按钮 -->
      <button
        type="button"
        class="code-input__btn"
        :disabled="btnDisabled || isCounting || isSending"
        @click="$emit('send')"
      >
        <svg
          v-if="isSending"
          class="code-input__spinner"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <template v-else-if="isCounting">
          重新发送({{ remaining }}s)
        </template>
        <template v-else>
          获取验证码
        </template>
      </button>
    </div>

    <!-- 错误提示 -->
    <p v-if="errorMsg" class="code-input__error">{{ errorMsg }}</p>

    <!-- 帮助提示 -->
    <p v-if="hint && !errorMsg" class="code-input__hint">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  btnDisabled?: boolean
  isCounting?: boolean
  remaining?: number
  isSending?: boolean
  errorMsg?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: '请输入 6 位验证码',
  disabled: false,
  btnDisabled: false,
  isCounting: false,
  remaining: 0,
  isSending: false,
  errorMsg: '',
  hint: '验证码将发送到您的手机，5 分钟内有效',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'enter'): void
}>()

const focused = ref(false)

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6)
  emit('update:modelValue', val)
}
</script>

<style scoped>
.code-input__row {
  display: flex;
  gap: 12px;
}

.code-input__field-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  height: 48px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 0 14px;
  gap: 10px;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.code-input__field-wrapper--focused {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.code-input__field-wrapper--error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px var(--error-bg);
}

.code-input__icon {
  color: var(--gray-400);
  display: flex;
  flex-shrink: 0;
}

.code-input__field {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--gray-900);
  letter-spacing: 4px;
  min-width: 0;
}

.code-input__field::placeholder {
  color: var(--gray-400);
  letter-spacing: 0;
}

.code-input__btn {
  min-width: 128px;
  height: 48px;
  padding: 0 16px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  color: var(--gray-700);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.code-input__btn:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.code-input__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  color: var(--gray-500);
}

.code-input__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.code-input__error {
  margin-top: 6px;
  font-size: 12px;
  color: var(--error);
}

.code-input__hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
