// stores/graphics.ts
import { defineStore } from 'pinia'
import type { WebGLRenderer, Camera, Scene } from 'three'
import * as THREE from 'three'
//import { ref } from 'vue'

export const useGraphicsStore = defineStore('graphics', {
  state: () => ({
    renderer: null as WebGLRenderer | null,
    activeCamera: null as Camera | null,
    scene: null as Scene | null,             // Добавляем сцену
    isAnimationActive: false as boolean,
    models: null as THREE.Object3D[] | null,
    envTexture: null as THREE.DataTexture | null
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
    },
    setModels(modelArray: THREE.Object3D[]) {
      this.models = modelArray
    },
    setEnvTexture(texture: THREE.DataTexture) {
      this.envTexture = texture
    },
  },
})