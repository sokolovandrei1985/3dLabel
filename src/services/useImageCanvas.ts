//useImageCanvas.ts
import { Canvas, FabricText, FabricObject, FabricImage, ActiveSelection, Rect, Group} from 'fabric'
import * as THREE from 'three'
import { useFabricStore } from '@/stores/fabric';
import { FabricThreeTextureManager } from '@/services/FabricThreeTextureManager'
import { useTextureStore } from '@/stores/texture';
import { useGraphicsStore } from '@/stores/graphics';
import { useGlobalConfigStore } from '@/stores/globalConfig';
import {ref} from 'vue'

let fabricCanvas: Canvas | null = null

//const fabricTextureManager = ref<FabricThreeTextureManager | null>(null);

export type CanvasConfig = {
  inputWidthMM: number
  inputHeightMM: number
}
export async function loadCanvasConfig(): Promise<CanvasConfig | null> {
  try {
    const res = await fetch('/configs/config.json')
    const data = await res.json()
    const config = {
      inputWidthMM: data.canvas.inputWidthMM,
      inputHeightMM: data.canvas.inputHeightMM,
    }
    return config
  } catch (e) {
    console.error('[loadCanvasConfig] Ошибка загрузки config.json:', e)
    return null
  }
}


export async function initFabricCanvas(canvasEl: HTMLCanvasElement): Promise<Canvas | null> {
  if (!canvasEl) {
    throw new Error('[Fabric] Передан пустой canvasEl')
  }
  try {
    const config = await loadCanvasConfig()
    if (!config) return null

    const { inputWidthMM, inputHeightMM } = config
    // Перевод миллиметров в пиксели (96 DPI)
    const width = inputWidthMM * 96 / 25.4
    const height = inputHeightMM * 96 / 25.4
    // Установка размеров DOM-элемента
    //canvasEl.width = width
    //canvasEl.height = height
    // Инициализация Fabric.js canvas
    const fabricCanvas = new Canvas(canvasEl, {
      backgroundColor: 'rgba(236, 170, 47, 0.23)',
      selection: true,
    })
    //const strokeWidth = 2
    fabricCanvas.setDimensions({ width, height }, { backstoreOnly: true })
    //console.log(fabricCanvas.getHeight(), fabricCanvas.getWidth())
    //fabricCanvas.setWidth(width)
    //fabricCanvas.setHeight(height)
    /*const __border__ = new Rect({
    left: strokeWidth/2,
    top: strokeWidth/2,
    width: width-strokeWidth - strokeWidth/2,
    height: height-strokeWidth - strokeWidth/2,
    fill: 'rgba(0,0,0,0)', // прозрачная заливка
    stroke: 'black',       // цвет рамки (обводки)
    strokeWidth: strokeWidth,
    selectable: false
    });*/

    // fabricCanvas.add(__border__)

    const globalConfigStore = useGlobalConfigStore();

    // Вызов для загрузки конфигурации из JSON (как у вас в сторе)
    await globalConfigStore.loadConfig();

    console.log('[Fabric] Канвас инициализирован:', fabricCanvas)
    return fabricCanvas
  } catch (err) {
    console.error('[Fabric] Ошибка загрузки или инициализации:', err)
    return null
  }
}
export function getFabricCanvas(): Canvas | null {
  return fabricCanvas
}

// Функция адаптивного масштабирования Fabric канваса с сохранением aspect ratio

