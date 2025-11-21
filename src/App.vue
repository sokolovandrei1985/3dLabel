<template>
  <div
    id="container"
    :class="{
      'first-tab-open': activeRightTab === 'settings',
      'right-collapsed': isRightCollapsed
    }"
  >
    <Loading v-bind="loading" />
    <div class="main_grid_area">
      <TopPanel class="header" />
      <LeftPanel class="left" />
      <CenterPanel ref="centerPanelRef" class="center" />
      <RightPanel
        class="right"
        v-model:collapsed="isRightCollapsed"
        @update:activeTab="onRightTabChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TopPanel from './components/panels/TopPanel/index.vue'
import LeftPanel from './components/panels/LeftPanel.vue'
import CenterPanel from './components/panels/CenterPanel.vue'
import RightPanel from './components/panels/RightPanel/index.vue'
import Loading from './components/utils/Loading.vue'
import {
  loadSceneModels,
  loadEnvironmentMap,
  setUICallbacks,
  fitModelToView,
  pmremGenerator,
  renderer,
  scene,
  activeCamera
} from '@/services/useThreeScene'
import { useTextureStore } from '@/stores/texture'
import { useApplicationStore } from '@/stores/application'
import { storeToRefs } from 'pinia'
import { initUndoRedoService } from '@/services/useUndoRedo'

const appStore = useApplicationStore()
const { loading } = storeToRefs(appStore)
const { setBrowserRestrictions } = appStore

const centerPanelRef = ref()
const activeRightTab = ref('')
const isRightCollapsed = ref(false)

const isRotationDisabled = ref(false)
const isFitDisabled = ref(false)
const rotationValue = ref(0)
const isSliderInternalUpdate = ref(false)

/*async function onLoadModel() {
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
}*/

function onRightTabChange(newKey: string) {
  activeRightTab.value = newKey
}

onMounted(() => {
  setBrowserRestrictions()
  initUndoRedoService()

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
</script>

<style scoped>
#container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.main_grid_area {
  padding: 0px 4px;
  display: grid;
  grid-template-areas:
    "header header header"
    "left center right";
  grid-template-rows: auto auto;
  grid-template-columns: minmax(18.5rem, 1fr) 5fr auto;
  column-gap: 8px;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.header {
  grid-area: header;
}

.left {
  grid-area: left;
}

.center {
  grid-area: center;
}

.right {
  grid-area: right;
}
</style>
