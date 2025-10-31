import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoadingProps } from '@/models/loading'

export const useApplicationStore = defineStore('applicatoin', () => {
  const showThreeContainer = ref<boolean>(true)
  const loading = ref<LoadingProps>({ show: false })

  const toggleShowThreeContainer = (): void => {
    showThreeContainer.value = !showThreeContainer.value
  }

  const setLoadingState = (state: LoadingProps): void => {
    loading.value = state
  }

  // Экспорт
  return {
    showThreeContainer,
    loading,
    toggleShowThreeContainer,
    setLoadingState,
  }
})