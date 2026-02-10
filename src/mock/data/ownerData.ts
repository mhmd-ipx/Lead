// Mock data for Owner modules

export interface User {
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

export interface Manager {
  id: number
  user_id: number
  company_id: number
  position: string
  department: string
  status: 'active' | 'inactive'
  assessment_status: 'not_started' | 'incomplete' | 'completed'
  exam_status: 'not_started' | 'in_progress' | 'completed'
  can_view_results: number
  created_at: string
  updated_at: string
  user: User
}

export interface CompanyWithManagers {
  id: number
  name: string
  legal_name: string | null
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
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  managers: Manager[]
}

export interface CreateManagerRequest {
  company_id: number
  name: string
  phone: string
  position: string
  department: string
  status?: 'active' | 'inactive'
}

export interface CreateManagerResponse {
  success: boolean
  message: string
  data: Manager & {
    company: CompanyWithManagers
  }
}

export interface UpdateManagerRequest {
  company_id: number
  name: string
  phone: string
  position: string
  department: string
  status?: 'active' | 'inactive'
}

export interface UpdateManagerResponse {
  success: boolean
  message: string
  data: Manager
}

export interface GetManagerResponse {
  success: boolean
  data: Manager
}

export interface CompanyProfile {
  id: string
  name: string
  legalName: string
  address: string
  phone: string
  email: string
  nationalId: string
  economicCode: string
  fieldOfActivity: string
  logo?: string
  website?: string
  description?: string
  manager_name?: string
  manager_phone?: string
  status?: 'active' | 'inactive'
}

export interface Assessment {
  id: string
  managerId: string
  managerName: string
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
}

export interface AssessmentStep {
  id: string
  title: string
  description?: string
  order?: number
  questions: AssessmentQuestion[]
}

export interface AssessmentTemplate {
  id: string
  name: string
  description: string
  category: string
  estimatedTime: number // minutes
  steps: AssessmentStep[]
}

export interface AssessmentQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'rating'
  options?: string[]
  required: boolean
  order?: number
}

export interface Payment {
  id: string
  managerId: string
  managerName: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  type: 'before_results' | 'after_results'
  paymentDate?: string
  dueDate?: string
  invoiceId?: string
}

export interface Invoice {
  id: string
  paymentId: string
  managerName: string
  amount: number
  currency: string
  status: 'requested' | 'generated' | 'sent'
  requestDate: string
  generatedDate?: string
  pdfUrl?: string
}

// سند مالی (Financial Document)
export interface FinancialDocument {
  id: string
  paymentId?: string
  managerName: string
  title: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled'
  createdDate: string
  paidDate?: string
  billId?: string
  description?: string
}

// صورتحساب (Bill/Receipt)
export interface Bill {
  id: string
  billNumber: string
  financialDocumentIds: string[]
  totalAmount: number
  currency: string
  status: 'pending' | 'paid' | 'partially_paid'
  createdDate: string
  paidDate?: string
  dueDate?: string
  officialInvoiceRequested: boolean
  officialInvoicePdfUrl?: string
  description?: string
}

export interface Exam {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'draft'
  assignedManagers: string[]
  totalQuestions: number
  duration: number // minutes
  createdAt: string
  startDate?: string
  endDate?: string
}

