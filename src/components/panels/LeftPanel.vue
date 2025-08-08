//LeftPanel.vue
<template>
<div class="panel-wrapper">
  <a-tabs tab-position="top" v-model:activeKey="activeTab" class="custom-tabs">
    <a-tab-pane
      v-for="tab in leftTabs"
      :key="tab.key"
      :tab="tab.label"
    >
      <div v-if="tab.key === '2d'">
        <a-button type="primary" @click="toggle3DView">Развернуть 3D</a-button>
         <a-button type="default" @click="onMakeScreenshots" >Сделать скриншоты</a-button>
        <a-divider />
        <a-collapse>
        <a-collapse-panel header="Добавить/удалить" key="1">        
         <a-button @click = "onLoadImage">Изображение</a-button><br/>  
         <a-button danger @click="onDeleteImage">Удалить</a-button><br/>         
        </a-collapse-panel>
          </a-collapse>
        <a-divider />
        <strong>Редактирование</strong><br />
        <a-button @click = "onResetImage">Вернуть к исходному состоянию</a-button>
        <a-button @click = "onSaveImage">Сохранит изображение</a-button>
        <a-divider />
        <strong>Уровень объектов</strong><br />
        <a-button-group style="margin-bottom: 10px;">
          <a-button @click="bringToFront">На передний план</a-button>
          <a-button @click="sendToBack">На задний план</a-button>
        </a-button-group>
        <a-button-group style="margin-bottom: 10px;">
          <a-button @click="sendBackwards">На уровень ниже</a-button>
          <a-button @click="bringForward">На уровень выше</a-button>
        </a-button-group>
        <!-- НОВЫЙ БЛОК: Добавление прямоугольника и управление его стилями -->
          <a-divider />
          <a-collapse>
          <a-collapse-panel header="Прямоугольник" key="1">          
          <a-button type="default" @click="addRectangle" style="margin-bottom: 10px;">Добавить прямоугольник</a-button>
          <a-row align="middle" :gutter="8">
            <a-col>
              Толщина обводки:
              <a-slider v-model:value="strokeWidth" :min="0" :max="20" style="width: 150px;" @change="updateStrokeWidth" />
            </a-col>
            <a-col>
              Цвет обводки:
              <input type="color" v-model="strokeColor" @input="updateStrokeColor" />
            </a-col>
            <a-col>
              Тип линии:
              <a-select
                v-model="strokeDashString"
                style="width: 140px"
                @change="updateStrokeDashArrayFromString"
              >
                <a-select-option :value="lineTypes.solid">Сплошная</a-select-option>
                <a-select-option :value="lineTypes.dashed">Пунктир</a-select-option>
                <a-select-option :value="lineTypes.dashdot">Штрих-пунктир</a-select-option>
              </a-select>
            </a-col>
          </a-row>
          <a-row align="middle" :gutter="8" style="margin-top: 10px;">
            <a-col>
              Цвет заливки:
              <input type="color" v-model="fillColor" @input="updateFillColor" />
            </a-col>
            <a-col>
              Прозрачность:
              <a-slider v-model:value="fillOpacity" :min="0" :max="1" :step="0.01" style="width: 150px;" @change="updateFillOpacity" />
            </a-col>
            <a-col>
              Скругление углов:
              <a-slider v-model:value="borderRadius" :min="0" :max="50" style="width: 150px;" @change="updateBorderRadius" />
            </a-col>
          </a-row>
          </a-collapse-panel>
          </a-collapse>
          <a-collapse>
          <a-collapse-panel header="Тень" key="1">
            <a-col>
              <div>Размер тени (px):</div>
              <a-slider v-model:value="shadowBlur" :min="0" :max="50"/>
            </a-col>
            <a-col>
              <div>Резкость (%):</div>
              <a-slider v-model:value="shadowOpacity" :min="0" :max="100"/>
            </a-col>
            <a-col>
              <div>Смещение по горизонтали (px):</div>
              <a-slider v-model:value="shadowOffsetX" :min="-50" :max="50"/>
            </a-col>
            <a-col>
              <div>Смещение по вертикали (px):</div>
              <a-slider v-model:value="shadowOffsetY" :min="-50" :max="50"/>
            </a-col>
          </a-collapse-panel>
        </a-collapse>
      </div>      
      <div v-else>
        <p>{{ tab.label }} содержимое</p>
      </div>
    </a-tab-pane>
  </a-tabs>  
  <!-- Скрытый input -->
  <input
    ref="fileInputRef"
    type="file"
    accept=".svg,image/*"
    multiple
    style="display: none"
    @change="handleFileInputChange"
  />         
