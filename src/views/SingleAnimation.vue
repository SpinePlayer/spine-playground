<template>
  <div class="content">
    <!-- 文件加载部分 -->
    <ContentPanel title="资源加载">
      <AssetsLoad @load="loadRemoteSpine"></AssetsLoad>
    </ContentPanel>

    <!-- 播放控制部分 -->
    <ContentPanel title="动画播放">
      <PlayControl
        :spineInfo="spineInfo"
        :spineConf="spineConf"
        @changeTimeScale="changeTimeScale"
        @changeAnimation="changeAnimation"
        @changeSkin="changeSkin"
        @changeCustomScale="changeCustomScale"
        @onSlotNameChange="onSlotNameChange"
        @changeOffset="changeOffset"
      />
    </ContentPanel>

    <!-- 动画展示区域 -->
    <div class="playground-container">
      <PlaygroundCvs
        :showCvs="showCvs"
        :playProgress="playProgress"
        @progressChange="onProgressChange"
      >
        <canvas ref="canvasEl"></canvas>
      </PlaygroundCvs>
      <!-- spine信息 -->
      <PerformanceInfo
        :version="spineInfo.version"
        :bounds="spineInfo.bounds"
      />
      <!-- 播放控制按钮 -->
      <FooterControl
        type="single"
        :showCvs="showCvs"
        :isPaused="spineInfo.isPaused"
        @start="playAnimation"
        @resume="resumeAnimation"
        @pause="stopAnimation"
        @showSlotData="showCode = true"
        @execCode="execCustomCode"
      />
    </div>
  </div>
  <!-- 骨骼代码展示 -->
  <code-drawer v-model:showCode="showCode" :code="skeletonSlotsData" />
</template>

