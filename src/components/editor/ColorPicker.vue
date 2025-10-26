<template>
  <div class="color-picker" :class="{ disabled: props.disabled }">
    <a-input
      v-show="!hideInput"
      :value="inputValue"
      class="color-picker-input"
      :disabled="props.disabled"
      placeholder="#000000"
      @change="changeInput"
      @keyup.enter="handleConfirm"
      @blur="handleConfirm" />
    <a-popover v-model:open="visibleEditor" :overlayInnerStyle="{ padding: 0 }" placement="right" :trigger="props.disabled ? '' : 'click'">
      <template #content>
        <ChromePicker :modelValue="color" :disableAlpha="props.disableAlpha" :formats="props.formats" @update:modelValue="changePicker" />
      </template>
      <div class="color-picker-button" :class="{ disabled: props.disabled }">
        <div class="color-picker-button-fill" :style="{ backgroundColor: color }" />
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChromePicker } from 'vue-color'

type Format = 'rgb' | 'hex' | 'hsl'

interface ColorPickerProps {
  disableAlpha?: boolean
  formats?: Format[]
  disabled?: boolean
  hideInput?: boolean
}

const props = withDefaults(defineProps<ColorPickerProps>(), {
  disableAlpha: false,
  formats: () => ['rgb', 'hex', 'hsl'],
  disabled: false,
  hideInput: false
});

const visibleEditor = ref<boolean>(false)

const color = defineModel<string>()
const inputValue = ref<string | undefined>(color.value)

const changeInput = (event: Event): void => {
  //emit('change', val)
  const target = event?.target as HTMLInputElement
  inputValue.value = target?.value
}

const changePicker = (val: string): void => {
  //emit('change', val)
  inputValue.value = val
  color.value = val
}

const handleConfirm = (): void => {
  color.value = inputValue.value
}

</script>

<style scoped>
.color-picker {
  display: flex;
  gap: 8px;
}

.color-picker.disabled {
  cursor: not-allowed;
}

.color-picker-input,
.color-picker-button {
  flex: 1 1 50%;
}

.color-picker-button {
  position: relative;
  height: 23px;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #d9d9d9;
  transition: all 0.2s;
}
.color-picker-button:hover:not(.disabled) {
  border-color: #4096ff;
}
.color-picker-button.disabled {
  background-color: #d9d9d9;
}

.color-picker-button-fill {
  position: absolute;
  left: 3px;
  top: 3px;
  bottom: 3px;
  right: 3px;
}
</style>