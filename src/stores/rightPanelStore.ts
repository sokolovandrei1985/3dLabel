import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CameraKey, ModelViewKey } from '@/types/camera'
import {
  loadSceneModels,
  loadEnvironmentMap,
  switchCamera,
  setModelRotation,
  setModelRotationAngle,
  fitModelToView as fitToView,
  pmremGenerator,
  renderer,
  scene,
  activeCamera
} from '@/services/useThreeScene'
import { useTextureStore } from '@/stores/texture'

export const useRightPanelStore = defineStore('rightPanelStore', () => {
  // State
  const isOrthoDisabled = ref<boolean>(false)
  const isPerspectiveDisabled = ref<boolean>(false)
  const isRotationDisabled = ref<boolean>(false)
  const isFitDisabled = ref<boolean>(false)
  const activeCameraType = ref<CameraKey>('ortho')
  const rotationValue = ref<number>(0)
  const activeModelView = ref<ModelViewKey>('front')
  const collapsed = ref<boolean>(true)

  // Getters
  /*const isCameraDisabled = computed(() => (cameraType: CameraKey): boolean => {
    switch (cameraType) {
      case 'orthographic':
        return isOrthoDisabled.value
      case 'perspective':
        return isPerspectiveDisabled.value
      default:
        return false
    }
  })*/

  /*const canRotate = computed(() => !isRotationDisabled.value)
  const canFit = computed(() => !isFitDisabled.value)
  const currentCamera = computed(() => activeCameraType.value)*/

  // Setters
  const setOrthoDisabled = (disabled: boolean): void => {
    isOrthoDisabled.value = disabled
  }

  const setPerspectiveDisabled = (disabled: boolean): void => {
    isPerspectiveDisabled.value = disabled
  }

  const setRotationDisabled = (disabled: boolean): void => {
    isRotationDisabled.value = disabled
  }

  const setFitDisabled = (disabled: boolean): void => {
    isFitDisabled.value = disabled
  }

  const setActiveCameraType = (cameraType: CameraKey): void => {
    if (cameraType === 'ortho' && isOrthoDisabled.value) {
      console.warn('Orthographic camera is disabled')
      return
    }
    if (cameraType === 'perspective' && isPerspectiveDisabled.value) {
      console.warn('Perspective camera is disabled')
      return
    }
    activeCameraType.value = cameraType
    switchCamera(cameraType)
  }

  const setRotationValue = (val: number): void => {
    rotationValue.value = val
    setModelRotationAngle(val)
  }

  const setActiveModelView = (val: ModelViewKey): void => {
    activeModelView.value = val
    setModelRotation(val)
  }

  const setCollapsed = (val: boolean): void => {
    collapsed.value = val
  }

  // Actions
  const toggleCameraType = (): void => {
    if (activeCameraType.value === 'ortho') {
      setActiveCameraType('perspective')
    } else {
      setActiveCameraType('ortho')
    }
  }

  const resetCameraControls = (): void => {
    isOrthoDisabled.value = false
    isPerspectiveDisabled.value = false
    isRotationDisabled.value = false
    isFitDisabled.value = false
    rotationValue.value = 0
    activeCameraType.value = 'perspective'
  }

  const fitModelToView = (): void => {
    fitToView()
  }

  const loadModel = async (): Promise<void> => {
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

  const toggleCollapsed = (): void => {
    collapsed.value = !collapsed.value
  }

  // Экспорт
  return {
    // State
    isOrthoDisabled,
    isPerspectiveDisabled,
    isRotationDisabled,
    isFitDisabled,
    activeCameraType,
    rotationValue,
    activeModelView,
    collapsed,

    // Getters
    /*isCameraDisabled,
    canRotate,
    canFit,
    currentCamera,*/

    // Actions
    setOrthoDisabled,
    setPerspectiveDisabled,
    setRotationDisabled,
    setFitDisabled,
    setActiveCameraType,
    setRotationValue,
    setActiveModelView,
    toggleCameraType,
    resetCameraControls,
    fitModelToView,
    loadModel,
    setCollapsed,
    toggleCollapsed
  }
})