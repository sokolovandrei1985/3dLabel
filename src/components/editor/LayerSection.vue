<template>
  <a-card title="Расположение" size="small" class="section-card">
    <div class="layer-buttons">
      <a-button @click="$emit('bring-to-front')" class="layer-btn">
        На передний план
      </a-button>
      <a-button @click="$emit('send-to-back')" class="layer-btn">
        На задний план
      </a-button>
      <a-button @click="$emit('bring-forward')" class="layer-btn">
        На уровень выше
      </a-button>
      <a-button @click="$emit('send-backward')" class="layer-btn">
        На уровень ниже
      </a-button>
    </div>
  </a-card>
</template>

<script setup>
import { Card as ACard, Button as AButton } from 'ant-design-vue';

defineEmits([
  'bring-to-front',
  'send-to-back',
  'bring-forward',
  'send-backward'
]);
</script>

<style scoped>
.layer-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-btn {
  width: 100%;
}
</style>