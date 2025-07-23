<template>
  <canvas ref="canvasEl" style="border:1px solid #ccc; width:100%; height:400px;"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Canvas, FabricImage } from 'fabric'

const canvasEl = ref<HTMLCanvasElement | null>(null)
let canvas: Canvas | null = null

onMounted(async () => {
  if (!canvasEl.value) return

  canvas = new Canvas(canvasEl.value, {
    selection: true,
  })

  try {
    const img = await FabricImage.fromURL('/path/to/your/image.png')
    img.set({
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasControls: true,
      hasBorders: true,
    })
    canvas.add(img)
    canvas.setActiveObject(img)
    canvas.requestRenderAll()
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error)
  }
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}
</style>