import { ref, onBeforeUnmount } from "vue";


export default (onUpdate?: () => void) => {
  const fps = ref(0);
  let frameCount = 0;
  let lastTime = performance.now();
  let animationFrameId: number;

  const calculateMetrics = () => {
    const currentTime = performance.now();
    frameCount++;
    if (currentTime - lastTime >= 1000) {
      fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
    }
    onUpdate?.();
    animationFrameId = requestAnimationFrame(calculateMetrics);
  }
  calculateMetrics();

  const stopFPS = () => {
    cancelAnimationFrame(animationFrameId);
  }

  onBeforeUnmount(() => {
    stopFPS()
  })

  return {
    fps,
    stopFPS
  }
}