<template>
  <a-form
    size="small"
    layout="horizontal"
    class="element-editor"
  >
    <!-- Общие данные -->
    <GeneralDataSection
      v-if="!!type"
      @update="updateObject"
    />

    <!-- Прямоугольник -->
    <RectangleSection
      v-if="type === 'rect'"
      @update="updateObject"
    />

    <!-- Текст -->
    <TextSection
      v-if="type === 'text'"
    />

    <!-- Тени -->
    <ShadowSection
      v-if="!!type"
    />

    <!-- Расположение -->
    <LayerSection
      v-if="false"
      @bring-to-front="$emit('bring-to-front')"
      @send-to-back="$emit('send-to-back')"
      @bring-forward="$emit('bring-forward')"
      @send-backward="$emit('send-backward')"
    />
  </a-form>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'

// Компоненты секций
import GeneralDataSection from './GeneralDataSection.vue'
import ShadowSection from './ShadowSection.vue'
import LayerSection from './LayerSection.vue'
import RectangleSection from './RectangleSection.vue'
import TextSection from './TextSection.vue'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const store = useFabricStore()
const { activeObject } = storeToRefs(store)
const { updateActiveObject } = store
const type = computed(() => activeObject.value?.type || null)

const updateObject = (obj: object) => {
  updateActiveObject(obj)
}

</script>

<style scoped>
.element-editor {
  font-size: 12px;
  height: 50vh;
  min-width: 300px;
  overflow: auto;
  background: #f5f5f5;
}

.element-editor:deep(.ant-form-item) {
  margin-bottom: 8px;
}

.element-editor:deep(.ant-card) {
  border-radius: 0;
  border-bottom: 0;
}

.element-editor:deep(.ant-card .ant-input-number-group-addon) {
  padding: 0px 8px;
}

/*.element-editor:deep(.ant-card .ant-card-body) {
  padding: 10px;
}*/

.element-editor:deep(.ant-card:first-child) {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px
};

.element-editor:deep(.ant-card:last-child) {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>