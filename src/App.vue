<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <div class="header-actions">
          <h1 class="logo">spine-web-player</h1>
          <!-- <div class="version-selector">
            <label class="version-label">版本：</label>
            <div class="version-wrapper">
              <div
                class="custom-select"
                @click="toggleDropdown"
                :class="{ open: isDropdownOpen }"
              >
                <div class="select-display">
                  <span class="select-text">{{ spineVersion }}</span>
                  <svg
                    class="select-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div class="dropdown-menu" v-if="isDropdownOpen">
                  <div
                    class="dropdown-item"
                    :class="{ active: spineVersion === '4.2' }"
                    @click="selectVersion('4.2')"
                  >
                    <span class="version-number">4.2</span>
                  </div>
                  <div
                    class="dropdown-item"
                    :class="{ active: spineVersion === '4.1' }"
                    @click="selectVersion('4.1')"
                  >
                    <span class="version-number">4.1</span>
                  </div>
                </div>
              </div>
            </div>
          </div> -->
          <nav class="nav">
            <router-link :to="getVersionPath('/single')" class="nav-link"
              >单动画</router-link
            >
            <router-link :to="getVersionPath('/vue')" class="nav-link"
              >Vue3组件</router-link
            >
            <router-link :to="getVersionPath('/multi')" class="nav-link"
              >多动画管理</router-link
            >
          </nav>
        </div>
        <!-- CODE_START -->
        <div class="header-actions">
          <div class="api-btn" @click="showSettingModal = true">
            <el-icon :size="25">
              <Setting />
            </el-icon>
          </div>
          <div class="api-btn" @click="showPreviewModal = true">
            <el-icon :size="25">
              <Iphone />
            </el-icon>
          </div>
          <a :href="API_DOCS_URL" target="_blank" class="api-link"> API文档 </a>
        </div>
        <!-- CODE_END -->
      </div>
    </header>

    <main class="main">
      <router-view v-if="isReady" :key="spineVersion" />
    </main>
  </div>

  <PreviewModal v-model="showPreviewModal" />
  <SettingModal v-model="showSettingModal" />
</template>

<script setup lang="ts">
// import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import { Iphone, Setting } from '@element-plus/icons-vue';
import { API_DOCS_URL } from '@/config/constant';
import useSpineVersion from '@/hooks/useSpineVersion';

// const router = useRouter();
const { spineVersion } = useSpineVersion();

const isReady = ref(true);
const isDropdownOpen = ref(false);
const showPreviewModal = ref(false);
const showSettingModal = ref(false);

// https://esotericsoftware.com/spine-api-reference

// const toggleDropdown = () => {
//   isDropdownOpen.value = !isDropdownOpen.value;
// };

// const selectVersion = (version: '4.1' | '4.2') => {
//   spineVersion.value = version;
//   isDropdownOpen.value = false;
//   handleVersionChange();
// };

// const handleVersionChange = () => {
//   console.log('版本切换到:', spineVersion.value);

//   // 获取当前路由信息
//   const currentRoute = router.currentRoute.value;
//   const currentPath = currentRoute.path;

//   // 根据版本调整路径
//   let newPath: string;

//   if (spineVersion.value === '4.1') {
//     // 4.1版本：确保路径以 /4.1/ 开头
//     if (currentPath.startsWith('/4.1/')) {
//       newPath = currentPath; // 已经是4.1路径，保持不变
//     } else if (currentPath === '/4.1') {
//       newPath = '/4.1/'; // 根路径
//     } else {
//       // 其他路径，添加 /4.1 前缀
//       newPath = `/4.1${currentPath}`;
//     }
//   } else {
//     // 4.2版本：移除 /4.1/ 前缀，使用原始路径
//     if (currentPath.startsWith('/4.1/')) {
//       newPath = currentPath.replace('/4.1', '');
//       if (newPath === '') newPath = '/'; // 处理根路径
//     } else {
//       newPath = currentPath; // 保持当前路径
//     }
//   }

//   // 如果路径发生变化，进行路由跳转
//   if (newPath !== currentPath) {
//     router.push(newPath);
//   }
// };

const getVersionPath = (path: string) => {
  if (spineVersion.value === '4.1') {
    return `/4.1${path}`;
  }
  return path;
};

// const getVersionFromPath = (path: string): string => {
//   if (path.startsWith('/4.1')) {
//     return '4.1';
//   }
//   return '4.2';
// };

// const initVersion = async () => {
//   await router.isReady();
//   const currentRoute = router.currentRoute.value;
//   const currentPath = currentRoute.path;
//   const version = getVersionFromPath(currentPath);
//   spineVersion.value = version as '4.1' | '4.2';
//   console.log('初始化版本:', version, '路径:', currentPath);
//   isReady.value = true;
// };

// 点击外部关闭下拉框
const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest('.custom-select')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  // initVersion();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use './styles/var.scss' as *;

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  color: $white;
  padding: 0.3rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}

.nav {
  display: flex;
  gap: 0.2rem;
}

.nav-link {
  color: $white;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba($white, 0.1);
    transform: translateY(-1px);
  }

  &.router-link-active {
    background: rgba($white, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.version-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.version-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.version-label {
  color: $white;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0.9;
}

.custom-select {
  position: relative;
  background: rgba($white, 0.08);
  color: $white;
  border: 1px solid rgba($white, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 80px;
  user-select: none;

  &:hover {
    background-color: rgba($white, 0.12);
    border-color: rgba($white, 0.4);
    transform: translateY(-1px);
  }

  &.open {
    background-color: rgba($white, 0.15);
    border-color: rgba($white, 0.5);
    box-shadow: 0 0 0 3px rgba($white, 0.1);

    .select-arrow {
      transform: rotate(180deg);
    }
  }
}

.select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.select-text {
  color: $white;
}

.select-arrow {
  color: $white;
  transition: transform 0.3s ease;
  margin-left: 0.5rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba($white, 0.2);
  border-radius: 8px;
  margin-top: 0.25rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
  animation: dropdownSlide 0.2s ease-out;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba($white, 0.1);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  }

  &.active {
    background: linear-gradient(
      135deg,
      $primary-color 0%,
      $secondary-color 100%
    );
    color: $white;
  }
}

.version-number {
  font-weight: 600;
  font-size: 0.9rem;
}

.version-label-text {
  font-size: 0.8rem;
  opacity: 0.8;
  font-weight: 400;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.api-link {
  color: $white;
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border: 2px solid rgba($white, 0.3);
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
  box-sizing: border-box;

  &:hover {
    background: rgba($white, 0.1);
    border-color: rgba($white, 0.5);
    transform: translateY(-1px);
  }
}

.api-btn {
  @extend .api-link;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 70px;
  min-height: 100vh;
}
</style>
