import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoadingProps } from '@/models/loading'
import type { IAuthUser } from '@/models/auth'
import type { IProject } from '@/models/project'
import { useFabricStore } from './fabric'

export const useApplicationStore = defineStore('applicatoin', () => {
  const showThreeContainer = ref<boolean>(true)
  const loading = ref<LoadingProps>({ show: false })
  const authUser = ref<IAuthUser>(null)
  const projectName = ref<string>('New project')
  const projectAuthor = ref<IAuthUser>(null)
  const isIndexedDbAvailable = ref<boolean>(true)
  const isWebWorkersAvailable = ref<boolean>(true)

  const canUndo = ref<boolean>(false)
  const canRedo = ref<boolean>(false)

  const isAuthorized = computed(() => (!!authUser.value))
  const getUserName = computed(() => {
    if (!authUser.value) return '<Войдите или зарегистрируйтесь>'
    const { email, firstName, lastName } = authUser.value
    if (!firstName && !lastName) return email
    return `${[firstName, lastName].join(' ')} (${email})`
  })

  const toggleShowThreeContainer = (): void => {
    showThreeContainer.value = !showThreeContainer.value
  }

  const setLoadingState = (state: LoadingProps): void => {
    loading.value = state
  }

  const setAuthUser = (user: IAuthUser): void => {
    authUser.value = user
  }

  const setProjectName = (name: string): void => {
    projectName.value = name
  }

  const saveProjectToJson = (): IProject => {
    const fabricStore = useFabricStore()
    const result: IProject = {
      name: projectName.value,
      fabric: fabricStore.serialize(),
      ...(projectAuthor.value && { author: projectAuthor.value })
    }
    if (authUser.value) {
      result.lastUpdateBy = authUser.value
      if (!projectAuthor.value) result.author = authUser.value
    }
    return result
  }

  const loadProjectFromJson = async (json: IProject): Promise<void> => {
    if (!json) return
    const fabricStore = useFabricStore()
    const { name, author, fabric } = json
    projectName.value = name || 'New project'
    if (author) projectAuthor.value = author
    if (!name && !author && !fabric) {
      await fabricStore.deserialize(json)
    } else {
      await fabricStore.deserialize(fabric)
    }
  }

  const setBrowserRestrictions = (indexedDB?: boolean | undefined, webWorkers?: boolean | undefined): void => {
    isIndexedDbAvailable.value = indexedDB ?? !!window.indexedDB
    //console.log(`IndexedDB available: ${isIndexedDbAvailable.value}`)
    isWebWorkersAvailable.value = webWorkers ?? !!window.Worker
    //console.log(`WebWorker available: ${isWebWorkersAvailable.value}`)
  }

  const setUndoState = (state: boolean): void => {
    canUndo.value = state
  }

  const setRedoState = (state: boolean): void => {
    canRedo.value = state
  }

  // Экспорт
  return {
    showThreeContainer,
    loading,
    authUser,
    isAuthorized,
    getUserName,
    projectName,
    isIndexedDbAvailable,
    isWebWorkersAvailable,
    canUndo,
    canRedo,
    toggleShowThreeContainer,
    setLoadingState,
    setAuthUser,
    setProjectName,
    saveProjectToJson,
    loadProjectFromJson,
    setBrowserRestrictions,
    setUndoState,
    setRedoState,
  }
})