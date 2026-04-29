<template>
  <div class="content">
    <ContentPanel title="SPINE管理">
      <div class="control-group center">
        <button
          @click="showAssetsLoad = true"
          class="btn btn-primary"
          style="width: 100%"
        >
          加载更多Spine资源
        </button>
      </div>
      <SpineList
        :spineList="spineList"
        :selectedSpineId="selectedSpineId"
        @selectSpine="selectSpine"
        @deleteSpine="deleteSpine"
      />
    </ContentPanel>

    <!-- 播放控制部分 -->
    <ContentPanel title="动画播放">
      <PlayControl
        :multi="true"
        :spineInfo="spineInfo"
        :spineConf="spineConf"
        @changeTimeScale="changeTimeScale"
        @changeAnimation="changeAnimation"
        @changeSkin="changeSkin"
        @changeZIndex="changeZIndex"
        @onSlotNameChange="onSlotNameChange"
        @changeCustomBounds="changeCustomBounds"
      />
    </ContentPanel>

    <!-- 动画展示区域 -->
    <div class="playground-container">
      <PlaygroundCvs
        multi
        :showCvs="showCvs"
        :playProgress="playProgress"
        :drawCalls="performanceInfo.drawCalls"
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
        type="multi"
        :showCvs="showCvs"
        :isPaused="void 0"
        @start="playAnimation"
        @stop="stopAnimation"
        @resume="resumeAnimation"
        @pause="pauseAnimation"
        @hide="hideAnimation"
        @showSlotData="showCode = true"
        @execCode="execCustomCode"
      />
    </div>
  </div>
  <!-- 骨骼代码展示 -->
  <code-drawer v-model:showCode="showCode" :code="skeletonSlotsData" />
  <!-- 资源加载部分 -->
  <el-drawer
    v-model="showAssetsLoad"
    :with-header="false"
    direction="ltr"
    title="资源加载"
  >
    <AssetsLoad multi @load="loadRemoteSpine"></AssetsLoad>
  </el-drawer>
</template>

<script setup lang="ts">
import {
  ref,
  shallowRef,
  shallowReactive,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue';
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
  SpineManage as ISpineManage,
} from '@/types/common';

const { onBackgroundChange, backgroundSetting } = useSetting();
const { SpinePlayer, DEFAULT_MULTI_ASSETS } = useSpineVersion();
const { setManageInstance, setSpineUuid, onSlotNameChange } = useSpineSlots();
const SpineManage = SpinePlayer.SpineManage;
const SpineTools = SpinePlayer.SpineTools;

const getInitSpineInfo = (): ISpineInfo => {
  return {
    version: '', // 版本
    bounds: null,
    bonesCount: 0,
    customBounds: void 0, // 自定义坐标
    skinName: '', // 当前皮肤名称
    animationName: '', // 当前动画名称
    skins: [] as string[], // 皮肤列表
    animations: [] as string[], // 动画列表
    isPaused: false, // 是否暂停
    events: [] as Array<any>,
    soltNames: [] as string[], // 插槽名称列表
  };
};

// Canvas引用
const canvasEl = shallowRef<HTMLCanvasElement>();

// 动画控制相关
const showCvs = shallowRef(false);
const showCode = shallowRef(false);
const showAssetsLoad = shallowRef(false);
const skeletonSlotsData = shallowRef('');

const spineList = ref<string[]>([]);
const selectedSpineId = shallowRef<string>('');

const { execCode } = useExec();
// 性能信息
const { performanceInfo, initGLPerformance, updateSpineDataSize } =
  usePerformanceInfo();
// 播放进度
const { playProgress, updatePlayProgress, handleProgressChange } =
  useProgress();

const spineInfo = ref<ISpineInfo>(getInitSpineInfo());

const spineInfoMap = new Map<string, ISpineInfo>();
const spineConfMap = new Map<
  string,
  {
    loop: boolean;
    mixDuration: number;
    timeScale: number;
    zIndex: number;
  }