</div>
</template>



<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { onLoadImageFromFiles, logFabricCanvasObjects, saveAllObjectStates, centerObjectOnCanvas } from '@/services/useImageCanvas'
import { Rect, FabricObject, ActiveSelection, loadSVGFromString, util } from 'fabric'
import { useFabricStore } from '@/stores/fabric'
import { saveHighResImage } from '@/services/useImageExport' 


interface TabItem {
  key: string
  label: string
}


const fileInputRef = ref<HTMLInputElement | null>(null)

const canvasWidthMM = ref<number>(0);
const canvasLengthMM = ref<number>(0);


const leftTabs = ref<TabItem[]>([])
const activeTab = ref('')

//Прямоугольник
const strokeWidth = ref(2)
const strokeColor = ref('#000000')
const strokeDashArray = ref<number[] | undefined>(undefined)
const fillColor = ref('#ffa500')
const fillOpacity = ref(0.5)
const borderRadius = ref(0)

const lineTypes = {
  solid: 'none',       // Сплошная, соответствует undefined
  dashed: '[5,5]',     // Пунктир
  dashdot: '[10,5,2,5]'// Штрих-пунктир
}

const strokeDashString = ref(lineTypes.solid)



// Параметры тени
const shadowBlur = ref(10)
const shadowOpacity = ref(100) // в процентах для UI
const shadowOffsetX = ref(5)
const shadowOffsetY = ref(5)

const fabricStore = useFabricStore()

const addRectangle = () => {
  if (!fabricStore.canvas) {
    alert('Fabric Canvas не инициализирован')
    return
  }
  const canvas = fabricStore.canvas
  const size = Math.min(canvas.width ?? 100, canvas.height ?? 100) * 0.1

  const rect = new Rect({
    left: (canvas.width ?? 0) / 2,
    top: (canvas.height ?? 0) / 2,
    width: size,
    height: size,
    originX: 'center',
    originY: 'center',
    fill: fillColor.value,
    stroke: strokeColor.value,
    strokeWidth: strokeWidth.value,
    strokeDashArray: strokeDashArray.value,
    strokeUniform: true,
    selectable: true,
    rx: borderRadius.value,
    ry: borderRadius.value,
  })

  canvas.add(rect)
  canvas.setActiveObject(rect)
  canvas.requestRenderAll()
}

const updateStrokeWidth = (value: number) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ strokeWidth: value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj });
  }
}

const updateStrokeColor = (event: Event) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ stroke: (event.target as HTMLInputElement).value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj });
  }
}

const updateStrokeDashArray = (value: number[] | undefined) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ strokeDashArray: value })
    fabricStore.canvas?.requestRenderAll()
  }
}

function updateStrokeDashArrayFromString(value: string) {
  if (value === 'none') {
    strokeDashArray.value = undefined
  } else {
    try {
      strokeDashArray.value = JSON.parse(value)
    } catch (e) {
      console.warn('Не удалось распарсить strokeDashArray:', e)
      strokeDashArray.value = undefined
    }
  }
  updateStrokeDashArray(strokeDashArray.value) // обновляем активный объект на канвасе
  
}
const updateFillColor = (event: Event) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ fill: (event.target as HTMLInputElement).value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj });
  }
  
}

const updateFillOpacity = (value: number) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj) {
    obj.set({ opacity: value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj });
  }
  
}

const updateBorderRadius = (value: number) => {
  const obj = fabricStore.canvas?.getActiveObject()
  if (obj && obj.type === 'rect') {
    obj.set({ rx: value, ry: value })
    fabricStore.canvas?.requestRenderAll()
    fabricStore.canvas?.fire('object:modified', { target: obj });
  }
  
}

// Функция обновления тени
interface Shadow {
  color?: string;
  blur?: number;
  offsetX?: number;
  offsetY?: number;
  affectStroke?: boolean;
}