export interface ExamResult {
  id: string
  examId: string
  examTitle: string
  managerId: string
  managerName: string
  score: number
  totalScore: number
  percentage: number
  status: 'passed' | 'failed' | 'in_progress'
  completedAt?: string
  answers: Record<string, string | string[] | number>
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'system' | 'payment' | 'exam' | 'assessment'
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export interface SupportMessage {
  id: string
  userId: string
  userName: string
  message: string
  type: 'user' | 'admin'
  createdAt: string
  isRead: boolean
}

export interface DashboardStats {
  totalManagers: number
  activeManagers: number
  completedAssessments: number
  activeExams: number
  completedExams: number
  pendingExams: number
  totalPaid: number
  totalPending: number
  unreadNotifications: number
}

// Mock data
export const mockManagers: Manager[] = [
  {
    id: '1',
    name: 'علی محمدی',
    email: 'ali.mohammadi@example.com',
    phone: '+989123456789',
    position: 'مدیر فروش',
    department: 'فروش',
    companyId: '1',
    status: 'active',
    assessmentStatus: 'completed',
    examStatus: 'completed',
    canViewResults: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-12-07T14:30:00Z'
  },
  {
    id: '2',
    name: 'مریم احمدی',
    email: 'maryam.ahmadi@example.com',
    phone: '+989123456788',
    position: 'مدیر منابع انسانی',
    department: 'HR',
    companyId: '2',
    status: 'active',
    assessmentStatus: 'incomplete',
    examStatus: 'in_progress',
    canViewResults: false,
    createdAt: '2024-02-20T09:15:00Z',
    lastLogin: '2024-12-06T16:45:00Z'
  },
  {
    id: '3',
    name: 'حسن رضایی',
    email: 'hasan.rezaei@example.com',
    phone: '+989123456787',
    position: 'مدیر مالی',
    department: 'مالی',
    companyId: '1',
    status: 'inactive',
    assessmentStatus: 'not_started',
    examStatus: 'not_started',
    canViewResults: false,
    createdAt: '2024-03-10T11:30:00Z'
  },
  {
    id: '4',
    name: 'فاطمه کریمی',
    email: 'fateme.karimi@example.com',
    phone: '+989123456786',
    position: 'مدیر بازاریابی',
    department: 'بازاریابی',
    companyId: '2',
    status: 'active',
    assessmentStatus: 'completed',
    examStatus: 'completed',
    canViewResults: true,
    createdAt: '2024-01-25T13:20:00Z',
    lastLogin: '2024-12-07T10:15:00Z'
  }
]

export const mockCompanyProfile: CompanyProfile = {
  id: '1',
  name: 'شرکت نمونه',
  legalName: 'شرکت نمونه سهامی خاص',
  address: 'تهران، خیابان ولیعصر، پلاک 123',
  phone: '+98211234567',
  email: 'info@samplecompany.com',
  nationalId: '1234567890',
  economicCode: '1234567890123',
  fieldOfActivity: 'فناوری اطلاعات',
  logo: '/img/logo/logo-light-full.png',
  website: 'https://samplecompany.com',
  description: 'شرکت پیشرو در حوزه فناوری اطلاعات و ارائه خدمات نرم‌افزاری',
  status: 'active'
}

// Mock companies list for filtering
export const mockCompanies: CompanyProfile[] = [
  {
    id: '1',
    name: 'شرکت فناوری پیشرو',
    legalName: 'شرکت فناوری پیشرو سهامی خاص',
    address: 'تهران، خیابان ولیعصر، پلاک 123',
    phone: '+98211234567',
    email: 'info@techcompany.com',
    nationalId: '1234567890',
    economicCode: '1234567890123',
    fieldOfActivity: 'فناوری اطلاعات',
    status: 'active'
  },
  {
    id: '2',
    name: 'شرکت بازرگانی آریا',
    legalName: 'شرکت بازرگانی آریا سهامی خاص',
    address: 'تهران، خیابان آزادی، پلاک 456',
    phone: '+98211234568',
    email: 'info@ariatrading.com',
    nationalId: '0987654321',
    economicCode: '3210987654321',
    fieldOfActivity: 'بازرگانی',
    status: 'active'
  },
  {
    id: '3',
    name: 'شرکت صنعتی سپهر',
    legalName: 'شرکت صنعتی سپهر سهامی عام',
    address: 'کرج، شهرک صنعتی، فاز 2',
    phone: '+98261234567',
    email: 'info@sepahrindustry.com',
    nationalId: '1122334455',
    economicCode: '5544332211001',
    fieldOfActivity: 'صنعت',
    status: 'inactive'
  }
]


// Assessment Templates
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
          },
          {
            id: 'q3',
            question: 'به طور خلاصه تجربیات مدیریتی خود را توصیف کنید.',
            type: 'text',
            required: false
          }
        ]
      },
      {
        id: 'step-2',
        title: 'مهارت‌های کلیدی',
        description: 'ارزیابی مهارت‌های کلیدی مدیریت',
        questions: [
          {
            id: 'q4',
            question: 'مهارت رهبری شما در چه سطحی است؟',
            type: 'rating',
            required: true
          },
          {
            id: 'q5',
            question: 'مهارت‌های ارتباطی شما چگونه است؟',
            type: 'radio',
            options: ['ضعیف', 'متوسط', 'خوب', 'عالی'],
            required: true
          },
          {
            id: 'q6',
            question: 'مهارت‌های کلیدی شما کدامند؟',
            type: 'checkbox',
            options: ['برنامه‌ریزی استراتژیک', 'مدیریت تیم', 'تحلیل داده', 'ارتباطات', 'مشکل‌گشایی', 'انطباق‌پذیری'],
            required: true
          }
        ]
      }
    ]
  },
  {
    id: 'template-2',
    name: 'ارزیابی جامع رهبری',
    description: 'ارزیابی کامل توانایی‌های رهبری و مدیریت تیم',
    category: 'رهبری',
    estimatedTime: 25,
    steps: [
      {
        id: 'step-1',
        title: 'سبک رهبری',
        description: 'شناخت سبک رهبری شما',
        questions: [
          {
            id: 'q1',
            question: 'سبک رهبری شما چگونه است؟',
            type: 'select',
            options: ['انتقادی', 'مشارکتی', 'تحول‌خواه', 'تراکنشی', 'لایزرفر'],
            required: true
          },
          {
            id: 'q2',
            question: 'چگونه با چالش‌های تیم برخورد می‌کنید؟',
            type: 'text',
            required: true
          }
        ]
      },
      {
        id: 'step-2',
        title: 'مدیریت تیم',
        description: 'ارزیابی مهارت‌های مدیریت تیم',
        questions: [
          {
            id: 'q3',
            question: 'تجربه شما در مدیریت تیم چند نفره چقدر است؟',
            type: 'select',
            options: ['1-5 نفر', '6-15 نفر', '16-50 نفر', 'بیشتر از 50 نفر'],
            required: true
          },
          {
            id: 'q4',
            question: 'روش‌های انگیزشی شما برای تیم چیست؟',
            type: 'checkbox',
            options: ['پاداش مالی', 'تشویق کلامی', 'اهداف چالش‌برانگیز', 'آموزش و توسعه', 'خودمختاری'],
            required: true
          }
        ]
      },
      {
        id: 'step-3',
        title: 'ارزیابی عملکرد',
        description: 'نحوه ارزیابی عملکرد تیم',
        questions: [
          {
            id: 'q5',
            question: 'چگونه عملکرد تیم را ارزیابی می‌کنید؟',
            type: 'text',
            required: true
          },
          {
            id: 'q6',
            question: 'نظرات شما درباره بهبود عملکرد تیم چیست؟',
            type: 'text',
            required: false
          }
        ]
      }
    ]
  }
]

