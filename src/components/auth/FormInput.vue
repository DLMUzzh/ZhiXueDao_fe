<template>
  <div class="form-input" :class="{ 'form-input--error': !!errorMsg, 'form-input--disabled': disabled }">
    <div class="form-input__wrapper" :class="{ 'form-input--focused': focused }">
      <!-- 左侧图标 -->
      <span v-if="$slots.leftIcon" class="form-input__icon form-input__icon--left">
        <slot name="leftIcon" />
      </span>

      <input
        ref="inputRef"
        :type="computedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :inputmode="inputmode"
        class="form-input__field"
        @input="onInput"
        @focus="focused = true"
        @blur="onBlur"
        @keydown.enter="$emit('enter')"
      />

      <!-- 右侧图标 (密码眼睛 / 自定义) -->
      <button
        v-if="showToggle"
        type="button"
        class="form-input__icon form-input__icon--right form-input__toggle"
        tabindex="-1"
        @click="toggleVisible"
      >
        <!-- Eye Open -->
        <svg v-if="!passwordVisible" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <!-- Eye Off -->
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      </button>

      <span v-if="$slots.rightIcon" class="form-input__icon form-input__icon--right">
        <slot name="rightIcon" />
      </span>
    </div>

    <!-- 错误提示 -->
    <p v-if="errorMsg" class="form-input__error">{{ errorMsg }}</p>

    <!-- 帮助提示 -->
    <p v-if="hint && !errorMsg" class="form-input__hint">
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
import { ref, computed } from 'vue'

type InputMode = 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'

interface Props {
  modelValue: string
  placeholder?: string
  type?: HTMLInputElement['type']
  disabled?: boolean
  maxlength?: number
  inputmode?: InputMode
  errorMsg?: string
  hint?: string
  showToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  type: 'text',
  disabled: false,
  maxlength: undefined,
  inputmode: undefined,
  errorMsg: '',
  hint: '',
  showToggle: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
  (e: 'enter'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const passwordVisible = ref(false)

const computedType = computed(() => {
  if (props.showToggle) {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function onBlur() {
  focused.value = false
  emit('blur')
}

function toggleVisible() {
  passwordVisible.value = !passwordVisible.value
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.form-input {
  width: 100%;
}

.form-input__wrapper {
  display: flex;
  align-items: center;
  height: 48px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 0 14px;
  transition: border-color 200ms ease, box-shadow 200ms ease;
  gap: 10px;
}

.form-input--focused .form-input__wrapper,
.form-input__wrapper:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.form-input--error .form-input__wrapper {
  border-color: var(--error);
  box-shadow: 0 0 0 3px var(--error-bg);
}

.form-input--disabled .form-input__wrapper {
  opacity: 0.6;
  pointer-events: none;
  background: var(--gray-50);
}

.form-input__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  flex-shrink: 0;
}

.form-input__field {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--gray-900);
  min-width: 0;
}

.form-input__field::placeholder {
  color: var(--gray-400);
}

.form-input__field:disabled {
  color: var(--gray-500);
}

.form-input__toggle {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 150ms ease;
}

.form-input__toggle:hover {
  background: var(--gray-100);
}

.form-input__error {
  margin-top: 6px;
  font-size: 12px;
  color: var(--error);
  line-height: 1.4;
}

.form-input__hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--gray-500);
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
