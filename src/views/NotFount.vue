<template>
  <div class="not-found-container">
    <el-empty description="页面不存在" image-size="200">
    <el-button size="large" type="primary" @click="goHome">返回</el-button>
  </el-empty>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import useSpineVersion from '@/hooks/useSpineVersion';

const router = useRouter();
const { spineVersion } = useSpineVersion();

const goHome = () => {
  const homePath = spineVersion.value === '4.1' ? '/4.1/single' : '/single';
  router.push(homePath);
};
</script>


<style scoped lang="scss">
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  height: calc(100vh - 220px);
}
</style>