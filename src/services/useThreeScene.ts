// useThreeScene.ts
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PMREMGenerator } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { loadModelsFromJson } from '@/services/useModelLoader'
import { useGraphicsStore } from '@/stores/graphics';
import { markRaw, watch } from 'vue'
import { useTextureStore } from '@/stores/texture';
import {Room} from './Room'
import { Table } from './tablewall';

//Область гллобальных переменных

export let camera: THREE.PerspectiveCamera
export let orthoCamera: THREE.OrthographicCamera
export let activeCamera: THREE.Camera
export let scene: THREE.Scene
export let renderer: THREE.WebGLRenderer
export let controls: OrbitControls
export let pmremGenerator: PMREMGenerator;

export let envMap: THREE.Texture | null = null;

let fixedPerspectiveCameraState: {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  zoom: number
  fov: number
  controlsTarget: THREE.Vector3
} | null = null

type CameraUIControls = {
  setRotationSliderEnabled: (enabled: boolean) => void
  setFitToViewEnabled: (enabled: boolean) => void
  setRotationSliderValue?: (value: number) => void
}

let uiControls: CameraUIControls | null = null

let containerEl: HTMLElement | null = null;

const frustumSize = 5;

let isSliderInternalUpdate = false

// --- Объявляем группы глобально ---

const tableGroup = new THREE.Group();

const modelGroup = new THREE.Group();

const pivotGroup = new THREE.Group();

const roomGroup = new THREE.Group();

//Экспортируемые функции

export function setUICallbacks(callbacks: CameraUIControls) {
  uiControls = callbacks
}



export function initScene(container: HTMLElement): void {
  const width = container.clientWidth
  const height = container.clientHeight
  console.log('width, height',width,height )
  containerEl = container; //запоминаем контейнер

  const graphicsStore = useGraphicsStore();
  scene = new THREE.Scene()

    // Сохраняем сцену в Pinia
  graphicsStore.setScene(markRaw(scene));

  //Создаем перспективную камеру
  function getAspect() {
    return container.clientWidth / container.clientHeight;
  }
  
  const aspect = getAspect();
  
  camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
  camera.position.z = 8;

  //Создаем орто камеру
  
  orthoCamera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    1000
  );
  orthoCamera.position.copy(camera.position);
  orthoCamera.lookAt(0, 0, 0);

  //Активная камера
  activeCamera = orthoCamera;

    // Сохраняем активную камеру в Pinia
  graphicsStore.setActiveCamera(markRaw(activeCamera));

  //Рендеринг
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  container.appendChild(renderer.domElement)
  renderer.setClearColor(0xFFDAB9);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;

  console.log('Renderer initialized and appended');
  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.BasicShadowMap; // быстрые но "жесткие" тени без фильтрации
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  //Для загрузки EXR
  pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  // Создаём controls один раз для текущей activeCamera
  controls = new OrbitControls(activeCamera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1
  controls.enabled = true; // Всегда включены
  controls.reset(); // сбрасывает вращение камеры
  controls.target.set(0, 0, 0);
  

  // По умолчанию OrbitControls отвечают только за зум и панорамирование, вращение отключено
  controls.enableRotate = true;
  controls.enablePan = true;
  controls.enableZoom = true;

  // Настройка кнопок мыши для удобства:
  // Левая кнопка - панорамирование (чтобы не конфликтовать с ручным вращением модели)
  // Средняя - зум
  // Правая - панорамирование (можно оставить так)
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };

  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;

  controls.update();

  console.log('OrbitControls initialized with rotate disabled (manual rotation mode)');


 fixedPerspectiveCameraState = {
    position: camera.position.clone(),
    quaternion: camera.quaternion.clone(),
    zoom: 2, //camera.zoom,
    fov: camera.fov,
    controlsTarget: controls.target.clone(),
    
  };  

  //Выводим группы на сцену

  // scene.add(tableGroup);

  scene.add(pivotGroup);

  //Добавляем группы в пивот группу
  pivotGroup.add(modelGroup);
  // pivotGroup.add(tableGroup);




  //Свет

 const directionalLight = new THREE.DirectionalLight(0xffffff, 20);
