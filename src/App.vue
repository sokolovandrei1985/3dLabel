<template>
  <div
    id="container"
    :class="{
      'first-tab-open': activeRightTab === 'settings',
      'right-collapsed': isRightCollapsed
    }"
  >
    <LeftPanel />
    <CenterPanel ref="centerPanelRef" />
    <RightPanel
      v-model:collapsed="isRightCollapsed"
      @update:activeTab="onRightTabChange"
    >
      <template #3d>
        <div class="control-section">
          <a-button block @click="onLoadModel">Загрузить модель</a-button>

          <a-divider />

          <div>
            <strong>Камеры:</strong><br />
            <a-button-group>
              <a-button
                size="small"
                :type="activeCameraType === 'ortho' ? 'primary' : 'default'"
                @click="onOrtho"
                :disabled="isOrthoDisabled"
              >
                Ортографическая
              </a-button>
              <a-button
                size="small"
                :type="activeCameraType === 'perspective' ? 'primary' : 'default'"
                @click="onPerspective"
                :disabled="isPerspectiveDisabled"
              >
                Перспективная
              </a-button>
            </a-button-group>
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
              @change="onRotateModel"
            />
          </div>

          <div>
            <strong>Виды модели:</strong><br />
            <a-button-group>
              <a-button
                size="small"
                :type="activeModelView === 'front' ? 'primary' : 'default'"
                @click="onSetModelView('front')"
              >
                Спереди
              </a-button>
              <a-button
                size="small"
                :type="activeModelView === 'back' ? 'primary' : 'default'"
                @click="onSetModelView('back')"
              >
                Сзади
              </a-button>
              <a-button
                size="small"
                :type="activeModelView === 'right' ? 'primary' : 'default'"
                @click="onSetModelView('right')"
              >
                Справа
              </a-button>
              <a-button
                size="small"
                :type="activeModelView === 'left' ? 'primary' : 'default'"
                @click="onSetModelView('left')"
              >
                Слева
              </a-button>
              <a-button
                size="small"
                :type="activeModelView === 'top' ? 'primary' : 'default'"
                @click="onSetModelView('top')"
              >
                Сверху
              </a-button>
            </a-button-group>
          </div>

          <a-divider />

          <div>
            <a-button block @click="onFitToView" :disabled="isFitDisabled">
              Вернуть в исходное состояние
            </a-button>
          </div>
        </div>
      </template>
    </RightPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LeftPanel from './components/panels/LeftPanel.vue'
import CenterPanel from './components/panels/CenterPanel.vue'
import RightPanel from './components/panels/RightPanel'
import {
  loadSceneModels,
  loadEnvironmentMap,
  setUICallbacks,
  switchCamera,
  setModelRotation,
  setModelRotationAngle,
  fitModelToView,
  pmremGenerator,
  renderer,
  scene,
  activeCamera
} from '@/services/useThreeScene'
import { useTextureStore } from '@/stores/texture'

const centerPanelRef = ref()
const activeRightTab = ref('')
const isRightCollapsed = ref(false)

const activeCameraType = ref<'perspective' | 'ortho'>('ortho')
const isPerspectiveDisabled = ref(false)
const isOrthoDisabled = ref(false)
const isRotationDisabled = ref(false)
const isFitDisabled = ref(false)
const rotationValue = ref(0)
const isSliderInternalUpdate = ref(false)
const activeModelView = ref<'front' | 'back' | 'right' | 'left' | 'top'>('front')

function onSetModelView(view: 'front' | 'back' | 'right' | 'left' | 'top') {
  activeModelView.value = view
  setModelRotation(view)
}

async function onLoadModel() {
  try {
    await loadEnvironmentMap(
      'environments/lonely_road_afternoon_puresky_4k.exr',
      pmremGenerator,
      renderer,
      scene,
      activeCamera
    )
    const textureStore = useTextureStore()
    const canvasTexture = textureStore.canvasTexture
    if (!canvasTexture) {
      console.warn('Canvas texture not ready yet')
      return
    }
    await loadSceneModels('models/models.json', canvasTexture)
  } catch (error) {
    console.error('Ошибка при загрузке окружения:', error)
  }
}

function onRightTabChange(newKey: string) {
  activeRightTab.value = newKey
}

onMounted(() => {
  setUICallbacks({
    setRotationSliderEnabled: (_enabled: boolean) => {
      isRotationDisabled.value = false
    },
    setFitToViewEnabled: (_enabled: boolean) => {
      isFitDisabled.value = false
    },
    setRotationSliderValue: (value: number) => {
      isSliderInternalUpdate.value = true
      rotationValue.value = value
      requestAnimationFrame(() => {
        isSliderInternalUpdate.value = false
      })
    }
  })
})

function onPerspective() {
  activeCameraType.value = 'perspective'
  switchCamera('perspective')
}

function onOrtho() {
  activeCameraType.value = 'ortho'
  switchCamera('ortho')
}

function onRotateModel(value: number) {
  if (isSliderInternalUpdate.value) return
  setModelRotationAngle(value)
}

function onFitToView() {
  fitModelToView()
}
</script>

<style scoped>
#container {
  padding: 8px;
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) 3fr minmax(min-content, max-content);
  column-gap: 8px;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #f5f5f5;
}
</style>