export const mockAssessments: Assessment[] = [
  {
    id: '1',
    managerId: '1',
    managerName: 'علی محمدی',
    templateId: 'template-1',
    templateName: 'ارزیابی مهارت‌های مدیریتی پایه',
    steps: mockAssessmentTemplates[0].steps,
    currentStep: 2,
    answers: {
      'step-1': {
        q1: '3-5 سال',
        q2: ['فروش', 'بازاریابی'],
        q3: 'تجربه مدیریت تیم فروش با 15 نفر نیرو'
      },
      'step-2': {
        q4: 4,
        q5: 'خوب',
        q6: ['مدیریت تیم', 'ارتباطات', 'برنامه‌ریزی استراتژیک']
      }
    },
    status: 'submitted',
    score: 85,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-05T14:30:00Z',
    submittedAt: '2024-11-05T14:30:00Z'
  }
]

export const mockPayments: Payment[] = [
  {
    id: '1',
    managerId: '1',
    managerName: 'علی محمدی',
    amount: 500000,
    currency: 'IRR',
    status: 'paid',
    type: 'after_results',
    paymentDate: '2024-11-10T12:00:00Z',
    invoiceId: 'inv-001'
  },
  {
    id: '2',
    managerId: '2',
    managerName: 'مریم احمدی',
    amount: 500000,
    currency: 'IRR',
    status: 'pending',
    type: 'before_results',
    dueDate: '2024-12-15T12:00:00Z'
  }
]

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    paymentId: '1',
    managerName: 'علی محمدی',
    amount: 500000,
    currency: 'IRR',
    status: 'generated',
    requestDate: '2024-11-10T12:00:00Z',
    generatedDate: '2024-11-11T10:00:00Z',
    pdfUrl: '/invoices/inv-001.pdf'
  }
]

