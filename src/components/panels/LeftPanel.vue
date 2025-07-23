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
        <strong>Импорт</strong><br />
        <a-button-group>
         <a-button @click = "onLoadImage">Изображение</a-button>
         <a-button danger @click="onDeleteImage">Удалить</a-button><br/>          
        </a-button-group>
        <a-divider />
        <strong>Редактирование</strong><br />
        <a-button @click = "onResetImage">Вернуть к исходному состоянию</a-button>
        <a-button @click = "onSaveImage">Сохранит изображение</a-button>
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
    accept="image/*"
    multiple
    style="display: none"
    @change="handleFileInputChange"
  />         
</div>
</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoadImageFromFiles, logFabricCanvasObjects, saveAllObjectStates, centerObjectOnCanvas } from '@/services/useImageCanvas'
// import type { Canvas } from 'fabric'
import { useFabricStore } from '@/stores/fabric'
import { saveHighResImage } from '@/services/useImageExport' 


interface TabItem {
  key: string
  label: string
}

const fabricStore = useFabricStore()
const fileInputRef = ref<HTMLInputElement | null>(null)

const canvasWidthMM = ref<number>(0);
const canvasLengthMM = ref<number>(0);


const leftTabs = ref<TabItem[]>([])
const activeTab = ref('')

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
})

const toggle3DView = () => {
  window.dispatchEvent(new Event('toggle-3d-view'))
}

const onMakeScreenshots = async () => {
  window.dispatchEvent(new Event('screenshoot-request'))
}

// 🔹 Кнопка вызывает клик по скрытому input
const onLoadImage = () => {
  console.log('fileInputRef.value:', fileInputRef.value)
  fileInputRef.value?.click()
} 


// 🔹 Обработчик загрузки файлов
const handleFileInputChange = async (e: Event) => {
  if (!fabricStore.canvas) {
    console.error('Fabric canvas not ready')
    return
  }
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return
  logFabricCanvasObjects(fabricStore.canvas)
  await onLoadImageFromFiles(files, fabricStore.canvas)
  logFabricCanvasObjects(fabricStore.canvas)
  saveAllObjectStates(fabricStore.canvas)
  target.value = ''
}

const onDeleteImage = () => {
  const canvas = fabricStore.canvas
  if (!canvas) {
    console.error('Fabric canvas не инициализирован');
    return
  }
  const activeObj = canvas.getActiveObject()
  if (!activeObj) {
    alert('Выберите изображение для удаления')
    return
  }
  canvas.remove(activeObj)
  canvas.discardActiveObject()
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: activeObj });
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
