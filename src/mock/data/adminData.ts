// Mock data for Admin modules

export interface Company {
    id: string
    name: string
    legalName: string
    phone: string
    email: string
    nationalId: string
    economicCode: string
    fieldOfActivity: string
    logo?: string
    website?: string
    address: string
    description?: string
    ownerName: string
    ownerEmail: string
    ownerPhone: string
    createdAt: string
    status: 'active' | 'inactive'
}

export const mockCompanies: Company[] = [
    {
        id: '1',
        name: 'شرکت نمونه',
        legalName: 'شرکت نمونه سهامی خاص',
        phone: '+98211234567',
        email: 'info@samplecompany.com',
        nationalId: '1234567890',
        economicCode: '1234567890123',
        fieldOfActivity: 'فناوری اطلاعات',
        logo: '/img/logo/logo-light-full.png',
        website: 'https://samplecompany.com',
        address: 'تهران، خیابان ولیعصر، پلاک 123',
        description: 'شرکت پیشرو در حوزه فناوری اطلاعات و ارائه خدمات نرم‌افزاری',
        ownerName: 'علی محمدزاده',
        ownerEmail: 'ali.mohammadzadeh@samplecompany.com',
        ownerPhone: '+989123456789',
        createdAt: '2024-01-15T10:00:00Z',
        status: 'active'
    },
    {
        id: '2',
        name: 'گروه صنعتی پارس',
        legalName: 'شرکت گروه صنعتی پارس سهامی عام',
        phone: '+98213334455',
        email: 'contact@pars-group.com',
        nationalId: '0987654321',
        economicCode: '9876543210987',
        fieldOfActivity: 'صنعت و تولید',
        logo: undefined,
        website: 'https://pars-group.com',
        address: 'تهران، میدان آرژانتین، برج پارس',
        description: 'گروه صنعتی با بیش از 30 سال سابقه در تولید محصولات صنعتی',
        ownerName: 'رضا احمدی',
        ownerEmail: 'reza.ahmadi@pars-group.com',
        ownerPhone: '+989121111111',
        createdAt: '2024-02-10T09:00:00Z',
        status: 'active'
    },
    {
        id: '3',
        name: 'تجارت الکترونیک آریا',
        legalName: 'شرکت تجارت الکترونیک آریا با مسئولیت محدود',
        phone: '+98215556677',
        email: 'info@arya-ecommerce.ir',
        nationalId: '1122334455',
        economicCode: '1122334455667',
        fieldOfActivity: 'تجارت الکترونیک',
        logo: undefined,
        website: 'https://arya-ecommerce.ir',
        address: 'تهران، خیابان نلسون ماندلا، پلاک 45',
        description: 'پلتفرم پیشرو تجارت الکترونیک در ایران',
        ownerName: 'مریم کریمی',
        ownerEmail: 'maryam.karimi@arya-ecommerce.ir',
        ownerPhone: '+989122222222',
        createdAt: '2024-03-05T11:30:00Z',
        status: 'active'
    },
    {
        id: '4',
        name: 'خدمات مشاوره کسب‌وکار مهر',
        legalName: 'شرکت خدمات مشاوره کسب‌وکار مهر',
        phone: '+98217778899',
        email: 'contact@mehr-consulting.com',
        nationalId: '5566778899',
        economicCode: '5566778899001',
        fieldOfActivity: 'مشاوره مدیریت',
        logo: undefined,
        website: 'https://mehr-consulting.com',
        address: 'تهران، خیابان فاطمی، مجتمع مهر',
        description: 'ارائه خدمات مشاوره مدیریت و استراتژی به سازمان‌ها',
        ownerName: 'حسین رضایی',
        ownerEmail: 'hossein.rezaei@mehr-consulting.com',
        ownerPhone: '+989123333333',
        createdAt: '2024-04-20T14:00:00Z',
        status: 'inactive'
    },
    {
        id: '5',
        name: 'شرکت بازرگانی سپهر',
        legalName: 'شرکت بازرگانی سپهر سهامی خاص',
        phone: '+98216665544',
        email: 'info@sepehr-trade.ir',
        nationalId: '9988776655',
        economicCode: '9988776655443',
        fieldOfActivity: 'بازرگانی و واردات',
        logo: undefined,
        website: 'https://sepehr-trade.ir',
        address: 'تهران، بلوار کشاورز، پلاک 88',
        description: 'واردات و توزیع مواد اولیه صنعتی',
        ownerName: 'فاطمه نوری',
        ownerEmail: 'fateme.nouri@sepehr-trade.ir',
        ownerPhone: '+989124444444',
        createdAt: '2024-05-15T08:45:00Z',
        status: 'active'
    }
]

