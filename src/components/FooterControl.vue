<template>
  <div class="control-group no-margin flex-group">
    <div class="button-group">
      <button
        @click="playAnimation"
        :disabled="!showCvs"
        :class="['btn btn-primary', { 's-padding': type === 'multi' }]"
      >
        <span class="btn-icon">▶️</span>
        开始
      </button>
      <button
        v-if="type === 'multi'"
        @click="stopAnimation"
        :disabled="!showCvs"
        :class="['btn btn-secondary', { 's-padding': type === 'multi' }]"
      >
        <span class="btn-icon">⏹️</span>
        停止
      </button>
      <button
        @click="resumeAnimation"
        :disabled="isPaused !== undefined && !isPaused"
        :class="['btn btn-primary', { 's-padding': type === 'multi' }]"
      >
        <span class="btn-icon">▶️</span>
        恢复
      </button>
      <button
        @click="pauseAnimation"
        :disabled="!showCvs"
        :class="['btn btn-secondary', { 's-padding': type === 'multi' }]"
      >
        暂停
      </button>
      <button
        v-if="type === 'multi'"
        @click="hideAnimation"
        :disabled="!showCvs"
        :class="['btn btn-secondary', { 's-padding': type === 'multi' }]"
      >
        隐藏
      </button>
      <!-- CODE_START -->
      <el-dropdown placement="top">
        <button
          :disabled="!showCvs"
          :class="['btn btn-secondary', { 's-padding': type === 'multi' }]"
        >
          <span class="btn-icon">📑</span>
          高级功能
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="onShowCoding"
              >在线Coding</el-dropdown-item
            >
            <el-dropdown-item @click="showCodeDemo = true"
              >查看使用代码</el-dropdown-item
            >
            <el-dropdown-item @click="onShowSlotData"
              >查看插槽数据</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- CODE_END -->
    </div>
  </div>
  <!-- CODE_START -->
  <!-- 使用代码展示 -->
  <code-drawer
    v-model:showCode="showCodeDemo"
    language="javascript"
    :code="useCode"
  />
  <!-- 在线Coding -->
  <code-drawer
    v-model:showCode="showCoding"
    saveText="执行代码"
    language="javascript"
    :readonly="false"
    :code="codingDemo"
    @save="onExecCode"
  />
  <!-- CODE_END -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  multiCodingDemo,
  singleCodingDemo,
  multiUseCodeDemo,
  vueUseCodeDemo,
  singleUseCodeDemo,
} from '@/config/codeDemo';

const showCodeDemo = ref(false);
const showCoding = ref(false);
const codingDemo = ref('');

const props = defineProps<{
  showCvs: boolean;
  isPaused?: boolean;
  type: 'single' | 'vue' | 'multi';
}>();

const useCode = computed(() => {
  if (props.type === 'multi') {
    return multiUseCodeDemo;
  } else if (props.type === 'vue') {
    return vueUseCodeDemo;
  } else if (props.type === 'single') {
    return singleUseCodeDemo;
  }
  return '';
});

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'stop'): void;
  (e: 'resume'): void;
  (e: 'pause'): void;
  (e: 'hide'): void;
  (e: 'showSlotData'): void;
  (e: 'execCode', code: string): void;
}>();

const playAnimation = () => {
  emit('start');
};

const stopAnimation = () => {
  emit('stop');
};

const resumeAnimation = () => {
  emit('resume');
};

const pauseAnimation = () => {
  emit('pause');
};

const hideAnimation = () => {
  emit('hide');
};

const onShowSlotData = () => {
  emit('showSlotData');
};

const onExecCode = (code: string) => {
  codingDemo.value = code;
  emit('execCode', code);
};

const onShowCoding = () => {
  if (props.type === 'multi') {
    codingDemo.value = multiCodingDemo;
  } else {
    codingDemo.value = singleCodingDemo;
  }
  showCoding.value = true;
};
</script>
