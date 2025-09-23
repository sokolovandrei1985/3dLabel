<template>
  <a-form
    layout="vertical"
    :model="element"
    class="element-editor"
  >
    <!-- Общие данные -->
    <GeneralDataSection
      v-model:coordinates="element.coordinates"
      v-model:size="element.size"
      v-model:opacity="element.opacity"
    />

    <!-- Тени -->
    <ShadowSection
      v-model:shadowSize="element.shadow.size"
      v-model:shadowBlur="element.shadow.blur"
      v-model:shadowOffsetX="element.shadow.offsetX"
      v-model:shadowOffsetY="element.shadow.offsetY"
    />

    <!-- Расположение -->
    <LayerSection
      @bring-to-front="$emit('bring-to-front')"
      @send-to-back="$emit('send-to-back')"
      @bring-forward="$emit('bring-forward')"
      @send-backward="$emit('send-backward')"
    />

    <!-- Прямоугольник -->
    <RectangleSection
      v-if="element.type === 'rectangle'"
      v-model:fillColor="element.fillColor"
      v-model:borderColor="element.borderColor"
      v-model:borderWidth="element.borderWidth"
      v-model:borderStyle="element.borderStyle"
      v-model:borderRadius="element.borderRadius"
    />

    <!-- Текст -->
    <TextSection
      v-if="element.type === 'text'"
      v-model:text="element.text"
      v-model:fontFamily="element.fontFamily"
      v-model:fontSize="element.fontSize"
      v-model:textColor="element.textColor"
    />
  </a-form>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import {
  Form as AForm,
} from 'ant-design-vue';

// Компоненты секций
import GeneralDataSection from './GeneralDataSection.vue';
import ShadowSection from './ShadowSection.vue';
import LayerSection from './LayerSection.vue';
import RectangleSection from './RectangleSection.vue';
import TextSection from './TextSection.vue';

const props = defineProps({
  element: {
    type: Object,
    required: true,
    default: () => ({
      coordinates: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      opacity: 1,
      shadow: {
        size: 0,
        blur: 0,
        offsetX: 0,
        offsetY: 0
      },
      type: 'rectangle', // или 'text'
      // Для прямоугольника
      fillColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 0,
      // Для текста
      text: '',
      fontFamily: 'Arial',
      fontSize: 16,
      textColor: '#000000'
    })
  }
});

const emit = defineEmits([
  'update:element',
  'bring-to-front',
  'send-to-back',
  'bring-forward',
  'send-backward'
]);
</script>

<style scoped>
.element-editor {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}
</style>