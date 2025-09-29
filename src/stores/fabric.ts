import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { Point } from 'fabric'
import type { Canvas } from 'fabric'
import type { FabricObject } from '@/models/fabric'
import { FabricObjectFactory } from '@/models/fabric'
import type { FabricThreeTextureManager } from '@/services/FabricThreeTextureManager'
import { LineTypes } from '@/components/editor/constants'

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
    console.log(canvasActiveObject)
    //rawActiveObject.value = canvasActiveObject
    const { type, /*left, top,*/ width, height, shadow, angle, opacity, fill, stroke, strokeWidth, strokeDashArray, rx, ry, fontFamily, fontSize, text } = canvasActiveObject

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
      strokeStyle = LineTypes.solid.key
    } else if (Array.isArray(strokeDashArray)) {
      const dashArrayStr = JSON.stringify(strokeDashArray)
      if (dashArrayStr === JSON.stringify(LineTypes.dashed.value)) {
        strokeStyle = LineTypes.dashed.key
      } else if (dashArrayStr === JSON.stringify(LineTypes.dashdot.value)) {
        strokeStyle = LineTypes.dashdot.key
      } else {
        strokeStyle = LineTypes.solid.key
      }
    } else {
      strokeStyle = LineTypes.solid.key
    }

    const params = {
      type: type === 'activeselection' ? 'group' : type,
      left: originCoords.x,
      top: originCoords.y,
      width,
      height,
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
    //console.log(canvasActiveObject, activeObject.value)
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
      const { left, top, strokeRadius, ...objProps } = obj
      // Координаты
      if (left != null || top != null) {
        const x = left ?? actObj.left
        const y = top ?? actObj.top
        actObj.setXY(new Point(x, y), left != null ? 'left' : 'center', top != null ? 'top' : 'center')
      }
      // Тип границы
      /*if (strokeStyle) {
        const strokeDashArray = LineTypes[strokeStyle]?.value || null
        actObj.set({ strokeDashArray })
      }*/
      if (strokeRadius != null) {
        actObj.set({ rx: strokeRadius, ry: strokeRadius })
      }
      actObj.set(objProps)
      //if (obj.top != null || obj.left != null || obj.angle != null) actObj.setCoords()
      actObj.setCoords()
      canvas.value.renderAll()
      canvas.value.fire('object:modified', { target: actObj })
    }
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
    //subscribeCanvasEvents,
    //unsubscribeCanvasEvents,
  }
})