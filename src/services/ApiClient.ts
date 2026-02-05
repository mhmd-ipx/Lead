import AxiosBase from './axios/AxiosBase'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type {
    ApiResponse,
    ApiError,
    PaginatedResponse,
    SearchParams,
} from '@/@types/api'

/**
 * ApiClient - کلاس مدیریت تمام درخواست‌های API
 * این کلاس شامل متدهای کامل CRUD و هندل کردن خطاها است
 */
class ApiClient {
    /**
     * متد عمومی برای ارسال درخواست
     */
    private async request<T = any, D = any>(
        config: AxiosRequestConfig<D>,
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await AxiosBase(config)
            return response.data
        } catch (error) {
            throw this.handleError(error as AxiosError)
        }
    }

    /**
     * متد GET - دریافت داده
     */
    async get<T = any>(
        url: string,
        params?: Record<string, any>,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        return this.request<T>({
            url,
            method: 'GET',
            params,
            ...config,
        })
    }

    /**
     * متد POST - ایجاد داده جدید
     */
    async post<T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        return this.request<T, D>({
            url,
            method: 'POST',
            data,
            ...config,
        })
    }

    /**
     * متد PUT - آپدیت کامل داده
     */
    async put<T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        return this.request<T, D>({
            url,
            method: 'PUT',
            data,
            ...config,
        })
    }

    /**
     * متد PATCH - آپدیت جزئی داده
     */
    async patch<T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        return this.request<T, D>({
            url,
            method: 'PATCH',
            data,
            ...config,
        })
    }

    /**
     * متد DELETE - حذف داده
     */
    async delete<T = any>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        return this.request<T>({
            url,
            method: 'DELETE',
            ...config,
        })
    }

    /**
     * متد برای دریافت لیست با pagination
     */
    async getPaginated<T = any>(
        url: string,
        params?: SearchParams,
        config?: AxiosRequestConfig,
    ): Promise<PaginatedResponse<T>> {
        return this.request<PaginatedResponse<T>>({
            url,
            method: 'GET',
            params,
            ...config,
        })
    }

    /**
     * متد برای آپلود فایل
     */
    async uploadFile<T = any>(
        url: string,
        file: File | Blob,
        fieldName: string = 'file',
        additionalData?: Record<string, any>,
    ): Promise<T> {
        const formData = new FormData()
        formData.append(fieldName, file)

        if (additionalData) {
            Object.keys(additionalData).forEach((key) => {
                formData.append(key, additionalData[key])
            })
        }

        return this.request<T>({
            url,
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    /**
     * متد برای آپلود چندین فایل
     */
    async uploadFiles<T = any>(
        url: string,
        files: File[] | Blob[],
        fieldName: string = 'files[]',
        additionalData?: Record<string, any>,
    ): Promise<T> {
        const formData = new FormData()

        files.forEach((file) => {
            formData.append(fieldName, file)
        })

        if (additionalData) {
            Object.keys(additionalData).forEach((key) => {
                formData.append(key, additionalData[key])
            })
        }

        return this.request<T>({
            url,
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    /**
     * هندل کردن خطاها
     */
    private handleError(error: AxiosError): ApiError {
        const apiError: ApiError = {
            success: false,
            message: 'خطایی رخ داده است',
            statusCode: error.response?.status,
        }

        if (error.response) {
            // سرور پاسخ داده اما با خطا
            const responseData = error.response.data as any

            apiError.message =
                responseData?.message ||
                error.response.statusText ||
                'خطای سرور'
            apiError.errors = responseData?.errors
        } else if (error.request) {
            // درخواست ارسال شده اما پاسخی دریافت نشد
            apiError.message = 'خطا در اتصال به سرور'
        } else {
            // خطا در تنظیم درخواست
            apiError.message = error.message || 'خطای نامشخص'
        }

        return apiError
    }
}

// ایجاد یک instance از ApiClient
const apiClient = new ApiClient()

export default apiClient

// Export کردن class برای استفاده‌های خاص
export { ApiClient }