function updateShadow(params: {
  blur?: number;
  color?: string;
  offsetX?: number;
  offsetY?: number;
}) {
  const obj = fabricStore.canvas?.getActiveObject()
  if (!obj) return
  
  const currentShadow = obj.shadow as Shadow || {}
  const newColor = params.color ?? currentShadow.color ?? `rgba(0,0,0,${shadowOpacity.value / 100})`

  obj.set('shadow', {
    color: newColor,
    blur: params.blur ?? currentShadow.blur ?? shadowBlur.value,
    offsetX: params.offsetX ?? currentShadow.offsetX ?? shadowOffsetX.value,
    offsetY: params.offsetY ?? currentShadow.offsetY ?? shadowOffsetY.value,
    affectStroke: true // если хочешь, чтобы тень была и на обводку
  })
  fabricStore.canvas?.requestRenderAll()
  fabricStore.canvas?.fire('object:modified', { target: obj });
}



// Синхронизация UI с активным объектом
watch(
  () => fabricStore.canvas?.getActiveObject(),
  (obj) => {
    if (obj) {
      strokeWidth.value = obj.strokeWidth ?? 2
      strokeColor.value = typeof obj.stroke === 'string' ? obj.stroke : '#000000'
      strokeDashArray.value = obj.strokeDashArray ?? undefined
      fillColor.value = typeof obj.fill === 'string' ? obj.fill : '#ffa500'
      fillOpacity.value = typeof obj.opacity === 'number' ? obj.opacity : 1
      
       // Обновление радиусов
      if (obj.type === 'rect') {
        const rect = obj as Rect;
        borderRadius.value = rect.rx ?? rect.ry ?? 0; // Используем сохраненные радиусы
      } else {
        borderRadius.value = 0;
      }

      // Обновление параметров теней, если они существуют
      if (obj.shadow) {
        const shadow = obj.shadow as Shadow;
        shadowBlur.value = shadow.blur ?? 10;
        const alphaMatch = shadow.color?.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/);
        shadowOpacity.value = alphaMatch ? parseFloat(alphaMatch[1]) * 100 : 100;
        shadowOffsetX.value = shadow.offsetX ?? 5;
        shadowOffsetY.value = shadow.offsetY ?? 5;
      } else {
        // Сброс значений тени, если тень отсутствует
        shadowBlur.value = 10;
        shadowOpacity.value = 100;
        shadowOffsetX.value = 5;
        shadowOffsetY.value = 5;
      }
    } else {
      // Сброс значений для пустого объекта
      strokeWidth.value = 2
      strokeColor.value = '#000000'
      strokeDashArray.value = undefined
      fillColor.value = '#ffa500'
      fillOpacity.value = 0.5
      borderRadius.value = 0
      // Сброс значений тени
      shadowBlur.value = 10
      shadowOpacity.value = 100
      shadowOffsetX.value = 5
      shadowOffsetY.value = 5
    }
  },
  { immediate: true }
);

// Отслеживание изменений параметров теней
watch(shadowBlur, (val) => {
  const obj = fabricStore.canvas?.getActiveObject();
  if (obj) {
    updateShadow({ blur: val });
  }
});

watch(shadowOpacity, (val) => {
  const obj = fabricStore.canvas?.getActiveObject();
  if (obj) {
    updateShadow({ color: `rgba(0,0,0,${val / 100})` });
  }
});

watch(shadowOffsetX, (val) => {
  const obj = fabricStore.canvas?.getActiveObject();
  if (obj) {
    updateShadow({ offsetX: val });
  }
});

watch(shadowOffsetY, (val) => {
  const obj = fabricStore.canvas?.getActiveObject();
  if (obj) {
    updateShadow({ offsetY: val });
  }
});

watch(strokeDashString, (newValue) => {
  console.log('strokeDashString изменен на:', newValue);
  // Здесь можно добавить любые дополнительные действия, если нужно
});


