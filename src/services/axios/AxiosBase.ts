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
    (response) => response,
    (error: AxiosError) => {
        AxiosResponseIntrceptorErrorCallback(error)
        return Promise.reject(error)
    },
)

export default AxiosBase
