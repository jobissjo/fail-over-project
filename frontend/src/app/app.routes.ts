import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./user/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'explore',
        loadComponent: () => import('./user/explore/explore').then(m => m.Explore)
    },
    {
        path: 'user-media-request',
        loadComponent: () => import('./user/user-media-request/user-media-request').then(m => m.UserMediaRequest)
    },
    {
        path: 'user-progress',
        loadComponent: () => import('./user/user-progress/user-progress').then(m => m.UserProgress)
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.routes)
    }
];
