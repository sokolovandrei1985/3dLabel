<template>
  <div class="top-panel">
    <a-divider type="vertical" style="margin: 0; height: 24px" />
    <ProjectName class="project-name"/>
    <a-divider type="vertical" style="margin: 0; height: 24px" />
    <template v-for="actionButton in actionButtons" :key="actionButton.key">
      <a-tooltip placement="bottomLeft" :title="actionButton.title">
        <a-button
          type="text"
          shape="circle"
          size="large"
          :disabled="actionButton.disabled"
          :icon="h(actionButton.icon)"
          @click="actionButton.action"
        />
      </a-tooltip>
      <a-divider v-if="actionButton.divider" type="vertical" style="margin: 0; height: 24px" />
    </template>

    <!-- Скрытый input -->
    <input
      ref="fileInput"
      type="file"
      accept=".3dl,*"
      style="display: none"
      @change="onSelectFile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { useApplicationStore } from '@/stores/application'
import { storeToRefs } from 'pinia'
import {
  SaveOutlined,
  FolderOpenOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  CameraOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons-vue'
import Screenshoter from '@/services/screenshoter'
import ProjectName from './ProjectName.vue'

const fileInput = ref<HTMLInputElement | null>(null)
const fabricStore = useFabricStore()
const applicationStore = useApplicationStore()
const screenshoter = ref<Screenshoter | null>(null)

const { getCanvas } = fabricStore

const { isAuthorized, showThreeContainer, projectName } = storeToRefs(applicationStore)
const { toggleShowThreeContainer, saveProjectToJson, loadProjectFromJson } = applicationStore

const showThreeContainerButton = computed(() => {
  if (showThreeContainer.value) {
    return { title: 'Развернуть рабочую область', icon: h(FullscreenOutlined) }
  } else {
    return { title: 'Свернуть рабочую область', icon: h(FullscreenExitOutlined) }
  }
})

const onSelectFile = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const files = target.files

  if (files?.length) {
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(files[0])
    })
    if (fileContent) {
      loadProjectFromJson(JSON.parse(fileContent))
    }
  }

  target.value = '' // сброс input
}

const onLoadProject = async (): Promise<void> => {
  fileInput.value?.click()
}

const saveProjectToFile = (): void => {
  try {
    // Создаем JSON строку
    const jsonString = JSON.stringify(saveProjectToJson())
    //console.log(serialize(), jsonString)

    // Создаем Blob
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Создаем URL для Blob
    const url = URL.createObjectURL(blob)

    // Создаем временную ссылку для скачивания
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName.value || 'New project'}.3dl`

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

const onTakeScreenshots = async (): Promise<void> => {
  if (!screenshoter.value) {
    const canvas = getCanvas()
    if (canvas) screenshoter.value = new Screenshoter(canvas)
  }
  if (screenshoter.value) {
    const blob = await screenshoter.value.makeScreenshot()
    console.log(blob)

    const url = URL.createObjectURL(blob as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'screenshot.zip'
    a.click()
  }
}

const actionButtons = computed(() => ([
  { key: 'load', title: 'Загрузить из файла', icon: FolderOpenOutlined, action: onLoadProject },
  { key: 'loadCloud', title: 'Загрузить из облака', icon: CloudDownloadOutlined, action: onLoadProject, disabled: !isAuthorized.value, divider: true },
  { key: 'save', title: 'Сохранить в файл', icon: SaveOutlined, action: saveProjectToFile },
  { key: 'saveCloud', title: 'Сохранить в облако', icon: CloudUploadOutlined, action: saveProjectToFile, disabled: !isAuthorized.value, divider: true },
  { key: 'screenshots', title: 'Сделать скриншоты', icon: CameraOutlined, action: onTakeScreenshots, divider: true },
  { key: 'showThreeContainer', title: showThreeContainerButton.value.title, icon: showThreeContainerButton.value.icon, action: toggleShowThreeContainer, divider: true },
]))

</script>

<style scoped>
.top-panel {
  padding: 0px 40px 0px 8px;
  display: flex;
  align-items: center;
}

.project-name {
  max-width: 200px;
  margin: 0px 8px;
}
</style>
