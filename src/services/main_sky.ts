import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PMREMGenerator } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { ImageCanvas } from './image';
import config from 'configs/config.json';
import JSZip from 'jszip';
import { Table } from './tablewall';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {Room} from './Room'


console.log('Script start');

const container = document.getElementById('centerTop')!;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const btnLoadModel = document.getElementById('btnLoadModel') as HTMLButtonElement;

const btnPerspective = document.getElementById('btnPerspective') as HTMLButtonElement;
const btnOrtho = document.getElementById('btnOrtho') as HTMLButtonElement;
const btnSwitchCamera = document.getElementById('btnSwitchCamera') as HTMLButtonElement;

const btnFront = document.getElementById('btnFront') as HTMLButtonElement;
const btnBack = document.getElementById('btnBack') as HTMLButtonElement;
const btnRight = document.getElementById('btnRight') as HTMLButtonElement;
const btnLeft = document.getElementById('btnLeft') as HTMLButtonElement;
const btnTop = document.getElementById('btnTop') as HTMLButtonElement;
const btnFitToView = document.getElementById('btnFitToView') as HTMLButtonElement;
const rotationSlider = document.getElementById('rotationSlider') as HTMLInputElement;

// const causticTexture = textureLoader.load('./textures/caustics/bottle.png');

console.log('DOM elements grabbed');

const scene = new THREE.Scene();

const frustumSize = 5;

function getAspect() {
  return container.clientWidth / container.clientHeight;
}

const aspect = getAspect();

const camera = new THREE.PerspectiveCamera(20, aspect, 0.1, 1000);
camera.position.z = 8;



const orthoCamera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  1000
);
orthoCamera.position.copy(camera.position);
orthoCamera.lookAt(0, 0, 0);





let activeCamera: THREE.Camera = orthoCamera;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0xFFDAB9);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 0.9;

container.appendChild(renderer.domElement);

console.log('Renderer initialized and appended');

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;



// Создаём controls один раз для текущей activeCamera
const controls = new OrbitControls(activeCamera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enabled = true; // Всегда включены

controls.target.set(0, 0, 0);

// По умолчанию OrbitControls отвечают только за зум и панорамирование, вращение отключено
controls.enableRotate = false;
controls.enablePan = true;
controls.enableZoom = true;

// Настройка кнопок мыши для удобства:
// Левая кнопка - панорамирование (чтобы не конфликтовать с ручным вращением модели)
// Средняя - зум
// Правая - панорамирование (можно оставить так)
controls.mouseButtons = {
  LEFT: THREE.MOUSE.PAN,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN,
};

controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;

controls.update();

console.log('OrbitControls initialized with rotate disabled (manual rotation mode)');


const fixedPerspectiveCameraState = {
  position: camera.position.clone(),
  quaternion: camera.quaternion.clone(),
  zoom: 0.8, //camera.zoom,
  fov: camera.fov,
  controlsTarget: controls.target.clone(),
  
};

// --- Объявляем modelGroup глобально ---

const tableGroup = new THREE.Group();
scene.add(tableGroup);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

// Рендерить modelGroup раньше
// modelGroup.renderOrder = 0;

// Рендерить tableGroup позже
// tableGroup.renderOrder = 1;
// Добавляем DirectionalLight с тенями
const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.position.set(10,10, 0);
directionalLight.castShadow = true;
   const directional1 = new THREE.DirectionalLight(0xffffff, 3);
    directional1.position.set(0, 10, -10);
    scene.add(directional1);

// directionalLight.shadow.camera.left = -10;
// directionalLight.shadow.camera.right = 10;
// directionalLight.shadow.camera.top = 10;
// directionalLight.shadow.camera.bottom = -10;
// directionalLight.shadow.camera.near = 1;
// directionalLight.shadow.camera.far = 50;

// directionalLight.shadow.mapSize.width = 2048;
// directionalLight.shadow.mapSize.height = 2048;

scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 4);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight (0xffffff, 2);
scene.add(hemiLight);

// const spotLight = new THREE.SpotLight(0xffffff, 2);
// spotLight.position.set(0, 3, 0); // поставь свет над бутылкой, примерно как в твоей сцене
// spotLight.angle = Math.PI / 4;
// spotLight.penumbra = 0.3;
// spotLight.decay = 2;
// spotLight.intensity = 5;
// spotLight.distance = 20;

// textureLoader.load('./textures/caustics/bottle.png', (texture) => {
//   console.log('Caustic Texture loaded', texture);
//   texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//   spotLight.map = texture;
//   spotLight.map.colorSpace = THREE.SRGBColorSpace;
//   spotLight.map.repeat.set(1, 1);
//   spotLight.map.offset.set(0, 0);
// });


// scene.add(spotLight);
// scene.add(spotLight.target);
// spotLight.target.position.set(0, 0, 0); // цель света — центр стола или бутылки
// spotLight.target.updateMatrixWorld();





const wallHeight = 100;
const tableHeight = 1;
const tableDepth = 10
const tableWidth = 10;
const tableWithWall = new Table(tableWidth, tableDepth, tableHeight, wallHeight); // ширина=100, глубина=10, высота=1
tableGroup.add(tableWithWall);

// Центрируем стол в tableGroup
const box = new THREE.Box3().setFromObject(tableWithWall);
const center = box.getCenter(new THREE.Vector3());
tableWithWall.position.sub(center);

const room = new Room(70, 70);
// scene.add(room);




rotationSlider.addEventListener('input', () => {
  if (activeCamera !== orthoCamera) {
    // Игнорируем вращение слайдера, если не ортокамера
    return;
  }

  const degrees = parseFloat(rotationSlider.value);
  const radians = THREE.MathUtils.degToRad(degrees);

  modelGroup.rotation.y = radians;
});


// --- Класс ModelScreenshotter с ярким освещением встроен в файл ---

class ModelScreenshotter {
  private renderer: THREE.WebGLRenderer;
  private modelGroup: THREE.Group;
  private container: HTMLElement;
  private orthoCamera: THREE.OrthographicCamera;
  private perspectiveCamera: THREE.PerspectiveCamera;
  private imageCanvas: ImageCanvas;

