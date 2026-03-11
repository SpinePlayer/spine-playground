import { reactive, onBeforeUnmount } from 'vue';
import type {
  SpinePlayer as ISpinePlayer,
  SpineManage as ISpineManage,
  IBonePosition
} from '@/types/common';

export const currentSlot = reactive({
  name: '',
  x: 0,
  y: 0,
  color: 'red',
  // scaleX: 1,
  // scaleY: 1,
  // rotation: 0,
});

export default () => {
  let spineUuid: string | null = null;
  let spinePlayer: ISpinePlayer | null = null;
  let spineManage: ISpineManage | null = null;

  const setPlayerInstance = (player: ISpinePlayer) => {
    if (!player) return;
    spinePlayer = player;
  };

  const setManageInstance = (manage: ISpineManage) => {
    if (!manage) return;
    spineManage = manage;
  };

  const setSpineUuid = (uuid: string, slotName?: string) => {
    if (!uuid) return;
    spineUuid = uuid;
    if (spineManage) {
      // @ts-expect-error
      spineManage.renderArray?.forEach(item => {
        if (item) item.followSlots?.clear();
      });
    }
    if (slotName) {
      onSlotNameChange(slotName)
    } else {
      clearSlotData();
    }
  };

  const clearSlotData = () => {
    currentSlot.name = '';
    currentSlot.x = 0;
    currentSlot.y = 0;
  };

  const clearAllSlotEvents = () => {
    clearSlotData();
    if (spinePlayer) {
      // @ts-expect-error
      spinePlayer.instance.followSlots?.clear();
    } else if (spineManage) {
      // @ts-expect-error
      spineManage.renderArray?.forEach(item => {
        if (item) item.followSlots?.clear();
      });
    }
  };

  const onSlotNameChange = (newVal: string) => {
    /* 清除旧的插槽监听 */
    if (spinePlayer) {
      // @ts-expect-error
      spinePlayer.instance.followSlots?.clear();
    } else if (spineManage && spineUuid) {
      const item = spineManage.getPlayStatus(spineUuid);
      if (item) item.followSlots?.clear();
    }
    /* 添加新的插槽监听 */
    if (newVal && spinePlayer) {
      currentSlot.name = newVal;
      spinePlayer.addSlotFollowListener(newVal, (bone?: IBonePosition) => {
        if (!bone) return;
        currentSlot.x = bone.x || 0;
        currentSlot.y = bone.y || 0;
      });
    } else if (newVal && spineManage && spineUuid) {
      currentSlot.name = newVal;
      spineManage.addSlotFollowListener(spineUuid, newVal, (bone?: IBonePosition) => {
        if (!bone) return;
        currentSlot.x = bone.x || 0;
        currentSlot.y = bone.y || 0;
      });
    } else {
      clearSlotData();
    }
  }

  onBeforeUnmount(() => {
    spineUuid = null;
    spinePlayer = null;
    spineManage = null;
    clearSlotData();
  });

  return {
    currentSlot,
    setSpineUuid,
    setPlayerInstance,
    setManageInstance,
    onSlotNameChange,
    clearAllSlotEvents
  };
};
