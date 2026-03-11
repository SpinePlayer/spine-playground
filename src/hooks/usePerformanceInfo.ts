import Stats from 'stats-gl';
import { shallowReactive, onBeforeUnmount, onBeforeMount, computed } from 'vue';
import JSMemorySizeof from '@/utils/JSMemorySizeof';
import WebGLMemoryTracker from '@/utils/WebGLMemoryTracker';
import performanceThreshold from '@/config/performanceThreshold';

const performanceInfo = shallowReactive({
  fps: 0,
  drawCalls: 0,
  vertices: 0,
  WebGLMemory: 0,
  JSHeapMemory: 0,
  bonesCount: 0, // 骨骼数量--与spine资源相关
  skeletonDataSize: 0, // 骨骼数据大小--与spine资源相关，单位：MB
  boundWidth: 0, // 边界宽度
});

export { performanceInfo };

export const checkPerformance = () => {
  const isAllPass = computed(() => {
    return Object.keys(performanceThreshold).every(name => {
      const value = performanceInfo[
        name as keyof typeof performanceInfo
      ] as number;
      const threshold =
        performanceThreshold[name as keyof typeof performanceThreshold];
      const constValue = threshold.threshold as number;
      if (threshold.type === 'min') {
        return value >= constValue;
      } else {
        return value <= constValue;
      }
    });
  });
  return {
    isAllPass,
  };
};

export default (mobile?: boolean) => {
  let frameCount = 0;
  let lastTime = performance.now();
  let animationFrameId: number;
  let webglMemoryTracker: WebGLMemoryTracker | null = null;
  let stats: Stats | null = null;

  if (mobile) {
    // stats.dom.style.position = 'absolute';
    // stats.dom.style.top = '100px';
    // stats.dom.style.left = 'auto';
    // stats.dom.style.right = '100px';
    // stats.dom.style.zIndex = '9';
    stats = new Stats({
      trackGPU: true,
      trackHz: true,
      trackCPT: false,
      logsPerSecond: 4,
      graphsPerSecond: 30,
      samplesLog: 40,
      samplesGraph: 10,
      precision: 1,
      horizontal: false,
      minimal: false,
      mode: 0,
    });
    document.body.appendChild(stats.dom);
  }

  const toggleStats = () => {
    if (stats) {
      if (stats.dom.style.display === 'none') {
        stats.dom.style.display = 'block';
      } else {
        stats.dom.style.display = 'none';
      }
    }
  };

  const updateSpineDataSize = (bonesCount: number, skeletonData: any, boundsWidth: number) => {
    performanceInfo.boundWidth = Math.round(boundsWidth || 0);
    performanceInfo.bonesCount = bonesCount;
    performanceInfo.skeletonDataSize =
      JSMemorySizeof.roughSizeOfObject(skeletonData);
  };

  const initGLPerformance = (gl: WebGLRenderingContext) => {
    if (stats) stats.init(gl);
    webglMemoryTracker = new WebGLMemoryTracker(gl, stats || undefined);
  };

  const calculateMetrics = () => {
    const currentTime = performance.now();
    frameCount++;
    if (currentTime - lastTime >= 1000) {
      performanceInfo.fps = Math.round(
        (frameCount * 1000) / (currentTime - lastTime)
      );
      frameCount = 0;
      lastTime = currentTime;
    }
    // update performance info
    if (webglMemoryTracker) {
      const memoryInfo = webglMemoryTracker?.getMemoryInfo();
      performanceInfo.JSHeapMemory = memoryInfo?.jsHeapMemory || 0;
      performanceInfo.WebGLMemory = memoryInfo?.webglMemory || 0;
      performanceInfo.vertices = memoryInfo?.vertexCount || 0;
      webglMemoryTracker?.resetFrameStats();
    }
    if (stats) stats.update();
    // next frame
    animationFrameId = requestAnimationFrame(calculateMetrics);
  };
  calculateMetrics();

  const stopTracking = () => {
    cancelAnimationFrame(animationFrameId);
  };

  const resetData = () => {
    performanceInfo.fps = 0;
    performanceInfo.drawCalls = 0;
    performanceInfo.vertices = 0;
    performanceInfo.WebGLMemory = 0;
    performanceInfo.JSHeapMemory = 0;
    performanceInfo.bonesCount = 0;
    performanceInfo.skeletonDataSize = 0;
    performanceInfo.boundWidth = 0;
  };

  onBeforeMount(() => {
    resetData();
  });

  onBeforeUnmount(() => {
    stopTracking();
    webglMemoryTracker?.clear();
    webglMemoryTracker = null;
    resetData();
    if (stats) {
      stats.dom.remove();
    }
  });

  return {
    performanceInfo,
    toggleStats,
    initGLPerformance,
    updateSpineDataSize,
  };
};