export function fitFabricCanvas(
  fabricCanvas: Canvas | null,
  fabricCanvasEl: HTMLCanvasElement | null,
  canvasWrapper: HTMLElement | null,
  inputWidthMM: number,
  inputHeightMM: number
): void {
  if (!canvasWrapper || !fabricCanvasEl || !fabricCanvas) return;

  const aspect = inputWidthMM / inputHeightMM;
  let drawW = canvasWrapper.clientWidth;
  let drawH = canvasWrapper.clientHeight;
  const aspectWrapper = drawW / drawH;

  // Коррекция размеров с учетом исходного соотношения сторон
  if (aspectWrapper < aspect) {
    if (inputWidthMM > inputHeightMM) {
      drawW = drawH * aspect;
    } else {
      drawH = drawW / aspect;
    }
  } else {
    if (inputWidthMM > inputHeightMM) {
      drawH = drawW / aspect;
    } else {
      drawW = drawH * aspect;
    }
  }

  // Задаём CSS размеры (логические пиксели)
  fabricCanvas.setDimensions({ width: drawW, height: drawH }, { cssOnly: true })
  //fabricCanvas.setZoom(fabricCanvas.getWidth() / drawW)
  //console.log(fabricCanvas.getZoom())
  //fabricCanvasEl.style.width = `${drawW}px`;
  //fabricCanvasEl.style.height = `${drawH}px`;

  /*
  // Device Pixel Ratio для поддержки высокой плотности пикселей
  const dpr = 1//window.devicePixelRatio || 2;
  //console.log('dpr=', dpr)
  // Новые физические размеры канваса с учетом DPR
  const newCanvasWidth = Math.round(drawW * dpr);
  const newCanvasHeight = Math.round(drawH * dpr);

  // Сохраняем размеры канваса до изменения (важно для правильного масштабирования)
  const oldWidth = fabricCanvas.getWidth();
  const oldHeight = fabricCanvas.getHeight();

  // Рассчитываем коэффициенты масштабирования
  const scaleX = newCanvasWidth / oldWidth;
  const scaleY = newCanvasHeight / oldHeight;

  fabricCanvas.discardActiveObject();

  // Сохраняем исходные состояния объектов (позиция и масштаб)
  const objectStates = new Map<FabricObject, { left: number; top: number; scaleX: number; scaleY: number }>();
  fabricCanvas.getObjects().forEach((obj) => {
    objectStates.set(obj, {
      left: obj.left ?? 0,
      top: obj.top ?? 0,
      scaleX: obj.scaleX ?? 1,
      scaleY: obj.scaleY ?? 1,
    });
  });*/

  // Устанавливаем новые физические размеры канваса
  //fabricCanvas.setWidth(newCanvasWidth);
  //fabricCanvas.setHeight(newCanvasHeight);

  // Масштабируем объекты с сохранением пропорций и позиций
  /*fabricCanvas.getObjects().forEach((obj) => {
    const orig = objectStates.get(obj);
    if (!orig) return;
    obj.left = orig.left * scaleX;
    obj.top = orig.top * scaleY;
    obj.scaleX = orig.scaleX * scaleX;
    obj.scaleY = orig.scaleY * scaleY;
    obj.setCoords();
  });*/

  fabricCanvas.renderAll();
  // fabricCanvas.setZoom(0.5);

  // Триггерим событие изменения для первого объекта (опционально)
  /*const objects = fabricCanvas.getObjects();
  if (objects.length) {
    fabricCanvas.fire('object:modified', { target: objects[0] });
  }*/
}

// Интерфейс для хранения состояния объекта
export interface ObjectTransformData {
  left: number
  top: number
  scaleX: number
  scaleY: number
  width: number
  height: number
  angle: number
}
const objectBuffer = new Map<FabricObject, ObjectTransformData>();

export function saveAllObjectStates(canvas: Canvas) {
  // Если objectBuffer не объявлена глобально, убедитесь, что она доступна здесь
  if (!objectBuffer) {
    throw new Error('objectBuffer is not defined');
  }

  canvas.getObjects().forEach(obj => {
    if (objectBuffer.has(obj)) {
      // Объект уже сохранён — пропускаем
      return;
    }
    // Сохраняем состояние
    objectBuffer.set(obj, {
      left: obj.left ?? 0,
      top: obj.top ?? 0,
      scaleX: obj.scaleX ?? 1,
      scaleY: obj.scaleY ?? 1,
      width: obj.width ?? 0,
      height: obj.height ?? 0,
      angle: obj.angle ?? 0,
    });
  });
}
export function rescaleObjects(canvas: Canvas, scaleX: number, scaleY: number) {
  canvas.getObjects().forEach(obj => {
    const orig = objectBuffer.get(obj);
    if (!orig) return; // объект без исходных данных — пропускаем
    obj.left = orig.left * scaleX;
    obj.top = orig.top * scaleY;
    obj.scaleX = orig.scaleX * scaleX;
    obj.scaleY = orig.scaleY * scaleY;
    obj.setCoords();
  });
}

export function logObjectBufferContents() {
  console.log('Содержимое objectBuffer:');
  if (!objectBuffer || objectBuffer.size === 0) {
    console.log('Буфер пуст');
    return;
  }
  objectBuffer.forEach((state, obj) => {
    console.log('Объект:', obj, 'Состояние:', state);
  });
}


