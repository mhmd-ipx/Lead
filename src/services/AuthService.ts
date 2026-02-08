import ApiService from './ApiService'
import apiClient from './ApiClient'
import endpointConfig from '@/configs/endpoint.config'
import API_ENDPOINTS from '@/constants/api.endpoints'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    LoginRequest,
    LoginResponse,
} from '@/@types/auth'

/**
 * Send OTP to phone number
 */
export async function apiSendOtp(data: SendOtpRequest) {
    return apiClient.post<SendOtpResponse>(API_ENDPOINTS.AUTH.SEND_OTP, data)
}

/**
 * Verify OTP code and login/register user
 */
export async function apiVerifyOtp(data: VerifyOtpRequest) {
    return apiClient.post<VerifyOtpResponse>(
        API_ENDPOINTS.AUTH.VERIFY_OTP,
        data,
    )
}

/**
 * Login with phone and password
 */
export async function apiLogin(data: LoginRequest) {
    return apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        data,
    )
}


export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchDataWithAxios<SignInResponse>({
        url: endpointConfig.signIn,
        method: 'post',
        data,
    })
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchDataWithAxios<SignUpResponse>({
        url: endpointConfig.signUp,
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signOut,
        method: 'post',
    })
}

export async function apiForgotPassword<T>(data: ForgotPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data,
    })
}

export async function apiResetPassword<T>(data: ResetPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}

