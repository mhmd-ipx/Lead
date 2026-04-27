/**
 * API Endpoints
 * تمام endpoint های پروژه در این فایل تعریف می‌شوند
 */

export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        SEND_OTP: '/auth/send-otp',
        VERIFY_OTP: '/auth/verify-otp',
        LOGIN: '/auth/login',
    },
    // Company
    COMPANY: {
        BASE: '/companies',
        MY_COMPANIES: '/companies/my-companies',
    },
    // Managers
    MANAGER: {
        MY_MANAGERS: '/managers/my-managers',
        CREATE: '/managers',
        UPDATE: (id: number) => `/managers/${id}`,
        GET_BY_ID: (id: number) => `/managers/${id}`,
        GET_BY_COMPANY: (companyId: number) => `/managers/?company_id=${companyId}`,
        DELETE: (id: number) => `/managers/${id}`,
    },
    // Support
    SUPPORT: {
        GET_TICKETS: '/support-tickets',
        CREATE_TICKET: '/support-tickets',
        GET_TICKET_DETAIL: (id: string) => `/support-tickets/${id}`,
        REPLY_TICKET: (id: string) => `/support-tickets/${id}/messages`,
    },
    // Exam Collections
    EXAM_COLLECTIONS: {
        VERIFY_ACCESS: '/exam-collections/verify-access',
    },
    // Exams
    EXAMS: {
        BASE: '/exams',
        GET_BY_ID: (id: string | number) => `/exams/${id}`,
        CREATE: '/exams',
        UPDATE: (id: string | number) => `/exams/${id}`,
        DELETE: (id: string | number) => `/exams/${id}`,
        ADD_SECTION: (id: string | number) => `/exams/${id}/sections`,
    },
    // Questions
    QUESTIONS: {
        BASE: '/questions',
        CREATE: '/questions',
        UPDATE: (id: string | number) => `/questions/${id}`,
        DELETE: (id: string | number) => `/questions/${id}`,
    },
    // Exam Sections
    EXAM_SECTIONS: {
        UPDATE: (id: string | number) => `/exam-sections/${id}`,
        DELETE: (id: string | number) => `/exam-sections/${id}`,
    },
} as const

export default API_ENDPOINTS
