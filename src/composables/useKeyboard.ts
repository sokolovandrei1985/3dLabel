import { ref, type Ref } from 'vue'

interface KeyboardHandlers {
  onEscape?: () => void
  onTab?: () => void
  onShiftTab?: () => void
  onCtrlZ?: () => void
  onCtrlY?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onDelete?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
}

interface KeyboardConfig {
  containerSelector?: string
  repeatDelay?: number
}

export function useKeyboard(
  handlers: KeyboardHandlers,
  config: KeyboardConfig = {}
) {
  const { containerSelector = 'body', repeatDelay = 100 } = config
  const container = document.querySelector(containerSelector)

  const pressedKeys: Set<string> = new Set()
  const arrowRepeatTimers: Map<string, number> = new Map()
  const isKeyPressed: Ref<boolean> = ref(false)

  const handleKeyDown = (event: KeyboardEvent) => {
    //console.log(container, document.activeElement)
    if (container && container !== document.activeElement) return

    pressedKeys.add(event.key)

    // Проверка комбинаций с Ctrl
    const ctrlPressed = event.ctrlKey || event.metaKey

    // Escape
    if (event.key === 'Escape' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      handlers.onEscape?.()
      return
    }

    // Tab
    if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      handlers.onTab?.()
      return
    }

    // Shift + Tab
    if (event.key === 'Tab' && event.shiftKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      handlers.onShiftTab?.()
      return
    }

    // Delete
    if (event.key === 'Delete' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      handlers.onDelete?.()
      return
    }

    // Ctrl + Z
    if (event.key === 'z' && ctrlPressed && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      handlers.onCtrlZ?.()
      return
    }

    // Ctrl + Y
    if (event.key === 'y' && ctrlPressed && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      handlers.onCtrlY?.()
      return
    }

    // Ctrl + C или Ctrl + Insert
    if ((event.key === 'c' && ctrlPressed) ||
        (event.key === 'Insert' && ctrlPressed)) {
      event.preventDefault()
      handlers.onCopy?.()
      return
    }

    // Ctrl + V или Shift + Insert
    if ((event.key === 'v' && ctrlPressed) ||
        (event.key === 'Insert' && event.shiftKey && !ctrlPressed)) {
      event.preventDefault()
      handlers.onPaste?.()
      return
    }

    // Обработка стрелок с повторением при зажатии
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault()

      // Если таймер для этой стрелки уже запущен, не создавать новый
      if (arrowRepeatTimers.has(event.key)) return

      // Немедленный вызов при первом нажатии
      executeArrowHandler(event.key)

      // Установка таймера для повторения при зажатии
      const timer = window.setInterval(() => {
        if (pressedKeys.has(event.key)) {
          executeArrowHandler(event.key)
        } else {
          clearArrowTimer(event.key)
        }
      }, repeatDelay)

      arrowRepeatTimers.set(event.key, timer)
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    pressedKeys.delete(event.key)
    isKeyPressed.value = pressedKeys.size > 0

    // Очистка таймера при отпускании стрелки
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      clearArrowTimer(event.key)
    }
  }

  const executeArrowHandler = (key: string) => {
    switch (key) {
      case 'ArrowUp':
        handlers.onArrowUp?.()
        break
      case 'ArrowDown':
        handlers.onArrowDown?.()
        break
      case 'ArrowLeft':
        handlers.onArrowLeft?.()
        break
      case 'ArrowRight':
        handlers.onArrowRight?.()
        break
    }
  }

  const clearArrowTimer = (key: string) => {
    const timer = arrowRepeatTimers.get(key)
    if (timer) {
      window.clearInterval(timer)
      arrowRepeatTimers.delete(key)
    }
  }

  const clearAllTimers = () => {
    arrowRepeatTimers.forEach((timer, key) => {
      window.clearInterval(timer)
    })
    arrowRepeatTimers.clear()
  }

  return {
    isKeyPressed,
    handleKeyDown,
    handleKeyUp,
    clearAllTimers
  }
}
