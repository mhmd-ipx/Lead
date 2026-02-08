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
} as const

export default API_ENDPOINTS
