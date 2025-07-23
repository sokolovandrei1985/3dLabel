<script setup lang="ts">
import { onMounted } from 'vue'
import { provideFitToView } from '@/composables/useFitToView'

onMounted(() => {
  provideFitToView()
})
</script>

<template>
  <!-- Пустой компонент, без DOM -->
</template>