// функция загрузки изображения
export function loadImage(canvas: Canvas, url: string): Promise<FabricImage> {
  return new Promise(async (resolve, reject) => {
    try {
       if (!canvas) {
        reject(new Error('Fabric canvas is not initialized'));
        return;
      }
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      img.set({
        originX: 'center',
        originY: 'center',
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        lockUniScaling: false,
        lockScalingFlip: false,
        angle: 0,
      });
      const scaleX = canvasWidth / (img.width || 1);
      const scaleY = canvasHeight / (img.height || 1);
      const scale = Math.min(scaleX, scaleY, 1);
      img.scale(scale);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      saveAllObjectStates(canvas)
      logObjectBufferContents()
      resolve(img);  // здесь функция успешно завершается
    } catch (error) {
      reject(error);  // здесь при ошибке
    }
  });
}

export async function handleFileInputChange(
  event: Event,
  fabricCanvas: Canvas,
  modelGroupForUpdate?: THREE.Group
) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const loadedObjects: FabricObject[] = []
  for (const file of Array.from(target.files)) {
    const dataUrl = await readFileAsDataURL(file)
    try {
      const img = await loadImage(fabricCanvas, dataUrl)

      loadedObjects.push(img)
    } catch (err) {
      console.error('Ошибка загрузки изображения:', err)
    }
  }
  if (loadedObjects.length === 1) {
    fabricCanvas.setActiveObject(loadedObjects[0])
  } else if (loadedObjects.length > 1) {
    const selection = new ActiveSelection(loadedObjects, { canvas: fabricCanvas })
    fabricCanvas.setActiveObject(selection)
  }
  saveAllObjectStates(fabricCanvas)
  fabricCanvas.requestRenderAll()
  if (modelGroupForUpdate) {
    modelGroupForUpdate.scale.multiplyScalar(1.001)
    modelGroupForUpdate.scale.multiplyScalar(1 / 1.001)
    modelGroupForUpdate.updateMatrixWorld(true)
  }

  // Сброс input, чтобы повторить выбор того же файла
  target.value = ''
}
// Вспомогательная функция чтения файла в dataUrl
// function readFileAsDataURL2(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onload = () => resolve(reader.result as string)
//     reader.onerror = reject
//     reader.readAsDataURL(file)
//   })
// }
//
export async function onLoadImageFromFiles(files: FileList, canvas: Canvas) {
  for (const file of Array.from(files)) {
    try {
      const dataUrl = await readFileAsDataURL(file)
      await loadImage(canvas, dataUrl )
      saveAllObjectStates(canvas)
    } catch (err) {
      console.error('Ошибка при загрузке изображения:', err)
    }
  }
}
// 🔹 Promise-обёртка над FileReader
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = (err) => {
      reject(err)
    }
    reader.readAsDataURL(file)
  })
}

export function logFabricCanvasObjects(canvas: Canvas): void {
  const objects = canvas.getObjects();
  //console.log('Объекты на Fabric канвасе:');
  objects.forEach((obj: FabricObject, index: number) => {
    console.log(`Объект #${index + 1}:`, {
      type: obj.type,
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
      selectable: obj.selectable,
      hasControls: obj.hasControls,
        hasBorders: obj.hasBorders,
    lockMovementX: (obj as any).lockMovementX,
    lockMovementY: (obj as any).lockMovementY,
    lockScalingX: (obj as any).lockScalingX,
    lockScalingY: (obj as any).lockScalingY,
    lockRotation: (obj as any).lockRotation,
    lockUniScaling: (obj as any).lockUniScaling,
    evented: obj.evented

    });
  });
}

