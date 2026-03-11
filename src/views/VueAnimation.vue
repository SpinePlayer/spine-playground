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
        @changeSkin="changeSkin"
        @changeTimeScale="changeTimeScale"
        @changeAnimation="onAnimationChange"
        @changeCustomScale="changeCustomScale"
        @onSlotNameChange="onSlotNameChange"
      />
    </ContentPanel>

    <!-- 动画展示区域 -->
    <div class="playground-container">
      <PlaygroundCvs
        :showCvs="showCvs"
        :playProgress="playProgress"
        @progressChange="onProgressChange"
      >
        <VSpinePlayer
          ref="spinePlayerRef"
          :loop="spineConf.loop"
          :assets="assets"
          :debugMode="spineConf.debugMode"
          :autoPlay="spineConf.autoPlay"
          :filters="spineConf.filters"
          :uniBlendMode="spineConf.uniBlendMode"
          :animationName="spineInfo.animationName"
          :dynamicCalcBound="spineConf.dynamicCalcBound"
          :cleanAssetsCache="spineConf.cleanAssetsCache"
          :renderFirstScreen="spineConf.renderFirstScreen"
          @loaded="onLoaded"
          @update="onUpdate"
        />
      </PlaygroundCvs>
      <!-- spine信息 -->
      <PerformanceInfo
        :version="spineInfo.version"
        :bounds="spineInfo.bounds"
      />
      <!-- 播放控制按钮 -->
      <FooterControl
        type="vue"
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
import { shallowRef, shallowReactive, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import useExec from '@/hooks/useExec';
import useSetting from '@/hooks/useSetting';
import useProgress from '@/hooks/useProgress';
import useSpineVersion from '@/hooks/useSpineVersion';
import usePerformanceInfo from '@/hooks/usePerformanceInfo';
import useSpineSlots from '@/hooks/useSpineSlots';
import type {
  TimeKeeper,
  RemoteOptions,
  RemoteAssets,
  ISpineInfo,
  SpinePlayer,
} from '@/types/common';

const { onBackgroundChange, backgroundSetting } = useSetting();
const { VSpinePlayer, DEFAULT_ASSETS } = useSpineVersion();
const { setPlayerInstance, onSlotNameChange, clearAllSlotEvents } = useSpineSlots();

// 动画控制相关
const showCvs = shallowRef(false);
const showCode = shallowRef(false);
const skeletonSlotsData = shallowRef('');

const { execCode } = useExec();
// 性能信息
const { performanceInfo, initGLPerformance, updateSpineDataSize } = usePerformanceInfo();
// 播放进度
const { playProgress, updatePlayProgress, handleProgressChange } =
  useProgress();

// 动画资源
const assets = shallowRef<RemoteAssets>({
  skel: DEFAULT_ASSETS.skel,
  atlas: DEFAULT_ASSETS.atlas,
});

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
  autoPlay: true,
  debugMode: false,
  mixDuration: 0.2,
  timeScale: 1,
  customScale: 1,
  filters: {} as any,
  uniBlendMode: false,
  renderFirstScreen: true,
  cleanAssetsCache: false,
  premultipliedAlpha: false,
  dynamicCalcBound: false,
});

// Spine播放器实例
let spinePlayer: SpinePlayer | null = null;
const spinePlayerRef = shallowRef<typeof VSpinePlayer>();
onMounted(() => {
  spinePlayer = spinePlayerRef.value?.getPlayer();
  if (spinePlayer) {
    spinePlayer.setBackground({
      ...backgroundSetting,
    });
    // 设置播放器实例
    setPlayerInstance(spinePlayer);
  }
  // 监听背景变化
  onBackgroundChange(payload => {
    spinePlayer?.setBackground({
      ...payload,
    });
  });
  initGLPerformance(spinePlayer?.gl!);
});

// 远程文件加载
const loadRemoteSpine = async (
  remoteAssets: RemoteAssets,
  options?: RemoteOptions
) => {
  if (!remoteAssets.atlas || !remoteAssets.skel) return;
  assets.value = remoteAssets;
  spineConf.debugMode = options?.debugMode ?? false;
  spineConf.autoPlay = options?.autoPlay ?? true;
  spineConf.uniBlendMode = options?.uniBlendMode ?? false;
  spineConf.renderFirstScreen = options?.firstRenderScreen ?? true;
  spineConf.cleanAssetsCache = options?.clearAssetsCache ?? false;
  spineConf.premultipliedAlpha = options?.premultipliedAlpha ?? false;
  spineConf.dynamicCalcBound = options?.dynamicCalcBound ?? false;
  spineInfo.animationName = ''; // 重置动画名称
  spineConf.filters = {
    type: options?.filterType || 'none',
    params: options?.filterParams || {},
  };
};

// 动画加载完成回调
function onLoaded() {
  if (!spinePlayer) return;
  // 设置属性信息
  showCvs.value = true;
  spineInfo.version = spinePlayer.spineVersion || '';
  spineInfo.isPaused = spinePlayer.isPaused || false;
  spineInfo.skins = spinePlayer.getSkins() || [];
  spineInfo.animations = spinePlayer.getAnimations() || [];
  spineInfo.skinName = spineInfo.skins[0] || '';
  spineInfo.animationName =
    spinePlayer.animationName || spineInfo.animations[0];
  spineInfo.bounds = spinePlayer.spineBounds;
  spineInfo.events = spinePlayer.spineEvents || [];
  spineInfo.bonesCount = spinePlayer.skeleton.bones?.length || 0;
  // 更新spine性能数据
  updateSpineDataSize(spineInfo.bonesCount, spinePlayer.skeleton.data, spineInfo.bounds?.width || 0);
  skeletonSlotsData.value =
    JSON.stringify(spinePlayer.skeleton.data.slots, null, 2) || '';
  spineInfo.soltNames = spinePlayer.skeleton.data.slots.map((slot: any) => slot.name) || [];
  spineInfo.slotName = '';
  clearAllSlotEvents();
  // reset data
  spineConf.mixDuration = 0.2;
  spineConf.timeScale = 1;
  spineConf.customScale = 1;
}
function onUpdate(_: TimeKeeper, drawCall?: number) {
  performanceInfo.drawCalls = drawCall || 0;
  updatePlayProgress(spinePlayer?.animationState);
}

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
const changeSkin = () => {
  if (spineInfo.skinName) {
    console.log('切换皮肤:', spineInfo.skinName);
    spinePlayer?.changeSkin(spineInfo.skinName);
  }
};
const onProgressChange = (percentage: number) => {
  handleProgressChange(spinePlayer, percentage);
};

const onAnimationChange = () => {
  if (spinePlayer?.spineBounds) {
    spineInfo.bounds = spinePlayer?.spineBounds;
  }
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
</script>
