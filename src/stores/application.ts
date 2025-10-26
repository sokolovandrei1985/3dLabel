import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useApplicationStore = defineStore('applicatoin', () => {
  const showThreeContainer = ref<boolean>(true)


  const toggleShowThreeContainer = (): void => {
    showThreeContainer.value = !showThreeContainer.value
  }

  // Экспорт
  return {
    showThreeContainer,
    toggleShowThreeContainer,
  }
})