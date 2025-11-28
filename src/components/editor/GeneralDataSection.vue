<template>
  <a-card size="small" class="section-card">
    <div class="prop-grid">

      <span>Координаты</span>
      <div class="coordinate-inputs">
        <NumberInput
          :value="left"
          addon-before="X"
          placeholder="X"
          :controls="false"
          :min="0"
          :max="canvasSize?.width || Infinity"
          class="coord-input"
          @change="(value) => update('left', value ?? 0)"
        />
        <NumberInput
          v-model:value="top"
          addon-before="Y"
          placeholder="Y"
          :controls="false"
          :min="0"
          :max="canvasSize?.height || Infinity"
          class="coord-input"
          @change="(value) => update('top', value ?? 0)"
        />
      </div>

      <span>Размер</span>
      <div class="size-inputs">
        <NumberInput
          v-model:value="width"
          addon-before="Ш"
          placeholder="Ширина"
          :controls="false"
          :min="1"
          class="size-input"
          @change="(value) => update('width', value)"
        />
        <NumberInput
          v-model:value="height"
          addon-before="В"
          placeholder="Высота"
          :controls="false"
          :min="1"
          class="size-input"
          @change="(value) => update('height', value)"
        />
      </div>

      <span v-if="isShowScale">Масштаб</span>
      <div v-if="isShowScale" class="size-inputs">
        <NumberInput
          v-model:value="scaleX"
          addon-before="X"
          placeholder="X"
          :controls="false"
          :min="1"
          class="size-input"
          @change="(value) => update('scaleX', value)"
        />
        <NumberInput
          v-model:value="scaleY"
          addon-before="Y"
          placeholder="Y"
          :controls="false"
          :min="1"
          class="size-input"
          @change="(value) => update('scaleY', value)"
        />
      </div>

      <span>Угол поворота</span>
      <div class="angle-inputs">
        <div class="angle-input" />
        <a-input-number
          v-model:value="angle"
          addon-after="°"
          placeholder="Угол поворота"
          :controls="false"
          :min="0"
          :max="360"
          class="angle-input"
        />
      </div>

      <span>Прозрачность</span>
      <div class="opacity-inputs">
        <a-slider
          v-model:value="opacity"
          :min="0"
          :max="100"
          :step="1"
          class="opacity-input opacity-slider"
        />
        <a-input-number
          v-model:value="opacity"
          addon-after="%"
          :controls="false"
          :min="0"
          :max="100"
          :step="1"
          class="opacity-input"
        />
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'
import NumberInput from './NumberInput.vue'

const emit = defineEmits([
  'update'
])

const update = (field: string, value: number): void => {
  emit('update', { [field]: value })
}

const store = useFabricStore()
const { activeObject, canvasSize } = storeToRefs(store)
const isShowScale = computed(() => activeObject.value?.type === 'textbox' || activeObject.value?.type === 'image')

const left = computed({
  get: () => Math.round(activeObject.value?.left || 0),
  set: (value) => update('left', value ?? 0)
})

const top = computed({
  get: () => Math.round(activeObject.value?.top || 0),
  set: (value) => update('top', value ?? 0)
})

const width = computed({
  get: () => Math.round(activeObject.value?.width || 0),
  set: (value) => update('width', value)
})

const height = computed({
  get: () => Math.round(activeObject.value?.height || 0),
  set: (value) => update('height', value)
})

const scaleX = computed({
  get: () => Math.round((activeObject.value?.scaleX || 0) * 1000) / 1000,
  set: (value) => update('scaleX', value)
})

const scaleY = computed({
  get: () => Math.round((activeObject.value?.scaleY || 0) * 1000) / 1000,
  set: (value) => update('scaleY', value)
})

const angle = computed({
  get: () => Math.round(activeObject.value?.angle || 0),
  set: (value) => update('angle', value)
})

const opacity = computed({
  get: () => 100 - Math.round((activeObject.value?.opacity ?? 0) * 100),
  set: (value) => update('opacity', Math.round(100 - value) / 100)
})
</script>

<style scoped>
.prop-grid {
  display: grid;
  grid-template-columns: 2fr 3fr;
  column-gap: 8px;
  row-gap: 8px;
}

.coordinate-inputs,
.size-inputs,
.opacity-inputs,
.angle-inputs {
  display: flex;
  gap: 8px;
}

.coord-input,
.size-input,
.opacity-input,
.angle-input {
  flex: 1;
}

.opacity-slider {
  margin: 6px 0;
}
</style>