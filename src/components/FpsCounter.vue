<template>
  <div class="performance-monitor">
    <div class="monitor-item">
      <span class="label">FPS:</span>
      <span class="value">{{ performanceInfo.fps }}</span>
    </div>
    <div v-if="performanceInfo.drawCalls" class="monitor-item">
      <span class="label">Draw Calls:</span>
      <span class="value">{{ performanceInfo.drawCalls }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { performanceInfo } from '@/hooks/usePerformanceInfo';

defineProps<{
  drawCalls?: number;
}>();
</script>

<style scoped>
.performance-monitor {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 10px;
  z-index: 99;
}

.monitor-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.monitor-item:last-child {
  margin-bottom: 0;
}

.label {
  margin-right: 10px;
  color: #aaa;
}

.value {
  font-weight: bold;
}
</style>