// Assessment related interfaces
export interface AssessmentStep {
    id: string
    title: string
    description?: string
    questions: AssessmentQuestion[]
}

export interface AssessmentQuestion {
    id: string
    question: string
    type: 'text' | 'select' | 'radio' | 'checkbox' | 'rating'
    options?: string[]
    required: boolean
}

export interface AssessmentTemplate {
    id: string
    name: string
    description: string
    category: string
    estimatedTime: number // minutes
    steps: AssessmentStep[]
}

export interface CompletedAssessment {
    id: string
    managerId: string
    managerName: string
    companyId: string
    companyName: string
    ownerId: string
    ownerName: string
    templateId: string
    templateName: string
    steps: AssessmentStep[]
    currentStep: number
    answers: Record<string, Record<string, string | number | string[]>>
    status: 'draft' | 'submitted'
    score?: number
    createdAt: string
    updatedAt: string
    submittedAt?: string
    assignedExams: string[] // Array of exam IDs
}

export const mockAssessmentTemplates: AssessmentTemplate[] = [
    {
        id: 'template-1',
        name: 'ارزیابی مهارت‌های مدیریتی پایه',
        description: 'ارزیابی اولیه مهارت‌های مدیریتی و تجربه کاری',
        category: 'مدیریت',
        estimatedTime: 15,
        steps: [
            {
                id: 'step-1',
                title: 'اطلاعات شخصی و تجربیات',
                description: 'سوالات مربوط به سابقه کاری و تجربیات مدیریتی',
                questions: [
                    {
                        id: 'q1',
                        question: 'سابقه کاری شما در مدیریت چقدر است؟',
                        type: 'select',
                        options: ['کمتر از 1 سال', '1-3 سال', '3-5 سال', 'بیشتر از 5 سال'],
                        required: true
                    },
                    {
                        id: 'q2',
                        question: 'در چه حوزه‌هایی تجربه مدیریتی دارید؟',
                        type: 'checkbox',
                        options: ['فروش', 'بازاریابی', 'منابع انسانی', 'مالی', 'عملیات', 'فنی'],
                        required: true
                    }
                ]
            },
            {
                id: 'step-2',
                title: 'مهارت‌های کلیدی',
                description: 'ارزیابی مهارت‌های کلیدی مدیریت',
                questions: [
                    {
                        id: 'q3',
                        question: 'مهارت رهبری شما در چه سطحی است؟',
                        type: 'rating',
                        required: true
                    },
                    {
                        id: 'q4',
                        question: 'مهارت‌های ارتباطی شما چگونه است؟',
                        type: 'radio',
                        options: ['ضعیف', 'متوسط', 'خوب', 'عالی'],
                        required: true
                    }
                ]
            }
        ]
    }
]

