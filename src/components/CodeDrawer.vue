<template>
  <el-drawer
    v-model="showCode"
    size="50%"
    :with-header="false"
    body-class="code-drawer-body"
    direction="ltr"
    append-to-body
  >
    <div ref="codeContainer" class="code-container"></div>
    <div v-if="!readonly" class="code-container-footer">
      <el-button type="primary" plain size="large" @click="showCode = false"
        >关闭</el-button
      >
      <el-button
        type="primary"
        size="large"
        style="width: 120px; margin-left: 20px"
        @click="handleSave"
        >{{ saveText || '保存代码' }}</el-button
      >
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
// import { editor } from "monaco-editor";

const showCode = defineModel<boolean>('showCode', {
  type: Boolean,
  default: false,
});

const props = withDefaults(
  defineProps<{
    title?: string;
    code: string;
    language?: string;
    readonly?: boolean;
    saveText?: string;
  }>(),
  {
    readonly: true,
  }
);

const codeContainer = ref<HTMLDivElement>();

let editorIns: any;
let monacoGlobal: any;

async function initEditor() {
  await nextTick();
  if (!codeContainer.value || !monacoGlobal) return;
  if (editorIns) {
    editorIns.dispose();
  }

  editorIns = monacoGlobal.editor.create(codeContainer.value, {
    value: props.code,
    language: props.language || 'json',
    theme: 'vs-dark',
    lineNumbers: 'on',
    folding: true,
    readOnly: props.readonly ?? true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    contextmenu: false,
  });
}

function loadMonaco() {
  try {
    if (typeof (window as any).require === 'undefined') {
      console.error(
        'Monaco Editor loader not found. Please check CDN loading.'
      );
      return;
    }
    (window as any).require(['vs/editor/editor.main'], function (monaco: any) {
      // console.log('Monaco loaded successfully:', monaco);
      monacoGlobal = monaco;
    });
  } catch (error) {
    console.error('Failed to initialize Monaco Editor:', error);
  }
}

/**
 * 处理窗口变化
 */
function handleResize() {
  if (editorIns) editorIns.layout();
}

/**
 * 保存代码
 */
const emit = defineEmits<{
  (e: 'save', code: string): void;
}>();
function handleSave() {
  emit('save', editorIns.getValue());
  setTimeout(() => {
    showCode.value = false;
  }, 100);
}

watch(showCode, newVal => {
  if (newVal) {
    initEditor();
  } else {
    editorIns?.dispose();
  }
});

onMounted(() => {
  loadMonaco();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  editorIns?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss">
.code-drawer-body {
  padding: 0;
}
</style>
<style scoped lang="scss">
.code-container {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: left !important;
}

.code-container-footer {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
