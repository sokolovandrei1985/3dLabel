<template>
  <a-card size="small" class="section-card">
    <a-form-item label="Текст">
      <a-textarea
        v-model:value="text"
        placeholder="Введите текст"
        :rows="3"
      />
    </a-form-item>

    <div class="prop-grid">
      <span>Шрифт</span>
      <a-select v-model:value="fontFamily">
        <a-select-option v-for="f in fontOptions" :key="f" :value="f">{{ f }}</a-select-option>
      </a-select>

      <span>Размер шрифта</span>
      <a-input-number
        v-model:value="fontSize"
        :min="8"
        :max="72"
        addon-after="px"
      />

      <span>Цвет текста</span>
      <ColorPicker v-model="fill" :formats="['hex']" :disableAlpha="true"/>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'
import ColorPicker from './ColorPicker.vue'
import { loadFonts, families } from '@/composables/useFontLoader'

const emit = defineEmits([
  'update'
])

const update = (field: string, value: number | string | undefined | null): void => {
  emit('update', { [field]: value })
}

const store = useFabricStore()
const { activeObject } = storeToRefs(store)

const fontOptions = ref<string[]>([])
loadFonts().then(() => {
  fontOptions.value = families
})

const text = computed({
  get: () => activeObject.value?.text,
  set: (value) => update('text', value)
});

const fontFamily = computed({
  get: () => activeObject.value?.fontFamily,
  set: (value) => update('fontFamily', value)
});

const fontSize = computed({
  get: () => activeObject.value?.fontSize,
  set: (value) => update('fontSize', value)
});

const fill = computed({
  get: () => activeObject.value?.fill,
  set: (value) => update('fill', value)
});
</script>

<style scoped>
.prop-grid {
  display: grid;
  align-items: center;
  grid-template-columns: 2fr 3fr;
  column-gap: 8px;
  row-gap: 8px;
}
</style>