<template>
  <a-card title="Текст" size="small" class="section-card">
    <a-form-item label="Текст">
      <a-textarea
        v-model:value="text"
        placeholder="Введите текст"
        :rows="3"
      />
    </a-form-item>

    <a-form-item label="Шрифт">
      <a-select v-model:value="fontFamily">
        <a-select-option value="Arial">Arial</a-select-option>
        <a-select-option value="Times New Roman">Times New Roman</a-select-option>
        <a-select-option value="Verdana">Verdana</a-select-option>
        <a-select-option value="Georgia">Georgia</a-select-option>
        <a-select-option value="Courier New">Courier New</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Размер шрифта">
      <a-input-number
        v-model:value="fontSize"
        :min="8"
        :max="72"
        addon-after="px"
      />
    </a-form-item>

    <a-form-item label="Цвет текста">
      <a-color-picker
        v-model:value="textColor"
        format="hex"
      />
    </a-form-item>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: String,
  fontFamily: String,
  fontSize: Number,
  textColor: String
});

const emit = defineEmits([
  'update:text',
  'update:fontFamily',
  'update:fontSize',
  'update:textColor'
]);

const text = computed({
  get: () => props.text,
  set: (value) => emit('update:text', value)
});

const fontFamily = computed({
  get: () => props.fontFamily,
  set: (value) => emit('update:fontFamily', value)
});

const fontSize = computed({
  get: () => props.fontSize,
  set: (value) => emit('update:fontSize', value)
});

const textColor = computed({
  get: () => props.textColor,
  set: (value) => emit('update:textColor', value)
});
</script>