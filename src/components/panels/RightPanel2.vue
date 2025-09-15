<template>
  <div class="panel-wrapper" :class="{ collapsed }">
    <!-- Кнопка в правом верхнем углу -->
    <div class="panel-actions">
      <a-button
        type="text"
        shape="circle"
        size="small"
        :title="collapsed ? 'Развернуть' : 'Свернуть'"
        @click="toggleCollapse"
      >
        <component :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
      </a-button>
    </div>

    <!-- Контент табов скрывается, когда свернуто -->
    <a-tabs
      v-if="!collapsed"
      tab-position="top"
      v-model:activeKey="activeTab"
      class="custom-tabs"
    >
      <a-tab-pane
        v-for="tab in rightTabs"
        :key="tab.key"
        :tab="tab.label"
      >
        <slot :name="tab.key" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'

interface TabItem { key: string; label: string }
const rightTabs = ref<TabItem[]>([])
const activeTab  = ref('')

const props = defineProps<{
  collapsed?: boolean
}>()
const collapsed = ref(!!props.collapsed)

const emit = defineEmits<{
  (e: 'update:activeTab', key: string): void
  (e: 'update:collapsed', val: boolean): void
}>()

watch(() => props.collapsed, (v) => { collapsed.value = !!v })

function toggleCollapse() {
  collapsed.value = !collapsed.value
  emit('update:collapsed', collapsed.value)
}

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
watch(activeTab, (newKey) => { emit('update:activeTab', newKey) })
</script>

<style scoped>
.panel-wrapper {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  padding: 8px 8px 8px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Кнопка-иконка */
.panel-actions {
  position: absolute;
  top: 12px;   /* было 6px */
  right: 12px; /* было 6px */
  z-index: 2;
}
.panel-actions :deep(.ant-btn .anticon) {
  font-size: 22px; /* увеличенная иконка */
}
.panel-actions :deep(.ant-btn) {
  width: 36px;
  height: 36px;
}
/* Блок табов */
.custom-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  height: 100%;
}

/* В свернутом состоянии просто оставляем фон и кнопку */
.panel-wrapper.collapsed {
  padding-right: 6px;
}
.panel-wrapper.collapsed .custom-tabs {
  display: none;
}
</style>
