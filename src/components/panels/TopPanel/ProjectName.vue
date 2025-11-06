<template>
  <a-input
    v-model:value="projectName"
    placeholder="Название проекта"
    :status="validationStatus"
    :maxlength="255"
    @input="handleInput"
    @paste="handlePaste"
    @keydown="handleKeyDown"
  >
    <template #suffix>
      <a-tooltip placement="left" :title="validationHelp">
        <InfoCircleOutlined v-if="validationStatus === 'error'" style="color: rgba(0, 0, 0, 0.45)" />
      </a-tooltip>
    </template>
  </a-input>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { useApplicationStore } from '@/stores/application'

const applicationStore = useApplicationStore()
const { projectName } = storeToRefs(applicationStore)
const { setProjectName } = applicationStore

// Запрещенные символы для имен файлов Windows
const windowsInvalidChars = [
  '<', '>', ':', '"', '|', '?', '*', '\\', '/',
  '\u0000', '\u0001', '\u0002', '\u0003', '\u0004', '\u0005', '\u0006', '\u0007',
  '\u0008', '\u0009', '\u000A', '\u000B', '\u000C', '\u000D', '\u000E', '\u000F',
  '\u0010', '\u0011', '\u0012', '\u0013', '\u0014', '\u0015', '\u0016', '\u0017',
  '\u0018', '\u0019', '\u001A', '\u001B', '\u001C', '\u001D', '\u001E', '\u001F'
]

// Зарезервированные имена Windows
const reservedNames = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]

// Удаляет запрещенные символы из строки
const removeInvalidChars = (value: string): string => {
  let result = value
  windowsInvalidChars.forEach(char => {
    result = result.split(char).join('')
  })
  return result
}

// Проверяет, содержит ли строка запрещенные символы
const hasInvalidChars = (value: string): boolean => {
  return windowsInvalidChars.some(char => value.includes(char))
}

// Проверяет, является ли имя зарезервированным
const isReservedName = (value: string): boolean => {
  const nameWithoutExt = value.split('.')[0].toUpperCase()
  return reservedNames.includes(nameWithoutExt)
}

// Проверяет, заканчивается ли имя на точку или пробел
const hasInvalidEnding = (value: string): boolean => {
  return value.endsWith('.') || value.endsWith(' ')
}

// Обработчик ввода
const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const cleanValue = removeInvalidChars(input.value)

  if (cleanValue !== input.value) {
    //projectName.value = cleanValue
    setProjectName(cleanValue)
  }
}

// Обработчик вставки
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''
  const cleanText = removeInvalidChars(pastedText)

  const input = event.target as HTMLInputElement
  const start = input.selectionStart || 0
  const end = input.selectionEnd || 0

  const newValue = projectName.value.substring(0, start) + cleanText + projectName.value.substring(end)
  //projectName.value = newValue
  setProjectName(newValue)
}

// Обработчик нажатия клавиш
const handleKeyDown = (event: KeyboardEvent) => {
  if (windowsInvalidChars.includes(event.key)) {
    event.preventDefault()
  }
}

// Статус валидации
const validationStatus = computed(() => {
  if (!projectName.value || hasInvalidChars(projectName.value) || isReservedName(projectName.value) || hasInvalidEnding(projectName.value)) {
    return 'error'
  }

  return 'success'
})

// Текст помощи
const validationHelp = computed(() => {
  if (!projectName.value) return 'Введите название проекта'

  if (hasInvalidChars(projectName.value)) {
    return 'Название содержит запрещенные символы'
  }

  if (isReservedName(projectName.value)) {
    return 'Это зарезервированное имя в Windows'
  }

  if (hasInvalidEnding(projectName.value)) {
    return 'Имя не может заканчиваться точкой или пробелом'
  }
})
</script>

<style scoped>

</style>