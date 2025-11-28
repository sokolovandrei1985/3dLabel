import { dbService } from "./indexedDB"
import type { StateRecord } from "./indexedDB"
import { useApplicationStore } from '@/stores/application'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { useEvents } from '@/composables/useEvents.ts'
import throttle from 'lodash.throttle'

/*const appStore = useApplicationStore()
const { isIndexedDbAvailable } = storeToRefs(appStore)
const { setUndoState, setRedoState } = appStore
const fabricStore = useFabricStore()*/

let appStore: ReturnType<typeof useApplicationStore> | null = null
let fabricStore: ReturnType<typeof useFabricStore> | null = null
let isIndexedDbAvailable: Ref<boolean> | null = null
let setUndoState: ((state: boolean) => void) | null = null
let setRedoState: ((state: boolean) => void) | null = null

let currentStateId: number = 0
let skipUdate: boolean = false

const MAX_STATE_COUNT = 10
const throttledSaveState = throttle(() => {
  saveState()
}, 200)

export async function initUndoRedoService(): Promise<void> {
  appStore = useApplicationStore()
  fabricStore = useFabricStore()
  isIndexedDbAvailable = storeToRefs(appStore).isIndexedDbAvailable
  setUndoState = appStore.setUndoState
  setRedoState = appStore.setRedoState

  if (isIndexedDbAvailable?.value) {
    try {
      const count = await dbService.getCount()
      if (count > 0) await dbService.clearAll()

      const { on } = useEvents()
      on('fabric:update', () => {
        if (skipUdate) {
          skipUdate = false
        } else {
          //saveState()
          throttledSaveState()
        }
      })
    } catch (e) {
      console.error('IndexedDB недоступна!', e)
      isIndexedDbAvailable.value = false
    }
  } else {
    console.error('IndexedDB недоступна!')
  }
}

export async function saveState(): Promise<number | null> {
  console.log('saveState')
  if (isIndexedDbAvailable?.value) {
    try {
      await dbService.removeRowsAfter(currentStateId)
      const state = JSON.stringify(fabricStore?.serialize())
      currentStateId = await dbService.addRow(state)

      // Проверяем, что записей в таблице не больше допустимого максимума
      let count = await dbService.getCount()
      while (count > MAX_STATE_COUNT) {
        await dbService.removeFirstRow()
        count = await dbService.getCount()
      }
      setUndoState!(count > 1)
      //console.log('save state', currentStateId, count)
      return currentStateId
    } catch (e) {
      console.error('Ошибка при сохранении состояния в IndexedDB!', e)
    }
  }
  return null
}

export async function undo(): Promise<string | null> {
  if (isIndexedDbAvailable?.value) {
    try {
      const prevState = await dbService.getPrevRow(currentStateId)
      if (typeof prevState === 'object') {
        const { id, state } = prevState as StateRecord
        //console.log('undo', currentStateId, id, state)
        currentStateId = id
        setRedoState!(true)
        skipUdate = true
        await fabricStore?.deserialize(state)
        return state
      } else {
        setUndoState!(false)
        return null
      }
    } catch (e) {
      console.error('Ошибка получения состояния из IndexedDB!', e)
    }
  }
  return null
}

export async function redo(): Promise<string | null> {
  if (isIndexedDbAvailable?.value) {
    try {
      const nextState = await dbService.getNextRow(currentStateId)
      if (typeof nextState === 'object') {
        const { id, state } = nextState as StateRecord
        //console.log('redo', currentStateId, id, state)
        currentStateId = id
        setUndoState!(true)
        skipUdate = true
        await fabricStore?.deserialize(state)
        return state
      } else {
        setRedoState!(false)
        return null
      }
    } catch (e) {
      console.error('Ошибка получения состояния из IndexedDB!', e)
    }
  }
  return null
}