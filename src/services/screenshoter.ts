import * as THREE from 'three'
import JSZip from 'jszip'
import { switchScene, setModelView, scene, getModelDimensions, calcModelShaders, texture } from '@/services/useThreeScene'
import type { Canvas } from 'fabric'
import { saveHighResImage } from '@/services/useImageExport'
//import type { Ref } from 'vue'
import { useGlobalConfigStore } from '@/stores/globalConfig'
import { useGraphicsStore } from '@/stores/graphics'
import type { LoadingProps } from '@/models/loading'
import { useApplicationStore } from '@/stores/application'

const VIEWS = ['front', 'back', 'right', 'left', 'top'] as const
//type View = typeof VIEWS[number]

export default class Screenshoter {
  renderer: THREE.WebGLRenderer
  pmremGenerator: THREE.PMREMGenerator
  fabricCanvas: Canvas
  offscreenCanvas: OffscreenCanvas
  totalSteps: number
  currentStep: number
  currentState: string
  setLoadingState: Function

  constructor(fabricCanvas: Canvas) {
    this.fabricCanvas = fabricCanvas
    this.offscreenCanvas = new OffscreenCanvas(1024, 1024)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.offscreenCanvas,
      context: this.offscreenCanvas.getContext('webgl2') || undefined
    })
    this.renderer.setClearColor(0xFFDAB9)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 0.9

    //Для загрузки EXR
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    this.pmremGenerator.compileEquirectangularShader()

    const store = useApplicationStore()
    const { setLoadingState } = store
    this.setLoadingState = setLoadingState
    this.totalSteps = VIEWS.length * 2 + 1
    this.currentStep = 0
    this.currentState = ''
  }

  async awaitNextFrame(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => { resolve() })
    })
  }

  getLoadingState (text: string):LoadingProps {
    return {
      show: true,
      totalSteps: this.totalSteps,
      currentStep: this.currentStep,
      text,
      showProgressBar: true,
      width: '12rem'
    }
  }

  async getScreenshotBase64(): Promise<string | null> {
    const blob = await this.offscreenCanvas.convertToBlob()
    return new Promise((resolve, reject) => {
      if (!blob) {
        reject(new Error('Failed to get blob from Three.js canvas'))
      }
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }

  async makeScreenshotAllViews(scene: THREE.Scene, camera: THREE.OrthographicCamera | THREE.PerspectiveCamera): Promise<Map<string, string | null>> {
    const pivotGroup = scene.getObjectByName('pivotGroup') as THREE.Group
    const tableGroup = scene.getObjectByName('tableGroup') as THREE.Group
    if (!pivotGroup) return new Map()

    const result: Map<string, string | null> = new Map()
    let count = 0;

    for (const view of VIEWS) {
      this.currentStep++
      count++
      const loadingState = this.getLoadingState(`${this.currentState} (${count}/${VIEWS.length})`)
      this.setLoadingState(loadingState)

      setModelView(pivotGroup, view)
      setModelView(tableGroup, view)
      this.renderer.render(scene, camera)
      await this.awaitNextFrame()
      const screenshot = await this.getScreenshotBase64()
      result.set(view, screenshot)
    }

    return result
  }

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async makeScreenshot(): Promise<Blob | null> {
    const graphicsStore = useGraphicsStore()
    graphicsStore.setAnimationActive(false)
    this.currentStep = 0
    this.setLoadingState({ show: true })

    const screenshots: Map<string, string | null> = new Map()

    // Копируем сцену
    const sceneData = scene.toJSON()
    const loader = new THREE.ObjectLoader()
    const offscreenScene: THREE.Scene = await loader.parseAsync(sceneData) as THREE.Scene
    // Добавляем текстуры
    const screenshotEnvMap = this.pmremGenerator.fromEquirectangular(texture).texture
    offscreenScene.environment = screenshotEnvMap
    offscreenScene.background = screenshotEnvMap

    // Получаем размеры и центр модели
    const { size, center } = getModelDimensions() || {}

    if (!size || !center) return null

    const part = 2000 / Math.max(size.x, size.y)
    this.renderer.setSize(Math.round(size.x * part), Math.round(size.y * part), false)

    const margin_o = 1.5
    const dx = size.x * margin_o
    const dy = size.y * margin_o

    const halfBoxW = dx / 2
    const halfBoxH = dy / 2

    const modelAspect = dx / dy

    // Ортографисеская камера
    switchScene('ortho', offscreenScene)
    let camera: THREE.OrthographicCamera | THREE.PerspectiveCamera = new THREE.OrthographicCamera(
      -halfBoxW,
      halfBoxW,
      halfBoxH,
      -halfBoxH,
      0.1,
      1000
    )
    // ортокамера всегда смотрит со страницы +Z
    camera.position.set(center.x, center.y, center.z + 10)
    camera.lookAt(center)
    camera.zoom = 1

    camera.updateProjectionMatrix()

    /*console.log(`Ширина сцены: ${size.x}`)
    console.log(`Высота сцены: ${size.y}`)
    console.log(`Глубина сцены: ${size.z}`)*/

    calcModelShaders()
    this.currentState = 'Создание ортографических скриншотов'
    for (const [key, value] of await this.makeScreenshotAllViews(offscreenScene, camera)) {
      screenshots.set('ortho_' + key, value)
    }

    // Перспективная камера
    switchScene('perspective', offscreenScene)
    const cameraFov = 35
    const fovY = THREE.MathUtils.degToRad(cameraFov)
    const fovX = 2 * Math.atan(Math.tan(fovY / 2) * modelAspect)

    const distForX = size.x / Math.tan(fovX / 2)
    const distForY = size.y / Math.tan(fovY / 2)

    const camDist = Math.max(distForX, distForY)

    camera = new THREE.PerspectiveCamera(cameraFov, modelAspect, camDist * 0.01, camDist + size.z * 2 + 100)

    camera.position.set(center.x, center.y, center.z + camDist)
    camera.zoom = 1
    camera.lookAt(center)
    camera.updateProjectionMatrix()

    calcModelShaders()
    this.currentState = 'Создание перспективных скриншотов'
    for (const [key, value] of await this.makeScreenshotAllViews(offscreenScene, camera)) {
      screenshots.set('perspective_' + key, value)
    }

    // Вернуть сцену к состоянию до запуска скриншотов
    //switchCamera(currentCamera)
    //scene.environment = envMap
    //scene.background = envMap

    const zip = new JSZip()
    for (const [key, value] of screenshots) {
      if (!value) continue
      const data = value.split(',')[1]
      zip.file(`${key}.png`, data, { base64: true })
    }

    // Скрин fabric canvas высокого разрешения
    this.currentStep++
    const loadingState = this.getLoadingState('Полотно высокого разрешения')
    this.setLoadingState(loadingState)
    await this.awaitNextFrame()

    const globalConfigStore = useGlobalConfigStore()
    const highResBlob = await saveHighResImage(
      this.fabricCanvas,
      globalConfigStore.canvasConfig?.inputWidthMM ?? 160,
      globalConfigStore.canvasConfig?.inputHeightMM ?? 90
    )
    // Добавляем fabric high res png
    zip.file('fabric_high_res.png', highResBlob)

    // Генерируем и скачиваем архив
    const content = await zip.generateAsync({ type: 'blob' })
    graphicsStore.setAnimationActive(true)
    this.setLoadingState({ show: false })

    return content
  }
}