export const mockCompletedAssessments: CompletedAssessment[] = [
    {
        id: 'assessment-1',
        managerId: 'manager-1',
        managerName: 'علی محمدی',
        companyId: '1',
        companyName: 'شرکت نمونه',
        ownerId: 'owner-1',
        ownerName: 'علی محمدزاده',
        templateId: 'template-1',
        templateName: 'ارزیابی مهارت‌های مدیریتی پایه',
        steps: mockAssessmentTemplates[0].steps,
        currentStep: 2,
        answers: {
            'step-1': {
                q1: '3-5 سال',
                q2: ['فروش', 'بازاریابی']
            },
            'step-2': {
                q3: 4,
                q4: 'خوب'
            }
        },
        status: 'submitted',
        score: 85,
        createdAt: '2024-11-01T10:00:00Z',
        updatedAt: '2024-11-05T14:30:00Z',
        submittedAt: '2024-11-05T14:30:00Z',
        assignedExams: []
    },
    {
        id: 'assessment-2',
        managerId: 'manager-2',
        managerName: 'مریم احمدی',
        companyId: '2',
        companyName: 'گروه صنعتی پارس',
        ownerId: 'owner-2',
        ownerName: 'رضا احمدی',
        templateId: 'template-1',
        templateName: 'ارزیابی مهارت‌های مدیریتی پایه',
        steps: mockAssessmentTemplates[0].steps,
        currentStep: 2,
        answers: {
            'step-1': {
                q1: '1-3 سال',
                q2: ['منابع انسانی', 'مالی']
            },
            'step-2': {
                q3: 5,
                q4: 'عالی'
            }
        },
        status: 'submitted',
        score: 92,
        createdAt: '2024-11-10T09:00:00Z',
        updatedAt: '2024-11-15T16:45:00Z',
        submittedAt: '2024-11-15T16:45:00Z',
        assignedExams: ['exam-1']
    },
    {
        id: 'assessment-3',
        managerId: 'manager-3',
        managerName: 'حسن رضایی',
        companyId: '1',
        companyName: 'شرکت نمونه',
        ownerId: 'owner-1',
        ownerName: 'علی محمدزاده',
        templateId: 'template-1',
        templateName: 'ارزیابی مهارت‌های مدیریتی پایه',
        steps: mockAssessmentTemplates[0].steps,
        currentStep: 2,
        answers: {
            'step-1': {
                q1: 'بیشتر از 5 سال',
                q2: ['فنی', 'عملیات']
            },
            'step-2': {
                q3: 3,
                q4: 'متوسط'
            }
        },
        status: 'submitted',
        score: 78,
        createdAt: '2024-11-20T11:00:00Z',
        updatedAt: '2024-11-25T13:20:00Z',
        submittedAt: '2024-11-25T13:20:00Z',
        assignedExams: ['exam-1', 'exam-2']
    }
]

// Exam interface and data (for assignment)
export interface Exam {
    id: string
    title: string
    description: string
    status: 'active' | 'completed' | 'draft'
    totalQuestions: number
    duration: number // minutes
    createdAt: string
}

export const mockExams: Exam[] = [
    {
        id: 'exam-1',
        title: 'آزمون مهارت‌های مدیریتی',
        description: 'ارزیابی مهارت‌های کلیدی مدیریت',
        status: 'active',
        totalQuestions: 20,
        duration: 60,
        createdAt: '2024-11-15T09:00:00Z'
    },
    {
        id: 'exam-2',
        title: 'آزمون رهبری و تیم‌سازی',
        description: 'ارزیابی توانایی‌های رهبری',
        status: 'active',
        totalQuestions: 15,
        duration: 45,
        createdAt: '2024-10-01T09:00:00Z'
    },
    {
        id: 'exam-3',
        title: 'آزمون تفکر استراتژیک',
        description: 'سنجش توانایی تفکر استراتژیک و برنامه‌ریزی',
        status: 'active',
        totalQuestions: 25,
        duration: 90,
        createdAt: '2024-09-10T10:00:00Z'
    }
]

// Applicant Exam Sets (for admin panel)
export interface Applicant {
    id: string
    name: string
    companyId: string
    companyName: string
}

