<!-- LeftPanel.vue -->
<template>
  <div class="panel-wrapper">
    <editor/>
    <a-tabs tab-position="top" v-model:activeKey="activeTab" class="custom-tabs">
      <a-tab-pane
        v-for="tab in leftTabs"
        :key="tab.key"
        :tab="tab.label"
      >
        <div v-if="tab.key === '2d'">
          <a-button block type="primary" @click="toggle3DView" style="margin-bottom: 8px;">Развернуть 3D</a-button>
          <a-button block type="default" @click="onMakeScreenshots">Сделать скриншоты</a-button>
          <a-divider />

          <a-collapse>
            <a-collapse-panel header="Добавить/удалить" key="1">
              <a-button block @click="onLoadImage" style="margin-bottom: 8px;">
                <template #icon>
                  <UploadOutlined />
                </template>
                Изображение
              </a-button><br/>
              <a-button block danger @click="onDeleteImage">
                <template #icon>
                  <DeleteOutlined />
                </template>
                Удалить
              </a-button><br/>
            </a-collapse-panel>
          </a-collapse>

          <a-divider />

          <a-collapse>
            <a-collapse-panel header="Редактирование" key="1">
              <a-button block @click="onResetImage" style="margin-bottom: 8px;">Вернуть к исходному состоянию</a-button>
              <a-button block @click="onSaveImage" style="margin-bottom: 8px;">Сохранить изображение</a-button>

              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="bringToFront" key="1">На передний план</a-menu-item>
                    <a-menu-item @click="sendToBack" key="2">На задний план</a-menu-item>
                    <a-menu-item @click="sendBackwards" key="3">На уровень ниже</a-menu-item>
                    <a-menu-item @click="bringForward" key="4">На уровень выше</a-menu-item>
                  </a-menu>
                </template>
                <a-button block style="margin-bottom: 8px;">Порядок отображения<DownOutlined /></a-button>
              </a-dropdown>

              <a-collapse>
                <a-collapse-panel header="Тень" key="1">
                  <a-col>
                    <div>Размер тени (px):</div>
                    <a-slider v-model:value="shadowBlur" :min="0" :max="50" />
                  </a-col>
                  <a-col>
                    <div>Резкость (%):</div>
                    <a-slider v-model:value="shadowOpacity" :min="0" :max="100" />
                  </a-col>
                  <a-col>
                    <div>Смещение по горизонтали (px):</div>
                    <a-slider v-model:value="shadowOffsetX" :min="-50" :max="50" />
                  </a-col>
                  <a-col>
                    <div>Смещение по вертикали (px):</div>
                    <a-slider v-model:value="shadowOffsetY" :min="-50" :max="50" />
                  </a-col>
                </a-collapse-panel>
              </a-collapse>
            </a-collapse-panel>
          </a-collapse>

          <!-- НОВЫЙ БЛОК: Добавление прямоугольника и управление его стилями -->
          <a-divider />
          <a-collapse>
            <a-collapse-panel header="Прямоугольник" key="1">
              <a-button type="default" @click="addRectangle" style="margin-bottom: 10px;">Добавить прямоугольник</a-button>

              <a-row align="middle" :gutter="8">
                <a-col>
                  Толщина обводки:
                  <a-slider v-model:value="strokeWidth" :min="0" :max="20" style="width: 150px;" @change="updateStrokeWidth" />
                </a-col>
                <a-col>
                  Цвет обводки:
                  <input type="color" v-model="strokeColor" @input="updateStrokeColor" />
                </a-col>
                <a-col>
                  Тип линии:
                  <a-select
                    v-model="strokeDashString"
                    style="width: 140px"
                    @change="updateStrokeDashArrayFromString"
                  >
                    <a-select-option :value="lineTypes.solid">Сплошная</a-select-option>
                    <a-select-option :value="lineTypes.dashed">Пунктир</a-select-option>
                    <a-select-option :value="lineTypes.dashdot">Штрих-пунктир</a-select-option>
                  </a-select>
                </a-col>
              </a-row>

              <a-row align="middle" :gutter="8" style="margin-top: 10px;">
                <a-col>
                  Цвет заливки:
                  <input type="color" v-model="fillColor" @input="updateFillColor" />
                </a-col>
                <a-col>
                  Прозрачность:
                  <a-slider v-model:value="fillOpacity" :min="0" :max="1" :step="0.01" style="width: 150px;" @change="updateFillOpacity" />
                </a-col>
                <a-col>
                  Скругление углов:
                  <a-slider v-model:value="borderRadius" :min="0" :max="50" style="width: 150px;" @change="updateBorderRadius" />
                </a-col>
              </a-row>
            </a-collapse-panel>
          </a-collapse>
          <!-- НОВАЯ СЕКЦИЯ: Текст -->
          <a-divider />
          <a-collapse>
            <a-collapse-panel header="Текст" key="text">
              <a-button type="default" @click="addTextbox" style="margin-bottom: 10px;">Добавить текст</a-button>

              <a-row align="middle" :gutter="8">
                <a-col>
                  Шрифт:
                  <a-select v-model="textFont" style="width: 180px" @change="updateTextFont">
                    <a-select-option v-for="f in fontOptions" :key="f" :value="f">{{ f }}</a-select-option>
                  </a-select>
                </a-col>
                <a-col>
                  Размер:
                  <a-slider v-model:value="textSize" :min="8" :max="144" :step="1" style="width: 160px" @change="updateTextSize" />
                </a-col>
                <a-col>
                  Цвет:
                  <input type="color" v-model="textColor" @input="updateTextColor" />
                </a-col>
              </a-row>
              <div style="margin-top:8px; font-size:12px; color:#777;">
                Текстбокс фиксированной ширины: перенос по словам, рост по высоте.
              </div>
            </a-collapse-panel>
          </a-collapse>

        </div>

        <div v-else>
          <p>{{ tab.label }} содержимое</p>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- Скрытый input -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".svg,image/*"
      multiple
      style="display: none"
      @change="handleFileInputChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { onLoadImageFromFiles, logFabricCanvasObjects, saveAllObjectStates, centerObjectOnCanvas } from '@/services/useImageCanvas'
