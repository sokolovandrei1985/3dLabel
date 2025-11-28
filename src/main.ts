import { createApp } from 'vue' //, ref, nextTick
import App from './App.vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import 'vue-color/style.css'

const app = createApp(App)
app.use(Antd)

const pinia = createPinia()
app.use(pinia)

app.directive('blur-after-click', {
  mounted(el) {
    const originalClickHandler = el.onclick

    el.onclick = async (event: any) => {
      // Вызываем оригинальный обработчик, если он существует
      if (originalClickHandler) {
        await originalClickHandler.call(el, event)
      }

      // Сбрасываем фокус на контейнер приложения
      const container = document.querySelector('#app3dl') as HTMLElement
      if (container) container.focus()
    }
  }
})

// Критично: обязательно смонтировать приложение на DOM
app.mount('#app3dl')
