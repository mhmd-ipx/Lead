
export interface SubmittedAnswer {
    step_number: number
    step_title: string
    question_number: number
    question_title: string
    question_type: string
    answer: string | number | string[]
}

export interface AdminCompletedAssessment {
    id: number
    manager_id: number
    template_id: number
    current_step: number
    answers: Record<string, SubmittedAnswer> | Record<string, string | number | string[]> | any
    status: 'draft' | 'submitted'
    score: number
    submitted_at: string | null
    created_at: string
    updated_at: string
    manager: {
        id: number
        user_id: number
        company_id: number
        position: string
        department: string
        status: string
        assessment_status: string
        exam_status: string
        can_view_results: number
        created_at: string
        updated_at: string
        company: {
            id: number
            name: string
            legal_name: string
            phone: string | null
            email: string | null
            address: string | null
            national_id: string | null
            economic_code: string | null
            field_of_activity: string | null
            logo: string | null
            website: string | null
            description: string | null
            owner_id: number
            status: string
            created_at: string
            updated_at: string
        }
        user: {
            id: number
            phone: string
            avatar: string | null
            role: string
            status: string
            last_login: string | null
            name: string
            email: string | null
            email_verified_at: string | null
            created_at: string
            updated_at: string
        }
    }
    template: {
        id: number
        name: string
        description: string
        category: string
        estimated_time: number
        status: string
        created_by: number
        created_at: string
        updated_at: string
    }
    // Added for UI compatibility
    managerName?: string
    companyName?: string
    ownerName?: string
    templateName?: string
    assignedExams?: string[]
}

export interface AdminCompletedAssessmentListResponse {
    success: boolean
    data: AdminCompletedAssessment[]
}
