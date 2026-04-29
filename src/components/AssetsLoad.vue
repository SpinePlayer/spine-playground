<template>
  <el-tabs v-model="assetsLoadType" stretch>
    <el-tab-pane label="链接" name="remote">
      <!-- 远程文件加载 -->
      <div class="control-group">
        <label>Atlas文件URL：</label>
        <el-input
          type="text"
          size="large"
          v-model="remoteURL.atlasUrl"
          placeholder="输入.atlas文件的HTTP链接"
        />
      </div>
      <div class="control-group">
        <label>Skeleton文件URL：</label>
        <el-input
          type="text"
          size="large"
          v-model="remoteURL.skeletonUrl"
          placeholder="输入.json/.skel文件的HTTP链接"
        />
      </div>
    </el-tab-pane>
    <el-tab-pane label="本地文件" name="local">
      <!-- 本地文件加载 -->
      <div class="control-group">
        <label>选择.atlas文件：</label>
        <input type="file" accept=".atlas" @change="handleAtlasFileSelect" />
      </div>
      <div class="control-group">
        <label>选择.json/.skel文件：</label>
        <input
          type="file"
          accept=".json,.skel"
          @change="handleSkeletonFileSelect"
        />
      </div>
      <div class="control-group">
        <label>选择.png/.jpg文件(可多选)：</label>
        <input
          type="file"
          multiple
          accept=".png,.jpg"
          @change="handleTextureFileSelect"
        />
      </div>
    </el-tab-pane>
    <el-tab-pane label=".zip文件" name="zip">
      <div class="control-group">
        <label>选择.zip文件：</label>
        <input type="file" accept=".zip" @change="handleZIPFileSelect" />
      </div>
    </el-tab-pane>
  </el-tabs>
  <!-- 自定义坐标 -->
  <div v-if="multi" class="control-group">
    <label>自定义坐标：</label>
    <el-form :inline="true" :model="customBounds" class="demo-form-inline">
      <el-form-item label="x">
        <el-input v-model="customBounds.x" placeholder="x" />
      </el-form-item>
      <el-form-item label="y">
        <el-input v-model="customBounds.y" placeholder="y" />
      </el-form-item>
      <el-form-item label="width">
        <el-input v-model="customBounds.width" placeholder="width" />
      </el-form-item>
      <el-form-item label="height">
        <el-input v-model="customBounds.height" placeholder="height" />
      </el-form-item>
    </el-form>
  </div>
  <!-- 动画层级 -->
  <div v-if="multi" class="control-group">
    <label>动画层级：</label>
    <input v-model="options.zIndex" type="number" placeholder="zIndex" />
  </div>
  <!-- 滤镜 -->
  <div class="control-group">
    <label>滤镜选择：</label>
    <el-select v-model="options.filterType" size="large">
      <el-option
        v-for="filter in filters"
        :key="filter.value"
        :value="filter.value"
      />
    </el-select>
  </div>
  <!-- 滤镜参数 -->
  <div v-if="options.filterType === 'custom'" class="control-group inline">
    <el-button type="primary" plain @click="showVSCode"> 查看VS代码 </el-button>
    <el-button type="primary" @click="showFSCode"> 编辑FS代码 </el-button>
  </div>
  <!-- 插槽 -->
  <!-- <slot /> -->
  <!-- 加载完是否自动播放 -->
  <div class="control-group inline">
    <label>加载完是否自动播放：</label>
    <el-switch v-model="options.autoPlay" size="large" />
  </div>
  <!-- 加载完是否绘制首屏 -->
  <div v-if="!options.autoPlay" class="control-group inline">
    <label>加载完是否绘制首屏：</label>
    <el-switch v-model="options.firstRenderScreen" size="large" />
  </div>
  <!-- 是否开启Debug模式 -->
  <div class="control-group inline">
    <label>是否开启Debug模式：</label>
    <el-switch v-model="options.debugMode" size="large" />
  </div>
  <!-- 是否清除上个资源缓存 -->
  <div v-if="!multi" class="control-group inline">
    <label>清除上一个资源缓存：</label>
    <el-switch v-model="options.clearAssetsCache" size="large" />
  </div>
  <!-- 是否统一标准BlendMode -->
  <div class="control-group inline">
    <label>统一标准BlendMode：</label>
    <el-switch v-model="options.uniBlendMode" size="large" />
  </div>
  <!-- 是否开启PremultipliedAlpha -->
  <div class="control-group inline">
    <label>PremultipliedAlpha：</label>
    <el-switch v-model="options.premultipliedAlpha" size="large" />
  </div>
  <!-- 是否动态计算动画边界 -->
  <div v-if="!multi" class="control-group inline">
    <label>动态计算动画的边界：</label>
    <el-switch v-model="options.dynamicCalcBound" size="large" />
  </div>
  <!-- 加载按钮 -->
  <div class="control-group center">
    <button
      style="width: 80%"
      :disabled="isDisabled"
      @click="loadRemoteSpine"
      class="btn btn-primary"
    >
      加载动画
    </button>
  </div>
  <!-- 代码编辑器 -->
  <CodeDrawer v-model:showCode="showVSEditor" :code="vs" language="c" />
  <CodeDrawer
    v-model:showCode="showFSEditor"
    :code="shaderFSCode"
    language="c"
    :readonly="false"
    @save="handleSaveFSCode"
  />
