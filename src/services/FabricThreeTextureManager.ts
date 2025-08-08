import {FabricImage, Canvas, FabricObject, ActiveSelection, Group, Rect, filters } from 'fabric';
import * as THREE from 'three';
import { useTextureStore } from '@/stores/texture'
import { useGraphicsStore } from '@/stores/graphics';
import {toRaw} from 'vue'


type TextureStoreType = ReturnType<typeof useTextureStore>;
type GraphicsStoreType = ReturnType<typeof useGraphicsStore>;

export class FabricThreeTextureManager {
  fabricCanvas: Canvas;
  offscreenCanvas: HTMLCanvasElement;
  offscreenFabricCanvas: Canvas;
  hackRect: Rect;
  texture: THREE.CanvasTexture;
  canvasWidthMM: number;
  canvasLengthMM: number;
  DPI: number = 20;

    // Новые поля для трёх.js
  renderer?: THREE.WebGLRenderer;
  activeCamera?: THREE.Camera;
  scene?: THREE.Scene;

  constructor(fabricCanvas: Canvas, canvasWidthMM: number, canvasLengthMM: number) {
    this.fabricCanvas = fabricCanvas;
    this.canvasWidthMM = canvasWidthMM;
    this.canvasLengthMM = canvasLengthMM;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenFabricCanvas = new Canvas(this.offscreenCanvas, {
      enableRetinaScaling: false,
      selection: false,
    });

    this.hackRect = new Rect({
      left: 10,
      top: 10,
      width: 1,
      height: 1,
      fill: 'rgba(0, 0, 0, 0)',
      visible: true,
    });
    this.offscreenFabricCanvas.add(this.hackRect);

    this.texture = new THREE.CanvasTexture(this.offscreenCanvas);
  }


  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  resizeOffscreenCanvas() {
    const offscreenWidth = Math.round(this.canvasWidthMM * this.DPI);
    const offscreenHeight = Math.round(this.canvasLengthMM * this.DPI);

    this.offscreenCanvas.width = offscreenWidth;
    this.offscreenCanvas.height = offscreenHeight;

    this.offscreenFabricCanvas.setWidth(offscreenWidth);
    this.offscreenFabricCanvas.setHeight(offscreenHeight);

    const ctx = this.offscreenCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
  }

 public redrawScene() {
    const graphicsStore = useGraphicsStore();

    if (graphicsStore.renderer && graphicsStore.activeCamera && graphicsStore.scene) {
      graphicsStore.renderer.render(graphicsStore.scene, graphicsStore.activeCamera);
      //console.log('[redrawScene] Three.js сцена отрендерена');
    } else {
      //console.warn('[redrawScene] renderer, activeCamera или scene не инициализированы');
    }
  }

  applyFiltersToImages() {
    const brightnessFilter = new filters.Brightness({ brightness: -0.1 });
    const saturationFilter = new filters.Saturation({ saturation: 0 });

    this.offscreenFabricCanvas.getObjects().forEach((obj) => {
      if (obj.type === 'image') {
        const img = obj as FabricImage;

        // Можно заменить фильтры полностью
        img.filters = [brightnessFilter];

        // или добавить к существующим
        // img.filters.push(brightnessFilter, saturationFilter);

        img.applyFilters();
      }
    });
  }
  private isTextureInitialized = false;


  async updateTextureWithoutControls(textureStore: TextureStoreType) {
    if (!this.fabricCanvas || !this.offscreenFabricCanvas) {
      //console.warn('Fabric canvases not initialized');
      return;
    }

    this.resizeOffscreenCanvas();

    const visualWidth = this.fabricCanvas.getWidth();
    const visualHeight = this.fabricCanvas.getHeight();

    if (visualWidth === 0 || visualHeight === 0) {
      //console.warn('Visual fabric canvas has zero width or height, skipping texture update');
      return;
    }

    const offscreenWidth = this.offscreenCanvas.width;
    const offscreenHeight = this.offscreenCanvas.height;

    const scaleXRatio = offscreenWidth / visualWidth;
    const scaleYRatio = offscreenHeight / visualHeight;

    const fabricObjects = this.fabricCanvas.getObjects();
    const activeObject = this.fabricCanvas.getActiveObject();


    const activeContainedObjects = new Set<FabricObject>();
    if (activeObject) {
      if (activeObject.type === 'activeselection') {         
        (activeObject as ActiveSelection).getObjects().forEach(o => activeContainedObjects.add(toRaw(o)));
      } else if (activeObject.type === 'group') {
        (activeObject as Group).getObjects().forEach(o => activeContainedObjects.add(toRaw(o)));
      } else {
        activeContainedObjects.add(activeObject);
      }
    }
    if (activeObject?.type === 'activeselection') {
      //console.log('[updateTextureWithoutControls] Active children:', (activeObject as ActiveSelection).getObjects());
    }
    //console.log('[updateTextureWithoutControls] activeObject.type:', activeObject?.type);
    //console.log('[updateTextureWithoutControls] fabricObjects:', fabricObjects);
    //console.log('[updateTextureWithoutControls] activeContainedObjects:', Array.from(activeContainedObjects));
    
    this.offscreenFabricCanvas.clear();

 

    // this.hackRect.set({
    //   left: 10,
    //   top: 10,
    //   width: 1,
    //   height: 1,
    //   fill: 'rgba(0, 0, 0, 0)',
    //   visible: true,
    // });
    // this.offscreenFabricCanvas.add(this.hackRect);

    try {
      for (const obj of fabricObjects) {
        if ((obj as any).name === '__border__') continue;
        if (activeObject?.type === 'activeselection') continue;
        if (activeContainedObjects.has(obj)) continue;
        //console.log('Проверяем объект:', obj);
        if (activeContainedObjects.has(obj)) {
          //console.log('Пропускаем объект из activeContainedObjects:', obj);
          continue;
        }

        const clonedObj = await obj.clone();

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

        this.offscreenFabricCanvas.add(clonedObj);
      }
      if (activeObject) {
        
        const clonedActive = await activeObject.clone();
        
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

        this.offscreenFabricCanvas.add(clonedActive);
      }
      
      //console.log('Offscreen objescts = ', this.offscreenFabricCanvas.getObjects())
      //console.log('activeObject?.type = ', activeObject?.type)
      //Применяем фильтры
      // this.applyFiltersToImages();

      await new Promise<void>((resolve) => {
        const onAfterRender = () => {
        this.offscreenFabricCanvas.off('after:render', onAfterRender);
        this.texture.image = this.offscreenFabricCanvas.lowerCanvasEl;
        this.texture.needsUpdate = true;
        if (!this.isTextureInitialized) {
          textureStore.setCanvasTexture(this.texture);
          this.isTextureInitialized = true;
        }
        
        resolve();
        };
        this.offscreenFabricCanvas.on('after:render', onAfterRender);
        this.offscreenFabricCanvas.requestRenderAll();
      });

      //  this.redrawScene(); // вызов перерисовки после обновления текстуры
    } catch (error) {
      //console.error('Error updating texture:', error);
    }
  }
}