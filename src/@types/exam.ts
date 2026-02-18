export interface Exam {
    id: number
    title: string
    description: string
    duration: number
    passing_score: number
    status: string
    created_by: number
    created_at: string
    updated_at: string
    questions: ExamQuestion[]
    creator: {
        id: number
        phone: string | null
        avatar: string | null
        role: string
        status: string
        last_login: string | null
        name: string | null
        email: string | null
        email_verified_at: string | null
        created_at: string
        updated_at: string
    }
}

export interface ExamQuestion {
    id: number
    exam_id: number
    order: number
    question: string
    type: string
    options: string[] | null
    correct_answer: string
    score: number
    difficulty: string
    category: string
    created_by: number
    created_at: string
    updated_at: string
    exam_section_id: number | null
}

export interface ExamListResponse {
    success: boolean
    data: Exam[]
}

export interface CreateExamRequest {
    title: string
    description: string
    duration: number
    passing_score: number
    status: 'draft' | 'published'
    sections: {
        title: string
        description: string
        order: number
        questions: {
            question: string
            type: string
            options: string[] | null
            correct_answer: string
            score: number
            difficulty: string
            category: string
        }[]
    }[]
}
