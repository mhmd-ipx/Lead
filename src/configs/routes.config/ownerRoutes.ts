import { lazy } from 'react'
import { OWNER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const ownerRoutes: Routes = [
    {
        key: 'ownerDashboard',
        path: '/owner/dashboard',
        component: lazy(() => import('@/views/owner/Dashboard')),
        authority: [OWNER],
    },
    {
        key: 'ownerCompany',
        path: '/owner/company',
        component: lazy(() => import('@/views/owner/Company')),
        authority: [OWNER],
    },
    {
        key: 'ownerManagers',
        path: '/owner/managers',
        component: lazy(() => import('@/views/owner/Managers')),
        authority: [OWNER],
    },
    {
        key: 'ownerManagersAdd',
        path: '/owner/managers/add',
        component: lazy(() => import('@/views/owner/ManagersAdd')),
        authority: [OWNER],
    },
    {
        key: 'ownerManagerDetails',
        path: '/owner/managers/:managerId',
        component: lazy(() => import('@/views/owner/ManagerDetails')),
        authority: [OWNER],
    },
    {
        key: 'ownerManagerEdit',
        path: '/owner/managers/:managerId/edit',
        component: lazy(() => import('@/views/owner/ManagersAdd')),
        authority: [OWNER],
    },
    {
        key: 'ownerManagerAssessment',
        path: '/owner/managers/:managerId/assessment',
        component: lazy(() => import('@/views/owner/assessment/ManagerAssessmentList')),
        authority: [OWNER],
    },
    {
        key: 'ownerAssessments',
        path: '/owner/assessment',
        component: lazy(() => import('@/views/owner/assessment/AssessmentList')),
        authority: [OWNER],
    },
    {
        key: 'ownerAssessmentNew',
        path: '/owner/assessment/new',
        component: lazy(() => import('@/views/owner/assessment/NewAssessment')),
        authority: [OWNER],
    },
    {
        key: 'ownerManagerAssessment',
        path: '/owner/managers/:managerId/assessment',
        component: lazy(() => import('@/views/owner/assessment/ManagerAssessmentList')),
        authority: [OWNER],
    },
    {
        key: 'ownerAssessmentForm',
        path: '/owner/assessment/form/:assessmentId',
        component: lazy(() => import('@/views/owner/assessment/AssessmentForm')),
        authority: [OWNER],
    },
    {
        key: 'ownerExams',
        path: '/owner/exams',
        component: lazy(() => import('@/views/owner/Exams')),
        authority: [OWNER],
    },
    {
        key: 'ownerExamsAssigned',
        path: '/owner/exams/assigned',
        component: lazy(() => import('@/views/owner/ExamsAssigned')),
        authority: [OWNER],
    },
    {
        key: 'ownerExamsResults',
        path: '/owner/exams/results',
        component: lazy(() => import('@/views/owner/ExamsResults')),
        authority: [OWNER],
    },
    {
        key: 'ownerResults',
        path: '/owner/results',
        component: lazy(() => import('@/views/owner/Results')),
        authority: [OWNER],
    },
    {
        key: 'ownerResultsManager',
        path: '/owner/results/:managerId',
        component: lazy(() => import('@/views/owner/ResultsManager')),
        authority: [OWNER],
    },
    {
        key: 'ownerReports',
        path: '/owner/reports',
        component: lazy(() => import('@/views/owner/Reports')),
        authority: [OWNER],
    },
    {
        key: 'ownerPayments',
        path: '/owner/payments',
        component: lazy(() => import('@/views/owner/Payments')),
        authority: [OWNER],
    },
    {
        key: 'ownerPaymentsHistory',
        path: '/owner/payments/history',
        component: lazy(() => import('@/views/owner/PaymentsHistory')),
        authority: [OWNER],
    },
    {
        key: 'ownerPaymentsInvoice',
        path: '/owner/payments/invoice/:id',
        component: lazy(() => import('@/views/owner/PaymentsInvoice')),
        authority: [OWNER],
    },
    {
        key: 'ownerNotifications',
        path: '/owner/notifications',
        component: lazy(() => import('@/views/owner/Notifications')),
        authority: [OWNER],
    },
    {
        key: 'ownerProfile',
        path: '/owner/profile',
        component: lazy(() => import('@/views/owner/Profile')),
        authority: [OWNER],
    },
    {
        key: 'ownerSupport',
        path: '/owner/support',
        component: lazy(() => import('@/views/owner/Support')),
        authority: [OWNER],
    },
]

export default ownerRoutes