  // Добавляем функции управления, чтобы использовать их внутри скриншоттера
  private setModelRotation: (view: 'front' | 'back' | 'right' | 'left' | 'top') => void;

  private switchCamera: (toCamera: 'perspective' | 'ortho') => void;
  private resetRotationCenter: () => void;

  constructor(
    renderer: THREE.WebGLRenderer,
    modelGroup: THREE.Group,
    container: HTMLElement,
    orthoCamera: THREE.OrthographicCamera,
    perspectiveCamera: THREE.PerspectiveCamera,
    setModelRotation: (view: 'front' | 'back' | 'right' | 'left' | 'top') => void,
    switchCamera: (toCamera: 'perspective' | 'ortho') => void,
    resetRotationCenter: () => void,
    imageCanvas: ImageCanvas  // <-- новый параметр
  ) {
    this.renderer = renderer;
    this.modelGroup = modelGroup;
    this.container = container;
    this.orthoCamera = orthoCamera;
    this.perspectiveCamera = perspectiveCamera;
    this.setModelRotation = setModelRotation;
    this.switchCamera = switchCamera;
    this.resetRotationCenter = resetRotationCenter;
    this.imageCanvas = imageCanvas;
  }

  
  // /** Устанавливает яркое освещение в сцену, удаляя старое */
  // setupBrightLights(scene: THREE.Scene) {
  //   // Удаляем все старые источники света из сцены
  //   scene.children
  //     .filter(obj => obj instanceof THREE.Light)
  //     .forEach(light => scene.remove(light));

  //   const ambient = new THREE.AmbientLight(0xffffff, 5);
  //   scene.add(ambient);

  //   const directional1 = new THREE.DirectionalLight(0xffffff, 3);
  //   directional1.position.set(10, 10, 10);
  //   scene.add(directional1);

  //   const directional2 = new THREE.DirectionalLight(0xffffff, 1.5);
  //   directional2.position.set(-10, 10, -10);
  //   scene.add(directional2);

  //   const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
  //   hemiLight.position.set(0, 20, 0);
  //   scene.add(hemiLight);
  // }

  /** Захватывает скриншоты с разных ракурсов и упаковывает в ZIP */
  async captureScreenshotsZip(scene: THREE.Scene): Promise<Blob> {
  this.resetRotationCenter();

  // this.setupBrightLights(scene);

  const zip = new JSZip();

  // Запоминаем исходный размер и пиксельное соотношение
  const originalSize = new THREE.Vector2();
  this.renderer.getSize(originalSize);
  const originalPixelRatio = this.renderer.getPixelRatio();

  const aspect = originalSize.x / originalSize.y;

  // Рассчитываем целевой размер рендера
  let width: number, height: number;
  if (aspect >= 1) {
    height = 2000;
    width = Math.round(height * aspect);
  } else {
    width = 2000;
    height = Math.round(width / aspect);
  }

  width = Math.round(width);
  height = Math.round(height);

  // Устанавливаем базовые параметры рендера
  this.renderer.setPixelRatio(1);
  this.renderer.setSize(width, height, false);

  // Запоминаем активную камеру и поворот pivotGroup
  const originalCamera = activeCamera;
  const originalPivotQuaternion = pivotGroup.quaternion.clone();

  // Камеры для скриншотов
  const cameras: { camName: 'ortho' | 'persp'; camSwitchName: 'ortho' | 'perspective' }[] = [
    { camName: 'ortho', camSwitchName: 'ortho' },
    { camName: 'persp', camSwitchName: 'perspective' },
  ];

  // Ракурсы для скриншотов
  const views: Array<'front' | 'back' | 'left' | 'right'> = ['front', 'back', 'left', 'right'];

    // Добавляем в архив изображение из imageCanvas (через saveHighResImage)
  if (!this.imageCanvas) {
    throw new Error('imageCanvas не инициализирован');
  }
  // Получаем Blob PNG из saveHighResImage()
  const canvasImageBlob: Blob = await this.imageCanvas.saveHighResImage();
  // Если нужно получить SVG, тоже ждём Promise (опционально)
  const image_SVG = await this.imageCanvas.saveHighResSVG();
  // Добавляем PNG в архив
  zip.file('imageCanvas_export.png', canvasImageBlob);

  // Если хотите добавить SVG в архив, раскомментируйте:
  if (image_SVG) {
    zip.file('imageCanvas_export.svg', image_SVG);
  }

  for (const { camName, camSwitchName } of cameras) {
    this.switchCamera(camSwitchName);

    const cam = activeCamera;

    // Рендерим с увеличенным масштабом для качества
    const scaleFactor = 1.2;
    const renderWidth = Math.floor(width * scaleFactor);
    const renderHeight = Math.floor(height * scaleFactor);

    this.renderer.setSize(renderWidth, renderHeight, false);
    this.renderer.domElement.style.width = width + 'px';
    this.renderer.domElement.style.height = height + 'px';
    this.renderer.setPixelRatio(scaleFactor);

    // Настраиваем камеру под новый размер
    if (cam instanceof THREE.PerspectiveCamera) {
      cam.aspect = renderWidth / renderHeight;
      cam.fov = 60; // Можно адаптировать под ваши нужды
      cam.updateProjectionMatrix();
    } else if (cam instanceof THREE.OrthographicCamera) {
      const frustumSize = 5;
      cam.left = -frustumSize * (renderWidth / renderHeight) / 2;
      cam.right = frustumSize * (renderWidth / renderHeight) / 2;
      cam.top = frustumSize / 2;
      cam.bottom = -frustumSize / 2;
      cam.updateProjectionMatrix();
    }

    for (const view of views) {
      this.setModelRotation(view);

      pivotGroup.updateMatrixWorld(true);
      this.modelGroup.updateMatrixWorld(true);

      this.renderer.render(scene, cam);

      // Получаем Blob из канваса рендера
      const dataUrl = this.renderer.domElement.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();

      zip.file(`${camName}_screenshot_${view}.png`, blob);
    }
  }

  // Восстанавливаем исходные настройки рендера и камеры
  this.renderer.setSize(originalSize.x, originalSize.y, false);
  this.renderer.setPixelRatio(originalPixelRatio);

  // Восстанавливаем активную камеру и поворот pivotGroup
  this.switchCamera(originalCamera === camera ? 'perspective' : 'ortho');
  pivotGroup.quaternion.copy(originalPivotQuaternion);
  pivotGroup.updateMatrixWorld(true);

  if (activeCamera instanceof THREE.PerspectiveCamera) {
    activeCamera.aspect = originalSize.x / originalSize.y;
    activeCamera.updateProjectionMatrix();
  } else if (activeCamera instanceof THREE.OrthographicCamera) {
    const frustumSize = 5;
    activeCamera.left = -frustumSize * (originalSize.x / originalSize.y) / 2;
    activeCamera.right = frustumSize * (originalSize.x / originalSize.y) / 2;
    activeCamera.top = frustumSize / 2;
    activeCamera.bottom = -frustumSize / 2;
    activeCamera.updateProjectionMatrix();
  }



// Генерируем ZIP и возвращаем Blob
return zip.generateAsync({ type: 'blob' });

}


