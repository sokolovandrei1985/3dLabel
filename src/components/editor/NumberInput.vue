<template>
  <a-input-number
    v-model:value="localValue"
    :addon-before="addonBefore"
    :addon-after="addonAfter"
    :placeholder="placeholder"
    :controls="controls"
    :min="min"
    :max="max"
    :step="step"
    :status="status"
    @pressEnter="emitChange"
    @keydown="handleKeyDown"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface InputProps {
  value: string | number
  addonBefore?: string
  addonAfter?: string
  placeholder?: string
  controls?: boolean
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<InputProps>(), {
  value: undefined,
  addonBefore: undefined,
  addonAfter: undefined,
  placeholder: undefined,
  controls: true,
  min: undefined,
  max: undefined,
  step: undefined
})

interface Emits {
  (e: 'change', value: any): void
}
const emit = defineEmits<Emits>()

const localValue = ref(props.value)
const status = computed(() => (localValue.value === props.value ? '' : 'warning'))

// Синхронизация при изменении в хранилище
watch(() => props.value, (newVal) => {
  if (localValue.value !== newVal) {
    localValue.value = newVal
  }
})

const emitChange = () => {
  console.log(localValue.value, props.value)
  if (localValue.value !== props.value) {
    emit('change', localValue.value)
  }
}

const handleKeyDown = (event: any) => {
  if (event.key === 'Escape') {
    localValue.value = props.value
  }
}
</script>