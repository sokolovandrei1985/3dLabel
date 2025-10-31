<template>
  <div v-if="show" class="loading" ref="containerRef" :style="dimensions">
    <div class="loading-content" :style="contentStyle">
      <a-spin v-if="props.showLoadingAnimation" />
      <a-progress v-if="showProgressBar" :percent="percent" />
      <div v-if="props.text" class="loading-content-text">
        {{ props.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { LoadingProps } from '@/models/loading'

const props = withDefaults(defineProps<LoadingProps>(), {
  show: true,
  totalSteps: undefined,
  currentStep: undefined,
  text: undefined,
  showProgressBar: undefined,
  showLoadingAnimation: true,
  width: '10rem'
})

const containerRef = ref<HTMLElement | null>(null)
const dimensions = ref({ left: 0, top: 0, bottom: 0, right: 0 })

const percent = computed(() => props.totalSteps !== undefined && props.currentStep !== undefined ? Math.floor(props.currentStep * 100 / props.totalSteps) : 100)
const contentStyle = computed(() => ({ minWidth: props.width }))

const updateDimensions = () => {
  if (!containerRef.value || !props.show) return

  const parent = containerRef.value.parentElement

  if (parent) {
    const rect = parent.getBoundingClientRect()
    dimensions.value = {
      left: rect.left,
      top: rect.top,
      bottom: rect.bottom,
      right: rect.right
    }
  } else {
    dimensions.value = {
      left: 0,
      top: 0,
      bottom: window.innerHeight,
      right: window.innerWidth
    }
  }
}

watch(() => props.show, (show) => { if (show) updateDimensions() })

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
})

</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.loading {
  position: fixed;
  background-color: rgba(128, 128, 128, 0.35);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 1rem;
}
</style>