import { Rect, FabricObject, ActiveSelection, loadSVGFromString, util, Canvas, Textbox } from 'fabric'
import { useFabricStore } from '@/stores/fabric'
import { saveHighResImage } from '@/services/useImageExport'
import { UploadOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons-vue'
//import { useFontLoader } from '@/composables/useFontLoader'
import { loadFonts, families } from '@/composables/useFontLoader'
import type { TabItem } from '@/types/tabs'
import Editor from '@/components/editor'

const fileInputRef = ref<HTMLInputElement | null>(null)

const canvasWidthMM = ref<number>(0)
const canvasLengthMM = ref<number>(0)

const leftTabs = ref<TabItem[]>([])
const activeTab = ref('')

/** ------ Прямоугольник ------ **/
const strokeWidth = ref(2)
const strokeColor = ref('#000000')
const strokeDashArray = ref<number[] | undefined>(undefined)
const fillColor = ref('#ffa500')
const fillOpacity = ref(0.5)
const borderRadius = ref(0)

const lineTypes = {
  solid: 'none',          // сплошная
  dashed: '[5,5]',        // пунктир
  dashdot: '[10,5,2,5]'   // штрих-пунктир
}
const strokeDashString = ref(lineTypes.solid)

/** ------ Тень ------ **/
const shadowBlur = ref(10)
const shadowOpacity = ref(100) // %
const shadowOffsetX = ref(5)
const shadowOffsetY = ref(5)

const fabricStore = useFabricStore()

/** ------ Текст ------ **/
// Список шрифтов из папки
//const { families: fontOptions, ensureLoaded } = useFontLoader()
const fontOptions = ref([])
loadFonts().then(() => {
  fontOptions.value = families
})
const textFont = ref('Arial')
const textSize = ref(24)
const textColor = ref('#000000')
const DEFAULT_TEXTBOX_WIDTH_RATIO = 0.6

/** ===================== ФУНКЦИИ РАБОТЫ С ОБЪЕКТОМ ===================== **/
const addRectangle = () => {
  const canvas = fabricStore.canvas
  if (!canvas) {
    alert('Fabric Canvas не инициализирован')
    return
  }
  const size = Math.min(canvas.width ?? 100, canvas.height ?? 100) * 0.1

  const rect = new Rect({
    left: (canvas.width ?? 0) / 2,
    top: (canvas.height ?? 0) / 2,
    width: size,
    height: size,
    originX: 'center',
    originY: 'center',
    fill: fillColor.value,
    stroke: strokeColor.value,
    strokeWidth: strokeWidth.value,
    strokeDashArray: strokeDashArray.value,
    strokeUniform: true,
    selectable: true,
    centeredRotation: true,
    centeredScaling: true,
    rx: borderRadius.value,
    ry: borderRadius.value
  })

  canvas.add(rect)
  canvas.setActiveObject(rect)
  canvas.requestRenderAll()
  // Форсим синхронизацию UI (на случай, если selection-событие придёт позже)
  refreshUI()
}

const updateStrokeWidth = (value: number) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ strokeWidth: value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj })
  }
}

