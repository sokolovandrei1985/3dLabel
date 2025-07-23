import { createApp } from 'vue' //, ref, nextTick
import App from './App.vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
// import { useImageCanvas } from './services/useImageCanvas'
// import { useFontManager } from './services/useFontManager'
// import { useThreeScene } from './services/useThreeScene'

const app = createApp(App)
app.use(Antd)

const pinia = createPinia()
app.use(pinia)

// Критично: обязательно смонтировать приложение на DOM
app.mount('#app')

// --- Сervисы ---
// const imageCanvas = useImageCanvas()
// const fontManager = useFontManager()
// const hiddenBottom = ref(false)
// --- threeScene изначально null ---
// const threeScene = ref<ReturnType<typeof useThreeScene> | null>(null)

// --- Provide всех зависимостей ---
// app.provide('imageCanvas', imageCanvas)
// app.provide('fontManager', fontManager)
// app.provide('hiddenBottom', hiddenBottom)
// app.provide('threeScene', threeScene)

// --- Инициализируем threeScene после mount ---
// nextTick(() => {
//   const container = document.getElementById('center-top')
//   if (container) {
//     const scene = useThreeScene('center-top')
//     scene.init()
//     threeScene.value = scene
//   } else {
//     console.error('[main.ts] Контейнер centerTop не найден!')
//   }
// })