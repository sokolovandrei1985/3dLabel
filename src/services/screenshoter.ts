import * as THREE from 'three'
import JSZip from 'jszip'
import { camera, activeCamera, switchCamera, setModelRotation, fitModelToView, scene } from '@/services/useThreeScene'
import type { Canvas } from 'fabric'
import { saveHighResImage } from '@/services/useImageExport'
import type { Ref } from 'vue'
import { useGlobalConfigStore } from '@/stores/globalConfig'

const VIEWS = ['front', 'back', 'right', 'left', 'top'] as const
type View = typeof VIEWS[number]

export default class Screenshoter {
  renderer: THREE.WebGLRenderer
  fabricCanvas: Canvas
  offscreenCanvas: OffscreenCanvas

  constructor(fabricCanvas: Canvas) {
    this.fabricCanvas = fabricCanvas
    this.offscreenCanvas = new OffscreenCanvas(1024, 1024)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.offscreenCanvas,
      context: this.offscreenCanvas.getContext('webgl2') || undefined
    })
  }

  async makeScreenshot(): Promise<Blob | null> {
    this.renderer.setSize(1024, 1024, false)
    this.renderer.setClearColor(0xFFDAB9);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.renderer.render(scene, activeCamera)
    return this.offscreenCanvas.convertToBlob()
  }
}