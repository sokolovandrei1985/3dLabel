<template>
  <a-card title="Общие данные" size="small" class="section-card">
    <a-form-item label="Координаты">
      <div class="coordinate-inputs">
        <a-input-number
          v-model:value="left"
          addon-before="X"
          placeholder="X"
          :controls="false"
          :min="0"
          :max="canvasSize?.width || Infinity"
          class="coord-input"
        />
        <a-input-number
          v-model:value="top"
          addon-before="Y"
          placeholder="Y"
          :controls="false"
          :min="0"
          :max="canvasSize?.height || Infinity"
          class="coord-input"
        />
      </div>
    </a-form-item>

    <a-form-item label="Размер">
      <div class="size-inputs">
        <a-input-number
          v-model:value="width"
          addon-before="Ш"
          placeholder="Ширина"
          :controls="false"
          :min="1"
          class="size-input"
        />
        <a-input-number
          v-model:value="height"
          addon-before="В"
          placeholder="Высота"
          :controls="false"
          :min="1"
          class="size-input"
        />
      </div>
    </a-form-item>

    <a-form-item label="Прозрачность">
      <a-slider
        v-model:value="opacity"
        :min="0"
        :max="100"
        :step="1"
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
    </a-form-item>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'

const emit = defineEmits([
  'update'
])

const update = (field: string, value: number): void => {
  emit('update', { [field]: value })
}

const store = useFabricStore()
const { activeObject, canvasSize } = storeToRefs(store)
const left = computed({
  get: () => Math.round(activeObject.value.left),
  set: (value) => update('left', value)
})

const top = computed({
  get: () => Math.round(activeObject.value.top),
  set: (value) => update('top', value)
})

const width = computed({
  get: () => Math.round(activeObject.value.width),
  set: (value) => update('width', value)
})

const height = computed({
  get: () => Math.round(activeObject.value.height),
  set: (value) => update('height', value)
})

const opacity = computed({
  get: () => 100 - Math.round(activeObject.value.opacity * 100),
  set: (value) => update('opacity', Math.round(100 - value) / 100)
})
</script>

<style scoped>
.coordinate-inputs,
.size-inputs {
  display: flex;
  gap: 8px;
}

.coord-input,
.size-input {
  flex: 1;
}

.opacity-input {
  width: 100%;
}
</style>