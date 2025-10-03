<template>
  <a-card size="small" class="section-card">
    <div class="shadow-buttons">
      <a-button class="shadow-button" :disabled="hasShadow" @click="addShadow">Добавить тень</a-button>
      <a-button class="shadow-button" :disabled="!hasShadow" danger @click="removeShadow">Удалить тень</a-button>
    </div>

    <div class="prop-grid">
      <span>Размытие тени</span>
      <div class="shadow-inputs">
        <a-slider
          v-model:value="blur"
          :disabled="!hasShadow"
          :min="0"
          :max="50"
          :step="1"
          class="shadow-input value-slider"
        />
        <a-input-number
          v-model:value="blur"
          addon-after="px"
          :controls="false"
          :disabled="!hasShadow"
          :min="0"
          :max="50"
          :step="1"
          class="shadow-input"
        />
      </div>

      <span>Смещение по горизонтали</span>
      <div class="shadow-inputs">
        <a-slider
          v-model:value="offsetX"
          :disabled="!hasShadow"
          :min="-50"
          :max="50"
          :step="1"
          class="shadow-input value-slider"
        />
        <a-input-number
          v-model:value="offsetX"
          addon-after="px"
          :controls="false"
          :disabled="!hasShadow"
          :min="-50"
          :max="50"
          :step="1"
          class="shadow-input"
        />
      </div>

      <span>Смещение по вертикали</span>
      <div class="shadow-inputs">
        <a-slider
          v-model:value="offsetY"
          :disabled="!hasShadow"
          :min="-50"
          :max="50"
          :step="1"
          class="shadow-input value-slider"
        />
        <a-input-number
          v-model:value="offsetY"
          addon-after="px"
          :controls="false"
          :disabled="!hasShadow"
          :min="-50"
          :max="50"
          :step="1"
          class="shadow-input"
        />
      </div>

      <span>Цвет тени</span>
      <ColorPicker v-model="color" :disabled="!hasShadow" :formats="['rgb']" hideInput />
    </div>
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

const update = (field: string | null, value?: number | string | undefined | null): void => {
  if (field) {
    emit('update', { shadow: { [field]: value } })
  } else {
    emit('update', { shadow: null })
  }
}

const store = useFabricStore()
const { activeObject } = storeToRefs(store)
const shadow = computed(() => activeObject.value?.shadow)
const hasShadow = computed(() => !!shadow.value)

const addShadow = ():void => {
  update('blur', 5)
}

const removeShadow = ():void => {
  update(null)
}

const blur = computed({
  get: () => shadow.value?.blur || 0,
  set: (value) => update('blur', value)
})

const offsetX = computed({
  get: () => shadow.value?.offsetX || 0,
  set: (value) => update('offsetX', value)
})

const offsetY = computed({
  get: () => shadow.value?.offsetY || 0,
  set: (value) => update('offsetY', value)
})

const color = computed({
  get: () => shadow.value?.color || '#000000',
  set: (value) => update('color', value)
})
</script>

<style scoped>
.prop-grid {
  display: grid;
  align-items: center;
  grid-template-columns: 2fr 3fr;
  column-gap: 8px;
  row-gap: 8px;
}

.shadow-buttons,
.shadow-inputs {
  display: flex;
  gap: 8px;
}

.shadow-button,
.shadow-input {
  flex: 1;
}

.value-slider {
  margin: 6px 0;
}

.value-slider:deep(.ant-slider-track) {
  background-color: unset !important;
}

.shadow-buttons {
  margin-bottom: 8px;
}
</style>