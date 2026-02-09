
export interface AssessmentOption {
    value: string
    label?: string
}

export interface AssessmentQuestion {
    id: number
    stepId: number
    question: string
    type: 'text' | 'select' | 'radio' | 'checkbox' | 'rating'
    options?: string[]
    required: boolean
    order: number
    createdAt: string
    updatedAt: string
}

export interface AssessmentStep {
    id: number
    templateId: number
    title: string
    description?: string
    order: number
    createdAt: string
    updatedAt: string
    questions: AssessmentQuestion[]
}

export interface AssessmentCreator {
    id: number
    name: string
    email: string | null
    phone: string
    role: string
    status: string
    avatar: string | null
    lastLogin: string
    createdAt: string
    updatedAt: string
}

export interface AssessmentTemplate {
    id: number
    name: string
    description: string
    category: string
    estimatedTime: number
    status: 'active' | 'draft' | 'archived'
    createdBy: number
    createdAt: string
    updatedAt: string
    steps: AssessmentStep[]
    creator?: AssessmentCreator
}

export interface AssessmentTemplateApiResponse {
    id: number
    name: string
    description: string
    category: string
    estimated_time: number
    status: 'active' | 'draft' | 'archived'
    created_by: number
    created_at: string
    updated_at: string
    steps: {
        id: number
        template_id: number
        title: string
        description: string
        order: number
        created_at: string
        updated_at: string
        questions: {
            id: number
            step_id: number
            question: string
            type: 'text' | 'select' | 'radio' | 'checkbox' | 'rating'
            options: string[]
            required: boolean
            order: number
            created_at: string
            updated_at: string
        }[]
    }[]
    creator: {
        id: number
        phone: string
        avatar: string | null
        role: string
        status: string
        last_login: string
        name: string
        email: string | null
        email_verified_at: string | null
        created_at: string
        updated_at: string
    }
}

export interface AssessmentTemplateListResponse {
    success: boolean
    data: AssessmentTemplateApiResponse[]
}
