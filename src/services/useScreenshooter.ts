// services/useScreenshooter.ts
import JSZip from 'jszip'
import { switchCamera, setModelRotation, fitModelToView, renderer, activeCamera, scene } from '@/services/useThreeScene'
import type { Canvas } from 'fabric'
import { saveHighResImage } from '@/services/useImageExport'
import type { Ref } from 'vue'
import { useGlobalConfigStore } from '@/stores/globalConfig'

const VIEWS = ['front', 'back', 'right', 'left', 'top'] as const
type View = typeof VIEWS[number]

export function useScreenshooter(params: {
  expandTop: Ref<boolean>,
  threeContainer: Ref<HTMLElement | null>
}) {
  const { expandTop, threeContainer } = params
  const globalConfigStore = useGlobalConfigStore()

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Снимает скриншот с renderer.domElement, возвращает base64 строку
  async function captureScreenshot(): Promise<string> {
    return new Promise((resolve, reject) => {
      renderer.domElement.toBlob(blob => {
        if (!blob) {
          reject(new Error('Failed to get blob from Three.js canvas'))
          return
        }
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      }, 'image/png')
    })
  }

  // Делает скриншоты по всем видам для указанной камеры ('perspective' или 'ortho')
  async function makeShotsForCamera(mode: 'perspective' | 'ortho'): Promise<Record<View, string>> {
    switchCamera(mode)
    await delay(150)

    if (threeContainer.value) {
      renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
      fitModelToView()
    }
    await delay(100)

    const shots: Partial<Record<View, string>> = {}

    for (const view of VIEWS) {
      setModelRotation(view)
      // fitModelToView()
      await delay(150)

      renderer.render(scene, activeCamera)
      shots[view] = await captureScreenshot()
    }

    // Все виды должны быть обработаны
    if (Object.keys(shots).length !== VIEWS.length) {
      throw new Error('Not all views were captured!')
    }

    return shots as Record<View, string>
  }

  /**
   * Основная функция. Принимает актуальный fabric.Canvas и делает серию скриншотов 
   * с трехмерной сцены, а также снимок с fabric canvas,
   * упаковывает все в zip и предлагает скачать.
   */
  async function doScreenshots(fabricCanvas: Canvas) {
    if (!fabricCanvas) throw new Error('Fabric canvas is not ready (null or undefined)')
    if (!globalConfigStore.canvasConfig) throw new Error('Global canvas config is missing')

    expandTop.value = true
    await delay(400) // Ждем анимацию раскрытия контейнера

    if (threeContainer.value) {
      renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
    }

    // Перспективные скриншоты
    const perspectiveShots = await makeShotsForCamera('perspective')
    // Ортографические скриншоты
    const orthoShots = await makeShotsForCamera('ortho')

    // Скрин fabric canvas высокого разрешения
    const blob = await saveHighResImage(
      fabricCanvas,
      globalConfigStore.canvasConfig.inputWidthMM,
      globalConfigStore.canvasConfig.inputHeightMM
    )

    const zip = new JSZip()

    // Добавляем картинки perspective
    for (const view of VIEWS) {
      const base64 = perspectiveShots[view]
      if (!base64) continue
      const data = base64.split(',')[1]
      zip.file(`perspective_${view}.png`, data, { base64: true })
    }

    // Добавляем картинки ortho
    for (const view of VIEWS) {
      const base64 = orthoShots[view]
      if (!base64) continue
      const data = base64.split(',')[1]
      zip.file(`ortho_${view}.png`, data, { base64: true })
    }

    // Добавляем fabric high res png
    zip.file('fabric_high_res.png', blob)

    // Генерируем и скачиваем архив
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'screenshots.zip'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)

    expandTop.value = false
  }

  return {
    doScreenshots,
  }
}