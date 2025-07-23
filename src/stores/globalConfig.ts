// stores/globalConfig.ts
import { defineStore } from 'pinia'

export interface CanvasConfig {
  inputWidthMM: number
  inputHeightMM: number
}

export const useGlobalConfigStore = defineStore('globalConfig', {
  state: () => ({
    canvasConfig: null as CanvasConfig | null,
  }),
  actions: {
    async loadConfig() {
      try {
        const res = await fetch('/configs/config.json')
        if (!res.ok) throw new Error('Failed to load config')
        const data = await res.json()
        this.canvasConfig = {
          inputWidthMM: data.canvas.inputWidthMM,
          inputHeightMM: data.canvas.inputHeightMM,
        }
      } catch (err) {
        console.error('Error loading config:', err)
      }
    },
  },
})