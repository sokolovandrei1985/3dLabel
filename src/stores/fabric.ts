import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { Canvas } from 'fabric'
import type { ActiveObject } from '@/types/canvas'
import type { FabricThreeTextureManager } from '@/services/FabricThreeTextureManager'

export const useFabricStore = defineStore('fabric', () => {
  const canvas = shallowRef<Canvas | null>(null)
  const textureManager = shallowRef<FabricThreeTextureManager | null>(null)
  const activeObject = ref<ActiveObject | null>(null)

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
    const canvasActiveObject = canvas.value.getActiveObject()
    console.log(canvasActiveObject)
  }

  function clearSelection(): void {
    activeObject.value = null
  }

  function subscribeCanvasEvents(): void {
    if (canvas.value) {
      canvas.value.on('selection:created', updateSelection)
      canvas.value.on('selection:updated', updateSelection)
      canvas.value.on('selection:cleared', () => clearSelection)
    }
  }

  function unsubscribeCanvasEvents(): void {
    if (canvas.value) {
      canvas.value.off('selection:created', updateSelection)
      canvas.value.off('selection:updated', updateSelection)
      canvas.value.off('selection:cleared', () => clearSelection)
    }
  }

  return {
    canvas,
    textureManager,
    getCanvas,
    setCanvas,
    getTextureManager,
    setTextureManager,
    //subscribeCanvasEvents,
    //unsubscribeCanvasEvents,
  }
})