directionalLight.position.set(1, 0.8, 0);
directionalLight.castShadow = true;

const d = 1.5;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = -d;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 4; // уменьшено с 10 до 4

directionalLight.shadow.bias = -0.005;
directionalLight.shadow.normalBias = 0.05;

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

directionalLight.shadow.camera.updateProjectionMatrix();

scene.add(directionalLight);

const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);

  const directional1 = new THREE.DirectionalLight(0xffffff, 3);
  directional1.position.set(0, 1, -1);
  scene.add(directional1);
    
  const ambientLight = new THREE.AmbientLight(0xffffff, 3);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight (0xffffff, 2);
  scene.add(hemiLight);


  //Объекты сцены

  //Комната
  const room = new Room(1, 1, 5, -1);
  roomGroup.add(room)
  scene.add(roomGroup);





  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshToonMaterial({ color: 0xfbb03b })
  )
  sphere.position.set(0.5, 0.5, 0)
  // tableGroup.add(sphere)

  window.addEventListener('resize', () => {
    onWindowResize(container)
  })

  const textureStore = useTextureStore();

  watch(
    () => textureStore.canvasTexture,
    (canvasTexture) => {
      if (canvasTexture && renderer && scene && activeCamera) {
        canvasTexture.needsUpdate = true;
        renderer.render(scene, activeCamera);
        console.log('Three.js сцена отрендерена после обновления текстуры');
      }
    }
  );


  animate()
}

//Переключение камеры
  export function switchCamera(toCamera: 'perspective' | 'ortho') {
  console.log('switchCamera to:', toCamera)

  activeCamera = (toCamera === 'perspective') ? camera : orthoCamera;

  if (toCamera == 'perspective') {
    scene.remove(roomGroup)
    scene.add(tableGroup)
  } 
  else {
    scene.add(roomGroup)
    scene.remove(tableGroup)
  }

  controls.object = activeCamera;
  controls.update();

  if (containerEl) {
    onWindowResize(containerEl)
  }
      // Сохраняем активную камеру в Pinia
  const graphicsStore = useGraphicsStore();
  graphicsStore.setActiveCamera(markRaw(activeCamera));

  fitModelToView() // ← теперь корректно!
}


