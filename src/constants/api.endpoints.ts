/**
 * API Endpoints
 * تمام endpoint های پروژه در این فایل تعریف می‌شوند
 */

export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        SEND_OTP: '/auth/send-otp',
        VERIFY_OTP: '/auth/verify-otp',
    },
    // Company
    COMPANY: {
        BASE: '/companies',
        MY_COMPANIES: '/companies/my-companies',
    },
} as const

export default API_ENDPOINTS
