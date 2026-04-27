import axios from 'axios'
import AxiosResponseIntrceptorErrorCallback from './AxiosResponseIntrceptorErrorCallback'
import AxiosRequestIntrceptorConfigCallback from './AxiosRequestIntrceptorConfigCallback'
import appConfig from '@/configs/app.config'
import type { AxiosError } from 'axios'

const AxiosBase = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
})

AxiosBase.interceptors.request.use(
    (config) => {
        const updatedConfig = AxiosRequestIntrceptorConfigCallback(config)

        // Log complete request details
        console.log('🚀 API Request:', {
            method: updatedConfig.method?.toUpperCase(),
            url: `${updatedConfig.baseURL || ''}${updatedConfig.url || ''}`,
            headers: updatedConfig.headers,
            data: updatedConfig.data,
        })

        return updatedConfig
    },
    (error) => {
        return Promise.reject(error)
    },
)

AxiosBase.interceptors.response.use(
    (response) => {
        // Log complete response details
        console.log('✅ API Response:', {
            status: response.status,
            url: `${response.config.baseURL || ''}${response.config.url || ''}`,
            data: response.data,
        })
        return response
    },
    (error: AxiosError) => {
        // Log error details
        console.error('❌ API Error:', {
            status: error.response?.status,
            url: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
            message: error.message,
            responseData: error.response?.data,
        })
        AxiosResponseIntrceptorErrorCallback(error)
        return Promise.reject(error)
    },
)

export default AxiosBase
