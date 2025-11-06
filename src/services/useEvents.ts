import { ref, onUnmounted } from 'vue'

// Базовые типы для событий
export interface EventMap {
  /*'user:login': { user: any; timestamp: number }
  'user:logout': { user: any }
  'order:created': { orderId: string; amount: number }
  'app:refresh': void
  'app:notification': { message: string; type: 'success' | 'error' }*/
  'fabric:update': void
}

export type EventName = keyof EventMap

const events = new Map<EventName, Set<Function>>()

export function useEvents() {
  const emit = <T extends EventName>(eventName: T, data: EventMap[T]) => {
    if (events.has(eventName)) {
      events.get(eventName)?.forEach(callback => {
        callback(data)
      })
    }
  }

  const on = <T extends EventName>(eventName: T, callback: (data: EventMap[T]) => void) => {
    if (!events.has(eventName)) {
      events.set(eventName, new Set())
    }
    events.get(eventName)?.add(callback)

    // Автоматическая отписка при уничтожении компонента
    onUnmounted(() => {
      off(eventName, callback)
    })
  }

  const off = <T extends EventName>(eventName: T, callback: (data: EventMap[T]) => void) => {
    if (events.has(eventName)) {
      events.get(eventName)?.delete(callback)
    }
  }

  const once = <T extends EventName>(eventName: T, callback: (data: EventMap[T]) => void) => {
    const onceCallback = (data: EventMap[T]) => {
      callback(data)
      off(eventName, onceCallback)
    }
    on(eventName, onceCallback)
  }

  return {
    emit,
    on,
    off,
    once
  }
}