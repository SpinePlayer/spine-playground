<template>
  <el-dialog v-model="showPreviewModal" center title="手机预览" width="620" body-class="preview-modal-body">
    <el-row>
      <el-col :span="14">
        <el-form-item label="Atlas文件URL：" label-position="top">
          <el-input v-model="assets.atlas" clearable />
        </el-form-item>
        <el-form-item label="Skeleton文件URL：" label-position="top">
          <el-input v-model="assets.skel" clearable />
        </el-form-item>
        <el-alert type="info" show-icon :closable="false">
          <p>请输入要预览的文件URL，然后扫码预览</p>
        </el-alert>
      </el-col>
      <el-col :span="1"></el-col>
      <el-col :span="1">
        <div class="split-line"></div>
      </el-col>
      <el-col :span="8">
        <div :class="['qrcode-container', isDisabled ? 'disabled' : '']">
          <qrcode-vue :value="mobileUrl" :size="150" />
        </div>
        <div class="qrcode-text">
          <p v-if="!isDisabled">使用手机扫描二维码</p>
          <p v-else>请先输入真机预览的文件URL</p>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script setup lang="ts">
import qs from 'qs';
import { reactive, computed } from 'vue';
import { MOBILE_URL } from '@/config/constant';
import QrcodeVue from 'qrcode.vue';
import useSpineVersion from '@/hooks/useSpineVersion';

const { spineVersion, DEFAULT_ASSETS } = useSpineVersion();

const showPreviewModal = defineModel({
  type: Boolean,
  default: false,
});

const assets = reactive({
  atlas: DEFAULT_ASSETS.atlas,
  skel: DEFAULT_ASSETS.skel,
});

const isDisabled = computed(() => {
  return !assets.atlas || !assets.skel;
});

const mobileUrl = computed(() => {
  return `${MOBILE_URL}&${qs.stringify({
    version: spineVersion.value,
    atlas: encodeURIComponent(assets.atlas),
    skel: encodeURIComponent(assets.skel),
  })}`;
});
</script>

<style lang="scss">
.preview-modal-body {
  padding: 20px 10px;
}
</style>
<style lang="scss" scoped>
.split-line {
  width: 1px;
  height: 100%;
  background-color: #e5e5e5;
}

.qrcode-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  margin: 0 auto;

  &.disabled {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #fff;
      opacity: 0.97;
      border-radius: 10px;
    }
  }
}
.qrcode-text {
  text-align: center;
  font-size: 13px;
  color: #888;
  margin-top: 6px;
}
</style>