/*export function fitFabricCanvas_0(
  fabricCanvas: Canvas | null,
  fabricCanvasEl: HTMLCanvasElement | null,
  canvasWrapper: HTMLElement | null,
  inputWidthMM: number,
  inputHeightMM: number,
  originalCanvasWidth: number,
  originalCanvasHeight: number
): void {
  if (!canvasWrapper || !fabricCanvasEl || !fabricCanvas) return;
  const aspect = inputWidthMM / inputHeightMM;
  let drawW = canvasWrapper.clientWidth;
  let drawH = canvasWrapper.clientHeight;
  const aspectWrapper = drawW / drawH;
  if (aspectWrapper < aspect) {
    if (inputWidthMM > inputHeightMM) {
      drawW = drawH * aspect;
    } else {
      drawH = drawW / aspect;
    }
  } else {
    if (inputWidthMM > inputHeightMM) {
      drawH = drawW / aspect;
    } else {
      drawW = drawH * aspect;
    }
  }
  // Устанавливаем размеры канваса в стилях (CSS)
  fabricCanvasEl.style.width = `${drawW}px`;
  fabricCanvasEl.style.height = `${drawH}px`;
  // DPI / Device Pixel Ratio
  const dpr = window.devicePixelRatio || 1;
  // Новые физические размеры
  const newCanvasWidth = Math.round(drawW * dpr);
  const newCanvasHeight = Math.round(drawH * dpr);
  // ВАЖНО: задаём атрибуты ширины и высоты у самого HTML элемента <canvas>
  fabricCanvasEl.width = newCanvasWidth;
  fabricCanvasEl.height = newCanvasHeight;
  // Обновляем размеры канваса Fabric.js
  fabricCanvas.setWidth(newCanvasWidth);
  fabricCanvas.setHeight(newCanvasHeight);
  // Считаем коэффициенты масштабирования относительно исходных размеров
  const scaleX = newCanvasWidth / originalCanvasWidth;
  const scaleY = newCanvasHeight / originalCanvasHeight;
  // Выбираем минимальный масштаб для сохранения пропорций
  const scale = Math.min(scaleX, scaleY);
  // Смещение для центрирования содержимого
  const offsetX = (newCanvasWidth - originalCanvasWidth * scale) / 2;
  const offsetY = (newCanvasHeight - originalCanvasHeight * scale) / 2;
  // Устанавливаем viewportTransform для масштабирования и сдвига
  // fabricCanvas.viewportTransform = [scale, 0, 0, scale, offsetX, offsetY];
  fabricCanvas.requestRenderAll();
  //console.log('[fitFabricCanvas] scale:', scale, 'offsetX:', offsetX, 'offsetY:', offsetY);
}*/

export async function centerObjectOnCanvas(canvas: Canvas, img: FabricObject): Promise<void> {
  if (!img) return;
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  img.set({
    originX: 'center',
    originY: 'center',
    left: canvasWidth / 2,
    top: canvasHeight / 2,
    angle: 0,
  });

  const scaleX = canvasWidth / (img.width || 1);
  const scaleY = canvasHeight / (img.height || 1);
  const scale = Math.min(scaleX, scaleY, 1);
  img.scale(scale);

  img.setCoords();
  canvas.requestRenderAll();

  // Триггерим событие, чтобы подписчики реагировали на изменение
  canvas.fire('object:modified', { target: img });
}


export function enableCanvasZoomAndPan(canvas: Canvas) {
  let isPanning = false;
  let lastPosX = 0;
  let lastPosY = 0;
  const el = canvas.lowerCanvasEl;
  if (!el) {
    console.warn('Canvas element not ready for zoom/pan handlers');
    return;
  }
  // Предотвращаем контекстное меню (правый клик)
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  // Панорамирование — начало (правая кнопка)
  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 2) {
      isPanning = true;
      lastPosX = e.clientX;
      lastPosY = e.clientY;
      canvas.selection = false;
    }
  };
  // Панорамирование — конец
  const onMouseUp = (e: MouseEvent) => {
    if (e.button === 2) {
      isPanning = false;
      canvas.selection = true;
    }
  };
  // Панорамирование — движение мыши
  const onMouseMove = (e: MouseEvent) => {
    if (!isPanning) return;
    const deltaX = e.clientX - lastPosX;
    const deltaY = e.clientY - lastPosY;
    lastPosX = e.clientX;
    lastPosY = e.clientY;
    const vt = canvas.viewportTransform;
    if (!vt) return;
    vt[4] += deltaX;
    vt[5] += deltaY;
    canvas.setViewportTransform(vt);
    canvas.requestRenderAll();
  };
  // Зум колесом мыши
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const wheelDelta = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
    const vt = canvas.viewportTransform;
    if (!vt) return;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    let newScaleX = vt[0] * wheelDelta;
    let newScaleY = vt[3] * wheelDelta;
    // Ограничим масштаб
    newScaleX = Math.min(Math.max(newScaleX, 0.2), 5);
    newScaleY = Math.min(Math.max(newScaleY, 0.2), 5);
    // Сдвигаем viewport чтобы центр зума оставался под курсором
    const dx = mouseX - mouseX * wheelDelta;
    const dy = mouseY - mouseY * wheelDelta;
    vt[0] = newScaleX;
    vt[3] = newScaleY;
    vt[4] += dx;
    vt[5] += dy;
    canvas.setViewportTransform(vt);
    canvas.requestRenderAll();
  };

  el.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);    // на window, чтобы поймать событие за пределами canvas
  window.addEventListener('mousemove', onMouseMove);
  el.addEventListener('wheel', onWheel);
  // Вернуть функцию для отписки, если понадобится
  return () => {
    el.removeEventListener('contextmenu', e => e.preventDefault());
    el.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('wheel', onWheel);
  };
}

