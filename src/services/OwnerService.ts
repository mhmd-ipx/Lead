import {
  Manager,
  CompanyProfile,
  CompanyWithManagers,
  CreateManagerRequest,
  CreateManagerResponse,
  UpdateManagerRequest,
  UpdateManagerResponse,
  GetManagerResponse,
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
  mockCompanies,
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
import apiClient from '@/services/ApiClient'
import API_ENDPOINTS from '@/constants/api.endpoints'

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // In real implementation, this would be an API call
  // return ApiService.fetchDataWithAxios<DashboardStats>({ method: 'GET', url: '/owner/dashboard/stats' })
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDashboardStats), 500)
  })
}

// Company Profile
export const getCompanies = async (): Promise<CompanyProfile[]> => {
  try {
    const response = await apiClient.get<{ data: CompanyProfile[] }>(API_ENDPOINTS.COMPANY.MY_COMPANIES)
    return response.data
  } catch (error) {
    console.warn('Failed to fetch companies from API, using mock data:', error)
    return mockCompanies
  }
}

export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCompanyProfile), 300)
  })
}

export const getCompanyById = async (id: string): Promise<CompanyProfile | null> => {
  try {
    const response = await apiClient.get<{ data: any }>(API_ENDPOINTS.COMPANY.MY_COMPANIES)
    const companies = response.data

    // Find the company by ID from the list
    const company = companies.find((c: any) => c.id.toString() === id)

    if (!company) {
      return null
    }

    // Map snake_case API response to camelCase frontend format
    return {
      id: company.id?.toString() || '',
      name: company.name || '',
      legalName: company.legal_name || '',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      fieldOfActivity: company.field_of_activity || '',
      nationalId: company.national_id || '',
      economicCode: company.economic_code || '',
      address: company.address || '',
      description: company.description || '',
      logo: company.logo || '',
      manager_name: company.manager_name || '',
      manager_phone: company.manager_phone || ''
    }
  } catch (error) {
    console.error('Error fetching company by ID:', error)
    return null
  }
}

export const createCompany = async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
  // تبدیل داده‌ها به فرمت snake_case برای API
  const apiData = {
    name: data.name,
    legal_name: data.legalName,
    phone: data.phone,
    email: data.email,
    address: data.address,
    website: data.website,
    description: data.description,
    manager_name: data.manager_name,
    manager_phone: data.manager_phone,
  }

  console.log('📤 Sending company data:', apiData)

  const response = await apiClient.post<{ data: CompanyProfile }>(API_ENDPOINTS.COMPANY.BASE, apiData)
  return response.data
}

export const updateCompanyProfile = async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
  // Transform data to snake_case for API
  const apiData: any = {}

  if (data.name?.trim()) apiData.name = data.name.trim()
  if (data.legalName?.trim()) apiData.legal_name = data.legalName.trim()
  if (data.phone?.trim()) apiData.phone = data.phone.trim()
  if (data.email?.trim()) apiData.email = data.email.trim()
  if (data.address?.trim()) apiData.address = data.address.trim()
  if (data.website?.trim()) apiData.website = data.website.trim()
  if (data.description?.trim()) apiData.description = data.description.trim()
  if (data.manager_name?.trim()) apiData.manager_name = data.manager_name.trim()
  if (data.manager_phone?.trim()) apiData.manager_phone = data.manager_phone.trim()
  if (data.logo) apiData.logo = data.logo

  console.log('📝 Updating company data:', apiData)

  const response = await apiClient.put<{ data: CompanyProfile }>(
    `${API_ENDPOINTS.COMPANY.BASE}/${data.id}`,
    apiData
  )
  return response.data
}

// Managers
export const getMyManagers = async (): Promise<CompanyWithManagers[]> => {
  try {
    const response = await apiClient.get<{ data: CompanyWithManagers[] }>(API_ENDPOINTS.MANAGER.MY_MANAGERS)
    return response.data
  } catch (error) {
    console.error('Error fetching my managers:', error)
    throw error
  }
}

export const createManager = async (data: CreateManagerRequest): Promise<CreateManagerResponse> => {
  try {
    const response = await apiClient.post<CreateManagerResponse>(API_ENDPOINTS.MANAGER.CREATE, data)
    return response
  } catch (error) {
    console.error('Error creating manager:', error)
    throw error
  }
}

export const getManagerByIdFromAPI = async (id: number): Promise<GetManagerResponse['data']> => {
  try {
    const response = await apiClient.get<GetManagerResponse>(API_ENDPOINTS.MANAGER.GET_BY_ID(id))
    return response.data
  } catch (error) {
    console.error('Error fetching manager:', error)
    throw error
  }
}

export const updateManager = async (id: number, data: UpdateManagerRequest): Promise<UpdateManagerResponse> => {
  try {
    const response = await apiClient.put<UpdateManagerResponse>(API_ENDPOINTS.MANAGER.UPDATE(id), data)
    return response
  } catch (error) {
    console.error('Error updating manager:', error)
    throw error
  }
}

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