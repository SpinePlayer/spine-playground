/**
 * 多动画获取插槽替换
 */
export const multiCodingDemo = `
/**
 * ‼️外层main函数不可修改，函数内部代码可修改
 */
// 修改插槽文字演示
function main(spineManager) {
  // 创建纹理图片
  const fontConfig = {
    color: 'red',
    width: 324,
    height: 82,
    fontSize: 50,
    fontWeight: 500,
    hasShadow: true,
    shadowColor: '#FFA800',
  };
  const fontTexture = getTextImage('我是自定义的', fontConfig);
  // 加载纹理图片
  spineManager.assetManager?.loadTexture(fontTexture);
  // 替换插槽数据
  spineManager.assetManager?.loadAll().then(() => {
    spineManager.hackTextureBySlotName('spineboy', 'gun', fontTexture);
  });


  // 获取文本图片--工具函数
  function getTextImage(text, config) {
    const fontCanvas = document.createElement('canvas');
    const ratio = 2;
    fontCanvas.width = (config.width || 120) * ratio; // resize
    fontCanvas.height = (config.height || 27) * ratio;
    const fontSize = (config.fontSize || 28) * ratio;
    const lineHeight = (config.lineHeight || 32) * ratio;
    const fontContext = fontCanvas.getContext('2d');
    const fontWeight = config.fontWeight || 400;
    fontContext.font = \`\${fontWeight} \${fontSize}px "PingFang SC", Arial\`;
    fontContext.textAlign = 'center';
    fontContext.textBaseline = config.textBaseline || 'middle';
    fontContext.fillStyle = config.color || '#FFF0B3';
    // shadow
    if (config.hasShadow) {
      fontContext.shadowColor = config.shadowColor ?? 'rgba(0, 0, 0, 0.5)';
      fontContext.shadowBlur = 6;
      fontContext.shadowOffsetX = 0;
      fontContext.shadowOffsetY = 0;
    }
    drawWrappedText(
      fontContext,
      text,
      fontCanvas.width / 2,
      config.verticalAligin === 'top' ? 0 : fontCanvas.height / 2,
      fontCanvas.width,
      lineHeight
    );
    return fontCanvas.toDataURL();
  }
  // 绘制文本--工具函数
  function drawWrappedText(
    context,
    text,
    x,
    y,
    maxWidth,
    lineHeight
  ) {
    const words = text.split(' ');
    let line = '';
    let offsetY = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        context.fillText(line, x, y + offsetY);
        line = words[i] + ' ';
        offsetY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y + offsetY);
  }
}
`;

/**
 * 单动画在线Coding演示代码
 */
export const singleCodingDemo = `
/**
 * ‼️外层main函数不可修改，函数内部代码可修改
 */
function main(spinePlayer) {
  // 停止动画
  spinePlayer?.stop();
}`;

export const singleUseCodeDemo = `
import { SpinePlayer } from 'spine-web-player';

// 创建播放器实例
const spinePlayer = new SpinePlayer(canvasEl.value, {
  type: 'auto',
  onUpdate: (drawCall?: number) => {
    console.log(drawCall);
  },
});
// 加载spine动画
spinePlayer.loadSpine({
  assets: {
    atlas: 'https://demo.com/static/spine/mix-pma.atlas',
    skel: 'https://demo.com/spine/mix-pro.json',
  },
  loop: spineConf.loop, // 是否循环播放
  filters: { // 滤镜
    type: options?.filterType,
    params: options?.filterParams,
  },
  autoPlay: options?.autoPlay, // 是否自动播放
  debugMode: options?.debugMode, // 是否开启调试模式
  uniBlendMode: options?.uniBlendMode, // 是否开启混合模式
  renderFirstScreen: options?.firstRenderScreen, // 是否渲染第一帧
  cleanAssetsCache: options?.clearAssetsCache, // 是否清除缓存
  premultipliedAlpha: options?.premultipliedAlpha, // 是否开启预乘alpha
});
`;

export const vueUseCodeDemo = `
<template>
  <VSpinePlayer
    ref="spinePlayerRef"
    :loop="spineConf.loop"
    :assets="assets"
    :debugMode="spineConf.debugMode"
    :autoPlay="spineConf.autoPlay"
    :filters="spineConf.filters"
    :uniBlendMode="spineConf.uniBlendMode"
    :animationName="spineInfo.animationName"
    :cleanAssetsCache="spineConf.cleanAssetsCache"
    :renderFirstScreen="spineConf.renderFirstScreen"
    @loaded="onLoaded"
    @update="onUpdate"
  />
</template>

<script setup lang="ts">
import { shallowRef, shallowReactive, watch, onMounted } from 'vue';
import { VSpinePlayer, SpinePlayer } from 'spine-web-player';

// Spine播放器实例
let spinePlayer: SpinePlayer | null = null;
const spinePlayerRef = shallowRef<typeof VSpinePlayer>();
onMounted(() => {
  spinePlayer = spinePlayerRef.value?.getPlayer();
});

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
  spineInfo.bounds = JSON.stringify({
    width: spinePlayer.spineBounds.width?.toFixed(1) || 0,
    height: spinePlayer.spineBounds.height?.toFixed(1) || 0,
  });
  spineInfo.events = spinePlayer.spineEvents || [];
  skeletonSlotsData.value =
    JSON.stringify(spinePlayer.skeleton.data.slots, null, 2) || '';
  // reset data
  spineConf.mixDuration = 0.2;
  spineConf.timeScale = 1;
}
</script>
`

export const multiUseCodeDemo = `
import { SpineManage, SpineTools } from 'spine-web-player';

// Spine播放器实例
let spineManager: SpineManage | null = null;
function initSpinePlayer() {
  if (canvasEl.value) {
    // 创建播放器实例
    spineManager = new SpineManage(canvasEl.value, {
      onUpdate: (drawCall?: number) => {
        performanceInfo.drawCalls = drawCall || 0;
      },
    });
  }
}

// 加载spine动画
function loadSpine(assets, options, uniqueID) {
  const uuid = uniqueID || SpineTools.getRandomUUID();
  spineManager.loadSpine({
    uuid,
    assets,
    loop: spineConf.loop,
    bound: options?.bound,
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
}
`
