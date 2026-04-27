// Question Types
export type QuestionType = 'multiple_choice' | 'descriptive' | 'check_box' | 'mixed' | 'order'

export interface BaseQuestion {
    id: string
    priority: number
    type: QuestionType
    title: string
    description?: string
    required: boolean
    score: number
    image?: string
    file_id?: number | string
}

export interface QuestionOption {
    id: string
    text: string
    image?: string
    isCorrect?: boolean
    correctOrder?: number
    file_id?: number | string
}

// Multiple Choice Question (Single Select)
export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple_choice'
    options: QuestionOption[]
}

// Check Box Question (Multi Select)
export interface CheckBoxQuestion extends BaseQuestion {
    type: 'check_box'
    options: QuestionOption[]
}

// Descriptive Question
export interface DescriptiveQuestion extends BaseQuestion {
    type: 'descriptive'
    maxLength?: number
    minLength?: number
    placeholder?: string
}

// Mixed Question (Multiple Choice + Descriptive)
export interface MixedQuestion extends BaseQuestion {
    type: 'mixed'
    options: QuestionOption[]
    descriptionRequired: boolean
    descriptionPlaceholder?: string
}

// Order Question
export interface OrderQuestion extends BaseQuestion {
    type: 'order'
    options: QuestionOption[]
}

// Union type for all questions
export type Question =
    | MultipleChoiceQuestion
    | CheckBoxQuestion
    | DescriptiveQuestion
    | MixedQuestion
    | OrderQuestion

// Question Form Data
export interface QuestionFormData {
    type: QuestionType
    title: string
    description?: string
    required: boolean
    score: number
}
