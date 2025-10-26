import { defineStore } from 'pinia'

export const useImageFiles = defineStore('imageFiles', () => {
  const images = new Map<string, string>()

  const loadImageFiles = async (files: FileList | null): Promise<string | null> => {
    try {
      if (!files || files.length === 0) return null

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i)
        if (!file) continue

        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        //const [ fileName, fileExtension ] = file.name.split('.')
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(reader.error)
          if (fileExtension === 'svg') {
            reader.readAsText(file)
          } else {
            reader.readAsDataURL(file)
          }
        })

        if (fileContent) {
          images.set(file.name, fileContent)
          return file.name
        }
      }
      return null
    } catch (error) {
      console.error('Ошибка при загрузке окружения:', error)
      return null
    }
  }

  const setImage = (name: string, content: string): void => {
    images.set(name, content)
  }

  const getImage = (name: string): string | undefined => {
    return images.get(name)
  }

  const getImageList = (): string[] => {
    return Array.from(images.keys())
  }

  const removeImage = (name: string): void => {
    images.delete(name)
  }

  // Экспорт
  return {
    loadImageFiles,
    setImage,
    getImage,
    getImageList,
    removeImage,
  }
})