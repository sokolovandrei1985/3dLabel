<template>
  <div class="add-object">
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
    <!-- Скрытый input -->
    <input
      ref="fileInput"
      type="file"
      accept=".svg,image/*"
      multiple
      style="display: none"
      @change="onSelectImageFile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'

import { h } from 'vue'
import { PictureOutlined, BorderOutlined, FontSizeOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const fileInput = ref<HTMLInputElement | null>(null)
const store = useFabricStore()
const { activeObject } = storeToRefs(store)

const {
  addRect,
  addText,
  addSVG,
  removeSelected,
} = store

const onAddImage = (): void => {
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

const onSelectImageFile = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (!file) continue

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })

    if (fileExtension === 'svg') {
      try {
        await addSVG(fileContent)
      } catch (error) {
        console.error('Error loading SVG:', error)
      }
    } else {
      //await onLoadImageFromFiles(files, canvas)
    }
    //logFabricCanvasObjects(canvas)
    //saveAllObjectStates(canvas)
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