export interface ApplicantExamSet {
    id: string
    title: string
    description: string
    assignedDate: string
    examDate?: string
    status: 'pending' | 'in_progress' | 'completed'
    progress: number
    totalExams: number
    completedExams: number
    duration: number
    averageScore?: number
    applicantId: string
    applicantName: string
    companyId: string
    companyName: string
    username?: string
    password?: string
    exams?: {
        id: string
        title: string
        description: string
        duration: number
        questionCount: number
    }[]
}

export const mockApplicantExamSets: ApplicantExamSet[] = [
    {
        id: 'examset-001',
        title: 'مجموعه آزمون مدیریت پروژه',
        description: 'آزمون‌های جامع مدیریت پروژه و رهبری',
        assignedDate: '2024-12-01T10:00:00Z',
        examDate: '2024-12-15T14:00:00Z',
        status: 'in_progress',
        progress: 60,
        totalExams: 5,
        completedExams: 3,
        duration: 120,
        applicantId: 'manager-1',
        applicantName: 'علی محمدی',
        companyId: '1',
        companyName: 'شرکت نمونه',
        username: 'ali.mohammad@example.com',
        password: 'Temp@1234',
        exams: [
            { id: '1', title: 'آزمون مبانی مدیریت', description: 'ارزیابی دانش پایه', duration: 30, questionCount: 20 },
            { id: '2', title: 'آزمون برنامه‌ریزی پروژه', description: 'مهارت‌های برنامه‌ریزی', duration: 25, questionCount: 15 },
            { id: '3', title: 'آزمون رهبری تیم', description: 'مهارت‌های رهبری', duration: 35, questionCount: 25 },
            { id: '4', title: 'آزمون مدیریت ریسک', description: 'شناسایی و مدیریت ریسک', duration: 20, questionCount: 15 },
            { id: '5', title: 'آزمون کنترل پروژه', description: 'نظارت و کنترل', duration: 30, questionCount: 20 },
        ],
    },
    {
        id: 'examset-002',
        title: 'مجموعه آزمون مهارت‌های فنی',
        description: 'ارزیابی دانش فنی و تخصصی',
        assignedDate: '2024-11-20T10:00:00Z',
        examDate: '2024-11-25T10:00:00Z',
        status: 'completed',
        progress: 100,
        totalExams: 3,
        completedExams: 3,
        duration: 90,
        averageScore: 85,
        applicantId: 'manager-2',
        applicantName: 'مریم احمدی',
        companyId: '2',
        companyName: 'گروه صنعتی پارس',
        username: 'maryam.ahmadi@example.com',
        password: 'Temp@5678',
        exams: [
            { id: '6', title: 'آزمون برنامه‌نویسی', description: 'مهارت‌های کدنویسی', duration: 40, questionCount: 30 },
            { id: '7', title: 'آزمون پایگاه داده', description: 'طراحی و مدیریت', duration: 30, questionCount: 20 },
            { id: '8', title: 'آزمون معماری نرم‌افزار', description: 'طراحی سیستم', duration: 20, questionCount: 15 },
        ],
    },
    {
        id: 'examset-003',
        title: 'مجموعه آزمون رهبری تیم',
        description: 'بررسی مهارت‌های رهبری و مدیریت',
        assignedDate: '2024-12-10T10:00:00Z',
        status: 'pending',
        progress: 0,
        totalExams: 4,
        completedExams: 0,
        duration: 100,
        applicantId: 'manager-1',
        applicantName: 'علی محمدی',
        companyId: '1',
        companyName: 'شرکت نمونه',
        username: 'ali.mohammad@example.com',
        password: 'Temp@9012',
        exams: [
            { id: '9', title: 'آزمون انگیزش تیم', description: 'ایجاد انگیزه در تیم', duration: 25, questionCount: 20 },
            { id: '10', title: 'آزمون ارتباطات', description: 'مهارت‌های ارتباطی', duration: 25, questionCount: 20 },
            { id: '11', title: 'آزمون حل تعارض', description: 'مدیریت تعارضات', duration: 25, questionCount: 15 },
            { id: '12', title: 'آزمون تصمیم‌گیری', description: 'فرآیند تصمیم‌گیری', duration: 25, questionCount: 20 },
        ],
    },
    {
        id: 'examset-004',
        title: 'مجموعه آزمون مدیریت استراتژیک',
        description: 'ارزیابی تفکر استراتژیک و برنامه‌ریزی بلندمدت',
        assignedDate: '2024-12-05T10:00:00Z',
        examDate: '2024-12-20T10:00:00Z',
        status: 'in_progress',
        progress: 25,
        totalExams: 4,
        completedExams: 1,
        duration: 110,
        applicantId: 'manager-3',
        applicantName: 'حسن رضایی',
        companyId: '1',
        companyName: 'شرکت نمونه',
        username: 'hasan.rezaei@example.com',
        password: 'Temp@4567',
        exams: [
            { id: '13', title: 'آزمون برنامه‌ریزی استراتژیک', description: 'ایجاد استراتژی سازمانی', duration: 30, questionCount: 25 },
            { id: '14', title: 'آزمون تحلیل محیطی', description: 'بررسی محیط کسب‌وکار', duration: 25, questionCount: 20 },
            { id: '15', title: 'آزمون مدیریت تغییر', description: 'پیاده‌سازی تغییرات', duration: 30, questionCount: 22 },
            { id: '16', title: 'آزمون اجرای استراتژی', description: 'عملیاتی کردن استراتژی', duration: 25, questionCount: 18 },
        ],
    },
]