<script setup lang="ts">
import {
  shallowRef,
  shallowReactive,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { ElMessage } from 'element-plus';
import useExec from '@/hooks/useExec';
import useSetting from '@/hooks/useSetting';
import useSpineVersion from '@/hooks/useSpineVersion';
import usePerformanceInfo from '@/hooks/usePerformanceInfo';
import useProgress from '@/hooks/useProgress';
import useSpineSlots from '@/hooks/useSpineSlots';
import type {
  TimeKeeper,
  RemoteOptions,
  RemoteAssets,
  ISpineInfo,
  SpinePlayer as ISpinePlayer,
} from '@/types/common';

const { onBackgroundChange, backgroundSetting } = useSetting();
const { SpinePlayer: SpinePlayerAll, DEFAULT_ASSETS } = useSpineVersion();
const SpinePlayer = SpinePlayerAll.SpinePlayer;

// Canvas引用
const canvasEl = shallowRef<HTMLCanvasElement>();

// 动画控制相关
const isDisposed = shallowRef(false);
const showCvs = shallowRef(false);
const showCode = shallowRef(false);
const skeletonSlotsData = shallowRef('');

const { execCode } = useExec();
const { setPlayerInstance, onSlotNameChange, clearAllSlotEvents } = useSpineSlots();
// 性能信息
const { performanceInfo, initGLPerformance, updateSpineDataSize } = usePerformanceInfo();
// 播放进度
const { playProgress, updatePlayProgress, handleProgressChange } =
  useProgress();

// 动画信息
const spineInfo = shallowReactive<ISpineInfo>({
  version: '', // 版本
  bounds: null,
  bonesCount: 0,
  skinName: '', // 当前皮肤名称
  animationName: '', // 当前动画名称
  skins: [] as string[], // 皮肤列表
  animations: [] as string[], // 动画列表
  isPaused: false, // 是否暂停
  events: [] as Array<any>,
  soltNames: [] as string[], // 插槽名称列表
});

// 动画设置
const spineConf = shallowReactive({
  loop: true,
  mixDuration: 0.2,
  timeScale: 1,
  customScale: 1,
  offsetX: 0,
  offsetY: 0,
});

// Spine播放器实例
let spinePlayer: ISpinePlayer | null = null;
function initSpinePlayer() {
  if (canvasEl.value) {
    // 创建播放器实例
    spinePlayer = new SpinePlayer(canvasEl.value, {
      type: 'auto',
      background: {
        ...backgroundSetting,
      },
      onUpdate: (_: TimeKeeper, drawCall?: number) => {
        performanceInfo.drawCalls = drawCall || 0;
        updatePlayProgress(spinePlayer?.animationState);
      },
    });
    // 监听背景变化
    onBackgroundChange(payload => {
      spinePlayer?.setBackground({
        ...payload,
      });
    });
    // 创建WebGL内存跟踪器
    initGLPerformance(spinePlayer.gl!);
    // 加载初始资源
    loadRemoteSpine({
      atlas: DEFAULT_ASSETS.atlas,
      skel: DEFAULT_ASSETS.skel,
    });
    // 设置播放器实例
    setPlayerInstance(spinePlayer);
  }
}

// 远程文件加载
const loadRemoteSpine = async (
  assets: RemoteAssets,
  options?: RemoteOptions
) => {
  if (!assets.atlas || !assets.skel || !spinePlayer) return;
  try {
    await spinePlayer.loadSpine({
      assets,
      loop: spineConf.loop,
      filters: {
        type: options?.filterType,
        params: options?.filterParams,
      },
      autoPlay: options?.autoPlay,
      debugMode: options?.debugMode,
      uniBlendMode: options?.uniBlendMode,
      renderFirstScreen: options?.firstRenderScreen,
      cleanAssetsCache: options?.clearAssetsCache,
      premultipliedAlpha: options?.premultipliedAlpha,
      dynamicCalcBound: options?.dynamicCalcBound,
    });
    if (isDisposed.value) {
      spinePlayer.dispose();
      spinePlayer = null;
      return;
    }
    // 设置属性信息
    showCvs.value = true;
    spineInfo.version = spinePlayer.spineVersion || '';
    spineInfo.isPaused = spinePlayer.isPaused || false;
    spineInfo.skins = spinePlayer.getSkins() || [];
    spineInfo.animations = spinePlayer.getAnimations() || [];
    spineInfo.skinName = spineInfo.skins[0] || '';
    spineInfo.animationName = spinePlayer.animationName || '';
    spineInfo.bounds = spinePlayer.spineBounds;
    spineInfo.events = spinePlayer.spineEvents || [];
    spineInfo.bonesCount = spinePlayer.skeleton.bones?.length || 0;
    // 更新spine性能数据
    updateSpineDataSize(spineInfo.bonesCount, spinePlayer.skeleton, spineInfo.bounds?.width || 0);
    // 插槽数据
    skeletonSlotsData.value =
      JSON.stringify(spinePlayer.skeleton.data.slots, null, 2) || '';
    spineInfo.soltNames = spinePlayer.skeleton.data.slots.map((slot: any) => slot.name) || [];
    spineInfo.slotName = '';
    clearAllSlotEvents();
    // reset data
    spineConf.mixDuration = 0.2;
    spineConf.timeScale = 1;
    spineConf.customScale = 1;
  } catch (error) {
    ElMessage.error('播放失败' + error);
  }
};

// 播放控制
const playAnimation = () => {
  spinePlayer?.start();
  spineInfo.isPaused = spinePlayer?.isPaused || false;
  spineInfo.animationName = spinePlayer?.animationName || '';
};
const resumeAnimation = () => {
  spinePlayer?.resume();
  spineInfo.isPaused = spinePlayer?.isPaused || false;
};
const stopAnimation = () => {
  spinePlayer?.stop();
  spineInfo.isPaused = spinePlayer?.isPaused || false;
};
const setMixDuration = () => {
  if (spinePlayer && spineConf.mixDuration >= 0) {
    spinePlayer.setMix(spineConf.mixDuration);
  } else {
    ElMessage.error('设置失败，确保数字合法');
  }
};
const changeTimeScale = () => {
  if (spinePlayer && spineConf.timeScale >= 0) {
    spinePlayer.setTimeScale(spineConf.timeScale);
  } else {
    ElMessage.error('设置失败，确保数字合法');
  }
};
const changeCustomScale = () => {
  if (spinePlayer && spineConf.customScale >= 0) {
    spinePlayer.updateConfig({
      customScale: spineConf.customScale,
    });
  } else {
    ElMessage.error('设置失败，确保数字合法');
  }
};
const changeOffset = () => {
  spinePlayer?.updateConfig({
    positionOffset: {
      x: `${spineConf.offsetX}%`,
      y: `${spineConf.offsetY}%`,
    },
  });
};
const changeAnimation = () => {
  if (spineInfo.animationName && spinePlayer) {
    console.log('切换动画:', spineInfo.animationName);
    spinePlayer.playAnimation(spineInfo.animationName, spineConf.loop);
    if (spinePlayer?.spineBounds) {
      spineInfo.bounds = spinePlayer?.spineBounds;
    }
  }
  spineInfo.isPaused = spinePlayer?.isPaused || false;
};
const changeSkin = () => {
  if (spineInfo.skinName) {
    console.log('切换皮肤:', spineInfo.skinName);
    spinePlayer?.changeSkin(spineInfo.skinName);
  }
};
const onProgressChange = (percentage: number) => {
  handleProgressChange(spinePlayer, percentage);
};

const execCustomCode = (code: string) => {
  execCode(code, spinePlayer);
};

watch(
  () => spineConf.mixDuration,
  () => {
    setMixDuration();
  }
);

// 初始化播放器
onMounted(() => {
  isDisposed.value = false;
  initSpinePlayer();
});

// 销毁播放器
onBeforeUnmount(() => {
  isDisposed.value = true;
  spinePlayer?.dispose();
});
</script>
