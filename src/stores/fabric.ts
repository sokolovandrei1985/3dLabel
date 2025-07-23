import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import type { Canvas } from 'fabric'
import type { FabricThreeTextureManager } from '@/services/FabricThreeTextureManager'

export const useFabricStore = defineStore('fabric', () => {
  const canvas = shallowRef<Canvas | null>(null)
  const textureManager = shallowRef<FabricThreeTextureManager | null>(null)

  function getCanvas(): Canvas | null {
    return canvas.value
  }

  function setCanvas(newCanvas: Canvas | null) {
    canvas.value = newCanvas
  }

  function getTextureManager(): FabricThreeTextureManager | null {
    return textureManager.value
  }

  function setTextureManager(manager: FabricThreeTextureManager | null) {
    textureManager.value = manager
  }

  return {
    canvas,
    textureManager,
    getCanvas,
    setCanvas,
    getTextureManager,
    setTextureManager,
  }
})