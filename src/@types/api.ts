/**
 * Generic API Response Types
 */

// پاسخ موفق API
export interface ApiResponse<T = any> {
    success: boolean
    data: T
    message?: string
}

// پاسخ خطا API
export interface ApiError {
    success: false
    message: string
    errors?: Record<string, string[]>
    statusCode?: number
}

// پاسخ لیست داده‌ها با pagination
export interface PaginatedResponse<T> {
    success: boolean
    data: T[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
        from: number
        to: number
    }
    links?: {
        first: string | null
        last: string | null
        prev: string | null
        next: string | null
    }
}

// پارامترهای pagination
export interface PaginationParams {
    page?: number
    per_page?: number
}

// پارامترهای جستجو و فیلتر
export interface SearchParams extends PaginationParams {
    search?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    filters?: Record<string, any>
}

// نوع متدهای HTTP
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// تنظیمات درخواست
export interface RequestConfig<T = any> {
    url: string
    method?: HttpMethod
    data?: T
    params?: Record<string, any>
    headers?: Record<string, string>
}
