import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { Canvas } from 'fabric'
import type { FabricObject } from '@/models/fabric'
import { FabricObjectFactory } from '@/models/fabric'
import type { FabricThreeTextureManager } from '@/services/FabricThreeTextureManager'
import { LineTypes } from '@/components/editor/constants'

export const useFabricStore = defineStore('fabric', () => {
  const canvas = shallowRef<Canvas | null>(null)
  const textureManager = shallowRef<FabricThreeTextureManager | null>(null)
  const activeObject = ref<FabricObject>(null)

  function getCanvas(): Canvas | null {
    return canvas.value
  }

  function setCanvas(newCanvas: Canvas | null) {
    canvas.value = newCanvas
    if (newCanvas) {
      subscribeCanvasEvents()
    } else {
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
    const { type, aCoords, shadow, angle, opacity, fill, stroke, strokeWidth, strokeDashArray, rx, ry, fontFamily, fontSize, text } = canvasActiveObject

    const left = aCoords.tl.x
    const top = aCoords.tl.y
    const width = aCoords.tr.x - left
    const height = aCoords.bl.y - top

    const shadowObj = !shadow ? null : {
      color: shadow.color,
      blur: shadow.blur,
      offsetX: shadow.offsetX,
      offsetY: shadow.offsetY
    }

    let borderStyle
    if (!strokeDashArray?.length) {
      borderStyle = LineTypes.solid
    } else if (Array.isArray(strokeDashArray)) {
      const dashArrayStr = JSON.stringify(strokeDashArray)
      if (dashArrayStr === LineTypes.dashed) {
        borderStyle = LineTypes.dashed
      } else if (dashArrayStr === LineTypes.dashdot) {
        borderStyle = LineTypes.dashdot
      } else {
        borderStyle = 'custom'
      }
    } else {
      borderStyle = 'custom'
    }

    const params = {
      type: type === 'activeselection' ? 'group' : type,
      left,
      top,
      width,
      height,
      angle,
      opacity,
      shadow: shadowObj,
      color: fill,
      borderColor: stroke,
      borderWidth: strokeWidth,
      borderStyle,
      borderRadius: rx ?? ry ?? 0,
      text,
      fontFamily,
      fontSize
    }

    activeObject.value = FabricObjectFactory.createObject(params)
    //console.log(canvasActiveObject, activeObject.value)
  }

  function clearSelection(): void {
    activeObject.value = null
  }

  function updateActiveObject(obj: any): void {
    if (!canvas.value) return
    const actObj: any = canvas.value.getActiveObject()
    if (actObj) {
      console.log(obj)
      const { left, top, ...objProps } = obj
      if (left != null) actObj.setX(left)
      if (top != null) actObj.setY(top)
      actObj.set(objProps)
      if (obj.top != null || obj.left != null || obj.angle != null) actObj.setCoords()
      canvas.value.requestRenderAll()
      canvas.value.fire('object:modified', { target: actObj })
    }
  }

  function subscribeCanvasEvents(): void {
    if (canvas.value) {
      canvas.value.on('selection:created', updateSelection)
      canvas.value.on('selection:updated', updateSelection)
      canvas.value.on('selection:cleared', () => clearSelection)
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
      canvas.value.off('selection:cleared', () => clearSelection)
      canvas.value.off('object:modified', updateSelection)
      canvas.value.off('object:added', updateSelection)
      canvas.value.off('object:moving', updateSelection)
      canvas.value.off('object:scaling', updateSelection)
      canvas.value.off('object:rotating', updateSelection)
    }
  }

  return {
    canvas,
    textureManager,
    activeObject,
    getCanvas,
    setCanvas,
    getTextureManager,
    setTextureManager,
    updateActiveObject,
    //subscribeCanvasEvents,
    //unsubscribeCanvasEvents,
  }
})