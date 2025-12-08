import {
  Manager,
  CompanyProfile,
  Assessment,
  AssessmentTemplate,
  Payment,
  Invoice,
  Exam,
  ExamResult,
  Notification,
  SupportMessage,
  DashboardStats,
  mockManagers,
  mockCompanyProfile,
  mockAssessments,
  mockAssessmentTemplates,
  mockPayments,
  mockInvoices,
  mockExams,
  mockExamResults,
  mockNotifications,
  mockSupportMessages,
  mockDashboardStats
} from '@/mock/data/ownerData'

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // In real implementation, this would be an API call
  // return ApiService.fetchDataWithAxios<DashboardStats>({ method: 'GET', url: '/owner/dashboard/stats' })
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDashboardStats), 500)
  })
}

// Company Profile
export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCompanyProfile), 300)
  })
}

export const updateCompanyProfile = async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updated = { ...mockCompanyProfile, ...data }
      resolve(updated)
    }, 500)
  })
}

// Managers
export const getManagers = async (): Promise<Manager[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockManagers), 300)
  })
}

export const getManagerById = async (id: string): Promise<Manager | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const manager = mockManagers.find(m => m.id === id) || null
      resolve(manager)
    }, 300)
  })
}

export const createManager = async (data: Omit<Manager, 'id' | 'createdAt'>): Promise<Manager> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newManager: Manager = {
        ...data,
        id: `manager-${Date.now()}`,
        createdAt: new Date().toISOString()
      }
      resolve(newManager)
    }, 500)
  })
}

export const updateManager = async (id: string, data: Partial<Manager>): Promise<Manager> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const manager = mockManagers.find(m => m.id === id)
      if (manager) {
        const updated = { ...manager, ...data }
        resolve(updated)
      } else {
        throw new Error('Manager not found')
      }
    }, 500)
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteManager = async (_id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300)
  })
}

export const toggleManagerAccess = async (id: string, canViewResults: boolean): Promise<Manager> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const manager = mockManagers.find(m => m.id === id)
      if (manager) {
        const updated = { ...manager, canViewResults }
        resolve(updated)
      } else {
        throw new Error('Manager not found')
      }
    }, 300)
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendManagerInvite = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  })
}

// Assessment Templates
export const getAssessmentTemplates = async (): Promise<AssessmentTemplate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAssessmentTemplates), 300)
  })
}

export const getAssessmentTemplateById = async (id: string): Promise<AssessmentTemplate | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const template = mockAssessmentTemplates.find(t => t.id === id) || null
      resolve(template)
    }, 300)
  })
}

// Assessments
export const getAssessments = async (): Promise<Assessment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAssessments), 300)
  })
}

export const createAssessment = async (managerId: string, templateId: string): Promise<Assessment> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const manager = mockManagers.find(m => m.id === managerId)
      const template = await getAssessmentTemplateById(templateId)

      if (!manager || !template) {
        throw new Error('Manager or template not found')
      }

      const newAssessment: Assessment = {
        id: `assessment-${Date.now()}`,
        managerId,
        managerName: manager.name,
        templateId,
        templateName: template.name,
        steps: template.steps,
        currentStep: 0,
        answers: {},
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add to mock data for persistence in this session
      mockAssessments.push(newAssessment)

      resolve(newAssessment)
    }, 500)
  })
}

export const getAssessmentByManagerId = async (managerId: string): Promise<Assessment | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assessment = mockAssessments.find(a => a.managerId === managerId) || null
      resolve(assessment)
    }, 300)
  })
}

export const updateAssessment = async (id: string, data: Partial<Assessment>): Promise<Assessment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assessment = mockAssessments.find(a => a.id === id)
      if (assessment) {
        const updated = { ...assessment, ...data, updatedAt: new Date().toISOString() }
        resolve(updated)
      } else {
        throw new Error('Assessment not found')
      }
    }, 500)
  })
}

export const submitAssessment = async (id: string): Promise<Assessment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assessment = mockAssessments.find(a => a.id === id)
      if (assessment) {
        const updated = {
          ...assessment,
          status: 'submitted' as const,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        resolve(updated)
      } else {
        throw new Error('Assessment not found')
      }
    }, 500)
  })
}

// Payments
export const getPayments = async (): Promise<Payment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPayments), 300)
  })
}

export const createPayment = async (data: Omit<Payment, 'id'>): Promise<Payment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPayment: Payment = {
        ...data,
        id: `payment-${Date.now()}`
      }
      resolve(newPayment)
    }, 500)
  })
}

export const payForManager = async (managerId: string, type: 'before_results' | 'after_results'): Promise<Payment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const manager = mockManagers.find(m => m.id === managerId)
      if (manager) {
        const newPayment: Payment = {
          id: `payment-${Date.now()}`,
          managerId,
          managerName: manager.name,
          amount: 500000,
          currency: 'IRR',
          status: 'paid',
          type,
          paymentDate: new Date().toISOString()
        }
        resolve(newPayment)
      } else {
        throw new Error('Manager not found')
      }
    }, 500)
  })
}

export const payForAllManagers = async (type: 'before_results' | 'after_results'): Promise<Payment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const payments: Payment[] = mockManagers.map(manager => ({
        id: `payment-${Date.now()}-${manager.id}`,
        managerId: manager.id,
        managerName: manager.name,
        amount: 500000,
        currency: 'IRR',
        status: 'paid',
        type,
        paymentDate: new Date().toISOString()
      }))
      resolve(payments)
    }, 1000)
  })
}

// Invoices
export const getInvoices = async (): Promise<Invoice[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockInvoices), 300)
  })
}

export const requestInvoice = async (paymentId: string): Promise<Invoice> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const payment = mockPayments.find(p => p.id === paymentId)
      if (payment) {
        const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          paymentId,
          managerName: payment.managerName,
          amount: payment.amount,
          currency: payment.currency,
          status: 'requested',
          requestDate: new Date().toISOString()
        }
        resolve(newInvoice)
      } else {
        throw new Error('Payment not found')
      }
    }, 500)
  })
}

export const downloadInvoice = async (id: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`/invoices/${id}.pdf`)
    }, 500)
  })
}

// Exams
export const getExams = async (): Promise<Exam[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockExams), 300)
  })
}

export const getExamResults = async (): Promise<ExamResult[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockExamResults), 300)
  })
}

export const getExamResultsByManager = async (managerId: string): Promise<ExamResult[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = mockExamResults.filter(r => r.managerId === managerId)
      resolve(results)
    }, 300)
  })
}

// Notifications
export const getNotifications = async (): Promise<Notification[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockNotifications), 300)
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const markNotificationAsRead = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300)
  })
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300)
  })
}

// Support
export const getSupportMessages = async (): Promise<SupportMessage[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockSupportMessages), 300)
  })
}

export const sendSupportMessage = async (message: string): Promise<SupportMessage> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMessage: SupportMessage = {
        id: `msg-${Date.now()}`,
        userId: 'owner-1',
        userName: 'مدیرعامل',
        message,
        type: 'user',
        createdAt: new Date().toISOString(),
        isRead: false
      }
      resolve(newMessage)
    }, 500)
  })
}