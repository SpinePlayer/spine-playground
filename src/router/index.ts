import { createRouter, createWebHashHistory } from 'vue-router';
import SingleAnimation from '@/views/SingleAnimation.vue';
import VueAnimation from '@/views/VueAnimation.vue';
import MultiAnimation from '@/views/MultiAnimation.vue';
import NotFount from '@/views/NotFount.vue';

const commonRoutes = (version: '4.1' | '4.2', prefix: string) => [
  {
    path: `${prefix}single`,
    name: `SingleAnimation-${version}`,
    component: SingleAnimation,
  },
  {
    path: `${prefix}vue`,
    name: `ComponentAnimation-${version}`,
    component: VueAnimation,
  },
  {
    path: `${prefix}multi`,
    name: `MultiAnimation-${version}`,
    component: MultiAnimation,
  },
];

const routes = [
  // 4.2版本路由（默认）
  {
    path: '/',
    redirect: '/single',
  },
  ...commonRoutes('4.2', '/'),

  // 4.1版本路由
  // {
  //   path: '/4.1',
  //   children: [
  //     {
  //       path: '',
  //       redirect: '/4.1/single',
  //     },
  //     ...commonRoutes('4.1', ''),
  //   ],
  // },

  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFount,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
