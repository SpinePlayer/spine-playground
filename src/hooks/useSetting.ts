import { reactive, toRaw } from 'vue';
import mitt from 'mitt';
import type { IBackground } from '@/types/common';

type Events = {
  backgroundChange: IBackground;
};

const emitter = mitt<Events>();
const backgroundSetting = reactive<IBackground>({
  color: '',
  imageUrl: '',
  fit: 'cover',
});

export default () => {
  const emitBackgroundChange = () => {
    emitter.emit('backgroundChange', toRaw(backgroundSetting));
  };

  const onBackgroundChange = (
    callback: (payload: Events['backgroundChange']) => void
  ) => {
    emitter.on('backgroundChange', callback);
  };

  return {
    backgroundSetting,
    onBackgroundChange,
    emitBackgroundChange,
  };
};
