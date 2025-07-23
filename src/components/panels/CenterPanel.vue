<template>
  <div class="panel-wrapper">
    <div
      id="center-panel"
      :class="{
        vertical: isVertical,
        horizontal: !isVertical
      }"
    >      
      <div
        id="center-top"
        class="center-block"
        :class="{ expanded: expandTop }"
        ref="threeContainer"
      > 
      </div>

      <!-- Fabric.js / Нижняя панель -->
      <div
        id="center-bottom"
        class="center-block fabric-container"
        :class="{ hidden: expandTop }"
      >
        <div id="canvasWrapper" ref="canvasWrapper" >
          <canvas id="fabricCanvas" ref="fabricCanvasEl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { initScene, onWindowResize } from '@/services/useThreeScene'
import { initFabricCanvas, loadCanvasConfig, type CanvasConfig, fitFabricCanvas } from '@/services/useImageCanvas'
import type { Canvas } from 'fabric'
import { useFabricStore } from '@/stores/fabric'
import { useTextureStore } from '@/stores/texture'
import { FabricThreeTextureManager } from '@/services/FabricThreeTextureManager'
import throttle from 'lodash.throttle'
import { useScreenshooter } from '@/services/useScreenshooter'

const textureStore = useTextureStore()
const fabricStore = useFabricStore()

const fabricCanvasInstance = ref<Canvas | null>(null)

const isVertical = ref(true)
const expandTop = ref(false)
const threeContainer = ref<HTMLElement | null>(null)
const fabricCanvasEl = ref<HTMLCanvasElement | null>(null)
const canvasWrapper = ref<HTMLElement | null>(null)
const fabricTextureManager = ref<FabricThreeTextureManager | null>(null)

const inputWidthMM = ref(1)
const inputHeightMM = ref(1)
const originalCanvasWidth = ref(1)
const originalCanvasHeight = ref(1)

let resizeObserver: ResizeObserver | null = null
let fabricResizeObserver: ResizeObserver | null = null

const screenshooter = useScreenshooter({
  expandTop,
  threeContainer
})

function onMakeScreenshots() {
  if (!fabricCanvasInstance.value) {
    alert('Fabric canvas не готов')
    return
  }
  screenshooter.doScreenshots(fabricCanvasInstance.value as Canvas)
    .catch(e => {
      console.error('Screenshoot failed:', e)
    })
}

function onToggle3DView() {
  expandTop.value = !expandTop.value
  setTimeout(() => {
    if (fabricCanvasInstance.value && fabricCanvasEl.value && canvasWrapper.value) {
      fitFabricCanvas(
        fabricCanvasInstance.value as Canvas,
        fabricCanvasEl.value,
        canvasWrapper.value,
        inputWidthMM.value,
        inputHeightMM.value
      )
    }
  }, 400)
}

