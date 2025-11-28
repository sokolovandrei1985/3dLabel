import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { Canvas, Point, Shadow, Rect, Textbox, loadSVGFromString, util, FabricImage, ActiveSelection} from 'fabric'
//import type { Canvas } from 'fabric'
import type { FabricObject } from '@/models/fabric'
import type { FabricObject as FabricObjectType } from 'fabric'
import { FabricObjectFactory } from '@/models/fabric'
import type { FabricThreeTextureManager } from '@/services/FabricThreeTextureManager'
import {
  LINE_TYPES,
  DEFAULT_SHADOW,
  NEW_OBJECT_DEFAULTS,
  DEFAULT_TEXTBOX_WIDTH_RATIO,
  CHANGE_LAYER_METHODS
} from '@/components/editor/constants'
import type { ChangeLayerType } from '@/components/editor/constants'
import { useImageFiles } from '@/stores/imageFiles'
import { useGlobalConfigStore } from '@/stores/globalConfig'
import { useEvents } from '@/composables/useEvents.ts'
import { initAligningGuidelines } from 'fabric/extensions'

const aligningGuidelinesConfig = {
  /** At what distance from the shape does alignment begin? */
  margin: 4,
  /** Aligning line dimensions */
  width: 1,
  /** Aligning line color */
  color: 'rgb(255,0,0,0.7)',
}

// добавляем кастомное свойство для хранения имени файла в хранилище imageFiles
FabricImage.customProperties.push('fileName')

