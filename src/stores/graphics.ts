// stores/graphics.ts
import { defineStore } from 'pinia'
import type { WebGLRenderer, Camera, Scene } from 'three'
//import { ref } from 'vue'

export const useGraphicsStore = defineStore('graphics', {
  state: () => ({
    renderer: null as WebGLRenderer | null,
    activeCamera: null as Camera | null,
    scene: null as Scene | null,             // Добавляем сцену
    isAnimationActive: true as boolean,
  }),
  actions: {
    setRenderer(renderer: WebGLRenderer) {
      this.renderer = renderer
    },
    setActiveCamera(camera: Camera) {
      this.activeCamera = camera
    },
    setScene(scene: Scene) {
      this.scene = scene
    },
    setAnimationActive(isActive: boolean) {
      this.isAnimationActive = isActive ?? true
    }
  },
})