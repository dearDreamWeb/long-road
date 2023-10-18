import { lazy } from 'react';
import { RouteConfig } from 'react-router-config';
import Index from '@/pages/index/index';
import CreateGame from '@/pages/createGame/createGame';
import Warning from '@/pages/warning/warning';

const routes: RouteConfig[] = [
  {
    exact: true,
    path: '/',
    component: Index,
  },
  {
    exact: true,
    path: '/createGame',
    component: CreateGame,
  },
  {
    exact: true,
    path: '/warning',
    component: Warning,
  },
];
export default routes;
