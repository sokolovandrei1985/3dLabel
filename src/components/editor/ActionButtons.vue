<template>
  <div class="add-object">
    <!-- Добавление и удалиени объектов -->
    <a-divider style="margin: 0">Действия</a-divider>
    <div class="add-object-buttons">
      <a-tooltip placement="top" title="Отменить">
        <a-button size="large" :icon="h(UndoOutlined)" :disabled="!canUndo" @click="undo"/>
      </a-tooltip>
      <a-tooltip placement="top" title="Повторить">
        <a-button size="large" :icon="h(RedoOutlined)" :disabled="!canRedo" @click="redo"/>
      </a-tooltip>
      <a-tooltip placement="top" title="Копировать">
        <a-button size="large" :icon="h(CopyOutlined)" :disabled="!hasSelectedObject" @click="copy"/>
      </a-tooltip>
      <a-tooltip placement="top" title="Вставить">
        <a-button size="large" :icon="h(pasteIcon)" :disabled="!hasObjectInClipboard" @click="paste"/>
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
      accept=".svg,image/*"
      multiple
      style="display: none"
      @change="onSelectFile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { useApplicationStore } from '@/stores/application'
import { useImageFiles } from '@/stores/imageFiles'
import { storeToRefs } from 'pinia'
import {
  PictureOutlined,
  BorderOutlined,
  FontSizeOutlined,
  DeleteOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  UndoOutlined,
  RedoOutlined,
  CopyOutlined,
} from '@ant-design/icons-vue'
import { toBack, toFront, paste as pasteIcon } from '@/services/customIcons'
import { undo, redo } from '@/services/useUndoRedo'

const fileInput = ref<HTMLInputElement | null>(null)
const fabricStore = useFabricStore()
const { activeObject, clipboard } = storeToRefs(fabricStore)
const hasSelectedObject = computed(() => (!!activeObject.value))
const hasObjectInClipboard = computed(() => (!!clipboard.value))

const {
  addRect,
  addText,
  addSVG,
  addImage,
  removeSelected,
  moveObjects,
  copy,
  paste,
} = fabricStore

const imageStore = useImageFiles()
const { loadImageFiles } = imageStore

const applicationStore = useApplicationStore()
const { canUndo, canRedo } = storeToRefs(applicationStore)

const onAddImage = async (): Promise<void> => {
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

  target.value = '' // сброс input
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