import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'



const loader = new GLTFLoader()
let cachedNormalMap: THREE.Texture | null = null
const loadedModels: { [key: string]: THREE.Object3D } = {}

export async function loadModel(path: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene
        model.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true
          }
        })
        resolve(model)
      },
      undefined,
      (error) => reject(error)
    )
  })
}

async function loadTexture(path: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader()
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject)
  })
}

export async function makeObjectLabel(model: THREE.Object3D, canvasTexture: THREE.CanvasTexture) {
  
  if (!canvasTexture) {
    console.warn('canvasTexture not provided — skipping label material')
    return
  }
  canvasTexture.colorSpace = THREE.SRGBColorSpace

  if (!cachedNormalMap) {
    const normalMapPath = 'textures/normal_maps/Plastic016A_1K-JPG/Plastic016A_1K-JPG_NormalGL.jpg'
    cachedNormalMap = await loadTexture(normalMapPath)
  }
  const normalMap = cachedNormalMap

  model.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const oldMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

      const newMaterials = oldMaterials.map(() => new THREE.MeshPhysicalMaterial({
        map: canvasTexture,
        normalMap: normalMap!,
        transparent: true,
        metalness: 0,
        roughness: 0.2,
        alphaTest: 0.1,
        depthWrite: true,              
        side: THREE.DoubleSide,
        color: new THREE.Color(0.45, 0.45, 0.45)
      }))

      mesh.material = Array.isArray(mesh.material) ? newMaterials : newMaterials[0]
    }
  })
}

export function applyGlassMaterial(object: THREE.Object3D) {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe7f7f7,
        metalness: 0,
        roughness: 0,
        transparent: true,
        opacity: 0.8,
        transmission: 1,
        thickness: 0.05,
        side: THREE.FrontSide,
        depthWrite: false,
        depthTest: true,
        reflectivity: 0.7,
        clearcoat: 1,
        clearcoatRoughness: 0,
        ior: 1.33,
        normalScale: new THREE.Vector2(0.05, 0.05),
      })
      glassMaterial.needsUpdate = true

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(() => glassMaterial)
      } else {
        mesh.material = glassMaterial
      }
    }
  })
  console.log('applyGlassMaterial applied')
}

export function makeObjectWater(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true

      const waterMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe7f7f7,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 1,
        thickness: 0.9,
        ior: 1.33,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.0,
      })

      waterMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 }
        shader.vertexShader = `
          uniform float time;
          ${shader.vertexShader}
        `.replace(
          '#include <begin_vertex>',
          `
            #include <begin_vertex>

            float waveFreq = 100.0;
            float waveAmp = 0.0005;
            float waveSpeed = 3.0;

            transformed.y += sin(position.x * waveFreq + time * waveSpeed) * waveAmp;
            transformed.y += cos(position.z * waveFreq * 1.5 + time * waveSpeed * 1.2) * waveAmp * 0.5;
          `
        )

        waterMaterial.userData.shader = shader
      }

      waterMaterial.needsUpdate = true

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(() => waterMaterial)
      } else {
        mesh.material = waterMaterial
      }
    }
  })
  console.log('makeObjectWater applied')
}

export function makeObjectBasic(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true

      const basicMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3399ff,
        metalness: 0.1,
        roughness: 0,
        transmission: 1,
        thickness: 0.1,
        ior: 1.33,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        side: THREE.BackSide,
      })
      basicMaterial.needsUpdate = true

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(() => basicMaterial)
      } else {
        mesh.material = basicMaterial
      }
    }
  })
  console.log('makeObjectBasic applied')
}

export async function loadModelsFromJson(jsonUrl: string, canvasTexture: THREE.CanvasTexture): Promise<THREE.Object3D[]> {
  console.log('loadModelsFromJson start', jsonUrl)
  const response = await fetch(jsonUrl)
  if (!response.ok) throw new Error(`Ошибка загрузки models.json: ${response.statusText}`)
  
  const data = await response.json()
  const models: Array<{ name: string; path: string; material?: string }> = data.models
  console.log('[loadModelsFromJson] data.models', data.models)
  let renderOrderCounter = 20
  const result: THREE.Object3D[] = []


  for (const modelInfo of models) {
    console.log(`Loading model: ${modelInfo.name}`)
    const model = await loadModel(modelInfo.path)
    loadedModels[modelInfo.name] = model

    switch (modelInfo.material) {
      case 'glass':
        applyGlassMaterial(model)
        break
      case 'water':
        makeObjectWater(model)
        break
      case 'label':
        makeObjectLabel(model, canvasTexture)
        break
      case 'basic_water':
        makeObjectBasic(model)
        break
    }

    model.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).renderOrder = renderOrderCounter++
      }
    })

    result.push(model)
  }

  console.log('All models loaded')
  return result
}
