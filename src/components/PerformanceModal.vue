<template>
  <el-dialog 
    v-model="showPreviewModal" 
    center 
    title="性能监控" 
    width="1000"
    @opened="onDialogOpened"
    :close-on-click-modal="false"
  >
    <!-- 视图切换器 -->
    <div class="view-switcher">
      <el-segmented v-model="viewMode" :options="viewOptions" size="default" />
    </div>

    <!-- 表格视图 -->
    <div v-show="viewMode === 'table'" class="table-view">
      <el-table
        :data="tableData"
        :row-class-name="tableRowClassName"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="指标名称" width="140">
          <template #default="scope">
            <div class="table-metric-name">
              <span class="label-name">{{ scope.row.name }}</span>
              <span class="label-desc">{{ scope.row.desc }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="当前值" width="120">
          <template #default="scope">
            <span class="current-value">{{ scope.row.value }}</span>
            <span class="unit">{{ scope.row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="阈值" width="140">
          <template #default="scope">
            <span class="threshold-text">
              {{ scope.row.type === 'min' ? '≥' : '≤' }}
              {{ scope.row.threshold }}
              <span class="unit">{{ scope.row.unit }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="trend" label="趋势" width="100">
          <template #default="scope">
            <span v-if="isStaticMetric(scope.row.key)" class="static-tag">固定值</span>
            <span v-else class="trend-indicator" :class="getTrendClass(scope.row.key)">
              {{ getTrendText(scope.row.key) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag
              v-if="tableRowClassName(scope) === 'success-row'"
              type="success"
              size="small"
            >
              <el-icon><CircleCheck /></el-icon> 正常
            </el-tag>
            <el-tag v-else type="danger" size="small">
              <el-icon><CircleClose /></el-icon> 超标
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优化建议">
          <template #default="scope">
            <div v-if="tableRowClassName(scope) === 'warning-row'" class="advice-content">
              <el-icon class="advice-icon"><Warning /></el-icon>
              <span class="advice-text">{{ scope.row.advice }}</span>
            </div>
            <span v-else class="normal-status">
              <el-icon class="ok-icon"><Select /></el-icon>
              正常运行
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              v-if="!isStaticMetric(scope.row.key)"
              type="primary"
              link
              size="small"
              @click="viewChart(scope.row.key)"
            >
              <el-icon><TrendCharts /></el-icon>
              查看趋势
            </el-button>
            <span v-else class="no-trend">-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 提示信息 -->
      <div class="table-footer">
        <el-icon><InfoFilled /></el-icon>
        <span>实时更新频率：500ms · 点击"查看趋势"可切换到图表视图</span>
      </div>
    </div>

    <!-- 图表视图 -->
    <div v-show="viewMode === 'chart'" class="chart-view">
      <!-- 指标选择卡片 -->
      <div class="metrics-cards">
        <div 
          v-for="metric in dynamicMetricOptions" 
          :key="metric.key"
          class="metric-card"
          :class="{ 
            'active': selectedMetric === metric.key,
            'warning': isMetricWarning(metric.key)
          }"
          @click="selectedMetric = metric.key"
        >
          <div class="metric-icon">
            <el-icon v-if="isMetricWarning(metric.key)" color="#f56c6c"><WarningFilled /></el-icon>
            <el-icon v-else color="#67c23a"><SuccessFilled /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">
              {{ getCurrentValue(metric.key) }}
              <span class="metric-unit">{{ getUnit(metric.key) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="chart-section">
        <div class="chart-header">
          <div class="chart-info">
            <span class="chart-title">{{ getCurrentMetricName() }} 趋势图</span>
            <span class="chart-subtitle">最近 {{ currentHistoryLength }} 个数据点 · 更新频率 500ms</span>
          </div>
          <div class="chart-controls">
            <el-button size="small" @click="viewMode = 'table'">
              <el-icon><Back /></el-icon>
              返回表格
            </el-button>
          </div>
        </div>
        
        <div v-if="isChartReady" class="chart-container">
          <v-chart 
            ref="chartRef"
            class="chart" 
            :option="chartOption" 
            autoresize 
          />
        </div>
        <div v-else class="chart-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 当前指标详情 -->
        <div class="metric-detail">
          <el-descriptions :column="4" size="small" border>
            <el-descriptions-item label="当前值">
              <span class="detail-value">{{ getCurrentValue(selectedMetric) }} {{ getUnit(selectedMetric) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="阈值">
              <span>{{ getCurrentThreshold() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="平均值">
              <span>{{ getAvgValue() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="峰值">
              <span>{{ getPeakValue() }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, watch, nextTick } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  MarkLineComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { performanceInfo } from '@/hooks/usePerformanceInfo';
import performanceThreshold from '@/config/performanceThreshold';
import { 
  WarningFilled, 
  SuccessFilled, 
  Loading,
  CircleCheck,
  CircleClose,
  TrendCharts,
  InfoFilled,
  Back,
  Warning,
  Select,
} from '@element-plus/icons-vue';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  MarkLineComponent,
]);

const showPreviewModal = defineModel({
  type: Boolean,
  default: false,
});

// 视图模式
const viewMode = ref<'table' | 'chart'>('table');
const viewOptions = [
  { label: '表格视图', value: 'table' },
  { label: '图表分析', value: 'chart' },
];

const isChartReady = ref(false);
// chartRef 在模板中使用，用于绑定 v-chart 组件
// @ts-ignore - 在模板中使用
const chartRef = ref();

// 图表相关
type MetricKey = keyof typeof performanceThreshold;

// 固定值的指标（不需要趋势图）
const staticMetrics: MetricKey[] = ['bonesCount', 'boundWidth'];

const selectedMetric = ref<MetricKey>('fps');

// 固定最大数据点数量为30
const MAX_DATA_POINTS = 30;

// 所有指标（用于表格）
const allMetricOptions = [
  { key: 'fps' as MetricKey, label: 'FPS' },
  { key: 'drawCalls' as MetricKey, label: 'DrawCalls' },
  { key: 'vertices' as MetricKey, label: '顶点数' },
  { key: 'WebGLMemory' as MetricKey, label: '纹理内存' },
  { key: 'bonesCount' as MetricKey, label: '骨骼数' },
  { key: 'skeletonDataSize' as MetricKey, label: '资源内存' },
  { key: 'boundWidth' as MetricKey, label: '边界宽度' },
];

// 动态指标（用于图表，排除固定值）
const dynamicMetricOptions = computed(() => {
  return allMetricOptions.filter(metric => !staticMetrics.includes(metric.key));
});

// 判断是否为固定值指标
const isStaticMetric = (key: MetricKey) => {
  return staticMetrics.includes(key);
};

// 按需收集：只存储当前选中指标的历史数据，大幅降低内存占用
const currentMetricHistory = ref<{ time: string; value: number; timestamp: number }[]>([]);

const currentHistoryLength = computed(() => {
  return currentMetricHistory.value.length;
});

let collectionTimer: number | null = null;

// 清空历史数据的函数
const clearDataHistory = () => {
  currentMetricHistory.value.length = 0; // 直接清空数组
};

// 收集数据的函数（按需收集 - 只收集当前选中的指标）
const collectData = () => {
  // 只在图表视图时收集数据
  if (viewMode.value !== 'chart') {
    return;
  }
  
  const now = new Date();
  const timestamp = now.getTime();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  // 只收集当前选中指标的数据
  const currentValue = performanceInfo[selectedMetric.value];
  const numValue = typeof currentValue === 'number' ? currentValue : 0;
  
  // 如果已达到最大点数，移除第一个元素（最旧的）
  if (currentMetricHistory.value.length >= MAX_DATA_POINTS) {
    currentMetricHistory.value.shift();
  }
  
  // 添加新数据点
  currentMetricHistory.value.push({
    time: timeStr,
    value: numValue,
    timestamp
  });
};

// 开始数据收集（只在图表视图时调用）
const startDataCollection = () => {
  // 停止之前的收集
  stopDataCollection();
  
  // 清空历史数据
  clearDataHistory();

  // 立即收集一次数据
  collectData();

  // 每500ms收集一次数据
  collectionTimer = window.setInterval(() => {
    collectData();
  }, 500);
};

// 停止数据收集
const stopDataCollection = () => {
  if (collectionTimer !== null) {
    clearInterval(collectionTimer);
    collectionTimer = null;
  }
  
  // 不需要手动 dispose，vue-echarts 会自动管理实例生命周期
  // 手动 dispose 会导致切换视图时报错
  
  // 清空历史数据，释放内存
  clearDataHistory();
};

// 查看图表
const viewChart = (key: MetricKey) => {
  // 如果是固定值指标，不允许查看图表
  if (isStaticMetric(key)) {
    return;
  }
  selectedMetric.value = key;
  viewMode.value = 'chart';
  // watch(viewMode) 会自动处理数据收集
};

// 弹窗完全打开后的回调
const onDialogOpened = async () => {
  // 弹窗打开时默认是表格视图，不需要收集数据
  // 只有切换到图表视图时才开始收集
  await nextTick();
};

// 监听视图模式切换
watch(viewMode, async (newMode) => {
  if (newMode === 'chart') {
    // 切换到图表视图时，先准备图表，再开始收集数据
    isChartReady.value = true;
    await nextTick();
    setTimeout(() => {
      startDataCollection();
    }, 100);
  } else {
    // 切换到表格视图时，停止收集数据并清空
    stopDataCollection();
    isChartReady.value = false;
  }
});

// 监听指标切换
watch(selectedMetric, () => {
  // 切换指标时，如果在图表视图，重新开始收集新指标的数据
  if (viewMode.value === 'chart') {
    startDataCollection();
  }
});

// 监听弹窗关闭
watch(showPreviewModal, (newVal) => {
  if (!newVal) {
    stopDataCollection();
    viewMode.value = 'table'; // 关闭时重置为表格视图
  }
});

onUnmounted(() => {
  stopDataCollection();
  // 再次确认清理
  clearDataHistory();
});

// 辅助函数
const getCurrentValue = (key: MetricKey) => {
  const value = performanceInfo[key];
  if (typeof value === 'number') {
    return key === 'WebGLMemory' || key === 'skeletonDataSize' 
      ? value.toFixed(2) 
      : Math.round(value);
  }
  return 0;
};

const getUnit = (key: MetricKey) => {
  return performanceThreshold[key].unit || '';
};

const getCurrentMetricName = () => {
  return performanceThreshold[selectedMetric.value].name;
};

const getCurrentThreshold = () => {
  const threshold = performanceThreshold[selectedMetric.value];
  const symbol = threshold.type === 'min' ? '≥' : '≤';
  return `${symbol} ${threshold.threshold} ${threshold.unit}`;
};

const getAvgValue = () => {
  if (currentMetricHistory.value.length === 0) return '-';
  const avg = currentMetricHistory.value.reduce((sum, item) => sum + item.value, 0) / currentMetricHistory.value.length;
  const unit = getUnit(selectedMetric.value);
  return `${avg.toFixed(2)} ${unit}`;
};

const getPeakValue = () => {
  if (currentMetricHistory.value.length === 0) return '-';
  const peak = Math.max(...currentMetricHistory.value.map(item => item.value));
  const unit = getUnit(selectedMetric.value);
  return `${peak.toFixed(2)} ${unit}`;
};

const isMetricWarning = (key: MetricKey) => {
  const value = performanceInfo[key] as number;
  const threshold = performanceThreshold[key];
  if (threshold.type === 'min') {
    return value < threshold.threshold;
  } else {
    return value > threshold.threshold;
  }
};

const getTrendClass = (key: MetricKey) => {
  // 表格视图中不显示趋势（只有选中的指标才收集数据）
  // 只有在图表视图且是当前选中的指标时才有历史数据
  if (viewMode.value === 'chart' && key === selectedMetric.value) {
    if (currentMetricHistory.value.length < 2) return 'stable';
    
    const recent = currentMetricHistory.value.slice(-5);
    const avg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
    const current = recent[recent.length - 1].value;
    
    const diff = ((current - avg) / avg) * 100;
    
    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  }
  return 'stable';
};

const getTrendText = (key: MetricKey) => {
  // 表格视图中不显示趋势数据
  if (viewMode.value === 'table') {
    return '-';
  }
  
  const trendClass = getTrendClass(key);
  if (trendClass === 'up') return '↑ 上升';
  if (trendClass === 'down') return '↓ 下降';
  return '→ 稳定';
};

// 表格数据
const tableData = computed(() => {
  return [
    {
      ...performanceThreshold.fps,
      key: 'fps',
      value: getCurrentValue('fps'),
      advice: performanceThreshold.fps.advice,
    },
    {
      ...performanceThreshold.drawCalls,
      key: 'drawCalls',
      value: getCurrentValue('drawCalls'),
      advice: performanceThreshold.drawCalls.advice,
    },
    {
      ...performanceThreshold.vertices,
      key: 'vertices',
      value: getCurrentValue('vertices'),
      unit: '',
      advice: performanceThreshold.vertices.advice,
    },
    {
      ...performanceThreshold.WebGLMemory,
      key: 'WebGLMemory',
      value: getCurrentValue('WebGLMemory'),
      advice: performanceThreshold.WebGLMemory.advice,
    },
    {
      ...performanceThreshold.bonesCount,
      key: 'bonesCount',
      value: getCurrentValue('bonesCount'),
      advice: performanceThreshold.bonesCount.advice,
    },
    {
      ...performanceThreshold.skeletonDataSize,
      key: 'skeletonDataSize',
      value: getCurrentValue('skeletonDataSize'),
      advice: performanceThreshold.skeletonDataSize.advice,
    },
    {
      ...performanceThreshold.boundWidth,
      key: 'boundWidth',
      value: getCurrentValue('boundWidth'),
      advice: performanceThreshold.boundWidth.advice,
    },
  ];
});

const tableRowClassName = ({
  row,
}: {
  row: {
    type: 'min' | 'max';
    value: number | string;
    threshold: number;
  };
}) => {
  const value = typeof row.value === 'string' ? parseFloat(row.value) : row.value;
  if (row.type === 'min' ? row.threshold <= value : row.threshold >= value) {
    return 'success-row';
  }
  return 'warning-row';
};

// 图表配置（使用 computed 缓存）
const chartOption = computed(() => {
  const history = currentMetricHistory.value;
  const threshold = performanceThreshold[selectedMetric.value];
  const unit = threshold.unit || '';

  // 根据数据范围自动计算合适的 Y 轴范围
  const values = history.map(item => item.value);
  const minValue = Math.min(...values, threshold.threshold);
  const maxValue = Math.max(...values, threshold.threshold);
  const padding = (maxValue - minValue) * 0.2 || 10;

  return {
    animation: false, // 关闭动画提升性能
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      textStyle: {
        color: '#fff',
      },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        const point = params[0];
        return `<div style="padding: 4px;">
          <div style="margin-bottom: 4px;">${point.axisValue}</div>
          <div><strong>${point.value}${unit}</strong></div>
        </div>`;
      },
    },
    grid: {
      left: '50px',
      right: '20px',
      bottom: '40px',
      top: '20px',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: history.length > 0 ? history.map((item) => item.time) : ['--:--:--'],
      axisLabel: {
        rotate: 45,
        interval: Math.max(Math.floor(history.length / 10), 0),
        fontSize: 11,
        color: '#606266',
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: unit,
      nameTextStyle: {
        color: '#909399',
        fontSize: 12,
      },
      min: Math.floor(minValue - padding),
      max: Math.ceil(maxValue + padding),
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e4e7ed',
        },
      },
      axisLabel: {
        fontSize: 11,
        color: '#606266',
      },
    },
    series: [
      {
        name: threshold.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        sampling: 'lttb', // 大数据量优化
        data: history.length > 0 ? history.map((item) => item.value) : [0],
        itemStyle: {
          color: isMetricWarning(selectedMetric.value) ? '#f56c6c' : '#409eff',
        },
        lineStyle: {
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { 
                offset: 0, 
                color: isMetricWarning(selectedMetric.value) 
                  ? 'rgba(245, 108, 108, 0.3)' 
                  : 'rgba(64, 158, 255, 0.3)' 
              },
              { 
                offset: 1, 
                color: isMetricWarning(selectedMetric.value) 
                  ? 'rgba(245, 108, 108, 0.05)' 
                  : 'rgba(64, 158, 255, 0.05)' 
              },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          label: {
            position: 'insideEndTop',
            formatter: `阈值 ${threshold.threshold}${unit}`,
            fontSize: 11,
            color: '#909399',
          },
          lineStyle: {
            type: 'dashed',
            color: threshold.type === 'min' ? '#67c23a' : '#f56c6c',
            width: 2,
          },
          data: [
            {
              yAxis: threshold.threshold,
            },
          ],
        },
      },
    ],
  };
});
</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>

<style lang="scss" scoped>
.view-switcher {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

// 表格视图样式
.table-view {
  .table-footer {
    margin-top: 0px;
    padding: 6px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #606266;

    .el-icon {
      color: #409eff;
    }
  }
  
  .no-trend {
    color: #c0c4cc;
    font-size: 13px;
  }

  .advice-content {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 6px 0;

    .advice-icon {
      color: #e6a23c;
      font-size: 16px;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .advice-text {
      color: #606266;
      font-size: 13px;
      line-height: 1.4;
      flex: 1;
    }
  }

  .normal-status {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #67c23a;
    font-size: 13px;

    .ok-icon {
      font-size: 14px;
    }
  }
}

.table-metric-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.label-desc {
  height: 20px;
  line-height: 20px;
  background-color: #e6f0ff;
  color: #409eff;
  padding: 0px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.current-value {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.threshold-text {
  color: #606266;
  font-size: 14px;
}

.unit {
  font-size: 11px;
  color: #909399;
  margin-left: 2px;
}

.static-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f4f4f5;
  color: #909399;
  font-size: 12px;
  border-radius: 3px;
}

.trend-indicator {
  font-size: 13px;
  font-weight: 600;
  
  &.up {
    color: #f56c6c;
  }
  
  &.down {
    color: #67c23a;
  }
  
  &.stable {
    color: #909399;
  }
}

// 图表视图样式
.chart-view {
  .metrics-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }

  .metric-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.active {
      border-color: #409eff;
      background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    }

    &.warning {
      border-color: #f56c6c;
      background: linear-gradient(135deg, #fef0f0 0%, #fff 100%);
      
      &.active {
        box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
      }
    }

    .metric-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .metric-info {
      flex: 1;
      min-width: 0;
    }

    .metric-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 1;
    }

    .metric-unit {
      font-size: 11px;
      color: #909399;
      font-weight: normal;
      margin-left: 2px;
    }
  }

  .chart-section {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    background: #fff;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 16px;

      .chart-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .chart-subtitle {
        font-size: 12px;
        color: #909399;
      }

      .chart-controls {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
    }

    .chart-container {
      height: 320px;
      width: 100%;
    }

    .chart {
      height: 100%;
      width: 100%;
    }

    .chart-loading {
      height: 320px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #909399;
      font-size: 14px;

      .el-icon {
        font-size: 32px;
      }
    }

    .metric-detail {
      margin-top: 16px;

      :deep(.el-descriptions__label) {
        font-weight: 600;
      }

      .detail-value {
        color: #409eff;
        font-weight: 600;
        font-size: 15px;
      }
    }
  }
}
</style>