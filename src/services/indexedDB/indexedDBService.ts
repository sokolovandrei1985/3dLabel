import type { StateRecord, DatabaseService } from './types'

const DB_NAME = 'StatesDB'
const DB_VERSION = 1
const STORE_NAME = 'states'

export class IndexedDBService implements DatabaseService {
  private db: IDBDatabase | null = null

  constructor() {
    this.initDB()
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('id', 'id', { unique: true })
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB()
    }
    return this.db!
  }

  async addRow(state: string): Promise<number> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      // Генерируем ID как timestamp с точностью до 1мс
      const id = Math.floor(Date.now())
      const record: StateRecord = { id, state }

      const request = store.add(record)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  }

  async getRow(id: number): Promise<string | null> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result: StateRecord | undefined = request.result
        resolve(result ? result.state : null)
      }
    })
  }

  async getNextRow(id: number): Promise<StateRecord | boolean | null> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.openCursor(IDBKeyRange.lowerBound(id + 1))

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const record: StateRecord = cursor.value
          resolve(record)
        } else {
          resolve(false)
        }
      }
    })
  }

  async getPrevRow(id: number): Promise<StateRecord | boolean | null> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.openCursor(IDBKeyRange.upperBound(id - 1), 'prev')

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const record: StateRecord = cursor.value
          resolve(record)
        } else {
          resolve(false)
        }
      }
    })
  }

  async removeRow(id: number): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async removeRowsAfter(id: number): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.openCursor(IDBKeyRange.lowerBound(id + 1))

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }

  async removeFirstRow(): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.openCursor()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          resolve()
        } else {
          resolve()
        }
      }
    })
  }

  async getCount(): Promise<number> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async clearAll(): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getLastRow(): Promise<StateRecord | null> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.openCursor(null, 'prev')

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const record: StateRecord = cursor.value
          resolve(record)
        } else {
          resolve(null)
        }
      }
    })
  }
}

// Создаем синглтон экземпляр
export const dbService = new IndexedDBService()