<template>
  <el-drawer
    v-model="showSettingModal"
    :with-header="false"
    size="380px"
    direction="ltr"
    append-to-body
  >
    <!-- 画布背景色 -->
    <el-divider content-position="center">画布背景设置</el-divider>
    <h5 class="setting-title">画布背景色:</h5>
    <el-color-picker-panel
      v-model="backgroundSetting.color"
      show-alpha
      :predefine="predefineColors"
    />
    <!-- 画布背景图 -->
    <h5 class="setting-title">画布背景图:</h5>
    <el-upload
      class="image-uploader"
      drag
      accept="image/*"
      action="#"
      :show-file-list="false"
      :on-change="onBackgroundImageUpload"
      :auto-upload="false"
    >
      <template v-if="backgroundSetting.imageUrl">
        <el-image
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
          :src="backgroundSetting.imageUrl"
          fit="contain"
        />
        <div class="delete-icon" @click="handleRemove">
          <el-icon>
            <Delete />
          </el-icon>
        </div>
      </template>
      <template v-else>
        <el-icon>
          <Plus />
        </el-icon>
        <div class="uploader-text">点击或拖拽图片到此处</div>
      </template>
    </el-upload>
    <!-- 画布背景图适应方式 -->
    <el-radio-group v-model="backgroundSetting.fit" size="small">
      <el-radio-button label="cover" value="cover" />
      <el-radio-button label="contain" value="contain" />
      <el-radio-button label="fill" value="fill" />
      <el-radio-button label="none" value="none" />
      <el-radio-button label="scale-down" value="scale-down" />
    </el-radio-group>
    <!-- 底部按钮 -->
    <div class="drawer-container-footer">
      <el-button
        type="primary"
        plain
        size="large"
        @click="showSettingModal = false"
        >关闭</el-button
      >
      <el-button
        type="primary"
        size="large"
        style="width: 120px; margin-left: 20px"
        @click="handleSaveSetting"
        >保存设置</el-button
      >
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
import type { UploadFile } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import useSetting from '@/hooks/useSetting';

const { backgroundSetting, emitBackgroundChange } = useSetting();

const showSettingModal = defineModel<boolean>({
  type: Boolean,
  default: false,
});

const predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'hsva(120, 40, 94, 0.5)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
];

const onBackgroundImageUpload = (file: UploadFile) => {
  if (file && file.raw) {
    backgroundSetting.imageUrl = URL.createObjectURL(file.raw);
  } else {
    backgroundSetting.imageUrl = '';
  }
};

const handleRemove = () => {
  backgroundSetting.imageUrl = '';
};

const handleSaveSetting = () => {
  showSettingModal.value = false;
  emitBackgroundChange();
};
</script>

<style lang="scss">
.image-uploader {
  position: relative;
  width: 326px;

  .el-upload {
    --el-upload-dragger-padding-horizontal: 70px;
  }

  .uploader-text {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: 400;
    color: $text-dark;
    opacity: 0.7;
  }

  .delete-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    cursor: pointer;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.7);
    font-size: 26px;
    opacity: 0;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }
  }
}

.drawer-container-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.setting-title {
  margin: 10px 0 5px 0;
  font-size: 14px;
  font-weight: 500;
  color: $text-dark;
}
</style>