const updateStrokeColor = (event: Event) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ stroke: (event.target as HTMLInputElement).value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj })
  }
}

const updateStrokeDashArray = (value: number[] | undefined) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ strokeDashArray: value })
    fabricStore.canvas?.requestRenderAll()
  }
}

function updateStrokeDashArrayFromString(value: string) {
  if (value === 'none') {
    strokeDashArray.value = undefined
  } else {
    try {
      strokeDashArray.value = JSON.parse(value)
    } catch (e) {
      console.warn('Не удалось распарсить strokeDashArray:', e)
      strokeDashArray.value = undefined
    }
  }
  updateStrokeDashArray(strokeDashArray.value)
}

const updateFillColor = (event: Event) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ fill: (event.target as HTMLInputElement).value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj })
  }
}

const updateFillOpacity = (value: number) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ opacity: value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj })
  }
}

const updateBorderRadius = (value: number) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj && obj.type === 'rect') {
    obj.set({ rx: value, ry: value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj })
  }
}

/** ------ Текстовые объекты ------ **/
const addTextbox = async () => {
  const canvas = fabricStore.canvas
  if (!canvas) { alert('Fabric Canvas не инициализирован'); return }

  // гарантируем, что выбранный шрифт готов
  //await ensureLoaded(textFont.value, 400, 'normal')

  const tbWidth = Math.max(100, Math.floor((canvas.width ?? 500) * DEFAULT_TEXTBOX_WIDTH_RATIO))
  const tb = new Textbox('Введите текст…', {
    left: (canvas.width ?? 0) / 2,
    top: (canvas.height ?? 0) / 2,
    width: tbWidth,
    originX: 'center',
    originY: 'center',
    fontFamily: textFont.value,
    fontSize: textSize.value,
    fill: textColor.value,
    editable: true,
    lockScalingX: true,
    splitByGrapheme: false,
    textAlign: 'left'
  })
  canvas.add(tb)
  canvas.setActiveObject(tb)
  canvas.requestRenderAll()
  refreshUI()
}

const updateTextFont = async (font: string) => {
  const obj = fabricStore.canvas?.getActiveObject() as any
  //await ensureLoaded(font, obj?.fontWeight ?? 400, obj?.fontStyle ?? 'normal')
  if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
    obj.set({ fontFamily: font })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj })
  }
}
const updateTextSize = (val: number) => {
  const obj = fabricStore.canvas?.getActiveObject() as any
  if (obj && obj.type === 'textbox') {
    obj.set({ fontSize: val })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj })
  }
}
const updateTextColor = (e: Event) => {
  const obj = fabricStore.canvas?.getActiveObject() as any
  if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
    obj.set({ fill: (e.target as HTMLInputElement).value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj })
  }
}

/** ------ Тени ------ **/
interface Shadow {
  color?: string
  blur?: number
  offsetX?: number
  offsetY?: number
  affectStroke?: boolean
}

