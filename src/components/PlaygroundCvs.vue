<template>
  <div class="animation-container">
    <div :class="['canvas-wrapper', multi ? 'coordinate' : '']">
      <slot></slot>
      <div class="placeholder" v-if="!showCvs">
        <div class="placeholder-content">
          <div class="placeholder-icon">🎬</div>
          <p>请选择动画文件开始播放</p>
        </div>
      </div>
      <FpsCounter />
      <div v-if="currentSlot.name" class="slot-point" :style="{
        transform: `translate(${currentSlot.x}px, ${currentSlot.y}px)`,
        backgroundColor: currentSlot.color,
      }" />
    </div>
    <div v-if="multi" class="coordinate-system">
      <div class="arrow-x"></div>
      <div class="arrow-y"></div>
      <!-- 坐标值标注 -->
      <div class="x-label" ref="xLabelRef">x: 0</div>
      <div class="y-label" ref="yLabelRef">y: 0</div>
    </div>
  </div>
  <ProgressBar :showCvs="showCvs" :playProgress="playProgress" @progressChange="handleProgressChange" />
</template>

<script setup lang="ts">
import { shallowRef, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { currentSlot } from '@/hooks/useSpineSlots';

const props = defineProps<{
  multi?: boolean;
  showCvs: boolean;
  drawCalls?: number;
  playProgress?: {
    current: number;
    duration: number;
    percentage: number;
  };
}>();

const xLabelRef = shallowRef<HTMLElement>();
const yLabelRef = shallowRef<HTMLElement>();

// 更新坐标标注
const updateCoordinateLabels = () => {
  nextTick(() => {
    const container = document.querySelector('.animation-container');
    if (container && xLabelRef.value && yLabelRef.value) {
      const rect = container.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      xLabelRef.value.textContent = `X: ${width}`;
      yLabelRef.value.textContent = `Y: ${height}`;
    }
  });
};

// 监听窗口大小变化
const handleResize = () => {
  updateCoordinateLabels();
};

onMounted(() => {
  if (props.multi) {
    updateCoordinateLabels();
    window.addEventListener('resize', handleResize);
  }
});

onBeforeUnmount(() => {
  if (props.multi) {
    window.removeEventListener('resize', handleResize);
  }
});

const emit = defineEmits<{
  (e: 'progressChange', percentage: number): void;
}>();
const handleProgressChange = (percentage: number) => {
  emit('progressChange', percentage);
};
</script>

<style lang="scss" scoped>
@use 'sass:math';
@use 'sass:color';
@use '../styles/var.scss' as *;

$alpha: 0.081;
$size: 50px;

.animation-container {
  position: relative;
  flex-grow: 1;
  overflow: hidden;
  max-height: 600px;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  border-radius: 12px;
  overflow: hidden;
  // background-image:
  //   linear-gradient(rgba(44, 44, 44, 0.141) 1px, transparent 1px),
  //   linear-gradient(90deg, rgba(44, 44, 44, 0.141) 1px, transparent 1px);
  // background-size: 20px 20px;
  background-image: linear-gradient(45deg,
      rgba(44, 44, 44, $alpha) 25%,
      transparent 25%),
    linear-gradient(-45deg, rgba(44, 44, 44, $alpha) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(44, 44, 44, $alpha) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(44, 44, 44, $alpha) 75%);
  background-size: $size $size;
  background-position: 0 0, 0 math.div($size, 2),
    math.div($size, 2) math.div($size, -2), math.div($size, -2) 0;
  // border: 1px solid $border-color;
  border: 1px solid rgba($primary-color, 0.6);

  &.coordinate {
    width: calc(100% - 20px);
    height: calc(100% - 30px);
    margin: 15px 10px;
  }
}

.slot-point {
  position: absolute;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  background: red;
  border: 1px solid #000;
  // border-radius: 50%;
  z-index: 1;
  pointer-events: none;
  transform-origin: center center;
}

.placeholder {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-light;
  border-radius: 12px;

  &-content {
    text-align: center;
    color: $text-muted;

    p {
      margin: 0;
      font-size: 1.1rem;
    }
  }

  &-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
}

.coordinate-system {
  position: absolute;
  top: 0;
  left: 10px;
  bottom: 15px;
  right: 0;
  pointer-events: none;
  z-index: 1;
  border-left: 1px solid #667eea;
  border-bottom: 1px solid #667eea;

  &::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: -3px;
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    box-shadow: 0 0 8px 0 rgba(102, 126, 234, 0.5);
  }

  .arrow-x {
    position: absolute;
    top: -1px;
    left: -7.5px;
    width: 0px;
    height: 0px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 14px solid #667eea;
  }

  .arrow-y {
    position: absolute;
    right: -1px;
    bottom: -7.5px;
    width: 0px;
    height: 0px;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
    border-left: 14px solid #667eea;
  }

  .x-label {
    position: absolute;
    bottom: -20px;
    right: 30px;
    color: #667eea;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }

  .y-label {
    position: absolute;
    top: 20px;
    left: 10px;
    color: #667eea;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
}
</style>
