import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import ownerRoutes from './ownerRoutes'
import managerRoutes from './managerRoutes'
import adminRoutes from './adminRoutes'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'dashboard',
        path: '/dashboard',
        component: lazy(() => import('@/views/DashboardRedirect')),
        authority: [],
    },
    {
        key: 'notifications',
        path: '/notifications',
        component: lazy(() => import('@/views/Notifications')),
        authority: [],
    },
    {
        key: 'profile',
        path: '/profile',
        component: lazy(() => import('@/views/Profile')),
        authority: [],
    },
    {
        key: 'support',
        path: '/support',
        component: lazy(() => import('@/views/Support')),
        authority: [],
    },
    ...ownerRoutes,
    ...managerRoutes,
    ...adminRoutes,
    ...othersRoute,
]
