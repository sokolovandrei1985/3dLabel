<template>
  <div id="container" :class="{ 'first-tab-open': activeRightTab === 'settings' }">
    <LeftPanel/>
    <CenterPanel ref="centerPanelRef"/>
    <RightPanel @update:activeTab="onRightTabChange">
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
            <a-button block @click="onFitToView" :disabled="isFitDisabled">Вернуть в исходное состояние</a-button>
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
import RightPanel from './components/panels/RightPanel.vue'
import {loadSceneModels,  loadEnvironmentMap, setUICallbacks, switchCamera, setModelRotation, setModelRotationAngle, fitModelToView    } from '@/services/useThreeScene'
import { useTextureStore } from '@/stores/texture'
import { pmremGenerator, renderer, scene, activeCamera } from '@/services/useThreeScene'
const centerPanelRef = ref()
const activeRightTab = ref('')
const activeCameraType = ref<'perspective' | 'ortho'>('ortho')

// Примеры состояния доступности
const isPerspectiveDisabled = ref(false)
const isOrthoDisabled = ref(false)
const isRotationDisabled = ref(false)
const isFitDisabled = ref(false)
const rotationValue = ref(0)
const isSliderInternalUpdate = ref(false)
const activeModelView = ref<'front' | 'back' | 'right' | 'left' | 'top'>('front')

// loadEnvironmentMap('environments/lonely_road_afternoon_puresky_4k.exr') // например, после загрузки модели


function onSetModelView(view: 'front' | 'back' | 'right' | 'left' | 'top') {
  activeModelView.value = view
  setModelRotation(view)
}
//bush_restaurant_4k.exr
//lonely_road_afternoon_puresky_4k.exr
async function onLoadModel() {
  // Ждём загрузки окружения с актуальными параметрами
  try {
    await loadEnvironmentMap('environments/lonely_road_afternoon_puresky_4k.exr', pmremGenerator, renderer, scene, activeCamera)
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

// Функция для обновления активной вкладки из RightPanel
function onRightTabChange(newKey: string) {
  activeRightTab.value = newKey
}

onMounted(() => {
  setUICallbacks({
    setRotationSliderEnabled: (enabled: boolean) => {
      isRotationDisabled.value = false //!enabled
    },
    setFitToViewEnabled: (enabled: boolean) => {
      isFitDisabled.value = false //!enabled
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

//Работа с изображениями



//Работа с 3D
function onPerspective() {
  activeCameraType.value = 'perspective'
  switchCamera('perspective')
}
function onOrtho() {
  activeCameraType.value = 'ortho'
  switchCamera('ortho')
}


function onRotateModel(value: number) {
  if (isSliderInternalUpdate.value) {
    console.log('[onRotateModel] Пропуск из-за внутреннего обновления')
    return
  }
  setModelRotationAngle(value)
  console.log('Вращение модели (угол):', value)
}

function onFitToView() {
  fitModelToView()
  console.log('Вписать в окно')
}
</script>

<style scoped>
#container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

#container > * {
  min-width: 0;
  flex-basis: 0;
}


/* По умолчанию пропорции 1:3:1 */
#container > *:nth-child(1) {
  flex: 2;
}
#container > *:nth-child(2) {
  flex: 8;
}
#container > *:nth-child(3) {
  flex: 2;
}

/* При открытии первой вкладки правой панели меняем пропорции */
#container.first-tab-open > *:nth-child(1) {
  flex: 2;
}
#container.first-tab-open > *:nth-child(2) {
  flex: 6; /* центральная панель сжимается */
}
#container.first-tab-open > *:nth-child(3) {
  flex: 4; /* правая панель расширяется */
}
</style>