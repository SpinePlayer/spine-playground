import { reactive } from 'vue';

export default () => {
  const playProgress = reactive({
    current: 0, // 当前播放时间
    duration: 0, // 动画总时长
    percentage: 0, // 播放百分比
  });

  // 更新播放进度
  const updatePlayProgress = (animationState: any) => {
    if (!animationState) return;

    const tracks = animationState.tracks;
    if (tracks && tracks.length > 0 && tracks[0]) {
      const track = tracks[0];
      playProgress.duration = track.animation?.duration || 0;
      playProgress.current = track.animationLast || 0;
      if (playProgress.duration > 0) {
        playProgress.percentage =
          (playProgress.current / playProgress.duration) * 100;
      } else {
        playProgress.percentage = 0;
      }
    }
  };

  // 跳转到指定时间
  const seekToTime = (spinePlayer: any, time: number, uuid?: string) => {
    if (!spinePlayer) return;
    if (uuid) {
      spinePlayer.seekToTime(uuid, time);
    } else {
      spinePlayer.seekToTime(time);
    }
  };

  // 处理进度条拖动
  const handleProgressChange = (
    spinePlayer: any,
    percentage: number,
    uuid?: string
  ) => {
    const targetTime = (percentage / 100) * playProgress.duration;
    playProgress.percentage = percentage;
    playProgress.current = targetTime;
    seekToTime(spinePlayer, targetTime, uuid);
  };

  return {
    playProgress,
    updatePlayProgress,
    seekToTime,
    handleProgressChange,
  };
};
