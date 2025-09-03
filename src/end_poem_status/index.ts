import './source/styles/index.scss';

import { createApp } from 'vue';
import App from './source/App.vue';

import type { RouteRecordRaw } from 'vue-router';
import { createMemoryHistory, createRouter } from 'vue-router';

import global from './source/pages/global.vue';
import layout from './source/pages/layout.vue';
import plotRole from './source/pages/plot-role.vue';
import primaryRole from './source/pages/primary-role.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/global',
    component: layout,
    children: [
      {
        path: '/global',
        name: 'Global',
        component: global,
        meta: {
          title: '世界状态',
        },
      },
      {
        path: '/primary-role',
        name: 'PrimaryRole',
        component: primaryRole,
        meta: {
          title: '旅行同伴',
        },
      },
      {
        path: '/plot-role',
        name: 'PlotRole',
        component: plotRole,
        meta: {
          title: '邂逅之人',
        },
      },
    ],
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

const app = createApp(App);

$(() => {
  app.use(router);
  app.mount('#app');
});