// Exam Management
export interface ExamItem {
    id: string
    title: string
    description: string
    questionCount: number
    duration: number
    priority: number
    createdDate: string
    updatedDate: string
}

export const mockExamItems: ExamItem[] = [
    {
        id: 'exam-001',
        title: 'آزمون مبانی مدیریت',
        description: 'ارزیابی دانش پایه در حوزه مدیریت سازمانی',
        questionCount: 20,
        duration: 30,
        priority: 1,
        createdDate: '2024-01-15T10:00:00Z',
        updatedDate: '2024-02-20T14:30:00Z',
    },
    {
        id: 'exam-002',
        title: 'آزمون برنامه‌ریزی پروژه',
        description: 'سنجش مهارت‌های برنامه‌ریزی و زمان‌بندی پروژه',
        questionCount: 15,
        duration: 25,
        priority: 2,
        createdDate: '2024-01-20T09:00:00Z',
        updatedDate: '2024-02-18T11:00:00Z',
    },
    {
        id: 'exam-003',
        title: 'آزمون رهبری تیم',
        description: 'ارزیابی توانایی‌های رهبری و مدیریت تیم',
        questionCount: 25,
        duration: 35,
        priority: 3,
        createdDate: '2024-01-25T13:00:00Z',
        updatedDate: '2024-02-22T16:00:00Z',
    },
    {
        id: 'exam-004',
        title: 'آزمون مدیریت ریسک',
        description: 'شناسایی و ارزیابی ریسک‌های پروژه',
        questionCount: 15,
        duration: 20,
        priority: 4,
        createdDate: '2024-02-01T10:30:00Z',
        updatedDate: '2024-02-25T09:15:00Z',
    },
    {
        id: 'exam-005',
        title: 'آزمون کنترل پروژه',
        description: 'نظارت و کنترل بر اجرای پروژه‌ها',
        questionCount: 20,
        duration: 30,
        priority: 5,
        createdDate: '2024-02-05T14:00:00Z',
        updatedDate: '2024-02-28T10:45:00Z',
    },
    {
        id: 'exam-006',
        title: 'آزمون مدیریت منابع انسانی',
        description: 'ارزیابی مهارت‌های مدیریت نیروی انسانی',
        questionCount: 18,
        duration: 28,
        priority: 6,
        createdDate: '2024-02-10T11:00:00Z',
        updatedDate: '2024-03-01T15:20:00Z',
    },
]

