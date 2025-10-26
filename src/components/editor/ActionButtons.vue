<template>
  <div class="add-object">
    <!-- Сохранить / Загрузить -->
    <a-divider style="margin: 0">Сохранить / Загрузить проект</a-divider>
    <div class="add-object-buttons">
      <a-tooltip placement="top" title="Сохранить">
        <a-button size="large" :icon="h(SaveOutlined)" @click="saveProjectToFile"/>
      </a-tooltip>
      <a-tooltip placement="top" title="Зугрузить">
        <a-button size="large" :icon="h(FolderOpenOutlined)" @click="onLoadProject"/>
      </a-tooltip>
    </div>

    <!-- Развернуть/свернуть, сделать скриншоты -->
    <a-divider style="margin: 0">Функции</a-divider>
    <div class="add-object-buttons">
      <a-tooltip placement="top" :title="showThreeContainerButton.title">
        <a-button size="large" :icon="showThreeContainerButton.icon" @click="toggleShowThreeContainer"/>
      </a-tooltip>
      <a-tooltip placement="top" title="Сделать скриншоты">
        <a-button size="large" :icon="h(CameraOutlined)" @click="onTakeScreenshots"/>
      </a-tooltip>
    </div>

    <!-- Добавление и удалиени объектов -->
    <a-divider style="margin: 0">Добавить/Удалить объект</a-divider>
    <div class="add-object-buttons">
      <a-tooltip placement="top" title="Изображение">
        <a-button size="large" :icon="h(PictureOutlined)" @click="onAddImage"/>
      </a-tooltip>
      <a-tooltip placement="top" title="Прямоугольник">
        <a-button size="large" :icon="h(BorderOutlined)" @click="onAddRect"/>
      </a-tooltip>
      <a-tooltip placement="top" title="Текст">
        <a-button size="large" :icon="h(FontSizeOutlined)" @click="onAddText"/>
      </a-tooltip>
      <a-tooltip placement="top" title="Удалить выбранное">
        <a-button size="large" danger :disabled="!activeObject" :icon="h(DeleteOutlined)" @click="onDeleteSelected"/>
      </a-tooltip>
    </div>

    <!-- Перемещение объектов по слоям -->
    <a-divider style="margin: 0">Переместить объект</a-divider>
    <div class="add-object-buttons">
      <a-tooltip placement="top" title="На передний план">
        <a-button size="large" :disabled="!activeObject" :icon="h(toFront)" @click="moveObjects('bringToFront')"/>
      </a-tooltip>
      <a-tooltip placement="top" title="На задний план">
        <a-button size="large" :disabled="!activeObject" :icon="h(toBack)" @click="moveObjects('sendToBack')"/>
      </a-tooltip>
      <a-tooltip placement="top" title="На уровень ниже">
        <a-button size="large" :disabled="!activeObject" :icon="h(VerticalAlignBottomOutlined)" @click="moveObjects('sendBackwards')"/>
      </a-tooltip>
      <a-tooltip placement="top" title="На уровень выше">
        <a-button size="large" :disabled="!activeObject" :icon="h(VerticalAlignTopOutlined)" @click="moveObjects('bringForward')"/>
      </a-tooltip>
    </div>

    <!-- Скрытый input -->
    <input
      ref="fileInput"
      type="file"
      :accept="fileAccept"
      multiple
      style="display: none"
      @change="onSelectFile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { useImageFiles } from '@/stores/imageFiles'
import { useApplicationStore } from '@/stores/application'
import { storeToRefs } from 'pinia'
import { h } from 'vue'
import {
  PictureOutlined,
  BorderOutlined,
  FontSizeOutlined,
  DeleteOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  CameraOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons-vue'
import { toBack, toFront } from '@/services/customIcons'
import Screenshoter from '@/services/screenshoter'

const fileInput = ref<HTMLInputElement | null>(null)
const fileInputType = ref<string>('image')
const fileAccept = computed(() => (fileInputType.value === 'image' ? '.svg,image/*' : '.3dl/*'))
const store = useFabricStore()
const { activeObject } = storeToRefs(store)
const screenshoter = ref<Screenshoter>(null)

const {
  addRect,
  addText,
  addSVG,
  addImage,
  removeSelected,
  moveObjects,
  serialize,
  deserialize,
  getCanvas,
} = store

const imageStore = useImageFiles()
const { loadImageFiles } = imageStore

const applicationStore = useApplicationStore()
const { showThreeContainer } = storeToRefs(applicationStore)
const { toggleShowThreeContainer } = applicationStore
const showThreeContainerButton = computed(() => {
  if (showThreeContainer.value) {
    return { title: 'Развернуть рабочую область', icon: h(FullscreenOutlined) }
  } else {
    return { title: 'Свернуть рабочую область', icon: h(FullscreenExitOutlined) }
  }
})

//const screenshoter = canvas ? new Screenshoter(canvas) : null
const onTakeScreenshots = async (): Promise<void> => {
  if (!screenshoter.value) {
    const canvas = getCanvas()
    if (canvas) screenshoter.value = new Screenshoter(canvas)
  }
  if (screenshoter) {
    const blob = await screenshoter.value.makeScreenshot()
    console.log(blob)

    const url = URL.createObjectURL(blob as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'screenshot.png'
    a.click()
  }
}

const onAddImage = (): void => {
  fileInputType.value = 'image'
  fileInput.value?.click()
}

const onLoadProject = (): void => {
  fileInputType.value = 'project'
  fileInput.value?.click()
}

const onAddRect = (): void => {
  addRect()
}

const onAddText = (): void => {
  addText()
}

const onDeleteSelected = (): void => {
  removeSelected()
}

const onSelectFile = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const files = target.files
  /*if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (!file) continue

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      if (fileExtension === 'svg') {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })

    if (fileContent) {
      const addImgFunction = fileExtension === 'svg' ? addSVG : addImage
      try {
        await addImgFunction(fileContent)
      } catch (error) {
        console.error('Error loading image:', error)
      }
    }
  }*/
  if (fileInputType.value === 'image') {
    const fileName = await loadImageFiles(files)
    if (fileName) {
      const fileExtension = fileName.split('.').pop()?.toLowerCase()
      const addImgFunction = fileExtension === 'svg' ? addSVG : addImage
      try {
        await addImgFunction(fileName)
      } catch (error) {
        console.error('Error loading image:', error)
      }
    }
  } else {
    if (files?.length) {
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsText(files[0])
      })
      if (fileContent) {
        deserialize(JSON.parse(fileContent))
      }
    }
  }

  target.value = '' // сброс input
}

const saveProjectToFile = (): void => {
  try {
    // Создаем JSON строку
    const jsonString = JSON.stringify(serialize())
    console.log(serialize(), jsonString)

    // Создаем Blob
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Создаем URL для Blob
    const url = URL.createObjectURL(blob)

    // Создаем временную ссылку для скачивания
    const link = document.createElement('a')
    link.href = url
    link.download = 'project.3dl'

    // Программно кликаем по ссылке
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Освобождаем память
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка при сохранении файла:', error)
  }
}

</script>

<style scoped>
.add-object-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 8px 0;
}
</style>