  dispose() {
    // Очистка, если нужно
  }
}

// let imageCanvas: ImageCanvas | null = null;

// const screenshotter = new ModelScreenshotter(
//   renderer,
//   modelGroup,
//   container,
//   orthoCamera,
//   camera,
//   setModelRotation,
//   switchCamera,
//   resetRotationCenter,
//   imageCanvas! 
// );
// screenshotter.setupBrightLights(scene);

const pivotGroup = new THREE.Group();
scene.add(pivotGroup);
pivotGroup.add(modelGroup);
// pivotGroup.add(tableGroup); 
let initialPosition = new THREE.Vector3();
let initialRotation = new THREE.Euler();
let initialScale = new THREE.Vector3(1, 1, 1);

const loader = new GLTFLoader();
const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

let initialModelPosition = new THREE.Vector3();
let initialModelScale = new THREE.Vector3(1, 1, 1);

const exrLoader = new EXRLoader();
const hdrLoader = new RGBELoader();
let envMap: THREE.Texture | null = null;
function loadEnvironmentMap(url: string) {
  console.log('Start loading environment map:', url);
  exrLoader.load(
  // hdrLoader.load(
    url,
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      envMap = pmremGenerator.fromEquirectangular(texture).texture;

      scene.environment = envMap;
      // scene.environment = null;
      // scene.background = null;
      scene.background = envMap;
      // texture.dispose();
      // pmremGenerator.dispose();
      
      console.log('Environment map loaded');
    },
    undefined,
    (error) => {
      console.error('Ошибка загрузки EXR окружения:', error);
    }
  );
}


//Каустический overlay

let overlayCausticMaterial: THREE.MeshPhysicalMaterial;
async function overlay() {
  const c_width = 2.8;
const c_depth = 3;
const causticGeometry = new THREE.PlaneGeometry(c_width, c_depth);


const textureLoader = new THREE.TextureLoader();

const causticTexture = textureLoader.load('./textures/caustics/bottle_bright.png', (texture) => {
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace; // правильное цветовое пространство
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);
});

overlayCausticMaterial = new THREE.MeshPhysicalMaterial({
  metalness: 0,
  roughness: 0.8,
  transmission: 0.1, 
  thickness: 0.2,
  ior: 1.5,
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  alphaTest: 0.05,            // снизил порог, чтобы меньше обрезалось
  color: 0xffffff,
  alphaMap: causticTexture,
  emissive: new THREE.Color(0xffffff),
  emissiveMap: causticTexture,
  emissiveIntensity: 20,      // увеличил яркость свечения
  blending: THREE.AdditiveBlending, // режим сложения для усиления свечения
  toneMapped: true,
  lightMap: causticTexture
});
overlayCausticMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.time = { value: 0 };

  // Пример анимации emissiveIntensity через uniform времени
  // Можно менять цвет, яркость, или добавить мерцание

  // Вставим код в fragment shader для анимации emissiveIntensity
  shader.fragmentShader = `
    uniform float time;
    ${shader.fragmentShader}
  `.replace(
    '#include <emissivemap_fragment>',
    `
      #include <emissivemap_fragment>
      // Добавим пульсацию свечения
      float baseIntensity = 5.0;
      float amplitude = 5.0;
      float pulse = baseIntensity + amplitude * (0.5 + 0.5 * sin(time * 5.0));
      totalEmissiveRadiance *= pulse;
    `
  );

  overlayCausticMaterial.userData.shader = shader;
};

    const causticOverlay = new THREE.Mesh(causticGeometry, overlayCausticMaterial);
    // Поворачиваем плоскость, чтобы она лежала горизонтально


    function degreesToRadians(degrees: number): number {
      return degrees * (Math.PI / 180);
    }
  
    const angleX = degreesToRadians(90);
    const angleZ = degreesToRadians(-90);
    causticOverlay.rotateX(angleX);
    causticOverlay.rotateZ(angleZ);
    // Смещаем по Y — над столом
    // tableGroup.updateMatrixWorld(true);
    causticOverlay.position.set(0, 0, 0);
    
    const boxModel = new THREE.Box3().setFromObject(modelGroup);
    const sizeModel = boxModel.getSize(new THREE.Vector3());
    console.log('Низ бутылки:', boxModel.min.y  )
    console.log('Размеры бутылки:',sizeModel )
    // // const boxTableScaled = new THREE.Box3().setFromObject(tableGroup);
    causticOverlay.position.y = boxModel.min.y;
    // causticOverlay.position.z = -c_width/2;
    causticOverlay.position.x = -c_depth/2 + boxModel.min.x*0.45;

    causticOverlay.renderOrder = 18
    scene.add(causticOverlay);
}

    


//Материалы 


// loadEnvironmentMap('textures/equirectangular/brown_photostudio_02_4k.exr');
// loadEnvironmentMap('textures/IntererHDRI_26/IntererHDRI_26.hdr');
// loadEnvironmentMap('textures/bush_restaurant_4k.exr');
// loadEnvironmentMap('textures/studio_small_09_4k.exr');
// loadEnvironmentMap('textures/qwantani_dawn_puresky_4k.exr');
// loadEnvironmentMap('textures/blue_photo_studio_4k.exr');
// loadEnvironmentMap('textures/small_empty_room_3_4k.exr');
// loadEnvironmentMap('textures/studio_small_02_4k.exr');
// loadEnvironmentMap('textures/cyclorama_hard_light_4k.exr');
loadEnvironmentMap('textures/lonely_road_afternoon_puresky_4k.exr');

