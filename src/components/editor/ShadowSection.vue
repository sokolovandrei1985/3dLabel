<template>
  <a-card title="Тени" size="small" class="section-card">
    <a-form-item label="Размер тени">
      <a-input-number
        v-model:value="shadowSize"
        :min="0"
        :max="50"
      />
    </a-form-item>

    <a-form-item label="Резкость тени">
      <a-input-number
        v-model:value="shadowBlur"
        :min="0"
        :max="50"
      />
    </a-form-item>

    <a-form-item label="Смещение по горизонтали">
      <a-input-number
        v-model:value="shadowOffsetX"
        :min="-50"
        :max="50"
      />
    </a-form-item>

    <a-form-item label="Смещение по вертикали">
      <a-input-number
        v-model:value="shadowOffsetY"
        :min="-50"
        :max="50"
      />
    </a-form-item>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';
import {
  Card as ACard,
  FormItem as AFormItem,
  InputNumber as AInputNumber
} from 'ant-design-vue';

const props = defineProps({
  shadowSize: Number,
  shadowBlur: Number,
  shadowOffsetX: Number,
  shadowOffsetY: Number
});

const emit = defineEmits([
  'update:shadowSize',
  'update:shadowBlur',
  'update:shadowOffsetX',
  'update:shadowOffsetY'
]);

const shadowSize = computed({
  get: () => props.shadowSize,
  set: (value) => emit('update:shadowSize', value)
});

const shadowBlur = computed({
  get: () => props.shadowBlur,
  set: (value) => emit('update:shadowBlur', value)
});

const shadowOffsetX = computed({
  get: () => props.shadowOffsetX,
  set: (value) => emit('update:shadowOffsetX', value)
});

const shadowOffsetY = computed({
  get: () => props.shadowOffsetY,
  set: (value) => emit('update:shadowOffsetY', value)
});
</script>