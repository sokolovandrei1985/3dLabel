<template>
  <a-card title="Прямоугольник" size="small" class="section-card">
    <a-form-item label="Цвет заливки">
      <a-color-picker
        v-model:value="fillColor"
        format="hex"
      />
    </a-form-item>

    <a-form-item label="Цвет границы">
      <a-color-picker
        v-model:value="borderColor"
        format="hex"
      />
    </a-form-item>

    <a-form-item label="Толщина границы">
      <a-input-number
        v-model:value="borderWidth"
        :min="0"
        :max="20"
        addon-after="px"
      />
    </a-form-item>

    <a-form-item label="Тип линии">
      <a-select v-model:value="borderStyle">
        <a-select-option value="solid">Solid</a-select-option>
        <a-select-option value="dashed">Dashed</a-select-option>
        <a-select-option value="dotted">Dotted</a-select-option>
        <a-select-option value="double">Double</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Скругление углов">
      <a-input-number
        v-model:value="borderRadius"
        :min="0"
        :max="100"
        addon-after="px"
      />
    </a-form-item>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  fillColor: String,
  borderColor: String,
  borderWidth: Number,
  borderStyle: String,
  borderRadius: Number
});

const emit = defineEmits([
  'update:fillColor',
  'update:borderColor',
  'update:borderWidth',
  'update:borderStyle',
  'update:borderRadius'
]);

const fillColor = computed({
  get: () => props.fillColor,
  set: (value) => emit('update:fillColor', value)
});

const borderColor = computed({
  get: () => props.borderColor,
  set: (value) => emit('update:borderColor', value)
});

const borderWidth = computed({
  get: () => props.borderWidth,
  set: (value) => emit('update:borderWidth', value)
});

const borderStyle = computed({
  get: () => props.borderStyle,
  set: (value) => emit('update:borderStyle', value)
});

const borderRadius = computed({
  get: () => props.borderRadius,
  set: (value) => emit('update:borderRadius', value)
});
</script>