//Изменение размеров окна
export function onWindowResize(container: HTMLElement) {
  if (!renderer || !activeCamera) {
    console.warn('[onWindowResize] Renderer или activeCamera не инициализированы');
    return;
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  console.log('[onWindowResize] container size:', width, height);

  renderer.setSize(width, height);

  const graphicsStore = useGraphicsStore();
  // Сохраняем renderer в Pinia
  graphicsStore.setRenderer(markRaw(renderer));

  const aspect = width / height;

  if (activeCamera instanceof THREE.PerspectiveCamera) {
    activeCamera.aspect = aspect;
    activeCamera.updateProjectionMatrix();
    console.log('[onWindowResize] PerspectiveCamera updated. Aspect:', aspect);
    
  }

  if (activeCamera instanceof THREE.OrthographicCamera) {
    const frustumSize = 5;
    activeCamera.left = -frustumSize * aspect / 2;
    activeCamera.right = frustumSize * aspect / 2;
    activeCamera.top = frustumSize / 2;
    activeCamera.bottom = -frustumSize / 2;
    activeCamera.updateProjectionMatrix();
    console.log('[onWindowResize] OrthographicCamera updated. Aspect:', aspect);
  }
  
  fitModelToView()
}


//Позиционирование модели
export function setModelRotation(view: 'front' | 'back' | 'right' | 'left' | 'top') {
  console.log('setModelRotation:', view)

  if (!pivotGroup) return;

  // Только вращаем pivotGroup — модель остается на месте, камера не трогаем
  const euler = new THREE.Euler()

  switch (view) {
    case 'front': euler.set(0, 0, 0); break
    case 'back':  euler.set(0, Math.PI, 0); break
    case 'right': euler.set(0, -Math.PI / 2, 0); break
    case 'left':  euler.set(0, Math.PI / 2, 0); break
    case 'top':   euler.set(Math.PI / 2, 0, 0); break
  }

  pivotGroup.quaternion.setFromEuler(euler)

  // Обновление слайдера (без зацикливания)
  if (uiControls?.setRotationSliderValue) {
    isSliderInternalUpdate = true
    const angleMap = { front: 0, back: 180, right: 270, left: 90, top: 0 }
    uiControls.setRotationSliderValue(angleMap[view])
    setTimeout(() => { isSliderInternalUpdate = false }, 0)
  }
}



//Вращение слайдером
export function setModelRotationAngle(degrees: number) {
  if (!modelGroup || !pivotGroup) {
    console.warn('[setModelRotationAngle] modelGroup или pivotGroup не инициализированы')
    return
  }

  // Сбрасываем вращение modelGroup
  modelGroup.rotation.set(0, 0, 0)

  // Сброс поворота pivotGroup
  pivotGroup.quaternion.identity()
  controls.target.set(0, 0, 0)
  controls.update()
  // Угол вокруг оси Y
  const radians = THREE.MathUtils.degToRad(degrees)

  const euler = new THREE.Euler(0, radians, 0)
  pivotGroup.quaternion.setFromEuler(euler)
  controls.target.set(0, 0, 0)
  controls.update()
}


//Вписывание модели в окно
export function fitModelToView() {
  console.log('[fitModelToView] triggered')

  pivotGroup.quaternion.identity() // сброс поворота

  if (!modelGroup || !activeCamera || !renderer) return;

  if (!modelGroup || !activeCamera || !renderer) {
    console.warn('[fitModelToView] Scene not initialized')
    return
  }

  // --- габариты модели ---
const box = new THREE.Box3().setFromObject(modelGroup)
const size = box.getSize(new THREE.Vector3()) // w, h, d
const center = box.getCenter(new THREE.Vector3())

console.log('[fitModelToView] Model bounding box size:', size)
console.log('[fitModelToView] Model center:', center)

// --- габариты окна ---
const { width, height } = renderer.domElement.getBoundingClientRect()
const windowAspect = width / height

console.log('[fitModelToView] Viewport size:', { width, height })
console.log('[fitModelToView] Window aspect ratio:', windowAspect)

// небольшой отступ, чтобы модель не «липла» к краям
const margin_p = 2
const margin_o = 1.5
/* -------------------------------------------------------- *
 *  PERSPECTIVE CAMERA
 * -------------------------------------------------------- */
if (activeCamera instanceof THREE.PerspectiveCamera) {
  const fovY = THREE.MathUtils.degToRad(activeCamera.fov)
  const fovX = 2 * Math.atan(Math.tan(fovY / 2) * windowAspect)

  console.log('[fitModelToView] Camera FOV (Y radians):', fovY)
  console.log('[fitModelToView] Camera FOV (X radians):', fovX)

  const halfW = (size.x * margin_p) / 2
  const halfH = (size.y * margin_p) / 2

  console.log('[fitModelToView] Half dimensions with margin:', { halfW, halfH })

  const distForX = halfW / Math.tan(fovX / 2)
  const distForY = halfH / Math.tan(fovY / 2)

  console.log('[fitModelToView] Required distances:', {
    distForX,
    distForY,
  })

  const camDist = Math.max(distForX, distForY)
  console.log('[fitModelToView] Chosen camera distance:', camDist)

  activeCamera.position.set(center.x, center.y, center.z + camDist)
  activeCamera.near = camDist * 0.01
  activeCamera.far = camDist + size.z * margin_p + 100
  activeCamera.zoom = 1
  activeCamera.updateProjectionMatrix();
  activeCamera.lookAt(center)
  activeCamera.updateProjectionMatrix()

  console.log('[fitModelToView] Perspective camera positioned at:', activeCamera.position)
}


  /* -------------------------------------------------------- *
   *  ORTHOGRAPHIC CAMERA
   * -------------------------------------------------------- */
  if (activeCamera instanceof THREE.OrthographicCamera) {
    const dx = size.x * margin_o
    const dy = size.y * margin_o

    const halfBoxW = dx / 2
    const halfBoxH = dy / 2

    // ортокамера всегда смотрит со страницы +Z
    activeCamera.position.set(center.x, center.y, center.z + 10)
    activeCamera.lookAt(center)
    activeCamera.zoom = 1

    const boxAspect = dx / dy

    let halfWidth, halfHeight

    if (windowAspect > boxAspect) {
      // окно шире — ограничиваемся высотой
      halfHeight = halfBoxH
      halfWidth  = halfBoxH * windowAspect
    } else {
      // окно выше — ограничиваемся шириной
      halfWidth  = halfBoxW
      halfHeight = halfBoxW / windowAspect
    }

    activeCamera.left   = -halfWidth
    activeCamera.right  =  halfWidth
    activeCamera.top    =  halfHeight
    activeCamera.bottom = -halfHeight
    activeCamera.zoom = 1
    activeCamera.updateProjectionMatrix()
  }

  /* -------------------------------------------------------- *
   *  FINISH-UP
   * -------------------------------------------------------- */
  controls?.target.copy(center)
  controls?.update()
  
  // Обновляем интерфейс
  if (uiControls?.setRotationSliderValue) {
    isSliderInternalUpdate = true
    uiControls.setRotationSliderValue(0) // 0° = front
    setTimeout(() => {
      isSliderInternalUpdate = false
    }, 0)
  }
  console.log('[fitModelToView] complete, camera @', activeCamera.position)
}



export async function loadEnvironmentMap(
  url: string,
  pmremGenerator: PMREMGenerator,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  activeCamera: THREE.Camera,
  isEXR: boolean = true
): Promise<void> {
  return new Promise((resolve, reject) => {
    const loader = isEXR ? new EXRLoader() : new RGBELoader()
    loader.load(
      url,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        envMap = pmremGenerator.fromEquirectangular(texture).texture
        scene.environment = envMap
        scene.background = envMap
        // Если хотите, можно очистить и от dispose
        console.log('Environment map loaded')
        resolve()
      },
      undefined,
      (error) => {
        console.error('Ошибка загрузки окружения:', error)
        reject(error)
      }
    )
  })
}

