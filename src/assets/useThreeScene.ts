import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { PMREMGenerator } from 'three'
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import type { ThreeSceneService } from '../services/ThreeSceneService'

export function useThreeScene(containerId: string): ThreeSceneService {
  const container = document.getElementById(containerId)
  if (!container) throw new Error(`Контейнер с id '${containerId}' не найден.`)

  // Объявляем переменные с non-null assertion, чтобы TS не ругался
  let renderer!: THREE.WebGLRenderer
  let scene!: THREE.Scene
  let camera!: THREE.PerspectiveCamera
  let orthoCamera!: THREE.OrthographicCamera
  let activeCamera!: THREE.Camera
  let controls!: OrbitControls

  const pivotGroup = new THREE.Group()
  const modelGroup = new THREE.Group()
  const tableGroup = new THREE.Group()

  let envMap: THREE.Texture | null = null

  const fixedPerspectiveCameraState = {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    zoom: 1,
    fov: 45,
    controlsTarget: new THREE.Vector3()
  }

  let appStarted = false
  let glowLayer: any = null // заглушка
  let imageCanvas: any = null // заглушка
  let canvasTexture: THREE.Texture | null = null
  let rotationSlider: any = { value: '0', disabled: true }
  let btnFitToView: any = { disabled: true }
  const room = new THREE.Group()
  let frustumSize = 5
  let BLOOM_LAYER = 1

  // === Инициализация сцены ===
  function init() {
    const container = document.getElementById(containerId)
    if (!container) throw new Error(`Контейнер с id '${containerId}' не найден.`)

    scene = new THREE.Scene()
    envMap = null
    scene.background = envMap

    const aspect = container.clientWidth / container.clientHeight

    camera = new THREE.PerspectiveCamera(20, aspect, 0.1, 1000)
    camera.position.z = 8

    orthoCamera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    )
    orthoCamera.position.copy(camera.position)
    orthoCamera.lookAt(0, 0, 0)

    activeCamera = orthoCamera

    controls = new OrbitControls(activeCamera, container)
    controls.target.set(0, 0, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.zoomSpeed = 0.5
    controls.panSpeed = 0.5
    controls.update()

    controls.enableRotate = false
    controls.enablePan = true
    controls.enableZoom = true

    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    }

    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI
    controls.minAzimuthAngle = -Infinity
    controls.maxAzimuthAngle = Infinity

    controls.update()

    // фиксированные значения камеры
    fixedPerspectiveCameraState.position.copy(camera.position)
    fixedPerspectiveCameraState.quaternion.copy(camera.quaternion)
    fixedPerspectiveCameraState.zoom = 0.8
    fixedPerspectiveCameraState.fov = camera.fov
    fixedPerspectiveCameraState.controlsTarget.copy(controls.target)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0xFFDAB9)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMappingExposure = 0.8
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Свет
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10)
    directionalLight.position.set(10, 10, 0)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const directional1 = new THREE.DirectionalLight(0xffffff, 3)
    directional1.position.set(0, 10, -10)
    scene.add(directional1)

    const ambientLight = new THREE.AmbientLight(0xffffff, 3)
    scene.add(ambientLight)

    scene.add(pivotGroup)
    pivotGroup.add(modelGroup)
    scene.add(tableGroup)

    animate()
    window.addEventListener('resize', onWindowResize)
  }

  // ==== Ручное управление вращением модели (drag & rotate) с кватернионами ====