function applyGlassMaterial(object: THREE.Object3D) {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      const glassMaterial = new THREE.MeshPhysicalMaterial({
       color: 0xe7f7f7,
      metalness: 0,
      roughness: 0,
      transparent: true,
      opacity: 0.8,
      transmission: 1, // для стекла в MeshPhysicalMaterial
      thickness: 0.01,  // толщина стекла
      side:  THREE.FrontSide,
      depthWrite: false,
      depthTest:  true,
      envMapIntensity: 1,
      reflectivity: 0.7,
      clearcoat: 1,
      clearcoatRoughness: 0,
      ior: 1.33,
      normalScale: new THREE.Vector2(0.05, 0.05),

      });
      glassMaterial.needsUpdate = true;
      

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(() => glassMaterial);
      } else {
        mesh.material = glassMaterial;
      }
    }
  });
  console.log('applyGlassMaterial applied');
}

function makeObjectWater(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

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
      });

      waterMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 };
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
        );

        waterMaterial.userData.shader = shader; // сохраним шейдер для обновления uniform
      };

      waterMaterial.needsUpdate = true;

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(() => waterMaterial);
      } else {
        mesh.material = waterMaterial;
      }
    }
  });
  console.log('makeObjectWater applied');
}



function makeObjectBasic(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

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
      });
      basicMaterial.needsUpdate = true;

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(() => basicMaterial);
      } else {
        mesh.material = basicMaterial;
      }
    }
  });
  console.log('makeObjectBasic applied');
}


function disableReflections(object: THREE.Object3D) {
  object.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial ||
          material instanceof THREE.MeshPhongMaterial
        ) {
          material.envMap = null;
          material.needsUpdate = true;
        }
      });
    }
  });
  console.log('disableReflections called');
}

function resetModelTransform() {
  modelGroup.position.copy(initialPosition);
  modelGroup.rotation.copy(initialRotation);

  if (canvasTexture) {
    canvasTexture.needsUpdate = true;
  }
  console.log('resetModelTransform called');
}

const sceneCenter = new THREE.Vector3(0, 0, 0);


let canvasTexture: THREE.CanvasTexture;

async function initImageCanvas() {
  console.log('initImageCanvas start');
  imageCanvas = await ImageCanvas.create(
    'leftContainer',
    'centerBottom',
    config.canvas.inputWidthMM,
    config.canvas.inputLengthMM,
    modelGroup,
    renderer,
    activeCamera,
    scene
  );
  console.log('ImageCanvas created');

  imageCanvas.initSizeInputs();
  console.log('Size inputs initialized');

  // canvasTexture = new THREE.CanvasTexture(imageCanvas.getCanvasElement());
  
  canvasTexture = new THREE.CanvasTexture(imageCanvas.getOffscreenCanvasElement());
  canvasTexture.colorSpace = THREE.SRGBColorSpace;
  canvasTexture.minFilter = THREE.LinearMipMapLinearFilter;
  canvasTexture.magFilter = THREE.LinearFilter;
  canvasTexture.format = THREE.RGBAFormat;
  canvasTexture.needsUpdate = true;
  console.log('CanvasTexture created and configured');

  imageCanvas.setOnRedrawCallback(() => {
    canvasTexture.needsUpdate = true;
  });
  console.log('initImageCanvas end');
  console.log('Canvas size:', imageCanvas.getCanvasElement().width, imageCanvas.getCanvasElement().height);
}

btnLoadModel.addEventListener('click', () => {
  console.log('btnLoadModel clicked');
  fileInput.value = '';
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  console.log('fileInput change event');
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) {
    console.log('No files selected');
    return;
  }

  const file = target.files[0];
  const url = URL.createObjectURL(file);
  console.log('Loading model from file:', file.name);

  loadModel(url)
    .then(() => console.log('Model loaded from file'))
    .catch((e) => console.error('Error loading model from file:', e))
    .finally(() => {
      URL.revokeObjectURL(url);
      console.log('URL revoked');
    });
});

interface ModelInfo {
  name: string;
  path: string;
}

async function loadModel(path: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        resolve(model);
      },
      undefined,
      (error) => reject(error)
    );
  });
}

async function loadTexture(path: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });
}

// Кеш для нормал карты
let cachedNormalMap: THREE.Texture | null = null;

async function makeObjectLabel(model: THREE.Object3D, canvasTexture: THREE.Texture) {
  if (!cachedNormalMap) {
    const normalMapPath = '/textures/normal_maps/Plastic016A_1K-JPG/Plastic016A_1K-JPG_NormalGL.jpg';
    cachedNormalMap = await loadTexture(normalMapPath);
  }
  const normalMap = cachedNormalMap;

  model.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const oldMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      const newMaterials = oldMaterials.map(() => new THREE.MeshPhysicalMaterial({
        map: canvasTexture,
        normalMap: normalMap,
        transparent: true,
        metalness: 0,
        roughness: 0.5,             // больше шероховатости
        alphaTest: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide,
        color: new THREE.Color(0.45, 0.45, 0.45),
        // clearcoat: 0.15,            // меньше бликов
        // clearcoatRoughness: 0.4,    // более рассеянные блики
        // emissive: new THREE.Color(0.1, 0.1, 0.1),
        // emissiveIntensity: 0.3,
      }));

      mesh.material = Array.isArray(mesh.material) ? newMaterials : newMaterials[0];
    }
  });
}

const loadedModels: { [key: string]: THREE.Object3D } = {};

