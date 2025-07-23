import * as THREE from 'three'

export interface ThreeSceneService {
  init: () => void
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  orthoCamera: THREE.OrthographicCamera
  renderer: THREE.WebGLRenderer
  modelGroup: THREE.Group
  pivotGroup: THREE.Group
  tableGroup: THREE.Group
  switchCamera: (mode: 'perspective' | 'ortho') => void
  fitModelToView: () => void
}
