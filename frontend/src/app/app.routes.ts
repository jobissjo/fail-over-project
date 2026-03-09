import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/user-shell/user-shell').then((m) => m.UserShell),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./user/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'explore',
        loadComponent: () => import('./user/explore/explore').then((m) => m.Explore),
      },
      {
        path: 'progress',
        loadComponent: () => import('./user/user-progress/user-progress').then((m) => m.UserProgress),
      },
      {
        path: 'requests',
        loadComponent: () => import('./user/user-media-request/user-media-request').then((m) => m.UserMediaRequest),
      },
      {
        path: 'profile',
        loadComponent: () => import('./user/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'media',
        loadComponent: () => import('./admin/media/media').then((m) => m.Media),
      },
      {
        path: 'media-types',
        loadComponent: () => import('./admin/media-types/media-types').then((m) => m.MediaTypes),
      },
      {
        path: 'user-media-requests',
        loadComponent: () => import('./admin/user-media-requests/user-media-requests').then((m) => m.UserMediaRequests),
      },
    ],
  },
];
