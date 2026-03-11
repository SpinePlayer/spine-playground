<template>
  <div class="progress-container">
    <span class="time-label">{{ formatTime(playProgress?.current) }}</span>
    <el-slider
      :model-value="playProgress?.percentage"
      @input="handleProgressChange"
      :disabled="!showCvs"
      :show-tooltip="false"
      class="progress-slider"
    />
    <!-- <div class="progress-slider-wrapper">
      <div class="progress-slider-inner" :style="{ width: playProgress?.percentage + '%' }">
        <div class="progress-glow"></div>
      </div>
    </div> -->
    <span class="time-label">{{ formatTime(playProgress?.duration) }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showCvs?: boolean;
  playProgress?: {
    current: number;
    duration: number;
    percentage: number;
  };
}>();

const emit = defineEmits<{
  (e: 'progressChange', percentage: number): void;
  // (e: 'progressInput', percentage: number): void;
}>();

// 格式化时间显示（秒转为 mm:ss:ms 格式）
const formatTime = (seconds: number = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
};

// 处理进度条拖动
const handleProgressChange = (value: number) => {
  emit('progressChange', value);
};
</script>

<style scoped lang="scss">
.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 0;
  margin-top: -1rem;
  margin-bottom: -1rem;
}

.time-label {
  flex-shrink: 0;
  width: 50px;
  font-size: 12px;
  color: #666;
  min-width: 40px;
  text-align: center;
}

.progress-slider {
  margin: 0 6px;
}

.progress-slider-wrapper {
  flex: 1;
  height: 10px;
  background: linear-gradient(to right, #f0f0f0, #e8e8e8);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.progress-slider-inner {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 10px;
  position: relative;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.progress-glow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8),
              0 0 20px rgba(102, 126, 234, 0.6);
}
</style>