///////////////////////////////////////////////////////////////////////
////////   THREE TEXTURE      /////////////////
///////////////////////////////////////////////

// Метод для установки размеров offscreen canvas с минимумом 2000px ширины (или по DPI)

let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenFabricCanvas: Canvas | null = null;

export function initOffscreenFabricCanvas(width: number, height: number): Canvas {
  offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;

  offscreenFabricCanvas = new Canvas(offscreenCanvas, {
    enableRetinaScaling: false,
    selection: false,
  });

  return offscreenFabricCanvas;
}


export function resizeOffscreenCanvas(canvasWidthMM: number, canvasLengthMM: number, dpi = 20) {
  if (!offscreenCanvas || !offscreenFabricCanvas) {
    console.warn('Offscreen canvas not initialized');
    return;
  }

  const offscreenWidth = Math.round(canvasWidthMM * dpi);
  const offscreenHeight = Math.round(canvasLengthMM * dpi);

  offscreenCanvas.width = offscreenWidth;
  offscreenCanvas.height = offscreenHeight;

  offscreenFabricCanvas.setWidth(offscreenWidth);
  offscreenFabricCanvas.setHeight(offscreenHeight);

  const ctx = offscreenCanvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
}


export async function updateTextureWithoutControls(
  fabricCanvas: Canvas,
  offscreenFabricCanvas: Canvas,
  offscreenCanvas: HTMLCanvasElement,
  cloneAsync: (obj: FabricObject) => Promise<FabricObject>,
  hackRect: FabricObject,
  texture: THREE.Texture,
  resizeOffscreenCanvas: () => void
): Promise<void> {
  //console.log('[updateTextureWithoutControls] Начало обновления текстуры');

  if (!fabricCanvas || !offscreenFabricCanvas || !offscreenCanvas) {
    console.warn('Fabric canvases или offscreenCanvas не инициализированы');
    return;
  }

  // Обновляем размеры offscreen канваса
  resizeOffscreenCanvas();

  const visualWidth = fabricCanvas.getWidth();
  const visualHeight = fabricCanvas.getHeight();

  if (visualWidth === 0 || visualHeight === 0) {
    console.warn('Visual fabric canvas has zero width or height, skipping texture update');
    return;
  }

  const offscreenWidth = offscreenCanvas.width;
  const offscreenHeight = offscreenCanvas.height;

  const scaleXRatio = offscreenWidth / visualWidth;
  const scaleYRatio = offscreenHeight / visualHeight;

  const fabricObjects = fabricCanvas.getObjects();
  const activeObject = fabricCanvas.getActiveObject();

  let activeContainedObjects = new Set<FabricObject>();
  if (activeObject) {
    if (activeObject.type === 'activeSelection') {
      (activeObject as ActiveSelection).getObjects().forEach(o => activeContainedObjects.add(o));
    } else if (activeObject.type === 'group') {
      (activeObject as Group).getObjects().forEach(o => activeContainedObjects.add(o));
    } else {
      activeContainedObjects.add(activeObject);
    }
  }

  // Очищаем offscreen canvas
  offscreenFabricCanvas.clear();

  // Добавляем hackRect
  hackRect.set({
    left: 10,
    top: 10,
    width: 1,
    height: 1,
    fill: 'rgba(199, 27, 27, 0)',
    visible: true,
  });
  offscreenFabricCanvas.add(hackRect);

  try {
    // Добавляем объекты, которые не входят в активную группу
    for (const obj of fabricObjects) {
      if ((obj as any).name === '__border__') continue;

      if (activeObject?.type === 'activeselection') continue;

      if (activeContainedObjects.has(obj)) continue;

      const clonedObj = await cloneAsync(obj);
      clonedObj.left = (obj.left ?? 0) * scaleXRatio;
      clonedObj.top = (obj.top ?? 0) * scaleYRatio;
      clonedObj.scaleX = (obj.scaleX ?? 1) * scaleXRatio;
      clonedObj.scaleY = (obj.scaleY ?? 1) * scaleYRatio;

      if (clonedObj.strokeWidth !== undefined) {
        const avgScale = (scaleXRatio + scaleYRatio) / 2;
        clonedObj.strokeWidth = (obj.strokeWidth ?? 1) * avgScale;
      }

      clonedObj.angle = obj.angle ?? 0;
      clonedObj.setCoords();

      clonedObj.set({
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'default',
        visible: obj.visible !== false,
        opacity: obj.opacity ?? 1,
      });

      offscreenFabricCanvas.add(clonedObj);
    }

    // Добавляем активный объект целиком
    if (activeObject) {
      const clonedActive = await cloneAsync(activeObject);
      clonedActive.left = (activeObject.left ?? 0) * scaleXRatio;
      clonedActive.top = (activeObject.top ?? 0) * scaleYRatio;
      clonedActive.scaleX = (activeObject.scaleX ?? 1) * scaleXRatio;
      clonedActive.scaleY = (activeObject.scaleY ?? 1) * scaleYRatio;

      if (clonedActive.strokeWidth !== undefined) {
        const avgScale = (scaleXRatio + scaleYRatio) / 2;
        clonedActive.strokeWidth = (activeObject.strokeWidth ?? 1) * avgScale;
      }

      clonedActive.angle = activeObject.angle ?? 0;
      clonedActive.setCoords();

      clonedActive.set({
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'default',
        visible: activeObject.visible !== false,
        opacity: activeObject.opacity ?? 1,
      });

      offscreenFabricCanvas.add(clonedActive);
    }

    await new Promise<void>((resolve) => {
      const onAfterRender = () => {
        offscreenFabricCanvas.off('after:render', onAfterRender);
        if (texture) {
          texture.image = offscreenFabricCanvas.lowerCanvasEl;
          texture.needsUpdate = true;
          //console.log('[updateTextureWithoutControls] texture.needsUpdate = true');
        }
        resolve();
      };
      offscreenFabricCanvas.on('after:render', onAfterRender);
      offscreenFabricCanvas.requestRenderAll();
    });

  } catch (err) {
    console.error('Error cloning fabric objects:', err);
    throw err;
  }
}


