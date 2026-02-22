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



// Exam Collection Verify Access Types
export type VerifyExamAccessRequest = {
    phone: string
    code: string
}

export type ExamCollectionItem = {
    id: number
    exam_collection_id: number
    exam_id: number
    order: number
    is_required: boolean
    created_at: string
    updated_at: string
}

export type ExamInCollection = {
    id: number
    title: string
    description: string
    duration: number
    passing_score: number
    status: string
    created_by: number
    created_at: string
    updated_at: string
    pivot: {
        exam_collection_id: number
        exam_id: number
        order: number
        is_required: number
        created_at: string
        updated_at: string
    }
}

export type ExamCollection = {
    id: number
    code: string
    title: string
    description: string
    created_by: number
    status: string
    start_datetime: string
    end_datetime: string
    duration_minutes: number
    created_at: string
    updated_at: string
    total_exams: number
    exams: ExamInCollection[]
    creator: any
    items: ExamCollectionItem[]
}

export type VerifyExamAccessResponse = {
    success: boolean
    message: string
    data: {
        collection: ExamCollection
        assignment: {
            id: number
            exam_collection_id: number
            user_id: number
            assigned_date: string
            due_date: string
            status: string
            completed_exams: number
            total_score: string
            average_percentage: string
            created_at: string
            updated_at: string
        }
        user: {
            id: number
            name: string
            phone: string
        }
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
    email?: string | null
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
