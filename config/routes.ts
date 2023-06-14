import { lazy } from 'react';
import { RouteConfig } from 'react-router-config';

const routes: RouteConfig[] = [
  {
    exact: true,
    path: '/',
    component: lazy(() => import('@/pages/index/index')),
  },
  {
    exact: true,
    path: '/warning',
    component: lazy(() => import('@/pages/warning/warning')),
  },
];
export default routes;
