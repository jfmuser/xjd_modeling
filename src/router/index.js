import { createRouter, createWebHashHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import BareLayout from '../layouts/BareLayout.vue';
import PublicLayout from '../layouts/PublicLayout.vue';
import LoginView from '../views/LoginView.vue';
import NotAllowed from '../views/NotAllowed.vue';
import NotFound from '../views/NotFound.vue';

export const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: {
      layout: PublicLayout,
      public: true,
      breadcrumbDisabled: true,
    },
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      layout: MainLayout,
      breadcrumbDisabled: true,
    },
  },
  {
    path: '/not-allowed',
    name: '403',
    meta: {
      layout: BareLayout,
      public: true,
      breadcrumbDisabled: true,
    },
    component: NotAllowed,
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    meta: {
      layout: BareLayout,
      public: true,
      breadcrumbDisabled: true,
    },
    component: NotFound,
  },
];

export function getLabel(name) {
  const routes = router.getRoutes();
  const target = routes.find((item) => item.name === name);
  if (target) {
    return target.meta.label;
  }
  return '';
}

export function canShow(name, permissions) {
  const routes = router.getRoutes();
  const target = routes.find((item) => item.name === name);
  if (!target) {
    return false;
  }
  return permissions.includes(target.name);
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
