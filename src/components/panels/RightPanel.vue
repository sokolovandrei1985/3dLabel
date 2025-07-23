<!-- components/RightPanel.vue -->
<template>
  <div class="panel-wrapper">
    <a-tabs
      tab-position="top"
      v-model:activeKey="activeTab"
      class="custom-tabs"
    >
      <a-tab-pane
        v-for="tab in rightTabs"
        :key="tab.key"
        :tab="tab.label"
      >
        <p>{{ tab.label }} содержимое</p>
        <slot :name="tab.key" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch} from 'vue'

// const slots = useSlots()

// function hasSlot(name: string) {
//   return !!slots[name]
// }
interface TabItem {
  key: string
  label: string
}

const rightTabs = ref<TabItem[]>([])
const activeTab  = ref('')

const emit = defineEmits<{
  (e: 'update:activeTab', key: string): void
}>()

onMounted(async () => {
  try {
    const res  = await fetch('/configs/tabs.json')
    const data = await res.json()
    rightTabs.value = data.right
    activeTab.value = data.right[0]?.key || ''
    emit('update:activeTab', activeTab.value)
  } catch (err) {
    console.error('Ошибка загрузки tabs.json:', err)
  }
})

// Отслеживаем изменение activeTab и эмитим событие
watch(activeTab, (newKey) => {
  emit('update:activeTab', newKey)
})
</script>


<style scoped>
/* Точно такие же стили, как в LeftPanel.vue */
.panel-wrapper {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  padding: 8px;
  padding-left: 0px;
  box-sizing: border-box;
}

.custom-tabs {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  height: 100%;
}
</style>