async function loadModelsFromJson() {
  console.log('loadModelsFromJson start');
  try {
    const response = await fetch('/models.json');
    if (!response.ok) {
      throw new Error(`Ошибка загрузки models.json: ${response.statusText}`);
    }

    const data = await response.json();
    const models: Array<{name: string; path: string; material?: string}> = data.models;

    let renderOrderCounter = 20;  // счетчик для renderOrder

    for (const modelInfo of models) {
      console.log(`Loading model: ${modelInfo.name}`);

      const model = await loadModel(modelInfo.path);
      loadedModels[modelInfo.name] = model;
      switch (modelInfo.material) {
        case 'glass':
          applyGlassMaterial(model);
          break;
        case 'water':
          makeObjectWater(model);
          break;
        case 'label':
          if (canvasTexture) {
            await makeObjectLabel(model, canvasTexture);
          }
          break;
        case 'basic_water':
          makeObjectBasic(model);          
          break;
        // default:
        //   // Оставляем как есть
        //   break;
      }

      model.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).renderOrder = renderOrderCounter++;
        }
      });

      modelGroup.add(model);
      
      if (modelGroup.children.length === 1) {
        fitModelToView();
      }
    }
    
    fitTableToModel();
    console.log('All models loaded');
  } catch (error) {
    console.error('Error loading models from JSON:', error);
  }
}





let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let isControlLocked = false;

renderer.domElement.addEventListener('mousedown', (event) => {
  if (event.button !== 0) return;
  if (useOrbitControls && controls.enableRotate) return;// если OrbitControls активен — не обрабатывать
  isDragging = true;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;

  // Скрываем стол при начале вращения
  // tableGroup.visible = false;
});


tableGroup.visible = true;
renderer.domElement.addEventListener('mousemove', (event) => {
  if (!isDragging || isControlLocked) return;
  if (useOrbitControls && controls.enableRotate) return;
  if (activeCamera !== orthoCamera) return; // Вращаем объект только для ортокамеры
  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };

  const rotationSpeed = 0.005;

  const quatY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaMove.x * rotationSpeed);

  
   if (activeCamera === camera) { // перспективная камера — вращаем только вокруг Y
    pivotGroup.quaternion.premultiply(quatY);
  } else { // ортографическая камера — вращаем и вокруг X, и Y
    const quatX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaMove.y * rotationSpeed);

    pivotGroup.quaternion.premultiply(quatY);
    pivotGroup.quaternion.multiply(quatX);
  }

  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
});

renderer.domElement.addEventListener('mouseup', (event) => {
  if (event.button !== 0) return;
  if (useOrbitControls && controls.enableRotate) return;
  isDragging = false;
});

renderer.domElement.addEventListener('mouseleave', () => {
  if (useOrbitControls && controls.enableRotate) return;
  isDragging = false;
});

// Экспортируем в глобальную область для вызова из HTML
(window as any).onWindowResize = onWindowResize;
function onWindowResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  console.log('onWindowResize:', width, height);

  renderer.setSize(width, height);

  if (activeCamera instanceof THREE.PerspectiveCamera) {
    activeCamera.aspect = width / height;
    activeCamera.updateProjectionMatrix();
  } else if (activeCamera instanceof THREE.OrthographicCamera) {
    const aspect = width / height;
    activeCamera.left = -frustumSize * aspect / 2;
    activeCamera.right = frustumSize * aspect / 2;
    activeCamera.top = frustumSize / 2;
    activeCamera.bottom = -frustumSize / 2;
    activeCamera.updateProjectionMatrix();
  }
}

function setModelRotation(view: 'front' | 'back' | 'right' | 'left' | 'top') {
  console.log('setModelRotation:', view);

  // Сбрасываем вращение modelGroup вокруг Y
  modelGroup.rotation.y = 0;
  // НЕ сбрасываем pivotGroup.position, чтобы сохранить центрирование
  pivotGroup.quaternion.identity();

  let euler = new THREE.Euler();

  switch (view) {
    case 'front':
      euler.set(0, 0, 0);
      rotationSlider.value = '0';
      break;
    case 'back':
      euler.set(0, Math.PI, 0);
      rotationSlider.value = '180';
      break;
    case 'right':
      euler.set(0, -Math.PI / 2, 0);
      rotationSlider.value = '270';
      break;
    case 'left':
      euler.set(0, Math.PI / 2, 0);
      rotationSlider.value = '90';
      break;
    case 'top':
      euler.set(Math.PI / 2, 0, 0);
      break;
  }

  pivotGroup.quaternion.setFromEuler(euler);
}

//Переключение камеры
function switchCamera(toCamera: 'perspective' | 'ortho') {
  console.log('switchCamera to:', toCamera);

  resetRotationCenter();

  if (toCamera === 'perspective') {
    activeCamera = camera;
    scene.remove(room);
    // Восстанавливаем фиксированное состояние перспективной камеры
    camera.position.copy(fixedPerspectiveCameraState.position);
    camera.quaternion.copy(fixedPerspectiveCameraState.quaternion);
    camera.zoom = fixedPerspectiveCameraState.zoom;
    camera.fov = fixedPerspectiveCameraState.fov;
    camera.updateProjectionMatrix();

    controls.target.copy(fixedPerspectiveCameraState.controlsTarget);

    tableGroup.visible = true;
    scene.background = envMap;
    modelGroup.rotation.y = 0;
    rotationSlider.value = '0';
    rotationSlider.disabled = true;
    pivotGroup.quaternion.identity();

    btnFitToView.disabled = true;

    // Настраиваем controls для перспективной камеры
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.minPolarAngle = THREE.MathUtils.degToRad(0);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;

  } else {
    activeCamera = orthoCamera;
    scene.add(room);
    if (activeCamera instanceof THREE.OrthographicCamera) {
      activeCamera.zoom = 1;
      activeCamera.updateProjectionMatrix();
      btnFitToView.disabled = false;
    }

    controls.target.set(0, 0, 0);
    tableGroup.visible = false;
    scene.background = null;
    rotationSlider.disabled = false;
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    controls.update();
    // Настраиваем controls для ортографической камеры
    controls.enableRotate = false;
    controls.enablePan = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.minPolarAngle = THREE.MathUtils.degToRad(0);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
  }

  // Переключаем камеру у controls
  controls.object = activeCamera;
  controls.update();

  onWindowResize();

  if (canvasTexture) canvasTexture.needsUpdate = true;

  console.log(`Switched to ${toCamera === 'perspective' ? 'Perspective' : 'Orthographic'} Camera`);
}