export const mockExams: Exam[] = [
  {
    id: 'exam-1',
    title: 'آزمون مهارت‌های مدیریتی',
    description: 'ارزیابی مهارت‌های کلیدی مدیریت',
    status: 'active',
    assignedManagers: ['1', '2', '4'],
    totalQuestions: 20,
    duration: 60,
    createdAt: '2024-11-15T09:00:00Z',
    startDate: '2024-11-20T10:00:00Z',
    endDate: '2024-11-30T18:00:00Z'
  },
  {
    id: 'exam-2',
    title: 'آزمون رهبری و تیم‌سازی',
    description: 'ارزیابی توانایی‌های رهبری',
    status: 'completed',
    assignedManagers: ['1', '4'],
    totalQuestions: 15,
    duration: 45,
    createdAt: '2024-10-01T09:00:00Z',
    startDate: '2024-10-05T10:00:00Z',
    endDate: '2024-10-15T18:00:00Z'
  }
]

export const mockExamResults: ExamResult[] = [
  {
    id: 'result-1',
    examId: 'exam-1',
    examTitle: 'آزمون مهارت‌های مدیریتی',
    managerId: '1',
    managerName: 'علی محمدی',
    score: 17,
    totalScore: 20,
    percentage: 85,
    status: 'passed',
    completedAt: '2024-11-25T14:30:00Z',
    answers: {}
  },
  {
    id: 'result-2',
    examId: 'exam-2',
    examTitle: 'آزمون رهبری و تیم‌سازی',
    managerId: '1',
    managerName: 'علی محمدی',
    score: 13,
    totalScore: 15,
    percentage: 87,
    status: 'passed',
    completedAt: '2024-10-10T16:45:00Z',
    answers: {}
  },
  {
    id: 'result-3',
    examId: 'exam-1',
    examTitle: 'آزمون مهارت‌های مدیریتی',
    managerId: '4',
    managerName: 'فاطمه کریمی',
    score: 16,
    totalScore: 20,
    percentage: 80,
    status: 'passed',
    completedAt: '2024-11-22T11:20:00Z',
    answers: {}
  }
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'پرداخت موفق',
    message: 'پرداخت برای علی محمدی با موفقیت انجام شد.',
    type: 'payment',
    isRead: false,
    createdAt: '2024-11-10T12:00:00Z',
    actionUrl: '/owner/payments'
  },
  {
    id: 'notif-2',
    title: 'آزمون جدید',
    message: 'آزمون مهارت‌های مدیریتی برای شما فعال شده است.',
    type: 'exam',
    isRead: true,
    createdAt: '2024-11-15T09:00:00Z',
    actionUrl: '/owner/exams'
  },
  {
    id: 'notif-3',
    title: 'نیازسنجی تکمیل شده',
    message: 'نیازسنجی مریم احمدی نیاز به بررسی دارد.',
    type: 'assessment',
    isRead: false,
    createdAt: '2024-11-20T14:30:00Z',
    actionUrl: '/owner/assessment/2'
  }
]

export const mockSupportMessages: SupportMessage[] = [
  {
    id: 'msg-1',
    userId: 'owner-1',
    userName: 'مدیرعامل',
    message: 'مشکل در دسترسی به نتایج آزمون‌ها دارم.',
    type: 'user',
    createdAt: '2024-11-25T10:00:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    userId: 'admin-1',
    userName: 'پشتیبانی',
    message: 'مشکل بررسی شد. دسترسی شما بازیابی شده است.',
    type: 'admin',
    createdAt: '2024-11-25T10:30:00Z',
    isRead: true
  },
  {
    id: 'msg-3',
    userId: 'owner-1',
    userName: 'مدیرعامل',
    message: 'متشکرم از راهنمایی شما.',
    type: 'user',
    createdAt: '2024-11-25T11:00:00Z',
    isRead: false
  }
]

export const mockDashboardStats: DashboardStats = {
  totalManagers: 4,
  activeManagers: 3,
  completedAssessments: 2,
  activeExams: 1,
  completedExams: 1,
  pendingExams: 2,
  totalPaid: 500000,
  totalPending: 1000000,
  unreadNotifications: 2
}