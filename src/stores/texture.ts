// stores/texture.ts
import { defineStore } from 'pinia'
import type { CanvasTexture } from 'three'

export const useTextureStore = defineStore('texture', {
  state: () => ({
    canvasTexture: null as CanvasTexture | null,
  }),
  actions: {
    setCanvasTexture(texture: CanvasTexture) {
      this.canvasTexture = texture
    },
    clearCanvasTexture() {
      this.canvasTexture = null
    }
  }
})