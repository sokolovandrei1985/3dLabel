<template>
  <div class="panel-wrapper" :class="{ collapsed }">
    <!-- Кнопка в правом верхнем углу -->
    <a-button
      class="collapse-button"
      type="text"
      shape="circle"
      :title="collapseButton.title"
      size="large"
      :icon="h(collapseButton.icon)"
      @click="toggleCollapsed"
    />

    <div v-if="collapsed" class="panel-actions">
      <template v-for="actionButton in actionButtons" :key="actionButton.key">
        <a-button
          type="text"
          shape="circle"
          :title="actionButton.title"
          :icon="h(actionButton.icon)"
          @click="actionButton.action"
        />
        <a-divider v-if="actionButton.divider" style="margin: 0px;" />
      </template>
    </div>

    <!-- Контент табов скрывается, когда свернуто -->
    <a-tabs
      v-if="!collapsed"
      tab-position="top"
      v-model:activeKey="activeTab"
      class="custom-tabs"
      @change="onTabChange"
    >
      <a-tab-pane
        v-for="tab in rightTabs"
        :key="tab.key"
        :tab="tab.label"
      >
        <component
          :is="getComponent(tab.key)"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, VueElement, h, reactive } from 'vue'
import Tab3d from './Tab3d.vue'
import TabSettings from './TabSettings.vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownloadOutlined,
  PictureOutlined,
  AreaChartOutlined,
  BorderBottomOutlined,
  BorderTopOutlined,
  BorderLeftOutlined,
  BorderRightOutlined,
  BorderInnerOutlined,
  RedoOutlined,
} from '@ant-design/icons-vue'
import { useRightPanelStore } from '@/stores/rightPanelStore'
import type { TabItem } from '@/types/tabs'
import { storeToRefs } from 'pinia'

const rightTabs = ref<TabItem[]>([])
const activeTab  = ref('')

const store = useRightPanelStore()
const { collapsed } = storeToRefs(store)

const {
  setActiveCameraType,
  setRotationValue,
  resetCameraControls,
  setActiveModelView,
  fitModelToView,
  loadModel,
  toggleCollapsed,
} = store

const emit = defineEmits<{
  (e: 'update:activeTab', key: string): void
}>()

type TabComponent = '3d' | 'settings'

const collapseButton = computed(() => ({
  title: collapsed.value ? 'Развернуть' : 'Свернуть',
  icon: collapsed.value ? MenuFoldOutlined : MenuUnfoldOutlined
}))

const componentMap: Record<TabComponent, any> = {
  '3d': Tab3d,
  'settings': TabSettings
}

const getComponent = (key: string): VueElement => {
  return componentMap[key as TabComponent]
}

const onResetView = (): void => {
  //resetCameraControls()
  fitModelToView()
}

const actionButtons = reactive([
  //{ key: 'collapse', title: 'Развернуть', icon: MenuFoldOutlined, action: toggleCollapsed, divider: true },
  { key: 'loadModel', title: 'Загрузить модель', icon: DownloadOutlined, action: loadModel, divider: true },
  { key: 'orto', title: 'Ортографическая', icon: AreaChartOutlined, action: () => { setActiveCameraType('ortho') } },
  { key: 'perspective', title: 'Перспективная', icon: PictureOutlined, action: () => { setActiveCameraType('perspective') }, divider: true },
  { key: 'front', title: 'Спереди', icon: BorderBottomOutlined, action: () => { setActiveModelView('front') } },
  { key: 'back', title: 'Сзади', icon: BorderTopOutlined, action: () => { setActiveModelView('back') } },
  { key: 'right', title: 'Справа', icon: BorderRightOutlined, action: () => { setActiveModelView('right') } },
  { key: 'left', title: 'Слева', icon: BorderLeftOutlined, action: () => { setActiveModelView('left') } },
  { key: 'top', title: 'Сверху', icon: BorderInnerOutlined, action: () => { setActiveModelView('top') }, divider: true },
  { key: 'reset', title: 'Вернуть в исходное состояние', icon: RedoOutlined, action: onResetView },
])

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
const onTabChange = (activeTabKey: string): void => {
  emit('update:activeTab', activeTabKey)
}
</script>

<style scoped>
.panel-wrapper {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Кнопка-иконка */
.collapse-button {
  position: fixed;
  top: 0px;
  right: 0px;
  z-index: 10;
}

.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Блок табов */
.custom-tabs {
  min-width: min(394px, 30vw);
  max-width: 30vw;
  background-color: #fff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  height: 100%;
}
</style>
