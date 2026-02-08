export type SignInCredential = {
    phone?: string
    otp?: string
    email?: string
    password?: string
}

// Send OTP Types
export type SendOtpRequest = {
    phone: string
}

export type SendOtpResponse = {
    success: boolean
    message: string
    data: {
        expires_at: string
        code: string
        is_registered: boolean
    }
}

// Verify OTP Types
export type VerifyOtpRequest = {
    phone: string
    code: string
    data?: {
        name: string
        email?: string
        password?: string
    }
}

export type VerifyOtpResponse = {
    success: boolean
    message: string
    data: {
        user: any  // API user structure (will be mapped to User type)
        token: string
    }
}

// Login with Phone & Password Types
export type LoginRequest = {
    phone: string
    password: string
}

export type LoginResponse = {
    success: boolean
    message: string
    data: {
        user: any  // API user structure (will be mapped to User type)
        token: string
    }
}



export type SignInResponse = {
    token: string
    user: {
        userId: string
        userName: string
        authority: string[]
        avatar: string
        phone: string
    }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    userName: string
    phone: string
    password: string
}

export type ForgotPassword = {
    phone: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type User = {
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    phone?: string | null
    authority?: string[]
}

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
