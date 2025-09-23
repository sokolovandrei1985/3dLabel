<template>
  <div class="control-section">
    <a-button block @click="loadModel">Загрузить модель</a-button>

    <a-divider />

    <div>
      <strong>Камеры:</strong><br />
      <a-radio-group
        :value="activeCameraType"
        button-style="solid"
        @change="onCamTypeChange"
      >
        <a-radio-button v-for="camType in CamTypes" :key="camType.key" :value="camType.key">{{ camType.title }}</a-radio-button>
      </a-radio-group>
    </div>

    <a-divider />

    <div>
      <strong>Вращение модели (°):</strong>
      <a-slider
        v-model:value="rotationValue"
        :min="0"
        :max="360"
        :step="1"
        :disabled="isRotationDisabled"
        @change="(val) => { setRotationValue(val) }"
      />
    </div>

    <div>
      <strong>Виды модели:</strong><br />
      <a-radio-group
        :value="activeModelView"
        button-style="solid"
        @change="onModelViewChange"
      >
        <a-radio-button v-for="modelView in ModelViews" :key="modelView.key" :value="modelView.key">{{ modelView.title }}</a-radio-button>
      </a-radio-group>
    </div>

    <a-divider />

    <div>
      <a-button block @click="onResetView" :disabled="isFitDisabled">
        Вернуть в исходное состояние
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CamTypes, ModelViews } from './constants'
import { useRightPanelStore } from '@/stores/rightPanelStore'
import { storeToRefs } from 'pinia'

const store = useRightPanelStore()

const {
  isOrthoDisabled,
  isPerspectiveDisabled,
  isRotationDisabled,
  isFitDisabled,
  activeCameraType,
  rotationValue,
  activeModelView
} = storeToRefs(store)

const {
  setActiveCameraType,
  setRotationValue,
  resetCameraControls,
  setActiveModelView,
  fitModelToView,
  loadModel
} = store

const onCamTypeChange = (event: Event): void => {
  setActiveCameraType((event.target as HTMLInputElement).value)
}

const onModelViewChange = (event: Event): void => {
  setActiveModelView((event.target as HTMLInputElement).value)
}

const onResetView = (): void => {
  resetCameraControls()
  fitModelToView()
}

/*const props = withDefaults(defineProps<{
  isOrthoDisabled?: boolean,
  isPerspectiveDisabled?: boolean,
  isRotationDisabled?: boolean,
  isFitDisabled?: boolean,
  activeCameraType?: CameraKey
}>(), {
  isOrthoDisabled: false,
  isPerspectiveDisabled: false,
  isRotationDisabled: false,
  isFitDisabled: false,
  activeCameraType: 'ortho'
})*/

/*
const emit = defineEmits(['any-event'])

// Универсальная функция для любого события и параметров
const universalEmit = (eventName: string, ...args: any[]) => {
  // @ts-ignore - обход типизации для универсальности
  emit(eventName, ...args)
}
*/
</script>

<style scoped>

</style>
