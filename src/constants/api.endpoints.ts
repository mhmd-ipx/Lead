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
} as const

export default API_ENDPOINTS
