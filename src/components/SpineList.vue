<template>
  <div class="spine-list">
    <div class="list-header">
      <h4 class="sub-title">已加载的SPINE</h4>
      <span class="list-count">{{ spineList.length }} 个</span>
    </div>
    <div class="list-content">
      <div
        v-for="(spineId, index) in spineList"
        :key="spineId"
        class="spine-item"
        :class="{ 'spine-item--selected': selectedSpineId === spineId }"
        @click="selectSpine(spineId)"
      >
        <div class="spine-item-content">
          <div class="spine-item-icon">🎬</div>
          <div class="spine-item-info">
            <div class="spine-item-name">Spine资源 {{ index + 1 }}</div>
            <div class="spine-item-id">UUID: {{ spineId }}</div>
          </div>
          <div class="spine-item-status">
            <span
              class="status-dot"
              :class="{ 'status-dot--active': selectedSpineId === spineId }"
            ></span>
          </div>
        </div>
        <el-button
          type="danger"
          :icon="Delete"
          circle
          @click="deleteSpine(spineId)"
        />
      </div>
      <div v-if="spineList.length === 0" class="empty-list">
        <div class="empty-icon">📁</div>
        <div class="empty-text">暂无加载的动画</div>
        <div class="empty-hint">请先加载Spine资源</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue';

withDefaults(
  defineProps<{
    spineList: string[];
    selectedSpineId: string;
  }>(),
  {
    spineList: () => [],
    selectedSpineId: () => '',
  }
);

const emit = defineEmits<{
  (e: 'selectSpine', spineId: string): void;
  (e: 'deleteSpine', spineId: string): void;
}>();

const selectSpine = (spineId: string) => {
  emit('selectSpine', spineId);
};

const deleteSpine = (spineId: string) => {
  emit('deleteSpine', spineId);
};
</script>

<style scoped lang="scss">
.spine-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .list-count {
      font-size: 0.8rem;
      color: $text-light;
      background: rgba($primary-color, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
    }
  }

  .list-content {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 344px);
    gap: 0.5rem;
    overflow-y: auto;
    padding: 0.2rem 0;
  }

  .spine-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border: 1px solid $border-color;
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 2px 8px rgba($primary-color, 0.1);
      transform: translateY(-1px);
    }

    &--selected {
      border-color: $primary-color;
      background: linear-gradient(
        135deg,
        rgba($primary-color, 0.05),
        rgba($primary-color, 0.1)
      );
      box-shadow: 0 4px 12px rgba($primary-color, 0.15);

      .spine-item-name {
        color: $primary-color;
        font-weight: 600;
      }

      .status-dot {
        background: $primary-color;
        box-shadow: 0 0 8px rgba($primary-color, 0.5);
      }
    }

    .spine-item-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .spine-item-icon {
      font-size: 1.2rem;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spine-item-info {
      flex: 1;
      text-align: left;

      .spine-item-name {
        font-weight: 500;
        color: $text-dark;
        font-size: 0.9rem;
        margin-bottom: 0.2rem;
      }

      .spine-item-id {
        font-size: 0.75rem;
        color: $text-light;
        font-family: monospace;
      }
    }

    .spine-item-status {
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ccc;
        transition: all 0.2s ease;

        &--active {
          background: $primary-color;
        }
      }
    }
  }

  .empty-list {
    text-align: center;
    padding: 2rem 1rem;
    color: $text-light;

    .empty-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .empty-text {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .empty-hint {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }
}
</style>
