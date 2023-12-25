import { lazy } from 'react';
import { RouteConfig } from 'react-router-config';
import Index from '@/pages/index/index';
import CreateGame from '@/pages/createGame/createGame';
import Warning from '@/pages/warning/warning';

const routes: RouteConfig[] = [
  {
    exact: true,
    path: '/',
    component: lazy(() => import('@/pages/index/index')),
  },
  {
    exact: true,
    path: '/createGame',
    component: lazy(() => import('@/pages/createGame/createGame')),
  },
  {
    exact: true,
    path: '/warning',
    component: lazy(() => import('@/pages/warning/warning')),
  },
];
export default routes;