>();

const spineConf = shallowReactive({
  loop: true,
  mixDuration: 0.2,
  timeScale: 1,
  zIndex: 0,
});

const setSpineConf = (uuid: string, options?: any) => {
  spineConfMap.set(uuid, {
    loop: spineConf.loop,
    mixDuration: spineConf.mixDuration,
    timeScale: spineConf.timeScale,
    zIndex: spineConf.zIndex,
    ...options,
  });
};
const getSpineConf = (uuid: string) => {
  spineConf.loop = spineConfMap.get(uuid)?.loop || true;
  spineConf.mixDuration = spineConfMap.get(uuid)?.mixDuration || 0.2;
  spineConf.timeScale = spineConfMap.get(uuid)?.timeScale || 1;
  spineConf.zIndex = spineConfMap.get(uuid)?.zIndex || 0;
};

// Spine播放器实例
let spineManager: ISpineManage | null = null;
function initSpinePlayer() {
  if (canvasEl.value) {
    // 创建播放器实例
    spineManager = new SpineManage(canvasEl.value, {
      background: {
        ...backgroundSetting,
      },
      onUpdate: (_: TimeKeeper, drawCall?: number) => {
        performanceInfo.drawCalls = drawCall || 0;
        if (selectedSpineId.value) {
          updatePlayProgress(
            spineManager?.getAnimationState(selectedSpineId.value)
          );
        }
      },
    });
    // 监听背景变化
    onBackgroundChange(payload => {
      spineManager?.setBackground({
        ...payload,
      });
    });
    // 创建WebGL内存跟踪器
    initGLPerformance(spineManager.gl!);
    // 加载初始资源
    DEFAULT_MULTI_ASSETS.forEach((asset: any) => {
      loadRemoteSpine(
        asset,
        {
          bound: asset.bound,
        },
        asset.uuid
      );
    });
    // 设置管理实例
    setManageInstance(spineManager);
  }
}

// 远程文件加载
const loadRemoteSpine = async (
  assets: RemoteAssets,
  options?: RemoteOptions,
  uniqueID?: string
) => {
  if (!assets.atlas || !assets.skel || !spineManager) return;
  try {
    const uuid = uniqueID || SpineTools.getRandomUUID().split('_')[1];
    await spineManager.loadSpine({
      uuid,
      assets,
      loop: spineConf.loop,
      bound: options?.bound,
      zIndex: options?.zIndex,
      filters: {
        type: options?.filterType,
        params: options?.filterParams,
      },
      autoPlay: options?.autoPlay,
      debugMode: options?.debugMode,
      uniBlendMode: options?.uniBlendMode,
      renderFirstScreen: options?.firstRenderScreen,
      premultipliedAlpha: options?.premultipliedAlpha,
    });
    // 设置属性信息
    showAssetsLoad.value = false;
    showCvs.value = true;
    // 插槽数据
    const skeleton = spineManager.getSkeleton(uuid);
    skeletonSlotsData.value =
      JSON.stringify(skeleton?.data.slots, null, 2) || '';
    spineList.value.push(uuid);
    spineInfoMap.set(uuid, {
      version: spineManager.getVersion(uuid) || '',
      bounds: spineManager.getBounds(uuid),
      skinName: spineManager.getSkins(uuid)[0] || '',
      animationName: spineManager.getAnimations(uuid)[0] || '',
      skins: spineManager.getSkins(uuid) || [],
      animations: spineManager.getAnimations(uuid) || [],
      isPaused: false,
      events: spineManager.getEvents(uuid) || [],
      customBounds: options?.bound,
      bonesCount: skeleton?.bones?.length || 0,
      soltNames: skeleton?.data.slots.map((slot: any) => slot.name) || [],
    });
    setSpineConf(uuid, {
      zIndex: options?.zIndex || 0,
    });
    // 如果是第一个加载的动画，自动选中
    if (spineList.value.length === 1) {
      selectedSpineId.value = uuid;
    }
  } catch (error) {
    ElMessage.error('播放失败' + error);
  }
};

