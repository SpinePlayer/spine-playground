import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import * as SpinePlayer from 'spine-web-player';
import { SpinePlugins } from 'spine-web-player';
import VSpinePlayer from 'spine-web-player/vue3';
import { DEFAULT_ASSETS, DEFAULT_MULTI_ASSETS } from '@/config/constant';

const spineVersion = ref<'4.1' | '4.2'>('4.2');

export default () => {
  SpinePlugins.clearAll();
  SpinePlugins.use({
    reporter: (type: 'error' | 'warning' | 'info', message: string) => {
      if (type === 'error') {
        ElMessage.error(message);
      } else if (type === 'warning') {
        // ElMessage.warning(`【${ message}】${data}`);
      } else {
        // ElMessage.info(`【${ message}】${data}`);
      }
    },
  });
  return {
    spineVersion,
    SpinePlayer,
    VSpinePlayer,
    DEFAULT_ASSETS,
    DEFAULT_MULTI_ASSETS,
  };
};