export async function loadSceneModels(jsonUrl: string, canvasTexture: THREE.CanvasTexture) {
  console.log('loadSceneModels, старт')
  const models = await loadModelsFromJson(jsonUrl, canvasTexture)
  console.log('loadSceneModels, модели загружены')
  models.forEach(model => {
    modelGroup.add(model)
  })
  fitModelToView()
  //Стол
    // --- габариты модели ---
  const box = new THREE.Box3().setFromObject(modelGroup)
  const size = box.getSize(new THREE.Vector3()) // w, h, d
  const center = box.getCenter(new THREE.Vector3())
  const wallHeight = 100;
  const tableHeight = size.y/5;
  const tableDepth = size.x*6
  const tableWidth = size.x*6;
  const table = new Table(tableWidth, tableDepth, tableHeight, wallHeight); // ширина=100, глубина=10, высота=1
 
  table.position.set(0, -size.y/2-tableHeight/2-tableHeight*0.03, tableDepth/3);
  
  tableGroup.add(table);
  
}





function animate(time?: number) {
  requestAnimationFrame(animate)

  const t = (time ?? performance.now()) * 0.001;
  
    modelGroup.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material;
        if (mat) {
          const materials = Array.isArray(mat) ? mat : [mat];
          materials.forEach(material => {
            if (material.userData.shader && material.userData.shader.uniforms.time) {
              material.userData.shader.uniforms.time.value = t;
              // НЕ менять clearcoat и envMapIntensity напрямую в цикле
              // НЕ ставить material.needsUpdate = true;
            }
          });
        }
      }
    });

  controls.update()
  renderer.render(scene, activeCamera)
}


