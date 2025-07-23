// src/services/useFontManager.ts
import FontFaceObserver from 'fontfaceobserver'

export class FontManager {
  async loadFont(name: string, timeout = 5000): Promise<void> {
    const observer = new FontFaceObserver(name)
    try {
      await observer.load(null, timeout)
      console.log(`Font "${name}" loaded.`)
    } catch (e) {
      console.warn(`Font "${name}" failed to load.`)
    }
  }
}

let instance: FontManager | null = null

export function useFontManager(): FontManager {
  if (!instance) {
    instance = new FontManager()
  }
  return instance
}
