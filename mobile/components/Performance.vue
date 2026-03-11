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
    <div class="monitor-item">
      <span class="label">顶点数量:</span>
      <span class="value">{{ performanceInfo.vertices }}</span>
    </div>
    <div class="monitor-item">
      <span class="label">纹理内存:</span>
      <span class="value">{{ performanceInfo.WebGLMemory }}MB</span>
    </div>
    <div class="monitor-item">
      <span class="label">JS内存:</span>
      <span class="value">{{ performanceInfo.JSHeapMemory }}MB</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { performanceInfo } from '../../src/hooks/usePerformanceInfo';
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
  text-align: justify;
}

.value {
  font-weight: bold;
}
</style>
