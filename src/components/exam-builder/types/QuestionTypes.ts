// Question Types
export type QuestionType = 'multiple_choice' | 'descriptive' | 'mixed' | 'ranking'

export interface BaseQuestion {
    id: string
    priority: number
    type: QuestionType
    title: string
    description?: string
    required: boolean
    score: number
}

// Multiple Choice Question
export interface MultipleChoiceOption {
    id: string
    text: string
    image?: string
    isCorrect: boolean
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple_choice'
    options: MultipleChoiceOption[]
    allowMultiple: boolean
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
    options: MultipleChoiceOption[]
    allowMultiple: boolean
    descriptionRequired: boolean
    descriptionPlaceholder?: string
}

// Ranking Question
export interface RankingOption {
    id: string
    text: string
    image?: string
    correctOrder: number
}

export interface RankingQuestion extends BaseQuestion {
    type: 'ranking'
    options: RankingOption[]
}

// Union type for all questions
export type Question =
    | MultipleChoiceQuestion
    | DescriptiveQuestion
    | MixedQuestion
    | RankingQuestion

// Question Form Data
export interface QuestionFormData {
    type: QuestionType
    title: string
    description?: string
    required: boolean
    score: number
}