// 播放控制
const playAnimation = () => {
  spineManager?.start();
};
const resumeAnimation = () => {
  spineManager?.resume(selectedSpineId.value);
};
const stopAnimation = () => {
  spineManager?.stop();
};
const pauseAnimation = () => {
  spineManager?.pause(selectedSpineId.value);
};
const hideAnimation = () => {
  spineManager?.hide(selectedSpineId.value);
};
const setMixDuration = () => {
  if (spineManager && spineConf.mixDuration >= 0) {
    spineManager?.setMix(selectedSpineId.value, spineConf.mixDuration);
  } else {
    ElMessage.error('设置失败，确保数字合法');
  }
};
const changeTimeScale = () => {
  if (spineManager && spineConf.timeScale >= 0) {
    spineManager?.setTimeScale(selectedSpineId.value, spineConf.timeScale);
  } else {
    ElMessage.error('设置失败，确保数字合法');
  }
};
const changeAnimation = () => {
  if (spineInfo.value.animationName && spineManager) {
    console.log('切换动画:', spineInfo.value.animationName, spineConf.loop);
    spineManager?.playAnimation(selectedSpineId.value, {
      animationName: spineInfo.value.animationName,
      loop: spineConf.loop,
    });
  }
  // spineInfo.isPaused = spinePlayer?.isPaused || false;
};
const changeSkin = () => {
  if (spineInfo.value.skinName) {
    console.log('切换皮肤:', spineInfo.value.skinName);
    spineManager?.changeSkin(selectedSpineId.value, spineInfo.value.skinName);
  }
};
const changeZIndex = () => {
  spineManager?.setZIndex(selectedSpineId.value, spineConf.zIndex);
};
const onProgressChange = (percentage: number) => {
  handleProgressChange(spineManager, percentage, selectedSpineId.value);
};

// 选择动画
const selectSpine = (spineId: string) => {
  setSpineConf(selectedSpineId.value);
  selectedSpineId.value = spineId;
  getSpineConf(selectedSpineId.value);
};

const deleteSpine = (spineId: string) => {
  spineList.value = spineList.value.filter(id => id !== spineId);
  spineManager?.disposeByUUID(spineId);
  spineInfoMap.delete(spineId);
  spineConfMap.delete(spineId);
  if (spineList.value.length === 0) {
    showCvs.value = false;
    performanceInfo.drawCalls = 0;
  }
  setTimeout(() => {
    if (selectedSpineId.value === spineId) {
      selectSpine(spineList.value[0]);
    }
  }, 200);
};

/**
 * 更新自定义坐标
 */
 const changeCustomBounds = () => {
  if (!spineInfo.value.customBounds) return;
  spineManager?.updateBound(selectedSpineId.value, spineInfo.value.customBounds);
};

const execCustomCode = (code: string) => {
  execCode(code, spineManager);
};

watch(
  () => spineConf.mixDuration,
  () => {
    setMixDuration();
  }
);

watch(
  () => selectedSpineId.value,
  () => {
    if (selectedSpineId.value) {
      spineInfo.value = spineInfoMap.get(selectedSpineId.value) || getInitSpineInfo();
      updateSpineDataSize(spineInfo.value.bonesCount, spineManager?.getSkeleton(selectedSpineId.value)?.data, spineInfo.value.bounds?.width || 0);
    } else {
      spineInfo.value = getInitSpineInfo();
      updateSpineDataSize(0, null, 0);
    }
    setSpineUuid(selectedSpineId.value, spineInfo.value.slotName);
  }
);

// 初始化播放器
onMounted(() => {
  initSpinePlayer();
});

// 销毁播放器
onBeforeUnmount(() => {
  spineManager?.stop();
  spineManager?.disposeAll();
});
</script>