function updateShadow(params: {
  blur?: number
  color?: string
  offsetX?: number
  offsetY?: number
}) {
  const obj = fabricStore.canvas?.getActiveObject()
  if (!obj) return

  const currentShadow = (obj.shadow as Shadow) || {}
  const newColor = params.color ?? currentShadow.color ?? `rgba(0,0,0,${shadowOpacity.value / 100})`

  obj.set('shadow', {
    color: newColor,
    blur: params.blur ?? currentShadow.blur ?? shadowBlur.value,
    offsetX: params.offsetX ?? currentShadow.offsetX ?? shadowOffsetX.value,
    offsetY: params.offsetY ?? currentShadow.offsetY ?? shadowOffsetY.value,
    affectStroke: true
  })
  fabricStore.canvas?.requestRenderAll()
  fabricStore.canvas?.fire('object:modified', { target: obj })
}

/** ===================== СИНХРОНИЗАЦИЯ UI ===================== **/

// ⚠️ ВАЖНО: этот watch на getActiveObject() сам по себе не сработает,
// поэтому ниже мы навешиваем события canvas и вызываем refreshUI().
/*watch(
  () => fabricStore.canvas?.getActiveObject(),
  (obj) => {
    if (obj) {
      strokeWidth.value = obj.strokeWidth ?? 2
      strokeColor.value = typeof obj.stroke === 'string' ? obj.stroke : '#000000'
      strokeDashArray.value = obj.strokeDashArray ?? undefined
      fillColor.value = typeof obj.fill === 'string' ? obj.fill : '#ffa500'
      fillOpacity.value = typeof obj.opacity === 'number' ? obj.opacity : 1

      if (obj.type === 'rect') {
        const rect = obj as Rect
        borderRadius.value = rect.rx ?? rect.ry ?? 0
      } else {
        borderRadius.value = 0
      }

      if (obj.shadow) {
        const shadow = obj.shadow as Shadow
        shadowBlur.value = shadow.blur ?? 10
        const alphaMatch = shadow.color?.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/)
        shadowOpacity.value = alphaMatch ? parseFloat(alphaMatch[1]) * 100 : 100
        shadowOffsetX.value = shadow.offsetX ?? 5
        shadowOffsetY.value = shadow.offsetY ?? 5
      } else {
        shadowBlur.value = 10
        shadowOpacity.value = 100
        shadowOffsetX.value = 5
        shadowOffsetY.value = 5
      }
    }
  },
  { immediate: true }
)*/

/*watch(shadowBlur, (val) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) updateShadow({ blur: val })
})
watch(shadowOpacity, (val) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) updateShadow({ color: `rgba(0,0,0,${val / 100})` })
})
watch(shadowOffsetX, (val) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) updateShadow({ offsetX: val })
})
watch(shadowOffsetY, (val) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) updateShadow({ offsetY: val })
})

watch(strokeDashString, (newValue) => {
  console.log('strokeDashString изменен на:', newValue)
})*/

function updateUIFromActiveObject(obj: FabricObject | null) {
  if (!obj) {
    strokeWidth.value = 2
    strokeColor.value = '#000000'
    strokeDashArray.value = undefined
    fillColor.value = '#ffa500'
    fillOpacity.value = 0.5
    borderRadius.value = 0
    shadowBlur.value = 10
    shadowOpacity.value = 100
    shadowOffsetX.value = 5
    shadowOffsetY.value = 5
    strokeDashString.value = lineTypes.solid
    return
  }

  // strokeDashString
  const dashArray = obj.strokeDashArray
  if (!dashArray || dashArray.length === 0) {
    strokeDashString.value = lineTypes.solid
  } else if (Array.isArray(dashArray)) {
    const dashArrayStr = JSON.stringify(dashArray)
    if (dashArrayStr === JSON.stringify([5, 5])) {
      strokeDashString.value = lineTypes.dashed
    } else if (dashArrayStr === JSON.stringify([10, 5, 2, 5])) {
      strokeDashString.value = lineTypes.dashdot
    } else {
      strokeDashString.value = 'custom'
    }
  } else {
    strokeDashString.value = 'custom'
  }

  // Остальные параметры
  strokeWidth.value = obj.strokeWidth ?? 2
  strokeColor.value = typeof obj.stroke === 'string' ? obj.stroke : '#000000'
  strokeDashArray.value = obj.strokeDashArray ?? undefined
  fillColor.value = typeof obj.fill === 'string' ? obj.fill : '#ffa500'
  fillOpacity.value = obj.opacity ?? 1

  if (obj.type === 'rect') {
    const rect = obj as Rect
    borderRadius.value = (rect.rx || rect.ry) ?? 0
  } else {
    borderRadius.value = 0
  }

  const shadow = obj.shadow as Shadow
  if (shadow) {
    shadowBlur.value = shadow.blur ?? 10
    const alphaMatch = shadow.color?.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/)
    shadowOpacity.value = alphaMatch ? parseFloat(alphaMatch[1]) * 100 : 100
    shadowOffsetX.value = shadow.offsetX ?? 5
    shadowOffsetY.value = shadow.offsetY ?? 5
  } else {
    shadowBlur.value = 10
    shadowOpacity.value = 100
    shadowOffsetX.value = 5
    shadowOffsetY.value = 5
  }
}