// ------------------- Управление порядком объектов --------------------

export function bringObjectsToFront(canvas: Canvas): void {
  if (!canvas) return
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return

  if (activeObject.type === 'activeselection') {
    const activeSelection = activeObject as ActiveSelection
    // Перемещаем каждый объект на передний план в порядке выделения
    for (const obj of activeSelection.getObjects()) {
      canvas.bringObjectToFront(obj)
    }
    canvas.discardActiveObject()
    canvas.setActiveObject(activeSelection)
  } else {
    canvas.bringObjectToFront(activeObject)
  }
  canvas.discardActiveObject()
  canvas.requestRenderAll()
}

export function sendObjectsToBack(canvas: Canvas): void {
  if (!canvas) return
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return

  if (activeObject.type === 'activeselection') {
    const activeSelection = activeObject as ActiveSelection
    for (const obj of activeSelection.getObjects()) {
      canvas.sendObjectToBack(obj)
    }
    canvas.discardActiveObject()
    canvas.setActiveObject(activeSelection)
  } else {
    canvas.sendObjectToBack(activeObject)
  }
  canvas.discardActiveObject()
  canvas.requestRenderAll()
}

export function bringObjectsForward(canvas: Canvas): void {
  if (!canvas) return
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return

  if (activeObject.type === 'activeselection') {
    const activeSelection = activeObject as ActiveSelection
    for (const obj of activeSelection.getObjects()) {
      canvas.bringObjectForward(obj)
    }
    canvas.discardActiveObject()
    canvas.setActiveObject(activeSelection)
  } else {
    canvas.bringObjectForward(activeObject)
  }
  canvas.discardActiveObject()
  canvas.requestRenderAll()
}

export function sendObjectsBackwards(canvas: Canvas): void {
  if (!canvas) return
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return

  if (activeObject.type === 'activeselection') {
    const activeSelection = activeObject as ActiveSelection
    for (const obj of activeSelection.getObjects()) {
      canvas.sendObjectBackwards(obj)
    }
    canvas.discardActiveObject()
    canvas.setActiveObject(activeSelection)
  } else {
    canvas.sendObjectBackwards(activeObject)
  }
  canvas.discardActiveObject()
  canvas.requestRenderAll()
}