btnPerspective.addEventListener('click', () => {
  console.log('btnPerspective clicked');
  switchCamera('perspective');
});

btnOrtho.addEventListener('click', () => {
  console.log('btnOrtho clicked');
  switchCamera('ortho');
});

let useOrbitControls = false;

btnSwitchCamera.addEventListener('click', () => {
  useOrbitControls = !useOrbitControls;

  if (useOrbitControls) {
    // Включаем полный OrbitControls: вращение + зум + панорамирование
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.enableZoom = true;

    // При переключении камеры, если нужно, переключаем activeCamera (пример)
    // activeCamera = activeCamera === orthoCamera ? camera : orthoCamera;
    controls.object = activeCamera;
    controls.update();

    console.log('OrbitControls включены полностью (вращение, зум, панорамирование)');
  } else {
    // Возвращаем OrbitControls в режим только зума и панорамирования
    controls.enabled = true;
    controls.enableRotate = false;
    controls.enablePan = true;
    controls.enableZoom = true;

    controls.object = activeCamera;
    controls.update();

    console.log('OrbitControls включены только для зума и панорамирования, ручное вращение активно');
  }
});



btnFront.addEventListener('click', () => {
  console.log('btnFront clicked');
  setModelRotation('front');
});

btnBack.addEventListener('click', () => {
  console.log('btnBack clicked');
  setModelRotation('back');
});

btnRight.addEventListener('click', () => {
  console.log('btnRight clicked');
  setModelRotation('right');
});

btnLeft.addEventListener('click', () => {
  console.log('btnLeft clicked');
  setModelRotation('left');
});

btnTop.addEventListener('click', () => {
  console.log('btnTop clicked');
  setModelRotation('top');
});



// Кнопка для скриншотов и скачивания ZIP
const btnScreenshot = document.createElement('button');
btnScreenshot.textContent = 'Сделать скриншоты и скачать ZIP';
btnScreenshot.style.position = 'absolute';
btnScreenshot.style.top = '50px';
btnScreenshot.style.right = '10px';
btnScreenshot.style.zIndex = '1000';
document.body.appendChild(btnScreenshot);

btnScreenshot.addEventListener('click', async () => {
  if (!screenshotter) {
    alert('Скриншоттер не инициализирован');
    return;
  }
  if (modelGroup.children.length === 0) {
    alert('Модель не загружена');
    return;
  }
  if (imageCanvas) {
    imageCanvas.deselectActiveObject();
  } 
  resetRotationCenter();
  try {
    const zipBlob = await screenshotter.captureScreenshotsZip(scene);

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model_screenshots.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Ошибка при создании скриншотов:', e);
    alert('Ошибка при создании скриншотов. Подробности в консоли.');
  } finally {
    screenshotter.dispose();
  }
});
function logState(stage: string) {
  console.log(`--- ${stage} ---`);
  console.log('pivotGroup.position:', pivotGroup.position.toArray());
  console.log('pivotGroup.quaternion:', pivotGroup.quaternion.toArray());
  console.log('modelGroup.position:', modelGroup.position.toArray());

  const bboxLocal = new THREE.Box3().setFromObject(modelGroup);
  const centerLocal = bboxLocal.getCenter(new THREE.Vector3());
  console.log('bbox modelGroup local min:', bboxLocal.min.toArray(), 'max:', bboxLocal.max.toArray());
  console.log('center modelGroup local:', centerLocal.toArray());

  // Для мирового bbox возьмём pivotGroup (родитель) + modelGroup + дети
  const bboxWorld = new THREE.Box3().setFromObject(pivotGroup);
  const centerWorld = bboxWorld.getCenter(new THREE.Vector3());
  console.log('bbox pivotGroup world min:', bboxWorld.min.toArray(), 'max:', bboxWorld.max.toArray());
  console.log('center pivotGroup world:', centerWorld.toArray());

  console.log('controls.target:', controls.target.toArray());
  console.log('---------------------');
}


btnFitToView.addEventListener('click', () => {
  console.log('btnFitToView clicked');
resetRotationCenter();
    
});



function resetRotationCenter() {
  console.log('--- resetRotationCenter start ---');
  console.log('Camera zoom before resetRotationCenter:', camera.zoom);
  console.log('Model scale at start:', modelGroup.scale.toArray());
  
  setModelRotation('front');
  console.log('setModelRotation("top") вызвана');
   if (activeCamera instanceof THREE.PerspectiveCamera) {
    // Восстановить позицию и ориентацию камеры
    activeCamera.position.copy(fixedPerspectiveCameraState.position);
    activeCamera.quaternion.copy(fixedPerspectiveCameraState.quaternion);
    activeCamera.zoom = fixedPerspectiveCameraState.zoom;
    activeCamera.fov = fixedPerspectiveCameraState.fov;
    activeCamera.updateProjectionMatrix();

    // Восстановить target OrbitControls
    controls.target.copy(fixedPerspectiveCameraState.controlsTarget);

  } else if (activeCamera instanceof THREE.OrthographicCamera) {
    // Для ортокамеры можно сохранить аналогичные начальные параметры отдельно
    // Например:
    if (fixedPerspectiveCameraState) {
      activeCamera.position.copy(fixedPerspectiveCameraState.position);
      activeCamera.zoom = fixedPerspectiveCameraState.zoom;
      activeCamera.updateProjectionMatrix();
      controls.target.copy(fixedPerspectiveCameraState.controlsTarget);
    }
  }
  controls.update();


  if (activeCamera === orthoCamera) {
    tableGroup.visible = true;
    scene.background = envMap;  
  }
  else {
    tableGroup.visible = true;
    scene.background = envMap;  
  }
  rotationSlider.disabled = false;
  pivotGroup.position.set(0, 0, 0);
  pivotGroup.updateMatrixWorld(true);
  console.log('pivotGroup.position сброшена в (0,0,0)');

  const box = new THREE.Box3().setFromObject(modelGroup);
  const centerLocal = new THREE.Vector3();
  box.getCenter(centerLocal);
  const size = box.getSize(new THREE.Vector3());

  console.log('Bounding box size модели:', size.toArray());
  console.log('Bounding box центр в локальных координатах modelGroup:', centerLocal.toArray());

  const centerWorld = modelGroup.localToWorld(centerLocal.clone());
  console.log('Bounding box центр в мировых координатах:', centerWorld.toArray());

  const cameraPosition = activeCamera.position.clone();
  console.log('Позиция камеры:', cameraPosition.toArray());

  const cameraDirection = new THREE.Vector3();
  activeCamera.getWorldDirection(cameraDirection);
  console.log('Направление взгляда камеры:', cameraDirection.toArray());

  const toCenter = centerWorld.clone().sub(cameraPosition);
  console.log('Вектор от камеры к центру модели:', toCenter.toArray());

  const distanceAlongView = toCenter.dot(cameraDirection);
  console.log('Расстояние вдоль взгляда камеры до центра модели:', distanceAlongView);

  const projected = toCenter.clone().sub(cameraDirection.clone().multiplyScalar(distanceAlongView));
  console.log('Проекция вектора на плоскость, перпендикулярную взгляду камеры:', projected.toArray());

  pivotGroup.position.sub(projected);
  pivotGroup.updateMatrixWorld(true);
  console.log('pivotGroup.position после смещения:', pivotGroup.position.toArray());

    if (activeCamera instanceof THREE.OrthographicCamera) {
    activeCamera.zoom = 1;
    activeCamera.updateProjectionMatrix();
  } else {
    console.warn('resetRotationCenter: activeCamera is not OrthographicCamera');
  }
  console.log('Fit to view: camera zoom reset to 1');
  console.log('camera.zoom after resetRotationCenter:', camera.zoom);
  console.log('Model scale at end:', modelGroup.scale.toArray());
  console.log('--- resetRotationCenter end ---');
}


