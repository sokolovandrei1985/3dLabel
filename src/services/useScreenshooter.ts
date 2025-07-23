// services/useScreenshooter.ts
import JSZip from 'jszip'
import { switchCamera, setModelRotation, fitModelToView, renderer, activeCamera, scene } from '@/services/useThreeScene'
import type { Canvas } from 'fabric'
import { saveHighResImage } from '@/services/useImageExport'
import type { Ref } from 'vue'
import { useGlobalConfigStore } from '@/stores/globalConfig'
import * as THREE from 'three'     

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
async function captureScreenshot(minSidePx = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    // Сохраняем текущий размер
    const originalSize = new THREE.Vector2()
    renderer.getSize(originalSize)
    const aspect = originalSize.x / originalSize.y

    let width, height
    if (aspect >= 1) {
      width = minSidePx
      height = Math.round(minSidePx / aspect)
    } else {
      height = minSidePx
      width = Math.round(minSidePx * aspect)
    }

    // Сохраняем старые параметры камеры
    const oldAspect = activeCamera instanceof THREE.PerspectiveCamera ? activeCamera.aspect : 1
    const oldLeft = activeCamera instanceof THREE.OrthographicCamera ? activeCamera.left : 0
    const oldRight = activeCamera instanceof THREE.OrthographicCamera ? activeCamera.right : 0
    const oldTop = activeCamera instanceof THREE.OrthographicCamera ? activeCamera.top : 0
    const oldBottom = activeCamera instanceof THREE.OrthographicCamera ? activeCamera.bottom : 0

    // Размер и настройки
    renderer.setSize(width, height)

    if (activeCamera instanceof THREE.PerspectiveCamera) {
      activeCamera.aspect = width / height
      activeCamera.updateProjectionMatrix()
    } else if (activeCamera instanceof THREE.OrthographicCamera) {
      // подстройте значения left/right/top/bottom согласно новой размерности (пропорции)
      const frustumSize = 5 // используйте свой параметр, который актуален у вас
      const aspect = width / height
      activeCamera.left = -frustumSize * aspect / 2
      activeCamera.right = frustumSize * aspect / 2
      activeCamera.top = frustumSize / 2
      activeCamera.bottom = -frustumSize / 2
      activeCamera.updateProjectionMatrix()
    }

    // Обновляем fitModelToView или controls если нужно

    renderer.render(scene, activeCamera)

    renderer.domElement.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to create blob for screenshot'))
        return
      }
      // восстанавливаем исходный размер
      renderer.setSize(originalSize.x, originalSize.y)
      if (activeCamera instanceof THREE.PerspectiveCamera) {
        activeCamera.aspect = oldAspect
      } else if (activeCamera instanceof THREE.OrthographicCamera) {
        activeCamera.left = oldLeft
        activeCamera.right = oldRight
        activeCamera.top = oldTop
        activeCamera.bottom = oldBottom
      }
      if ('updateProjectionMatrix' in activeCamera && typeof activeCamera.updateProjectionMatrix === 'function') {
        activeCamera.updateProjectionMatrix()
       }
      resolve(URL.createObjectURL(blob))
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