// Функция для обновления свойств UI по активному объекту
function updateUIFromActiveObject(obj: FabricObject | null) {  
  if (!obj) {
    strokeWidth.value = 2
    strokeColor.value = '#000000'
    strokeDashArray.value = undefined
    fillColor.value = '#ffa500'
    fillOpacity.value = 0.5
    borderRadius.value = 0

    shadowBlur.value = 10
    shadowOpacity.value = 100
    shadowOffsetX.value = 5
    shadowOffsetY.value = 5
    return
  }
    // Получаем dashArray из объекта
  const dashArray = obj.strokeDashArray;

if (!dashArray || dashArray.length === 0) {
    strokeDashString.value = lineTypes.solid;
  } else {
    // Проверка на тип линии
    if (Array.isArray(dashArray)) {
      const dashArrayStr = JSON.stringify(dashArray);
      if (dashArrayStr === JSON.stringify([5, 5])) { // Пунктир
        strokeDashString.value = lineTypes.dashed;
      } else if (dashArrayStr === JSON.stringify([10, 5, 2, 5])) { // Штрих-пунктир
        strokeDashString.value = lineTypes.dashdot;
      } else {
        // Если не совпадает ни с одним из вариантов — присваиваем 'custom'
        strokeDashString.value = 'custom';
      }
    } else {
      strokeDashString.value = 'custom'; // Если dashArray не массив, устанавливаем 'custom'
    }
  }

  // Обновляем остальные параметры

  strokeWidth.value = obj.strokeWidth ?? 2
  strokeColor.value = typeof obj.stroke === 'string' ? obj.stroke : '#000000'
  strokeDashArray.value = obj.strokeDashArray ?? undefined
  fillColor.value = typeof obj.fill === 'string' ? obj.fill : '#ffa500'
  fillOpacity.value = obj.opacity ?? 1

  if (obj.type === 'rect') {
    const rect = obj as Rect
    borderRadius.value = (rect.rx || rect.ry) ?? 0
  } else {
    borderRadius.value = 0
  }

  // Тень
  const shadow = obj.shadow as Shadow; // Приведение типа
  if (shadow) {
    shadowBlur.value = shadow.blur ?? 10;

    // Извлекаем альфа канал из цвета тени
    const alphaMatch = shadow.color?.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/);
    shadowOpacity.value = alphaMatch ? parseFloat(alphaMatch[1]) * 100 : 100;

    shadowOffsetX.value = shadow.offsetX ?? 5;
    shadowOffsetY.value = shadow.offsetY ?? 5;
  } else {
    shadowBlur.value = 10;
    shadowOpacity.value = 100;
    shadowOffsetX.value = 5;
    shadowOffsetY.value = 5;
  }
}

onMounted(async () => {
  console.log('🚀 LeftPanel mounted')
  try {
    const res = await fetch('/configs/config.json');
    if (!res.ok) throw new Error('Error loading config.json');
    const data = await res.json();
    canvasWidthMM.value = data.canvas.inputWidthMM;
    canvasLengthMM.value = data.canvas.inputHeightMM;

    const tabsRes = await fetch('/configs/tabs.json')
    const tabsData = await tabsRes.json()
    console.log('Загруженные табы:', tabsData) // лог добавлен
    leftTabs.value = tabsData.left
    activeTab.value = tabsData.left[0]?.key || ''
  } catch (err) {
    console.error('Ошибка загрузки tabs.json:', err)
  }
  const canvas = fabricStore.canvas
  if (!canvas) return

const refreshUI = () => {
  const activeObject = canvas.getActiveObject()
  if (activeObject?.type === 'activeselection') {
    // Если выделена группа, берем первый объект
    const selection = activeObject as ActiveSelection
    const firstSelected = selection.getObjects()[0]
    updateUIFromActiveObject(firstSelected ?? null)
  } else {
    // console.log('refreshUI')
    updateUIFromActiveObject(activeObject ?? null)
  }
}

canvas.on('selection:created', refreshUI)
canvas.on('selection:updated', refreshUI)
canvas.on('selection:cleared', () => updateUIFromActiveObject(null))


  let savedRx = 0
  let savedRy = 0
  let scalingTarget: Rect | null = null;

  canvas.on('object:scaling', (e) => {
  const obj = e.target;
  if (!obj || obj.type !== 'rect') return;

  const rect = obj as Rect;

  // Сохраняем радиусы при первом вызове масштабирования
  if (!scalingTarget) {
    scalingTarget = rect;
    savedRx = rect.rx ?? 0;
    savedRy = rect.ry ?? 0;
  }
});

// После завершения масштабирования
canvas.on('mouse:up', () => {
  if (!scalingTarget) return;

  const rect = scalingTarget;
  const newWidth = rect.width! * rect.scaleX!;
  const newHeight = rect.height! * rect.scaleY!;

  rect.set({
    width: newWidth,
    height: newHeight,
    scaleX: 1,
    scaleY: 1,
    rx: savedRx,
    ry: savedRy,
  });

  fabricStore.canvas?.requestRenderAll();
  scalingTarget = null; // Сброс
});


  
})

