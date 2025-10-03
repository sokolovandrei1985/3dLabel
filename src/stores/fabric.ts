import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { Point, Shadow, Rect, Textbox, loadSVGFromString, util} from 'fabric'
import type { Canvas } from 'fabric'
import type { FabricObject } from '@/models/fabric'
import { FabricObjectFactory } from '@/models/fabric'
import type { FabricThreeTextureManager } from '@/services/FabricThreeTextureManager'
import {
  LINE_TYPES,
  DEFAULT_SHADOW,
  NEW_OBJECT_DEFAULTS,
  DEFAULT_TEXTBOX_WIDTH_RATIO
} from '@/components/editor/constants'

export const useFabricStore = defineStore('fabric', () => {
  const canvas = shallowRef<Canvas | null>(null)
  const canvasSize = ref<{ width: number, height: number } | null>(null)
  const textureManager = shallowRef<FabricThreeTextureManager | null>(null)
  const activeObject = ref<FabricObject>(null)
  //const rawActiveObject = ref<any>(null)

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

  function updateSelection(): void {
    if (!canvas.value) return
    const canvasActiveObject: any = canvas.value.getActiveObject()
    if (!canvasActiveObject) return
    //console.log(canvasActiveObject)
    //rawActiveObject.value = canvasActiveObject
    const { type, /*left, top, width, height,*/ shadow, angle, opacity, fill, stroke, strokeWidth, strokeDashArray, rx, ry, fontFamily, fontSize, text } = canvasActiveObject
    //const { width, height } = canvasActiveObject.getBoundingRect()

    const originCoords = canvasActiveObject.getPointByOrigin('left', 'top')
    /*const left = aCoords.tl.x
    const top = aCoords.tl.y
    const width = aCoords.tr.x - left
    const height = aCoords.bl.y - top*/

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
      left: originCoords.x,
      top: originCoords.y,
      width: canvasActiveObject.getScaledWidth(),
      height: canvasActiveObject.getScaledHeight(),
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
      fontSize
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
      const { left, top, strokeRadius, shadow, ...objProps } = obj
      // Координаты
      if (left != null || top != null) {
        const x = left ?? actObj.left
        const y = top ?? actObj.top
        actObj.setXY(new Point(x, y), left != null ? 'left' : 'center', top != null ? 'top' : 'center')
      }
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
      centeredScaling: true
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
      lockScalingX: true,
      splitByGrapheme: false,
      textAlign: 'left'
    })
    canvas.value.add(tb)
    canvas.value.setActiveObject(tb)
    canvas.value.requestRenderAll()
  }

  async function addSVG(svgContent: string): Promise<void> {
    if (!canvas.value) return

    const { objects, options } = await loadSVGFromString(svgContent)
    const validObjects = objects.filter((obj) => obj !== null)
    const svgGroup = util.groupSVGElements(validObjects, options)
    canvas.value.add(svgGroup)
    canvas.value.setActiveObject(svgGroup)
    canvas.value.requestRenderAll()
  }

  function removeSelected(): void {
    if (!canvas.value) return

    const activeObjects = canvas.value.getActiveObjects()
    if (!activeObjects || activeObjects.length === 0) return

    activeObjects.forEach(obj => canvas.value?.remove(obj))
    canvas.value.discardActiveObject()
    canvas.value.requestRenderAll()
  }

  function subscribeCanvasEvents(): void {
    if (canvas.value) {
      canvas.value.on('selection:created', updateSelection)
      canvas.value.on('selection:updated', updateSelection)
      canvas.value.on('selection:cleared', clearSelection)
      canvas.value.on('object:modified', updateSelection)
      canvas.value.on('object:added', updateSelection)
      canvas.value.on('object:moving', updateSelection)
      canvas.value.on('object:scaling', updateSelection)
      canvas.value.on('object:rotating', updateSelection)
    }
  }

  function unsubscribeCanvasEvents(): void {
    if (canvas.value) {
      canvas.value.off('selection:created', updateSelection)
      canvas.value.off('selection:updated', updateSelection)
      canvas.value.off('selection:cleared', clearSelection)
      canvas.value.off('object:modified', updateSelection)
      canvas.value.off('object:added', updateSelection)
      canvas.value.off('object:moving', updateSelection)
      canvas.value.off('object:scaling', updateSelection)
      canvas.value.off('object:rotating', updateSelection)
    }
  }

  return {
    canvas,
    canvasSize,
    textureManager,
    activeObject,
    //rawActiveObject,
    getCanvas,
    setCanvas,
    getTextureManager,
    setTextureManager,
    updateActiveObject,
    addRect,
    addText,
    addSVG,
    removeSelected,
  }
})