onMounted(async () => {
  // Загружаем настройки размеров
  const config: CanvasConfig | null = await loadCanvasConfig()
  if (config) {
    inputWidthMM.value = config.inputWidthMM
    inputHeightMM.value = config.inputHeightMM
  }

  try {
    const res = await fetch('/configs/config.json')
    const data = await res.json()
    const width = data.canvas.inputWidthMM
    const height = data.canvas.inputHeightMM
    isVertical.value = width >= height

    if (threeContainer.value) {
      initScene(threeContainer.value)
      resizeObserver = new ResizeObserver(() => {
        onWindowResize(threeContainer.value!)
      })
      resizeObserver.observe(threeContainer.value)
    }

    await nextTick() // ждём визуального обновления DOM

    if (fabricCanvasEl.value) {
      // Используем сервисную функцию инициализации fabricCanvas
      const fabricCanvas = await initFabricCanvas(fabricCanvasEl.value)
      if (fabricCanvas) {
        fabricCanvasInstance.value = fabricCanvas

        originalCanvasWidth.value = fabricCanvas.getWidth()
        originalCanvasHeight.value = fabricCanvas.getHeight()

        fabricStore.setCanvas(fabricCanvas)

        fabricTextureManager.value = new FabricThreeTextureManager(fabricCanvas, width, height)
        await fabricTextureManager.value.updateTextureWithoutControls(textureStore)

        const throttledUpdateTexture = throttle(() => {
          fabricTextureManager.value?.updateTextureWithoutControls(textureStore)
        }, 200, { trailing: true, leading: true })

        // Подписка на события с троттлингом
        fabricCanvas.on('object:modified', throttledUpdateTexture)
        fabricCanvas.on('object:added', throttledUpdateTexture)
        fabricCanvas.on('object:moving', throttledUpdateTexture)
        fabricCanvas.on('selection:cleared', throttledUpdateTexture)
        fabricCanvas.on('selection:created', throttledUpdateTexture)
        fabricCanvas.on('selection:updated', throttledUpdateTexture)
        fabricCanvas.on('object:scaling', throttledUpdateTexture)
        fabricCanvas.on('object:rotating', throttledUpdateTexture)
      }

      fitFabricCanvas(
        fabricCanvasInstance.value as Canvas,
        fabricCanvasEl.value,
        canvasWrapper.value,
        inputWidthMM.value,
        inputHeightMM.value
      )

      if (canvasWrapper.value) {
        fabricResizeObserver = new ResizeObserver(() => {
          if (fabricCanvasInstance.value && fabricCanvasEl.value && canvasWrapper.value) {
            fitFabricCanvas(
              fabricCanvasInstance.value as Canvas,
              fabricCanvasEl.value,
              canvasWrapper.value,
              inputWidthMM.value,
              inputHeightMM.value
            )
          }
        })
        fabricResizeObserver.observe(canvasWrapper.value)
      }
    } else {
      console.error('[Fabric] canvas ref is undefined')
    }
  } catch (e) {
    console.error('Ошибка загрузки config.json:', e)
  }

  // Регистрируем слушатели глобальных событий
  window.addEventListener('toggle-3d-view', onToggle3DView)
  window.addEventListener('screenshoot-request', onMakeScreenshots)
})

onBeforeUnmount(() => {
  if (resizeObserver && threeContainer.value) {
    resizeObserver.unobserve(threeContainer.value)
  }
  if (fabricResizeObserver && canvasWrapper.value) {
    fabricResizeObserver.unobserve(canvasWrapper.value)
  }
  window.removeEventListener('toggle-3d-view', onToggle3DView)
  window.removeEventListener('screenshoot-request', onMakeScreenshots)
})
</script>

<style scoped>
.panel-wrapper {
  width: 100%;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) */
  min-width: 0;
}

#center-panel {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative; /* важно для позиционирования вложенных абсолютных элементов */
  gap: 12px;
  background-color: #f5f5f5;
  min-width: 0;
}

.vertical {
  flex-direction: column;
}

.horizontal {
  flex-direction: row-reverse;
}

.center-block {
  flex: 1 1 auto;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  /* transition: all 0.5s ease; */
  background-color: rgb(255, 255, 255);
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

/* Раскрытие верхней панели на весь родительский контейнер */
/* Заменяем flex-настройки абсолютным позиционированием */
#center-top.expanded {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex: none;
  z-index: 10;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Опционально: При необходимости можно сохранить reduced класс */
/* Хотя он сейчас не используется */
#center-top.reduced {
  flex: 1 1 100%;
}

/* Нижняя панель Fabric.js */
/* Оставляем штатные flex-правила, чтобы размеры не менялись */
.fabric-container {
  flex: 1 1 50%;
  height: 100%;
  min-height: 20px;
  min-width: 20px;
  display: flex;
  flex-direction: column;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  background-color: white;
  /* transition: opacity 0.1s ease; */
  overflow: hidden;
  max-height: 1000px;
  opacity: 1;
}

/* При скрытии - делаем прозрачной и неактивной, но размеры не меняем */
.fabric-container.hidden {
  opacity: 1;
  pointer-events: none;
  /* flex и размеры не меняются! */
}

#canvasWrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 20px;
  min-width: 20px;
}

#canvasWrapper > canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  user-select: none;
}
</style>