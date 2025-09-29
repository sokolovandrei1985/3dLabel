<template>
  <a-card size="small" class="section-card">
    <a-form-item label="Размер тени">
      <a-input-number
        v-model:value="shadowSize"
        :min="0"
        :max="50"
      />
    </a-form-item>

    <span>Смещение по горизонтали</span>
    <div class="opacity-inputs">
      <a-slider
        v-model:value="shadowOffsetX"
        :min="-50"
        :max="50"
        :step="1"
        class="opacity-input opacity-slider"
      />
      <a-input-number
        v-model:value="shadowOffsetX"
        addon-after="px"
        :controls="false"
        :min="-50"
        :max="50"
        :step="1"
        class="opacity-input"
      />
    </div>

    <span>Смещение по вертикали</span>
    <div class="opacity-inputs">
      <a-slider
        v-model:value="shadowOffsetY"
        :min="-50"
        :max="50"
        :step="1"
        class="opacity-input opacity-slider"
      />
      <a-input-number
        v-model:value="shadowOffsetY"
        addon-after="px"
        :controls="false"
        :min="-50"
        :max="50"
        :step="1"
        class="opacity-input"
      />
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';

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