/** ——— ключевая функция: вызывать при любых изменениях выделения/объекта ——— */
const refreshUI = () => {
  const canvas = fabricStore.canvas
  if (!canvas) return
  const activeObject = canvas.getActiveObject()
  if (activeObject?.type === 'activeselection') {
    const firstSelected = (activeObject as ActiveSelection).getObjects()[0]
    updateUIFromActiveObject(firstSelected ?? null)
  } else {
    updateUIFromActiveObject(activeObject ?? null)
  }
}

/** Навешиваем/снимаем события, когда canvas появляется/меняется */
function attachCanvasListeners(canvas: Canvas) {
  detachCanvasListeners(canvas) // защита от дублирования

  canvas.on('selection:created', refreshUI)
  canvas.on('selection:updated', refreshUI)
  canvas.on('selection:cleared', () => updateUIFromActiveObject(null))
  canvas.on('object:modified', refreshUI)
  canvas.on('object:added', refreshUI)
  canvas.on('object:removed', refreshUI)
  canvas.on('text:changed', refreshUI) // <— добавлено для текста

  // Поддержка масштабирования прямоугольника с сохранением rx/ry
  let savedRx = 0
  let savedRy = 0
  let scalingTarget: Rect | null = null

  const onScaling = (e: any) => {
    const obj = e.target
    if (!obj || obj.type !== 'rect') return
    const rect = obj as Rect
    if (!scalingTarget) {
      scalingTarget = rect
      savedRx = rect.rx ?? 0
      savedRy = rect.ry ?? 0
    }
  }
  const onMouseUp = () => {
    if (!scalingTarget) return
    const rect = scalingTarget
    const newWidth = rect.width! * (rect.scaleX ?? 1)
    const newHeight = rect.height! * (rect.scaleY ?? 1)
    rect.set({
      width: newWidth,
      height: newHeight,
      scaleX: 1,
      scaleY: 1,
      rx: savedRx,
      ry: savedRy
    })
    canvas.requestRenderAll()
    scalingTarget = null
    refreshUI()
  }

  ;(canvas as any).__lp_onScaling = onScaling
  ;(canvas as any).__lp_onMouseUp = onMouseUp
  canvas.on('object:scaling', onScaling)
  canvas.on('mouse:up', onMouseUp)

  // Первая синхронизация
  refreshUI()
}

function detachCanvasListeners(canvas: Canvas) {
  canvas.off('selection:created', refreshUI)
  canvas.off('selection:updated', refreshUI)
  canvas.off('selection:cleared', () => updateUIFromActiveObject(null))
  canvas.off('object:modified', refreshUI)
  canvas.off('object:added', refreshUI)
  canvas.off('object:removed', refreshUI)

  const onScaling = (canvas as any).__lp_onScaling
  const onMouseUp = (canvas as any).__lp_onMouseUp
  if (onScaling) canvas.off('object:scaling', onScaling)
  if (onMouseUp) canvas.off('mouse:up', onMouseUp)
  delete (canvas as any).__lp_onScaling
  delete (canvas as any).__lp_onMouseUp
}

watch(
  () => fabricStore.canvas,
  (canvas, prev) => {
    if (prev) detachCanvasListeners(prev)
    if (canvas) attachCanvasListeners(canvas)
  },
  { immediate: true }
)

