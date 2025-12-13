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
        component: lazy(() => import('@/views/owner/ApplicantAssessment')),
        authority: [OWNER],
    },
    {
        key: 'ownerAssessmentView',
        path: '/owner/managers/:managerId/assessment/:assessmentId/view',
        component: lazy(() => import('@/views/owner/AssessmentView')),
        authority: [OWNER],
    },
    {
        key: 'ownerAssessmentNew',
        path: '/owner/managers/:managerId/assessment/new',
        component: lazy(() => import('@/views/owner/AssessmentForm')),
        authority: [OWNER],
    },
    {
        key: 'ownerAssessmentEdit',
        path: '/owner/managers/:managerId/assessment/:assessmentId/edit',
        component: lazy(() => import('@/views/owner/AssessmentForm')),
        authority: [OWNER],
    },
    {
        key: 'ownerManagerExams',
        path: '/owner/managers/:managerId/exams',
        component: lazy(() => import('@/views/owner/ApplicantExams')),
        authority: [OWNER],
    },
    {
        key: 'ownerExamSetResults',
        path: '/owner/managers/:managerId/exams/:examSetId/results',
        component: lazy(() => import('@/views/owner/ExamResults')),
        authority: [OWNER],
    },
    {
        key: 'ownerAllExamsResults',
        path: '/owner/exams-results',
        component: lazy(() => import('@/views/owner/AllExamsResults')),
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
        key: 'ownerPaymentsInvoice',
        path: '/owner/payments/invoice/:id',
        component: lazy(() => import('@/views/owner/PaymentsInvoice')),
        authority: [OWNER],
    },
    // Accounting Routes
    {
        key: 'ownerFinancialDocuments',
        path: '/owner/accounting/documents',
        component: lazy(() => import('@/views/owner/FinancialDocuments')),
        authority: [OWNER],
    },
    {
        key: 'ownerFinancialDocumentView',
        path: '/owner/accounting/documents/:id',
        component: lazy(() => import('@/views/owner/FinancialDocumentView')),
        authority: [OWNER],
    },
    {
        key: 'ownerBills',
        path: '/owner/accounting/bills',
        component: lazy(() => import('@/views/owner/Bills')),
        authority: [OWNER],
    },
    {
        key: 'ownerBillView',
        path: '/owner/accounting/bills/:id',
        component: lazy(() => import('@/views/owner/BillView')),
        authority: [OWNER],
    },
    {
        key: 'ownerBulkPayment',
        path: '/owner/accounting/bulk-payment',
        component: lazy(() => import('@/views/owner/BulkPayment')),
        authority: [OWNER],
    },
    {
        key: 'ownerNotifications',
        path: '/owner/notifications',
        component: lazy(() => import('@/views/owner/Notifications')),
        authority: [OWNER],
    },
    {
        key: 'ownerUserProfile',
        path: '/owner/user-profile',
        component: lazy(() => import('@/views/owner/UserProfile')),
        authority: [OWNER],
    },
    {
        key: 'ownerProfile',
        path: '/owner/profile',
        component: lazy(() => import('@/views/owner/Profile')),
        authority: [OWNER],
    },
    {
        key: 'ownerSupportTickets',
        path: '/owner/support/tickets',
        component: lazy(() => import('@/views/owner/Support')),
        authority: [OWNER],
    },
    {
        key: 'ownerSupportCreate',
        path: '/owner/support/create',
        component: lazy(() => import('@/views/owner/CreateTicket')),
        authority: [OWNER],
    },
    {
        key: 'ownerSupportContact',
        path: '/owner/support/contact',
        component: lazy(() => import('@/views/owner/ContactSupport')),
        authority: [OWNER],
    },
    {
        key: 'ownerSupportTicketView',
        path: '/owner/support/ticket/:ticketId',
        component: lazy(() => import('@/views/owner/SupportTicketView')),
        authority: [OWNER],
    },
]

export default ownerRoutes