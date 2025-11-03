import MainLayout from '../../layouts/MainLayout.vue';
// import { PERMISSION } from '../../utils/const';

export default [
  {
    path: '/data',
    name: 'data',
    component: () => import('../../views/workspace/DataView.vue'),
    meta: {
      layout: MainLayout,
      label: '数据列表',
      permission: 'data',
    },
  },
  {
    path: '/dataSource',
    name: 'dataSource',
    component: () => import('../../views/workspace/DataSourceView.vue'),
    meta: {
      layout: MainLayout,
      label: '数据源管理',
      permission: 'data',
    },
  },
  {
    path: '/algorithm',
    name: 'algorithm',
    component: () => import('../../views/workspace/AlgorithmView.vue'),
    meta: {
      layout: MainLayout,
      label: '隐私算法库',
      permission: 'algorithm',
    },
  },
  {
    path: '/project',
    name: 'project',
    component: () => import('../../views/workspace/ProjectViewNext.vue'),
    meta: {
      layout: MainLayout,
      label: '跨域模型训练',
      permission: 'project',
    },
  },
];