const toggle3DView = () => {
  window.dispatchEvent(new Event('toggle-3d-view'))
}

const onMakeScreenshots = async () => {
  window.dispatchEvent(new Event('screenshoot-request'))
}

const bringToFront = () => window.dispatchEvent(new Event('objects:bringToFront'))
const sendToBack = () => window.dispatchEvent(new Event('objects:sendToBack'))
const bringForward = () => window.dispatchEvent(new Event('objects:bringForward'))
const sendBackwards = () => window.dispatchEvent(new Event('objects:sendBackwards'))


// 🔹 Кнопка вызывает клик по скрытому input
const onLoadImage = () => {
  console.log('fileInputRef.value:', fileInputRef.value)
  fileInputRef.value?.click()
} 


// 🔹 Обработчик загрузки файлов
const handleFileInputChange = async (e: Event) => {
  if (!fabricStore.canvas) {
    console.error('Fabric canvas not ready');
    return;
  }

  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) continue;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });

    if (fileExtension === 'svg') {
      try {
        const { objects, options } = await loadSVGFromString(fileContent);
        // Теперь импортируем объекты как группу
        // Для группировки вызываем util.groupSVGElements
        const validObjects = objects.filter((obj): obj is FabricObject => obj !== null);
        const svgGroup = util.groupSVGElements(validObjects, options);
        fabricStore.canvas!.add(svgGroup);
        fabricStore.canvas!.setActiveObject(svgGroup);
        fabricStore.canvas!.requestRenderAll();
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    } else {
      // Логика загрузки обычных изображений у вас уже есть
      await onLoadImageFromFiles(files, fabricStore.canvas!) // Передаем files напрямую
    }

    logFabricCanvasObjects(fabricStore.canvas!);
    saveAllObjectStates(fabricStore.canvas!);
  }

  target.value = ''; // сброс input
}


const onDeleteImage = () => {
  const canvas = fabricStore.canvas
  if (!canvas) {
    console.error('Fabric canvas не инициализирован');
    return
  }
  const activeObjects = canvas.getActiveObjects()
  if (!activeObjects || activeObjects.length === 0) {
    alert('Выберите изображение для удаления')
    return
  }
  // Удаляем все выделенные объекты
  activeObjects.forEach(obj => {
    canvas.remove(obj)
  })
  // Снимаем выделение
  canvas.discardActiveObject()
  canvas.requestRenderAll()
  // Если нужно, триггерим событие object:modified для первого удалённого объекта (опционально)
  canvas.fire('object:modified', { target: activeObjects[0] })
}

const onResetImage = () => {
  const canvas = fabricStore.getCanvas()
  if (!canvas) {
    console.error('Fabric canvas не инициализирован');
    return
  }
  const activeObject = canvas.getActiveObject();
  if (!activeObject) {
    alert('Пожалуйста, выберите объект для центрирования');
    return;
  }
  centerObjectOnCanvas(canvas, activeObject)
}

const onSaveImage = async () => {
  const canvas = fabricStore.getCanvas();
  if (!canvas) {
    console.error('Fabric canvas не инициализирован');
    return;
  }
  try {
    const blob = await saveHighResImage(canvas, canvasWidthMM.value, canvasLengthMM.value);

    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'exported-image.png',
        types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    alert('Изображение успешно сохранено!');
  } catch (err) {
    console.error('Ошибка при сохранении изображения:', err);
    alert('Ошибка при сохранении изображения. Проверьте консоль.');
  }
}



</script>



<style scoped>
.panel-wrapper {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  padding: 8px;
  padding-right: 0px;
  box-sizing: border-box;
}
.custom-tabs {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 8px;
  /* box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.08); */
  height: 100%;
}
</style>
