import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface ThreeGlobals {
  camera: THREE.PerspectiveCamera
  orthoCamera: THREE.OrthographicCamera
  activeCamera: THREE.Camera
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  containerEl: HTMLElement | null
  fixedPerspectiveCameraState: {
    position: THREE.Vector3
    quaternion: THREE.Quaternion
    zoom: number
    fov: number
    controlsTarget: THREE.Vector3
  } | null
}

export const globals: ThreeGlobals = {
  camera: null!,
  orthoCamera: null!,
  activeCamera: null!,
  scene: null!,
  renderer: null!,
  controls: null!,
  containerEl: null,
  fixedPerspectiveCameraState: null
}