// Состояния для drag
let isDragging = false;
let pointerStart = new THREE.Vector2();
let pointerCurrent = new THREE.Vector2();
let startQuaternion = new THREE.Quaternion();

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return; // только левая кнопка мыши

    isDragging = true
    pointerStart.set(event.clientX, event.clientY)
    pointerCurrent.copy(pointerStart)
    startQuaternion.copy(pivotGroup.quaternion)

    const container = document.getElementById(containerId)
    if (container) {
      container.style.cursor = 'grabbing'
      container.addEventListener('pointerdown', onPointerDown)
    } else {
      console.warn(`Container with id ${containerId} not found`)
    }

  // Отключаем OrbitControls вращение, если нужно
  controls.enableRotate = false;

  // Чтобы не срабатывали другие события, если надо
  event.preventDefault();
  }

  function onPointerMove(event: PointerEvent) {
    if (!isDragging) return

    pointerCurrent.set(event.clientX, event.clientY)

    const deltaX = pointerCurrent.x - pointerStart.x
    const deltaY = pointerCurrent.y - pointerStart.y

  // Параметр скорости вращения — подстройте под себя
  const ROTATION_SPEED = 0.005;

  // Вращение вокруг оси Y (вверх)
  const quatY = new THREE.Quaternion();
  quatY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * ROTATION_SPEED);

  // Вращение вокруг оси X (вправо)
  const quatX = new THREE.Quaternion();
  quatX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * ROTATION_SPEED);

  // Итоговый кватернион — сначала X, потом Y
  const deltaQuat = new THREE.Quaternion();
  deltaQuat.multiplyQuaternions(quatY, quatX);

  // Применяем к начальному кватерниону
  pivotGroup.quaternion.copy(startQuaternion).multiply(deltaQuat);
  }

  function onPointerUp(event: PointerEvent) {
    if (event.button !== 0) return

    isDragging = false
    const container = document.getElementById(containerId)
    if (container) {
      container.style.cursor = 'grab'
      container.addEventListener('pointerdown', onPointerDown)
    } else {
      console.warn(`Container with id ${containerId} not found`)
    }

  // Включаем обратно OrbitControls вращение, если нужно
  controls.enableRotate = true;
  }

