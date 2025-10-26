<template>
  <div class="panel-wrapper">
    <editor/>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Editor from '@/components/editor'

onMounted(async () => {

})
</script>

<style scoped>
.panel-wrapper {
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background-color: #f5f5f5;
  padding-right: 0px;
  box-sizing: border-box;
}
</style>