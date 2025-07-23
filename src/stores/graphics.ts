// stores/graphics.ts
import { defineStore } from 'pinia';
import type { WebGLRenderer, Camera, Scene } from 'three';

export const useGraphicsStore = defineStore('graphics', {
  state: () => ({
    renderer: null as WebGLRenderer | null,
    activeCamera: null as Camera | null,
    scene: null as Scene | null,             // Добавляем сцену
  }),
  actions: {
    setRenderer(renderer: WebGLRenderer) {
      this.renderer = renderer;
    },
    setActiveCamera(camera: Camera) {
      this.activeCamera = camera;
    },
    setScene(scene: Scene) {
      this.scene = scene;
    },
  },
});