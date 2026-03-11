<template>
  <el-card shadow="never" class="info-card">
    <!-- spine信息 -->
    <!-- <el-descriptions :column="2" >
      <el-descriptions-item label="版本">123</el-descriptions-item>
      <el-descriptions-item label="spine宽高">18100000000</el-descriptions-item>
    </el-descriptions> -->
    <!-- 性能指标 -->
    <el-row>
      <el-col :span="4">
        <el-statistic title="spine版本" :value="null">
          <template #suffix>{{ version || '-' }}</template>
        </el-statistic>
      </el-col>
      <el-col :span="4">
        <el-statistic title="宽高比" :value="null">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              宽高比
              <el-tooltip
                effect="dark"
                :content="`spine尺寸：${boundsStr}`"
                placement="top"
              >
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #suffix>{{ aspectRatio }}</template>
        </el-statistic>
      </el-col>
      <el-col :span="4">
        <el-statistic title="骨骼数量" :value="performanceInfo.bonesCount" />
      </el-col>
      <el-col :span="4">
        <el-statistic title="顶点数量" :value="performanceInfo.vertices" />
      </el-col>
      <el-col :span="4">
        <el-statistic
          title="纹理内存"
          :value="performanceInfo.WebGLMemory"
          :precision="1"
        >
          <template #suffix>
            <div class="suffix-text">MB</div>
          </template>
        </el-statistic>
      </el-col>
      <el-col :span="4">
        <el-statistic
          title="JS内存"
          :value="performanceInfo.JSHeapMemory"
          :precision="1"
        >
          <template #suffix>
            <div class="suffix-text">MB</div>
          </template>
        </el-statistic>
      </el-col>
    </el-row>
    <!-- 性能状态 -->
    <div
      v-show="!isCalculating"
      class="performance-status"
      :class="{ normal: isAllPass, warning: !isAllPass }"
      @click="showPerformanceModal = true"
    >
      {{ isAllPass ? '正常' : '异常' }}
    </div>
    <div v-if="isCalculating" class="performance-status normal">计算中...</div>
  </el-card>
  <PerformanceModal v-if="showPerformanceModal" v-model="showPerformanceModal" />
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import type { IBound } from '@/types/common';
import { checkPerformance, performanceInfo } from '@/hooks/usePerformanceInfo';

const props = withDefaults(
  defineProps<{
    version: string;
    bounds: IBound | null;
  }>(),
  {
    version: '-',
    bounds: null,
  }
);

const isCalculating = ref(true);
const showPerformanceModal = ref(false);

const { isAllPass } = checkPerformance();

const boundsStr = computed(() => {
  if (!props.bounds || !props.bounds.width || !props.bounds.height) {
    return '-';
  }
  return `${Math.round(props.bounds.width)}x${Math.round(props.bounds.height)}`;
});

// 计算宽高比
const aspectRatio = computed(() => {
  if (
    !props.bounds ||
    !props.bounds.width ||
    !props.bounds.height ||
    Math.abs(props.bounds.height) === Infinity ||
    Math.abs(props.bounds.width) === Infinity
  ) {
    return '-';
  }
  const width = Math.round(props.bounds.width);
  const height = Math.round(props.bounds.height);
  // 计算最大公约数
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  const divisor = gcd(width, height);
  let ratioWidth = width / divisor;
  let ratioHeight = height / divisor;
  // 限制最大两位数，如果超过则进行近似处理
  if (ratioWidth > 99 || ratioHeight > 99) {
    // 找到合适的缩放因子，使两个数都不超过99
    const maxRatio = Math.max(ratioWidth, ratioHeight);
    const scale = Math.ceil(maxRatio / 99);
    ratioWidth = Math.round(ratioWidth / scale);
    ratioHeight = Math.round(ratioHeight / scale);
  }
  return `${ratioWidth}:${ratioHeight}`;
});

let timer: NodeJS.Timeout | null = null;
onMounted(() => {
  timer = setTimeout(() => {
    isCalculating.value = false;
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});
</script>

<style scoped lang="scss">
.el-col {
  text-align: center;
}

.suffix-text {
  font-size: 0.6rem;
}

.performance-status {
  position: absolute;
  right: -1px;
  top: -1px;
  color: #fff;
  padding: 1px 8px;
  border-radius: 0 12px 0 12px;
  // border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  // transform: translate(50%, -50%);

  &:hover {
    opacity: 0.9;
  }

  &.normal {
    background-color: #67c23a;
  }

  &.warning {
    // background-color: #e6a23c;
    background-color: #f56c6c;
  }
}
</style>