function scaleModelToFitCanvas(
  pivotGroup: THREE.Group,
  camera: THREE.OrthographicCamera,
  container: HTMLElement,
  frustumSize: number
) {
  console.log('--- scaleModelToFitCanvas start ---');

  const width = container.clientWidth;
  const height = container.clientHeight;
  const aspect = width / height;

  // ВАЖНО: сбросить позицию и масштаб pivotGroup и modelGroup для корректного вычисления bbox
  pivotGroup.position.set(0, 0, 0);
  pivotGroup.rotation.set(0, 0, 0);
  pivotGroup.updateMatrixWorld(true);

  modelGroup.position.set(0, 0, 0);
  modelGroup.scale.set(1, 1, 1);
  modelGroup.updateMatrixWorld(true);

  // Вычисляем bbox локально относительно modelGroup
  const box = new THREE.Box3().setFromObject(modelGroup);
  if (box.isEmpty()) {
    console.warn('Bounding box пустой, масштабирование не выполнено');
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Размеры фрустра камеры
  const frustumHeight = frustumSize;
  const frustumWidth = frustumSize * aspect;

  // Вычисляем масштаб с запасом 80%
  const scaleX = (frustumWidth * 0.8) / size.x;
  const scaleY = (frustumHeight * 0.8) / size.y;
  const scale = Math.min(scaleX, scaleY);

  if (!isFinite(scale) || scale <= 0) {
    console.warn('Некорректный коэффициент масштабирования');
    return;
  }

  // Центрируем модель локально
  modelGroup.position.copy(center).multiplyScalar(-1);

  // Применяем масштаб
  modelGroup.scale.setScalar(scale);

  modelGroup.updateMatrixWorld(true);

  console.log('Model scaled and centered locally');
  console.log('modelGroup.position:', modelGroup.position.toArray());
  console.log('modelGroup.scale:', modelGroup.scale.toArray());

  // НЕ трогаем pivotGroup.position здесь
  console.log('--- scaleModelToFitCanvas end ---');
}

function fitModelToView() {
  // Сбрасываем поворот и позицию pivotGroup
  pivotGroup.position.set(0, 0, 0);
  pivotGroup.quaternion.identity();

  // Сбрасываем позицию и масштаб modelGroup для корректного вычисления bbox
  modelGroup.position.set(0, 0, 0);
  modelGroup.scale.set(1, 1, 1);

  pivotGroup.updateMatrixWorld(true);
  modelGroup.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(modelGroup);
  if (box.isEmpty()) {
    console.warn('Bounding box пустой, масштабирование не выполнено');
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const aspect = container.clientWidth / container.clientHeight;
  const frustumHeight = frustumSize;
  const frustumWidth = frustumSize * aspect;

  const scaleX = (frustumWidth * 0.8) / size.x;
  const scaleY = (frustumHeight * 0.8) / size.y;
  const scale = Math.min(scaleX, scaleY);

  if (!isFinite(scale) || scale <= 0) {
    console.warn('Некорректный коэффициент масштабирования');
    return;
  }

  modelGroup.scale.setScalar(scale);
  modelGroup.position.copy(center).multiplyScalar(-1);

  pivotGroup.updateMatrixWorld(true);

  // Центрируем controls.target
  controls.target.set(0, 0, 0);
  controls.update();

  console.log('Модель вписана в видимую область камеры');
}

function fitTableToModel() {
  // Сбрасываем позицию и масштаб стола для корректных вычислений
  tableGroup.position.set(0, 0, 0);
  tableGroup.scale.set(1, 1, 1);
  tableGroup.updateMatrixWorld(true);

  // Получаем bbox стола в локальных координатах tableGroup
  const boxTable = new THREE.Box3().setFromObject(tableGroup);
  if (boxTable.isEmpty()) {
    console.warn('Bounding box стола пустой');
    return;
  }
  const sizeTable = boxTable.getSize(new THREE.Vector3());
  const centerTable = boxTable.getCenter(new THREE.Vector3());

  // Получаем bbox модели (уже отмасштабированной и центрированной)
  const boxModel = new THREE.Box3().setFromObject(modelGroup);
  if (boxModel.isEmpty()) {
    console.warn('Bounding box модели пустой');
    return;
  }
  const sizeModel = boxModel.getSize(new THREE.Vector3());
  const centerModel = boxModel.getCenter(new THREE.Vector3());

  // Рассчитываем масштаб, чтобы стол поместился по ширине и глубине модели
  // Можно масштабировать по X и Z (ширина и глубина)
  const scaleX = 10*sizeModel.x / sizeTable.x;
  const scaleZ = 10*sizeModel.z / sizeTable.z;
  const scaleY = 10*sizeModel.y / sizeTable.y;
  // Выбираем минимальный масштаб, чтобы стол не выходил за модель
  const scale = Math.min(scaleX, scaleZ);

  if (!isFinite(scale) || scale <= 0) {
    console.warn('Некорректный масштаб для стола');
    return;
  }

  // tableGroup.scale.setScalar(scale);

  // Обновляем bbox стола после масштабирования
  tableGroup.updateMatrixWorld(true);
  const boxTableScaled = new THREE.Box3().setFromObject(tableGroup);
  const sizeTableScaled = boxTableScaled.getSize(new THREE.Vector3());
  const centerTableScaled = boxTableScaled.getCenter(new THREE.Vector3());

  // Сдвигаем стол так, чтобы он стоял под моделью по Y
  // Например, стол должен "касаться" нижней грани модели
  const modelBottomY = boxModel.min.y;
  const tableTopY = boxTableScaled.min.y + tableHeight+0.05;

  // Смещаем стол по Y так, чтобы верхняя грань стола совпала с нижней гранью модели
  const deltaY = modelBottomY - tableTopY;

  // Центрируем стол по X и Z относительно модели
  const deltaX = centerModel.x - centerTableScaled.x;
  const deltaZ = centerModel.z - centerTableScaled.z+2;

  tableGroup.position.set(deltaX, deltaY, deltaZ);

  tableGroup.updateMatrixWorld(true);

  console.log('Стол подогнан под модель');
}


btnFitToView.addEventListener('click', () => {
  fitModelToView();

  // Показываем стол при вписывании в окно
  tableGroup.visible = true;
});



// Добавляем слушатель колесика мыши к канвасу
renderer.domElement.addEventListener('wheel', (event) => {
  console.log('Wheel event deltaY:', event.deltaY);
  console.log('Camera zoom before:', camera.zoom);

  event.preventDefault();

  const zoomSpeed = 0.002; // уменьшенный коэффициент чувствительности
  const zoomChange = -event.deltaY * zoomSpeed; // минус, чтобы направление было интуитивным

  camera.zoom = THREE.MathUtils.clamp(camera.zoom + zoomChange, 0.1, 5);
  camera.updateProjectionMatrix();

  console.log('Camera zoom after:', camera.zoom);
});

// // Пример управления положением и масштабом каустик
// tableWithWall.setCausticsOffset(0.1, 0.2);
// tableWithWall.setCausticsRepeat(2, 2);


// Глобально или в области видимости вашего скрипта
let bubbles: THREE.Mesh[] = [];




const bubbleCount = 100;

function createBubblesInsideModel(model: THREE.Object3D) {
  // Очистим старые пузырьки из сцены
  for (const bubble of bubbles) {
    if (bubble.parent) bubble.parent.remove(bubble);
  }
  // Предполагается, что геометрия и материал общие, их можно не удалять здесь
  bubbles = [];

  // Получаем размеры модели
  const bbox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  console.log('Bbox:',bbox )
  // Создаём геометрию и материал для пузырьков
  const bubbleGeometry = new THREE.SphereGeometry(0.01, 8, 8);
  const bubbleMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    roughness: 0.1,
    metalness: 0,
  });

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);

    // Случайно позиционируем пузырёк внутри объёма (с учётом центра)
    bubble.position.set(
      center.x + (Math.random() - 0.5) * size.x*0.8,
      center.y + (Math.random() - 0.5) * size.y*0.01 - size.y/2+0.05*size.y/2,
      center.z + (Math.random() - 0.5) * size.z*0.8
    );

    scene.add(bubble);
    bubbles.push(bubble);
  }
   console.log('Пузири:', bubbles)
}


