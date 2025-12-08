import { lazy } from 'react'
import { MANAGER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const managerRoutes: Routes = [
    {
        key: 'managerDashboard',
        path: '/manager/dashboard',
        component: lazy(() => import('@/views/manager/Dashboard')),
        authority: [MANAGER],
    },
    {
        key: 'managerExams',
        path: '/manager/exams',
        component: lazy(() => import('@/views/manager/Exams')),
        authority: [MANAGER],
    },
    {
        key: 'managerExamsActive',
        path: '/manager/exams/active',
        component: lazy(() => import('@/views/manager/ExamsActive')),
        authority: [MANAGER],
    },
    {
        key: 'managerExamDetails',
        path: '/manager/exams/:examId',
        component: lazy(() => import('@/views/manager/ExamDetails')),
        authority: [MANAGER],
    },
    {
        key: 'managerAnswers',
        path: '/manager/answers/:examId',
        component: lazy(() => import('@/views/manager/Answers')),
        authority: [MANAGER],
    },
    {
        key: 'managerResults',
        path: '/manager/results',
        component: lazy(() => import('@/views/manager/Results')),
        authority: [MANAGER],
    },
    {
        key: 'managerNotifications',
        path: '/manager/notifications',
        component: lazy(() => import('@/views/manager/Notifications')),
        authority: [MANAGER],
    },
    {
        key: 'managerProfile',
        path: '/manager/profile',
        component: lazy(() => import('@/views/manager/Profile')),
        authority: [MANAGER],
    },
    {
        key: 'managerSupport',
        path: '/manager/support',
        component: lazy(() => import('@/views/manager/Support')),
        authority: [MANAGER],
    },
]

export default managerRoutes