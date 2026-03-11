import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/global.scss';
import './styles/common.scss';
import 'element-plus/theme-chalk/el-message.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
