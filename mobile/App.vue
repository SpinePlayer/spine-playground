<template>
  <Performance v-show="performanceVisible" />
  <div ref="el" class="container"></div>
  <div class="button-container">
    <div class="button-container-item">切换动画：</div>
    <div class="button-container-item select">
      <el-select
        v-model="currentAnimation"
        placeholder="请选择动画"
        @change="changeAnimation"
      >
        <el-option
          v-for="item in animations"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </div>
    <div class="button-container-item">
      <el-button @click="togglePerformance">
        {{ performanceVisible ? '隐藏' : '显示' }}性能面板
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import qs from 'qs';
import { ref, onMounted } from 'vue';
import SpinePlayer from 'spine-web-player';
import usePerformanceInfo from '../src/hooks/usePerformanceInfo';
import Performance from './components/Performance.vue';
import type { TimeKeeper } from '../src/types/common';

const { search } = window.location;

const { version, atlas, skel } = qs.parse(search.slice(1));

const { performanceInfo, initGLPerformance, toggleStats } =
  usePerformanceInfo(true);

let spinePlayer: SpinePlayer;
const el = ref<HTMLDivElement>();
const animations = ref<string[]>([]);
const currentAnimation = ref<string>('');
const performanceVisible = ref(true);

async function initSpinePlayer() {
  if (!el.value) return;
  if (!atlas || !skel) {
    alert('请输入正确的atlas和skel');
    return;
  }
  try {
    spinePlayer = new SpinePlayer(el.value, {
      onUpdate: (_: TimeKeeper, drawCall?: number) => {
        performanceInfo.drawCalls = drawCall || 0;
      },
    });
    // 初始化性能信息
    initGLPerformance(spinePlayer.gl!);
    // 加载动画
    await spinePlayer.loadSpine({
      loop: true,
      assets: {
        atlas: decodeURIComponent(atlas as string),
        skel: decodeURIComponent(skel as string),
      },
    });
    // 获取动画列表
    animations.value = spinePlayer.getAnimations();
    // 设置当前动画
    currentAnimation.value = spinePlayer.animationName || '';
  } catch (error) {
    alert('请输入正确的atlas和skel' + error);
    return;
  }
}

const changeAnimation = () => {
  spinePlayer.playAnimation(currentAnimation.value, true);
};

const togglePerformance = () => {
  toggleStats();
  performanceVisible.value = !performanceVisible.value;
};

onMounted(() => {
  initSpinePlayer();
});
</script>

<style scoped lang="scss">
@use 'sass:math';

$alpha: 0.081;
$size: 50px;

.container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
  background-image: linear-gradient(
      45deg,
      rgba(44, 44, 44, $alpha) 25%,
      transparent 25%
    ),
    linear-gradient(-45deg, rgba(44, 44, 44, $alpha) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(44, 44, 44, $alpha) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(44, 44, 44, $alpha) 75%);
  background-size: $size $size;
  background-position: 0 0, 0 math.div($size, 2),
    math.div($size, 2) math.div($size, -2), math.div($size, -2) 0;
}
.button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  .button-container-item {
    min-width: 60px;
    margin-right: 10px;
    &.select {
      width: 110px;
      margin-right: 20px;
    }
  }
}
</style>
