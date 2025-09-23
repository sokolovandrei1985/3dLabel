<template>
  <a-card title="Общие данные" size="small" class="section-card">
    <a-form-item label="Координаты">
      <div class="coordinate-inputs">
        <a-input-number
          v-model:value="coordinates.x"
          placeholder="X"
          :min="0"
          class="coord-input"
        />
        <a-input-number
          v-model:value="coordinates.y"
          placeholder="Y"
          :min="0"
          class="coord-input"
        />
      </div>
    </a-form-item>

    <a-form-item label="Размер">
      <div class="size-inputs">
        <a-input-number
          v-model:value="size.width"
          placeholder="Ширина"
          :min="1"
          class="size-input"
        />
        <a-input-number
          v-model:value="size.height"
          placeholder="Высота"
          :min="1"
          class="size-input"
        />
      </div>
    </a-form-item>

    <a-form-item label="Прозрачность">
      <a-slider
        v-model:value="opacity"
        :min="0"
        :max="1"
        :step="0.01"
      />
      <a-input-number
        v-model:value="opacity"
        :min="0"
        :max="1"
        :step="0.01"
        class="opacity-input"
      />
    </a-form-item>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';
import {
  Card as ACard,
  FormItem as AFormItem,
  InputNumber as AInputNumber,
  Slider as ASlider
} from 'ant-design-vue';

const props = defineProps({
  coordinates: Object,
  size: Object,
  opacity: Number
});

const emit = defineEmits([
  'update:coordinates',
  'update:size',
  'update:opacity'
]);

const coordinates = computed({
  get: () => props.coordinates,
  set: (value) => emit('update:coordinates', value)
});

const size = computed({
  get: () => props.size,
  set: (value) => emit('update:size', value)
});

const opacity = computed({
  get: () => props.opacity,
  set: (value) => emit('update:opacity', value)
});
</script>

<style scoped>
.coordinate-inputs,
.size-inputs {
  display: flex;
  gap: 8px;
}

.coord-input,
.size-input {
  flex: 1;
}

.opacity-input {
  margin-top: 8px;
  width: 100%;
}

.section-card {
  margin-bottom: 16px;
}
</style>