container.style.cursor = 'grab';
container.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);




  const exrLoader = new EXRLoader();
   const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  function loadEnvironmentMap(url: string) {
    console.log('Start loading environment map:', url)
    exrLoader.load(
      url,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping

        envMap = pmremGenerator.fromEquirectangular(texture).texture
        scene.environment = envMap
        scene.background = envMap
        console.log('Environment map loaded')
      },
      undefined,
      (error) => {
        console.error('Ошибка загрузки EXR окружения:', error)
      }
    )
  }

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


  function onWindowResize() {
    if (!renderer || !camera || !orthoCamera) return

    const container = renderer.domElement.parentElement
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    if (activeCamera instanceof THREE.PerspectiveCamera) {
      activeCamera.aspect = width / height
      activeCamera.updateProjectionMatrix()
    } else if (activeCamera instanceof THREE.OrthographicCamera) {
      const aspect = width / height
      activeCamera.left = -frustumSize * aspect / 2
      activeCamera.right = frustumSize * aspect / 2
      activeCamera.top = frustumSize / 2
      activeCamera.bottom = -frustumSize / 2
      activeCamera.updateProjectionMatrix()
    }

    if (appStarted) {
      if (canvasTexture) canvasTexture.needsUpdate = true
    }

    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  //Каустический overlay

  let overlayCausticMaterial: THREE.MeshPhysicalMaterial;
  let causticOverlay: THREE.Mesh;

  async function overlay() {
    const c_width = 5;//2.8
  const c_depth = 5;
  const causticGeometry = new THREE.PlaneGeometry(c_width, c_depth);


  const textureLoader = new THREE.TextureLoader();

  const causticTexture = textureLoader.load('./textures/caustics/bottle_caustic.png', (texture) => {
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
    alphaTest: 0.0001,            // снизил порог, чтобы меньше обрезалось
    color: 0xffffff,
    alphaMap: causticTexture,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: causticTexture,
    emissiveIntensity: 3,      // увеличил яркость свечения
    toneMapped: true,
    specularColorMap:causticTexture
    // blending: THREE.AdditiveBlending, // режим сложения для усиления свечения
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
        float baseIntensity = 2.0;
        float amplitude = 5.0;
        float pulse = baseIntensity + amplitude * (0.5 + 0.5 * sin(time * 3.0));
        totalEmissiveRadiance *= pulse;
      `
    );

    overlayCausticMaterial.userData.shader = shader;
  };

      causticOverlay = new THREE.Mesh(causticGeometry, overlayCausticMaterial);
      // Поворачиваем плоскость, чтобы она лежала горизонтально


      function degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
      }
    
      const angleX = degreesToRadians(-90);
      const angleZ = degreesToRadians(135);
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
      // causticOverlay.position.x = -c_depth/2 + boxModel.min.x*0.45;

      causticOverlay.renderOrder = 18
      scene.add(causticOverlay);
  }

  



  function resetRotationCenter() {
    console.log('--- resetRotationCenter start ---');
    console.log('Camera zoom before resetRotationCenter:', camera.zoom);
    console.log('Model scale at start:', modelGroup.scale.toArray());
    
    // setModelRotation('front'); ОБЯЗАТЕЛЬНО ДОБАВИТЬ
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
      camera.updateMatrixWorld();
      controls.target.copy(fixedPerspectiveCameraState.controlsTarget);

      if (appStarted == true) {causticOverlay.visible = true}; 
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
      if (appStarted == true) {causticOverlay.visible = false};    
      activeCamera.updateMatrixWorld();
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

    // Создаём новые пассы с новой камерой


  glowLayer.setCamera(activeCamera);
    if (imageCanvas) {
      imageCanvas.setActiveCamera(activeCamera); 
    } 
    
    // Переключаем камеру у controls
  controls.object = activeCamera;
  controls.update();

  // Управляем слоями у активной камеры
  activeCamera.layers.disableAll();
  activeCamera.layers.enable(0);           // слой обычных объектов
  activeCamera.layers.enable(BLOOM_LAYER); // слой объектов с Bloom

  if (activeCamera instanceof THREE.PerspectiveCamera) {
    activeCamera.updateProjectionMatrix();
  }
    activeCamera.updateMatrixWorld();



  onWindowResize();

  if (canvasTexture) canvasTexture.needsUpdate = true;

  console.log(`Switched to ${toCamera === 'perspective' ? 'Perspective' : 'Orthographic'} Camera`);
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
    const container = document.getElementById(containerId)
    if (!container) throw new Error(`Контейнер с id '${containerId}' не найден.`)
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

  overlay()
  function animate(time?: number) {
    appStarted = true
    const t = (time ?? performance.now()) * 0.001

    modelGroup.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mat = mesh.material
        if (mat) {
          const materials = Array.isArray(mat) ? mat : [mat]
          materials.forEach(material => {
            if (material.userData.shader && material.userData.shader.uniforms.time) {
              material.userData.shader.uniforms.time.value = t
            }
          })
        }
      }
    })

    if (overlayCausticMaterial && overlayCausticMaterial.userData.shader) {
      overlayCausticMaterial.userData.shader.uniforms.time.value = t
    }

    requestAnimationFrame(animate)
    controls?.update()
    renderer?.render(scene, activeCamera)
  }

  // Возвращаем только то, что нужно, и с геттерами для переменных, которые инициализируются в init
  return {
    init,
    get scene() {
      if (!scene) throw new Error('Scene is not initialized yet. Call init() first.')
      return scene
    },
    get camera() {
      if (!camera) throw new Error('Camera is not initialized yet. Call init() first.')
      return camera
    },
    get orthoCamera() {
      if (!orthoCamera) throw new Error('OrthoCamera is not initialized yet. Call init() first.')
      return orthoCamera
    },
    get renderer() {
      if (!renderer) throw new Error('Renderer is not initialized yet. Call init() first.')
      return renderer
    },
    modelGroup,
    pivotGroup,
    tableGroup,
    switchCamera,
    fitModelToView
  }
}