</template>

<script setup lang="ts">
import JSZip from 'jszip';
import { ref, shallowRef, reactive, computed, toRaw, unref, watch } from 'vue';
import { vs, fs } from '@/config/shader';
import useSpineVersion from '@/hooks/useSpineVersion';
import type {
  IBound,
  RemoteOptions,
  RemoteAssets,
  ISpineFilters,
} from '@/types/common';

const { DEFAULT_ASSETS } = useSpineVersion();

const filters = [
  {
    name: '无',
    value: 'none',
  },
  {
    name: '灰白',
    value: 'grayscale',
  },
  {
    name: '模糊',
    value: 'blur',
  },
  {
    name: '自定义FragmentShader',
    value: 'custom',
  },
];

defineProps<{
  multi?: boolean;
}>();

const customBounds = ref<IBound>({
  x: 0,
  y: 0,
  width: 300,
  height: 300,
});

const options = reactive<RemoteOptions>({
  autoPlay: true,
  debugMode: false,
  filterType: 'none' as ISpineFilters['type'],
  filterParams: {} as ISpineFilters['params'],
  firstRenderScreen: true,
  clearAssetsCache: false,
  uniBlendMode: false,
  premultipliedAlpha: false,
  dynamicCalcBound: false,
  zIndex: 0,
});

const emit = defineEmits<{
  (e: 'load', assets: RemoteAssets, options: RemoteOptions): void;
}>();

const showVSEditor = shallowRef(false);
const showFSEditor = shallowRef(false);
const shaderFSCode = shallowRef(fs);

const showVSCode = () => {
  showVSEditor.value = true;
};

const showFSCode = () => {
  showFSEditor.value = true;
};

const handleSaveFSCode = (code: string) => {
  shaderFSCode.value = code;
  options.filterParams = {
    customFragmentShader: code,
  };
};

watch(
  () => options.filterType,
  newVal => {
    if (newVal === 'custom') {
      options.filterParams = {
        customFragmentShader: shaderFSCode.value,
      };
    } else {
      options.filterParams = {};
    }
  }
);

const assetsLoadType = ref<'remote' | 'local' | 'zip'>('remote');
const remoteURL = reactive({
  atlasUrl: DEFAULT_ASSETS.atlas,
  skeletonUrl: DEFAULT_ASSETS.skel,
});
const localURL = reactive<{
  atlasUrl: string;
  skeletonUrl: string;
  fileAlias: Record<string, string>;
}>({
  atlasUrl: '',
  skeletonUrl: '',
  fileAlias: <Record<string, string>>{},
});
const zipURL = reactive<{
  atlasUrl: string;
  skeletonUrl: string;
  fileAlias: Record<string, string>;
}>({
  atlasUrl: '',
  skeletonUrl: '',
  fileAlias: <Record<string, string>>{},
});

