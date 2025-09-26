<template>
  <div class="color-picker">
    <a-input :value="color" placeholder="#000000" @change="changeInput" />
    <a-popover v-model:open="visibleEditor" :overlayInnerStyle="{ padding: 0 }" placement="right" trigger="click">
      <template #content>
        <ChromePicker :modelValue="color" @update:modelValue="changeInput" />
      </template>
      <div class="color-picker-button">
        <div class="color-picker-button-fill" :style="{ backgroundColor: color }" />
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed, defineProps, defineModel } from 'vue'
import { ChromePicker } from 'vue-color'

const visibleEditor = ref<boolean>(false)

/*const props = defineProps({
  color: String
})

const emit = defineEmits([
  'change'
])*/

const color = defineModel()

const changeInput = (val: string): void => {
  //emit('change', val)
  color.value = val
}

</script>

<style scoped>
.color-picker {
  display: flex;
  gap: 8px;
}

.color-picker-button {
  position: relative;
  width: 100px;
  height: 23px;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #d9d9d9;
  transition: all 0.2s;
}
.color-picker-button:hover {
  border-color: #4096ff;
}

.color-picker-button-fill {
  position: absolute;
  left: 3px;
  top: 3px;
  bottom: 3px;
  right: 3px;
}
</style>