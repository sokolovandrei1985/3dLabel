<template>
  <a-card size="small" class="section-card">
    <div class="prop-grid">
      <span>Цвет заливки</span>
      <ColorPicker v-model="fill" :formats="['hex']" :disableAlpha="true" />

      <span>Толщина границы</span>
      <a-input-number
        v-model:value="strokeWidth"
        :min="0"
        :max="20"
        addon-after="px"
      />

      <span>Цвет границы</span>
      <ColorPicker v-model="stroke" :disabled="borderDisabled" :formats="['hex']" :disableAlpha="true"/>

      <span>Тип линии границы</span>
      <a-select v-model:value="strokeStyle" :disabled="borderDisabled">
        <a-select-option v-for="lt in LineTypes" :key="lt.key" :value="lt.key">
          {{ lt.title }}
        </a-select-option>
      </a-select>

      <span>Скругление углов</span>
      <a-input-number
        v-model:value="borderRadius"
        :min="0"
        :max="100"
        addon-after="px"
      />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'
import ColorPicker from './ColorPicker.vue'
import { LineTypes } from './constants'

const emit = defineEmits([
  'update'
])

const update = (field: string, value: number): void => {
  emit('update', { [field]: value })
}

const store = useFabricStore()
const { activeObject } = storeToRefs(store)

const fill = computed({
  get: () => activeObject.value?.fill,
  set: (value) => update('fill', value)
})

const stroke = computed({
  get: () => activeObject.value?.stroke,
  set: (value) => update('stroke', value)
})

const strokeWidth = computed({
  get: () => activeObject.value?.strokeWidth,
  set: (value) => update('strokeWidth', value)
})

const strokeStyle = computed({
  get: () => activeObject.value?.strokeStyle,
  set: (value) => update('strokeDashArray', LineTypes[value]?.value || null)
})

const borderRadius = computed({
  get: () => activeObject.value?.strokeRadius,
  set: (value) => update('strokeRadius', value)
})

const borderDisabled = computed(() => (!activeObject.value?.strokeWidth))
</script>

<style scoped>
.prop-grid {
  display: grid;
  align-items: center;
  grid-template-columns: 2fr 3fr;
  column-gap: 8px;
  row-gap: 8px;
}
</style>