const isDisabled = computed(() => {
  if (assetsLoadType.value === 'remote') {
    return !remoteURL.atlasUrl || !remoteURL.skeletonUrl;
  }
  if (assetsLoadType.value === 'zip') {
    return (
      !zipURL.atlasUrl ||
      !zipURL.skeletonUrl ||
      !Object.keys(zipURL.fileAlias).length
    );
  }
  return (
    !localURL.atlasUrl ||
    !localURL.skeletonUrl ||
    !Object.keys(localURL.fileAlias).length
  );
});

const cleanupBlobUrl = (url: string) => {
  if (url) URL.revokeObjectURL(url);
};

const createBlobUrl = (file: File) => {
  return `${URL.createObjectURL(file)}#.${file.name.split('.').pop()}`;
};

// 本地文件加载
const handleAtlasFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    cleanupBlobUrl(localURL.atlasUrl);
    localURL.atlasUrl = createBlobUrl(file);
  }
};

const handleSkeletonFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    cleanupBlobUrl(localURL.skeletonUrl);
    localURL.skeletonUrl = createBlobUrl(file);
  }
};

const handleTextureFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    for (let fileBlob in localURL.fileAlias) {
      cleanupBlobUrl(localURL.fileAlias[fileBlob]);
    }
    for (let file of target.files) {
      localURL.fileAlias[file.name] = createBlobUrl(file);
    }
  }
};

const setZipUrls = async (zip: JSZip) => {
  // 清理旧的blob url
  cleanupBlobUrl(zipURL.atlasUrl);
  cleanupBlobUrl(zipURL.skeletonUrl);
  for (let fileBlob in zipURL.fileAlias) {
    cleanupBlobUrl(zipURL.fileAlias[fileBlob]);
  }
  // 设置新的blob url
  for (const [fileName, zipFile] of Object.entries(zip.files)) {
    if (zipFile.dir) continue; // 跳过目录
    if (fileName.includes('__MACOSX/')) continue; // 跳过macos系统文件

    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    // 根据文件扩展名分类处理
    if (fileExtension === 'atlas') {
      // 处理atlas文件
      const blob = await zipFile.async('blob');
      zipURL.atlasUrl = `${URL.createObjectURL(blob)}#.${fileExtension}`;
    } else if (fileExtension === 'json' || fileExtension === 'skel') {
      // 处理skeleton文件 (json或skel)
      const blob = await zipFile.async('blob');
      zipURL.skeletonUrl = `${URL.createObjectURL(blob)}#.${fileExtension}`;
    } else if (fileExtension === 'png') {
      // 处理PNG纹理文件
      const fileKey = fileName.split('/').pop() || '';
      const blob = await zipFile.async('blob');
      zipURL.fileAlias[fileKey] = `${URL.createObjectURL(
        blob
      )}#.${fileExtension}`;
    }
  }
};

const handleZIPFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    JSZip.loadAsync(file).then(zip => {
      setZipUrls(zip);
    });
  }
};

const getCurrentURL = () => {
  if (assetsLoadType.value === 'remote')
    return {
      atlas: remoteURL.atlasUrl,
      skel: remoteURL.skeletonUrl,
      fileAlias: undefined,
    };
  if (assetsLoadType.value === 'zip')
    return {
      atlas: zipURL.atlasUrl,
      skel: zipURL.skeletonUrl,
      fileAlias: zipURL.fileAlias,
    };
  return {
    atlas: localURL.atlasUrl,
    skel: localURL.skeletonUrl,
    fileAlias: localURL.fileAlias,
  };
};

function loadRemoteSpine() {
  if (isDisabled.value) return;
  emit('load', getCurrentURL(), {
    ...toRaw(options),
    bound: {
      ...unref(customBounds),
    },
  });
}
</script>

<style>
.demo-form-inline .el-input__wrapper {
  margin-left: 8px;
  margin-bottom: 0.5rem;
}
.demo-form-inline .el-form-item {
  margin-right: 8px;
  margin-bottom: 0px;
}
.demo-form-inline .el-form-item__label {
  padding-right: 2px;
}
.demo-form-inline .el-input {
  --el-input-width: 66px;
  --el-input-height: 30px;
}
</style>