/** ===================== MOUNT / UTILITIES ===================== **/
onMounted(async () => {
  try {
    const res = await fetch('/configs/config.json')
    if (!res.ok) throw new Error('Error loading config.json')
    const data = await res.json()
    canvasWidthMM.value = data.canvas.inputWidthMM
    canvasLengthMM.value = data.canvas.inputHeightMM

    const tabsRes = await fetch('/configs/tabs.json')
    const tabsData = await tabsRes.json()
    console.log('Загруженные табы:', tabsData)
    leftTabs.value = tabsData.left
    activeTab.value = tabsData.left[0]?.key || ''

  } catch (err) {
    console.error('Ошибка загрузки tabs.json:', err)
  }
})

onBeforeUnmount(() => {
  const canvas = fabricStore.canvas
  if (canvas) detachCanvasListeners(canvas)
})

/** ===================== ACTIONS / IO ===================== **/
const toggle3DView = () => {
  window.dispatchEvent(new Event('toggle-3d-view'))
}

const onMakeScreenshots = async () => {
  window.dispatchEvent(new Event('screenshoot-request'))
}

const bringToFront = () => window.dispatchEvent(new Event('objects:bringToFront'))
const sendToBack = () => window.dispatchEvent(new Event('objects:sendToBack'))
const bringForward = () => window.dispatchEvent(new Event('objects:bringForward'))
const sendBackwards = () => window.dispatchEvent(new Event('objects:sendBackwards'))

const onLoadImage = () => {
  fileInputRef.value?.click()
}

const handleFileInputChange = async (e: Event) => {
  const canvas = fabricStore.canvas
  if (!canvas) {
    console.error('Fabric canvas not ready')
    return
  }
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (!file) continue

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })

    if (fileExtension === 'svg') {
      try {
        const { objects, options } = await loadSVGFromString(fileContent)
        const validObjects = objects.filter((obj): obj is FabricObject => obj !== null)
        const svgGroup = util.groupSVGElements(validObjects, options)
        canvas.add(svgGroup)
        canvas.setActiveObject(svgGroup)
        canvas.requestRenderAll()
      } catch (error) {
        console.error('Error loading SVG:', error)
      }
    } else {
      await onLoadImageFromFiles(files, canvas)
    }

    logFabricCanvasObjects(canvas)
    saveAllObjectStates(canvas)
  }

  target.value = '' // сброс input
}

const onDeleteImage = () => {
  const canvas = fabricStore.canvas
  if (!canvas) {
    console.error('Fabric canvas не инициализирован')
    return
  }
  const activeObjects = canvas.getActiveObjects()
  if (!activeObjects || activeObjects.length === 0) {
    alert('Выберите изображение для удаления')
    return
  }
  activeObjects.forEach(obj => canvas.remove(obj))
  canvas.discardActiveObject()
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: activeObjects[0] })
}

const onResetImage = () => {
  const canvas = fabricStore.getCanvas()
  if (!canvas) {
    console.error('Fabric canvas не инициализирован')
    return
  }
  const activeObject = canvas.getActiveObject()
  if (!activeObject) {
    alert('Пожалуйста, выберите объект для центрирования')
    return
  }
  centerObjectOnCanvas(canvas, activeObject)
}

const onSaveImage = async () => {
  const canvas = fabricStore.getCanvas()
  if (!canvas) {
    console.error('Fabric canvas не инициализирован')
    return
  }
  try {
    const blob = await saveHighResImage(canvas, canvasWidthMM.value, canvasLengthMM.value)

    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'exported-image.png',
        types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }]
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'exported-image.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    alert('Изображение успешно сохранено!')
  } catch (err) {
    console.error('Ошибка при сохранении изображения:', err)
    alert('Ошибка при сохранении изображения. Проверьте консоль.')
  }
}
</script>

<style scoped>
.panel-wrapper {
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  padding-right: 0px;
  box-sizing: border-box;
}
.custom-tabs {
  height: 100%;
  /* TODO: временные стили для отладки */
  overflow: auto;
  height: 30vh;

  background-color: #ffffff;
  border-radius: 12px;
  padding: 8px;
  /* box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.08); */
}
.custom-tabs > *:nth-child(2) {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