export const useFabricStore = defineStore('fabric', () => {
  const canvas = shallowRef<Canvas | null>(null)
  const canvasSize = ref<{ width: number, height: number } | null>(null)
  const textureManager = shallowRef<FabricThreeTextureManager | null>(null)
  const activeObject = ref<FabricObject>(null)
  const { emit } = useEvents()
  const isLoading = ref<boolean>(false)
  const clipboard = shallowRef<FabricObjectType | null>(null)
  const isDeserializing = ref<boolean>(false)
  //const throttleTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
  //const rawActiveObject = ref<any>(null)

  async function init(canvasEl: HTMLCanvasElement): Promise<Canvas | null> {
    if (!canvasEl) {
      throw new Error('[Fabric] Передан пустой canvasEl')
    }
    try {
      const globalConfigStore = useGlobalConfigStore()
      await globalConfigStore.loadConfig()
      const { canvasConfig } = globalConfigStore

      if (!canvasConfig) return null

      const { inputWidthMM, inputHeightMM } = canvasConfig
      // Перевод миллиметров в пиксели (96 DPI)
      const width = inputWidthMM * 96 / 25.4
      const height = inputHeightMM * 96 / 25.4
      // Инициализация Fabric.js canvas
      const fabricCanvas = new Canvas(canvasEl, {
        backgroundColor: 'rgba(236, 170, 47, 0.23)',
        selection: true,
        preserveObjectStacking: true
      })
      fabricCanvas.setDimensions({ width, height }, { backstoreOnly: true })
      setCanvas(fabricCanvas)

      // TODO: Добавить возможность включать/выключать и настраивать цвет
      const deactivate = initAligningGuidelines(fabricCanvas, aligningGuidelinesConfig)

      console.log('[Fabric] Канвас инициализирован:', fabricCanvas)
      return fabricCanvas
    } catch (err) {
      console.error('[Fabric] Ошибка загрузки или инициализации:', err)
      return null
    }
  }

  function getCanvas(): Canvas | null {
    return canvas.value
  }

  function setCanvas(newCanvas: Canvas | null) {
    canvas.value = newCanvas
    if (newCanvas) {
      canvasSize.value = { width: newCanvas.width, height: newCanvas.height }
      subscribeCanvasEvents()
    } else {
      canvasSize.value = null
      unsubscribeCanvasEvents()
    }
  }

  function getTextureManager(): FabricThreeTextureManager | null {
    return textureManager.value
  }

  function setTextureManager(manager: FabricThreeTextureManager | null) {
    textureManager.value = manager
  }

  function emitUpdateEvent(): void {
    if (isDeserializing.value) return
    emit('fabric:update')
    //throttleTimeout.value = null
  }

  function updateSelection(): void {
    if (!canvas.value) return
    const canvasActiveObject: any = canvas.value.getActiveObject()
    if (!canvasActiveObject) return
    const { type, left, top, /*width, height,*/ shadow, angle, opacity, fill, stroke, strokeWidth, strokeDashArray, rx, ry, fontFamily, fontSize, text, fileName, scaleX, scaleY } = canvasActiveObject

    //const originCoords = canvasActiveObject.getPointByOrigin('left', 'top')

    const shadowObj = !shadow ? null : {
      color: shadow.color,
      blur: shadow.blur,
      offsetX: shadow.offsetX,
      offsetY: shadow.offsetY
    }

    let strokeStyle
    if (!strokeDashArray?.length) {
      strokeStyle = LINE_TYPES.solid.key
    } else if (Array.isArray(strokeDashArray)) {
      const dashArrayStr = JSON.stringify(strokeDashArray)
      if (dashArrayStr === JSON.stringify(LINE_TYPES.dashed.value)) {
        strokeStyle = LINE_TYPES.dashed.key
      } else if (dashArrayStr === JSON.stringify(LINE_TYPES.dashdot.value)) {
        strokeStyle = LINE_TYPES.dashdot.key
      } else {
        strokeStyle = LINE_TYPES.solid.key
      }
    } else {
      strokeStyle = LINE_TYPES.solid.key
    }

    const params = {
      type: type === 'activeselection' ? 'group' : type,
      // left: originCoords.x,
      // top: originCoords.y,
      left,
      top,
      width: canvasActiveObject.getScaledWidth(),
      height: canvasActiveObject.getScaledHeight(),
      scaleX,
      scaleY,
      angle,
      opacity,
      shadow: shadowObj,
      fill,
      stroke,
      strokeWidth,
      strokeStyle,
      strokeRadius: rx ?? ry ?? 0,
      text,
      fontFamily,
      fontSize,
      fileName
    }

    activeObject.value = FabricObjectFactory.createObject(params)
    //console.log(params, canvasActiveObject.getScaledWidth(), activeObject.value)
  }

  function clearSelection(): void {
    activeObject.value = null
    //rawActiveObject.value = null
  }

  function updateActiveObject(obj: any): void {
    if (!canvas.value) return
    const actObj: any = canvas.value.getActiveObject()
    if (actObj) {
      //console.log(obj)
      const { /*left, top,*/ strokeRadius, shadow, ...objProps } = obj
      // Координаты
      /*if (left != null || top != null) {
        const x = left ?? actObj.left
        const y = top ?? actObj.top
        actObj.setXY(new Point(x, y), left != null ? 'left' : 'center', top != null ? 'top' : 'center')
      }*/
      // Ширина и высота
      if (actObj.strokeWidth) {
        if (objProps.width != null) objProps.width -= actObj.strokeWidth
        if (objProps.height != null) objProps.height -= actObj.strokeWidth
      }
      // Радиус углов
      if (strokeRadius != null) {
        actObj.set({ rx: strokeRadius, ry: strokeRadius })
      }
      // Тень
      if (shadow) {
        let newShadow = actObj.shadow  // текущее значение тени
        if (!newShadow) {
          newShadow = new Shadow({
            ...DEFAULT_SHADOW,
            ...shadow
          })
        } else {
          newShadow = {
            ...newShadow,
            ...shadow
          }
        }
        actObj.set({ shadow: { ...newShadow } })
      } else if (actObj.shadow) {
        actObj.set({ shadow: null })
      }
      console.log(objProps)
      actObj.set(objProps)
      actObj.setCoords()
      canvas.value.renderAll()
      canvas.value.fire('object:modified', { target: actObj })
    }
  }

  function addRect(): void {
    if (!canvas.value) return

    const size = Math.min(canvasSize.value?.width ?? 100, canvasSize.value?.height ?? 100) * 0.1

    const rect = new Rect({
      ...NEW_OBJECT_DEFAULTS.rect,
      left: Math.round((canvasSize.value?.width ?? 0) / 2),
      top: Math.round((canvasSize.value?.height ?? 0) / 2),
      width: size,
      height: size,
      originX: 'center',
      originY: 'center',
      strokeUniform: true,
      selectable: true,
      centeredRotation: true,
      //centeredScaling: true
    })

    canvas.value.add(rect)
    canvas.value.setActiveObject(rect)
    canvas.value.requestRenderAll()
  }

  function addText(): void {
    if (!canvas.value) return

    const tbWidth = Math.max(100, Math.floor((canvasSize.value?.width ?? 500) * DEFAULT_TEXTBOX_WIDTH_RATIO))
    const tb = new Textbox('Введите текст…', {
      ...NEW_OBJECT_DEFAULTS.textbox,
      left: (canvas.value.width ?? 0) / 2,
      top: (canvas.value.height ?? 0) / 2,
      width: tbWidth,
      originX: 'center',
      originY: 'center',
      editable: true,
      splitByGrapheme: false,
      textAlign: 'left',
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      lockUniScaling: false,
      lockScalingFlip: false,
    })
    canvas.value.add(tb)
    canvas.value.setActiveObject(tb)
    canvas.value.requestRenderAll()
  }

  //TODO: думаю я это сломал, потому что не записываю fileName в svgGroup
  async function addSVG(imageName: string): Promise<void> {
    if (!canvas.value) return
    const { getImage } = useImageFiles()
    const imageContent = getImage(imageName)
    if (!imageContent) throw new Error(`Не найдено изображение ${imageName}!`)

    const { objects, options } = await loadSVGFromString(imageContent)
    const validObjects = objects.filter((obj) => obj !== null)
    const svgGroup = util.groupSVGElements(validObjects, options)
    svgGroup.originX = 'center'  // необходимо для корректного вращения
    svgGroup.originY = 'center'
    canvas.value.add(svgGroup)
    canvas.value.setActiveObject(svgGroup)
    canvas.value.requestRenderAll()
  }

  // функция загрузки изображения
  async function addImage(imageName: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!canvas.value) return
        const { getImage } = useImageFiles()
        const imageContent = getImage(imageName)
        if (!imageContent) throw new Error(`Не найдено изображение ${imageName}!`)

        const img = await FabricImage.fromURL(imageContent, { crossOrigin: 'anonymous' })
        const canvasWidth = canvasSize.value?.width ?? 100
        const canvasHeight = canvasSize.value?.height ?? 100

        img.set({
          originX: 'center',
          originY: 'center',
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          // TODO: все эти опции надо бы выкинуть в отдеьный fabric.js конфиг файл
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          lockUniScaling: false,
          lockScalingFlip: false,
          angle: 0,
          fileName: imageName,
        })
        const scaleX = canvasWidth / (img.width || 1)
        const scaleY = canvasHeight / (img.height || 1)
        const scale = Math.min(scaleX, scaleY, 1)
        img.scale(scale)
        canvas.value.add(img)
        canvas.value.setActiveObject(img)
        canvas.value.requestRenderAll()
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  function removeSelected(): void {
    if (!canvas.value) return

    const activeObjects = canvas.value.getActiveObjects()
    if (!activeObjects || activeObjects.length === 0) return

    activeObjects.forEach(obj => canvas.value?.remove(obj))
    canvas.value.discardActiveObject()
    canvas.value.requestRenderAll()
  }

  function changeObjectLayer(moveType: ChangeLayerType): void {
    if (!canvas.value) return
    const method = ((canvas.value as any)[CHANGE_LAYER_METHODS[moveType]] as Function).bind(canvas.value)
    const activeObject = canvas.value.getActiveObject()
    if (!activeObject) return

    if (activeObject.type === 'activeselection') {
      const activeSelection = activeObject as ActiveSelection
      for (const obj of activeSelection.getObjects()) {
        method(obj)
      }
      //canvas.discardActiveObject()
      //canvas.setActiveObject(activeSelection)
    } else {
      method(activeObject)
    }
    //canvas.value.discardActiveObject()
    canvas.value.requestRenderAll()
  }

  function discardSelection(): void {
    if (!canvas.value) return
    canvas.value.discardActiveObject()
    canvas.value.requestRenderAll()
  }

  function serialize(): Object {
    //console.log(canvas.value?.toJSON())
    return canvas.value?.toJSON()
  }

  async function deserialize(data: Object): Promise<void> {
    if (!canvas.value) return
    isLoading.value = true
    try {
      isDeserializing.value = true
      await canvas.value.loadFromJSON(data)
      canvas.value.requestRenderAll()
      // Принудительно вызываем обновление текустуры на модели
      requestAnimationFrame(() => {
        isDeserializing.value = false
        emitUpdateEvent()
      })
    } finally {
      isLoading.value = false
    }
  }

  async function copy(): Promise<void> {
    if (!canvas.value) return
    const activeObject: FabricObjectType | undefined = canvas.value.getActiveObject()
    if (activeObject) {
      clipboard.value = await activeObject.clone()
    }
  }

  async function paste() {
    if (!canvas.value || !clipboard.value) return
    const clonedObj = await clipboard.value.clone()
    canvas.value.discardActiveObject()
    clonedObj.set({
      left: clonedObj.left + 10,
      top: clonedObj.top + 10,
      evented: true,
    })
    if (clonedObj instanceof ActiveSelection) {
      // active selection needs a reference to the canvas.
      const avtiveSelection = clonedObj as ActiveSelection
      avtiveSelection.canvas = canvas.value
      avtiveSelection.forEachObject((obj) => {
        canvas.value!.add(obj)
      })
      // this should solve the unselectability
      avtiveSelection.setCoords()
    } else {
      canvas.value.add(clonedObj)
    }
    clipboard.value.top += 10
    clipboard.value.left += 10
    canvas.value.setActiveObject(clonedObj)
    canvas.value.requestRenderAll()
  }

  function getNextFabricObject(prev: boolean = false): void {
    if (!canvas.value) return

    const objects = canvas.value.getObjects()
    if (objects.length === 0) return

    const activeObject = canvas.value.getActiveObject()
    let nextIndex = prev ? objects.length - 1 : 0

    if (activeObject && objects.includes(activeObject)) {
      const currentIndex = objects.indexOf(activeObject)
      if (prev) {
        nextIndex = currentIndex === 0 ? objects.length - 1 : currentIndex - 1
      } else {
        nextIndex = currentIndex === objects.length - 1 ? 0 : currentIndex + 1
      }
    }

    canvas.value.setActiveObject(objects[nextIndex])
    canvas.value.requestRenderAll()
  }

  function subscribeCanvasEvents(): void {
    if (canvas.value) {
      canvas.value.on('selection:created', updateSelection)
      canvas.value.on('selection:updated', updateSelection)
      canvas.value.on('selection:cleared', clearSelection)
      canvas.value.on('object:modified', updateSelection)
      /*canvas.value.on('object:added', updateSelection)
      canvas.value.on('object:moving', updateSelection)
      canvas.value.on('object:scaling', updateSelection)
      canvas.value.on('object:rotating', updateSelection)*/

      canvas.value.on('object:modified', emitUpdateEvent)
      canvas.value.on('object:added', emitUpdateEvent)
      canvas.value.on('object:removed', emitUpdateEvent)
    }
  }

  function unsubscribeCanvasEvents(): void {
    if (canvas.value) {
      canvas.value.off('selection:created', updateSelection)
      canvas.value.off('selection:updated', updateSelection)
      canvas.value.off('selection:cleared', clearSelection)
      canvas.value.off('object:modified', updateSelection)
      /*canvas.value.off('object:added', updateSelection)
      canvas.value.off('object:moving', updateSelection)
      canvas.value.off('object:scaling', updateSelection)
      canvas.value.off('object:rotating', updateSelection)*/

      canvas.value.off('object:modified', emitUpdateEvent)
      canvas.value.off('object:added', emitUpdateEvent)
      canvas.value.off('object:removed', emitUpdateEvent)
    }
  }

  return {
    init,
    canvas,
    canvasSize,
    textureManager,
    activeObject,
    isLoading,
    clipboard,
    //rawActiveObject,
    getCanvas,
    setCanvas,
    getTextureManager,
    setTextureManager,
    updateActiveObject,
    addRect,
    addText,
    addSVG,
    addImage,
    removeSelected,
    discardSelection,
    changeObjectLayer,
    serialize,
    deserialize,
    copy,
    paste,
    getNextFabricObject,
  }
})