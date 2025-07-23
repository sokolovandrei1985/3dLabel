import { Canvas, Line, FabricText as Text, Rect, FabricObject, Group } from 'fabric';

export async function saveHighResImage(
  fabricCanvas: Canvas,
  canvasWidthMM: number,
  canvasLengthMM: number
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const DPI = 96;
      const mmToPx = (mm: number) => (DPI / 25.4) * mm;

      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const marginMm = 15;

      const a4WidthPx = mmToPx(A4_WIDTH_MM);
      const a4HeightPx = mmToPx(A4_HEIGHT_MM);
      const marginPx = mmToPx(marginMm);

      const canvasWidth = fabricCanvas.getWidth();
      const canvasHeight = fabricCanvas.getHeight();

      if (canvasWidth === 0 || canvasHeight === 0) {
        reject(new Error('Размер холста равен нулю'));
        return;
      }

      const minSide = Math.min(canvasWidth, canvasHeight);
      const baseScale = 2000 / minSide;

      const aspectRatio = a4WidthPx / a4HeightPx;

      let exportWidth: number;
      let exportHeight: number;

      if (a4WidthPx < a4HeightPx) {
        exportWidth = 2000;
        exportHeight = Math.round(2000 / aspectRatio);
      } else {
        exportHeight = 2000;
        exportWidth = Math.round(2000 * aspectRatio);
      }

      const exportCanvasEl = document.createElement('canvas');
      exportCanvasEl.width = exportWidth;
      exportCanvasEl.height = exportHeight;

      const marginPxScaled = (marginPx / a4WidthPx) * exportWidth;
      const availableWidthScaled = exportWidth - 2 * marginPxScaled;
      const availableHeightScaled = exportHeight - 2 * marginPxScaled;

      const scaleX = availableWidthScaled / (canvasWidth * baseScale);
      const scaleY = availableHeightScaled / (canvasHeight * baseScale);

      const finalScale = baseScale * Math.min(scaleX, scaleY, 1);

      const finalWidth = canvasWidth * finalScale;
      const finalHeight = canvasHeight * finalScale;

      const offsetX = marginPxScaled + (availableWidthScaled - finalWidth) / 2;
      const offsetY = marginPxScaled + (availableHeightScaled - finalHeight) / 2;

      const exportFabricCanvas = new Canvas(exportCanvasEl, {
        enableRetinaScaling: false,
        backgroundColor: 'white',
        selection: false,
        preserveObjectStacking: true,
      });

   
      for (const obj of fabricCanvas.getObjects()) {
        const cloned = await obj.clone();
        cloned.scaleX = (cloned.scaleX ?? 1) * finalScale;
        cloned.scaleY = (cloned.scaleY ?? 1) * finalScale;
        cloned.left = ((cloned.left ?? 0) * finalScale) + offsetX;
        cloned.top = ((cloned.top ?? 0) * finalScale) + offsetY;
        cloned.setCoords();
        cloned.selectable = false;
        cloned.evented = false;
        exportFabricCanvas.add(cloned);
      }
      

      for (const obj of exportFabricCanvas.getObjects()) {
        obj.clipPath = new Rect({
        left: offsetX,
        top: offsetY,
        width: finalWidth,
        height: finalHeight,
        absolutePositioned: true
        });
      }
        

      const lineThicknessPx = mmToPx(0.5) * (finalScale / baseScale);
      const gapPx = mmToPx(5) * (finalScale / baseScale);
      const textHeightPx = mmToPx(20) * (finalScale / baseScale);

      const topLine = new Line(
        [offsetX, offsetY - gapPx, offsetX + finalWidth, offsetY - gapPx],
        {
          stroke: 'black',
          strokeWidth: lineThicknessPx,
          selectable: false,
          evented: false,
        }
      );

      const leftLine = new Line(
        [offsetX - gapPx, offsetY, offsetX - gapPx, offsetY + finalHeight],
        {
          stroke: 'black',
          strokeWidth: lineThicknessPx,
          selectable: false,
          evented: false,
        }
      );

      exportFabricCanvas.add(topLine, leftLine);

      const widthText = new Text(`${Math.round(canvasWidthMM)} мм`, {
        left: offsetX + finalWidth / 2,
        top: offsetY - gapPx - 2,
        fontSize: textHeightPx,
        fill: 'black',
        originX: 'center',
        originY: 'bottom',
        selectable: false,
        evented: false,
        fontFamily: 'Arial',
      });

      const heightText = new Text(`${Math.round(canvasLengthMM)} мм`, {
        left: offsetX - gapPx - 4,
        top: offsetY + finalHeight / 2,
        fontSize: textHeightPx,
        fill: 'black',
        originX: 'right',
        originY: 'center',
        angle: -90,
        selectable: false,
        evented: false,
        fontFamily: 'Arial',
      });

      heightText.setCoords();
      const bbox = heightText.getBoundingRect();
      heightText.left = heightText.left - bbox.width / 2 - 2;
      heightText.setCoords();

      exportFabricCanvas.add(widthText, heightText);

       const border = new Rect({
        left: offsetX,
        top: offsetY,
        width: finalWidth,
        height: finalHeight,
        fill: 'rgba(0,0,0,0)', // прозрачная заливка
        stroke: 'black',       // цвет рамки (обводки)
        strokeWidth: lineThicknessPx,
        });

        exportFabricCanvas.add(border)

      exportFabricCanvas.renderAll();

      exportCanvasEl.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Не удалось получить blob изображения'));
          return;
        }
        resolve(blob);
      }, 'image/png', 1);
    } catch (error) {
      reject(error);
    }
  });
}



