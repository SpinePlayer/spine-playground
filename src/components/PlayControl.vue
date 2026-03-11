<template>
  <!-- 动画播放控制 -->
  <div class="control-section">
    <!-- 是否循环播放 -->
    <div class="control-group inline">
      <label>循环：</label>
      <el-switch
        v-model="spineConf.loop"
        size="large"
        @change="changeAnimation"
      />
    </div>
    <!-- 皮肤切换 -->
    <div class="control-group">
      <label>皮肤：</label>
      <el-select
        v-model="spineInfo.skinName"
        size="large"
        :disabled="!spineInfo.skins.length"
        @change="changeSkin"
      >
        <el-option 
          v-for="skin in spineInfo.skins" 
          :key="skin" 
          :label="skin" 
          :value="skin" 
        />
      </el-select>
    </div>
    <!-- 动画切换 -->
    <div class="control-group">
      <label>动画：</label>
      <el-select
        v-model="spineInfo.animationName"
        size="large"
        :disabled="!spineInfo.animations.length"
        @change="changeAnimation"
      >
        <el-option 
          v-for="anim in spineInfo.animations" 
          :key="anim" 
          :label="anim" 
          :value="anim" 
        />
      </el-select>
    </div>
    <!-- 动画过渡时间 -->
    <div class="control-group">
      <label>动画过渡时间：</label>
      <input
        type="number"
        v-model="spineConf.mixDuration"
        placeholder="animation mix duration"
      />
    </div>
    <!-- 动画层级 -->
    <div v-if="multi" class="control-group">
      <label>动画显示层级：</label>
      <input
        v-model="spineConf.zIndex"
        type="number"
        placeholder="zIndex"
        @change="changeZIndex"
      />
    </div>
    <!-- 缩放 -->
    <div v-if="!multi" class="control-group">
      <label>动画大小缩放：</label>
      <el-slider
        v-model="spineConf.customScale"
        :min="0.1"
        :max="1.5"
        :step="0.1"
        show-input
        @change="changeCustomScale"
      />
    </div>
    <!-- 倍速 -->
    <div class="control-group">
      <label>动画播放倍速：</label>
      <el-slider
        v-model="spineConf.timeScale"
        :min="0.1"
        :max="5"
        :step="0.2"
        show-input
        @change="changeTimeScale"
      />
    </div>
  </div>
  <!-- 动画标注 -->
  <div class="control-section">
    <div class="control-group">
      <label>插槽位置标注：</label>
      <el-select
        v-model="spineInfo.slotName"
        size="large"
        :clearable="true"
        :value-on-clear="''"
        placeholder="请选择插槽位置标注"
        :disabled="!spineInfo.soltNames.length"
        @change="onSlotNameChange"
      >
        <el-option
          v-for="slotName in spineInfo.soltNames" 
          :key="slotName" 
          :label="slotName" 
          :value="slotName"
        />
      </el-select>
    </div>
    <div class="control-group inline">
      <label>插槽标注颜色：</label>
      <el-color-picker 
        v-model="currentSlot.color" 
        :clearable="false" 
        size="large" 
        :predefine="predefineColors" 
      />
    </div>
  </div>
  <!-- 动画信息展示 -->
  <div class="info-section">
    <div v-if="multi" class="events-section">
      <h5 class="sub-title">自定义坐标</h5>
      <div class="events-list">
        <el-descriptions
          v-if="spineInfo.customBounds"
          class="margin-top"
          :column="2"
          size="small"
          border
        >
          <el-descriptions-item>
            <template #label> x </template>
            {{ spineInfo.customBounds.x }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> width </template>
            {{ spineInfo.customBounds.width }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> y </template>
            {{ spineInfo.customBounds.y }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> height </template>
            {{ spineInfo.customBounds.height }}
          </el-descriptions-item>
        </el-descriptions>
        <div v-else class="no-events">暂无自定义坐标信息</div>
      </div>
    </div>
    <div class="events-section">
      <h5 class="sub-title">事件信息</h5>
      <div class="events-list">
        <div
          v-for="event in spineInfo.events"
          :key="event.id"
          class="event-item"
        >
          <span class="event-name">{{ event.name }}</span>
          <!-- <span class="event-time">value: {{ event.intValue }}</span> -->
        </div>
        <div v-if="!spineInfo.events?.length" class="no-events">暂无事件</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ISpineInfo } from '@/types/common';
import { currentSlot } from '@/hooks/useSpineSlots';

withDefaults(
  defineProps<{
    multi?: boolean; // 是否是多动画
    spineInfo: ISpineInfo;
    spineConf: any;
  }>(),
  {
    spineInfo: () => <ISpineInfo>{},
    spineConf: () => ({}),
  }
);

const predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
];

const emit = defineEmits([
  'changeSkin',
  'changeTimeScale',
  'changeAnimation',
  'changeCustomScale',
  'changeZIndex',
  'onSlotNameChange',
]);

const changeSkin = () => {
  emit('changeSkin');
};
const changeAnimation = () => {
  emit('changeAnimation');
};
const changeTimeScale = () => {
  emit('changeTimeScale');
};
const changeCustomScale = () => {
  emit('changeCustomScale');
};
const changeZIndex = () => {
  emit('changeZIndex');
};
const onSlotNameChange = (newVal: string) => {
  emit('onSlotNameChange', newVal);
};
</script>

<style lang="scss" scoped>
.events-section {
  margin-top: 1rem;
}

.events-list {
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid $border-color;
  border-radius: 6px;
  background: $white;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid $border-color;
  font-size: 0.85rem;

  &.start {
    justify-content: flex-start;
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba($primary-color, 0.05);
  }
}

.event-name {
  font-weight: 500;
  color: $text-dark;
}

.event-time {
  color: $text-muted;
  font-family: monospace;
}

.no-events {
  padding: 1rem;
  text-align: center;
  color: $text-muted;
  font-style: italic;
}
</style>