// Функция анимации пузырьков — поднимаем их вверх внутри объёма модели
function animateBubbles(model: THREE.Object3D) {
  if (bubbles.length === 0) return;

  const bbox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  
  bubbles.forEach(bubble => {
    // Поднимаем пузырёк вверх по оси Y
    bubble.position.y += 0.005;

    // Если вышел за верхнюю границу объёма, возвращаем вниз
    if (bubble.position.y > center.y + 0.7*size.y / 2) {
      bubble.position.y = center.y - 0.7*size.y / 2;
      // Случайно меняем X и Z чтобы пузырёк не поднимался строго по одной линии
      bubble.position.x = center.x + (Math.random() - 0.5) * size.x;
      bubble.position.z = center.z + (Math.random() - 0.5) * size.z;
    }
    
  });
  // console.log('Пузири:', bubbles)
}





function animate(time?: number) {
  requestAnimationFrame(animate);

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

  if (overlayCausticMaterial && overlayCausticMaterial.userData.shader) {
    overlayCausticMaterial.userData.shader.uniforms.time.value = t;
    // НЕ overlayCausticMaterial.needsUpdate = true;
  }
  
  // animateBubbles(modelGroup);
  controls.target.copy(pivotGroup.position);
  controls.update();

  renderer.render(scene, activeCamera);
}


let imageCanvas: ImageCanvas | null = null;
let screenshotter: ModelScreenshotter | null = null;

async function main() {
  console.log('main start');
  switchCamera('ortho')
  await initImageCanvas();
  console.log('initImageCanvas finished');

  if (!imageCanvas) {
    throw new Error('imageCanvas не был создан!');
  }

  screenshotter = new ModelScreenshotter(
    renderer,
    modelGroup,
    container,
    orthoCamera,
    camera,
    setModelRotation,
    switchCamera,
    resetRotationCenter,
    imageCanvas
  );

  // screenshotter.setupBrightLights(scene);

  await loadModelsFromJson();
  console.log('loadModelsFromJson finished');
  await overlay();
  onWindowResize();
  window.addEventListener('resize', onWindowResize);
  // createBubblesInsideModel(modelGroup);

  animate();

  console.log('Animation started');

  const resizeObserver = new ResizeObserver(() => {
    onWindowResize();
  });
  resizeObserver.observe(container);
}

main().catch(e => console.error('Error in main():', e));
