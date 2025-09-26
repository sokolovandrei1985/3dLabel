<template>
  <a-card size="small" class="section-card">
    <a-form-item label="Цвет заливки">
      <ColorPicker v-model="fill" />
    </a-form-item>

    <a-form-item label="Цвет границы">
      <ColorPicker v-model="stroke" />
    </a-form-item>

    <a-form-item label="Толщина границы">
      <a-input-number
        v-model:value="borderWidth"
        :min="0"
        :max="20"
        addon-after="px"
      />
    </a-form-item>

    <a-form-item label="Тип линии">
      <a-select v-model:value="borderStyle">
        <a-select-option value="solid">Solid</a-select-option>
        <a-select-option value="dashed">Dashed</a-select-option>
        <a-select-option value="dotted">Dotted</a-select-option>
        <a-select-option value="double">Double</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Скругление углов">
      <a-input-number
        v-model:value="borderRadius"
        :min="0"
        :max="100"
        addon-after="px"
      />
    </a-form-item>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'
import ColorPicker from './ColorPicker.vue'

const emit = defineEmits([
  'update'
])

const update = (field: string, value: number): void => {
  emit('update', { [field]: value })
}

const store = useFabricStore()
const { activeObject } = storeToRefs(store)

const fill = computed({
  get: () => activeObject.value.fill,
  set: (value) => update('fill', value)
})

const stroke = computed({
  get: () => activeObject.value.stroke,
  set: (value) => update('stroke', value)
})

const borderWidth = computed({
  get: () => activeObject.value.borderWidth,
  set: (value) => emit('update:borderWidth', value)
})

const borderStyle = computed({
  get: () => activeObject.value.borderStyle,
  set: (value) => emit('update:borderStyle', value)
})

const borderRadius = computed({
  get: () => activeObject.value.borderRadius,
  set: (value) => emit('update:borderRadius', value)
})
</script>