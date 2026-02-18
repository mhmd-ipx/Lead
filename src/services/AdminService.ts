import apiClient from '@/services/ApiClient'
import { Company, mockCompanies } from '@/mock/data/adminData'
import { Manager } from '@/mock/data/ownerData'
import API_ENDPOINTS from '@/constants/api.endpoints'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getCompanies(): Promise<Company[]> {
    try {
        const response = await apiClient.get<{ data: any[] }>('/companies')
        return response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            legalName: item.legal_name || '',
            phone: item.phone || '',
            email: item.email || '',
            address: item.address || '',
            nationalId: item.national_id,
            economicCode: item.economic_code,
            fieldOfActivity: item.field_of_activity,
            logo: item.logo,
            website: item.website,
            description: item.description,
            // Map owner details
            owner_id: item.owner_id,
            owner: item.owner,
            // Map legacy fields for existing UI components
            ownerName: item.owner?.name || 'نامشخص',
            ownerEmail: item.owner?.email || '-',
            ownerPhone: item.owner?.phone || '-',
            // Map managers count
            managers_count: item.managers_count || 0,

            status: item.status || 'active',
            createdAt: item.created_at,
            updatedAt: item.updated_at
        }))
    } catch (error) {
        console.error('Error fetching companies:', error)
        // Fallback to mock data if API fails (optional, based on requirement, usually we want to show error)
        // For now let's return mock if dev env or empty array
        return []
    }
}

export async function getCompanyById(id: string): Promise<Company | null> {
    try {
        const response = await apiClient.get<{ data: any[] }>('/companies')
        const companies = response.data

        // Find the company by ID from the list
        const company = companies.find((c: any) => c.id.toString() === id)

        if (!company) {
            return null
        }

        // Map snake_case API response to camelCase frontend format
        return {
            id: company.id,
            name: company.name,
            legalName: company.legal_name || '',
            phone: company.phone || '',
            email: company.email || '',
            address: company.address || '',
            nationalId: company.national_id,
            economicCode: company.economic_code,
            fieldOfActivity: company.field_of_activity,
            logo: company.logo,
            website: company.website,
            description: company.description,
            // Map owner details
            owner_id: company.owner_id,
            owner: company.owner,
            // Map legacy fields for existing UI components
            ownerName: company.owner?.name || 'نامشخص',
            ownerEmail: company.owner?.email || '-',
            ownerPhone: company.owner?.phone || '-',
            // Map managers count
            managers_count: company.managers_count || 0,

            status: company.status || 'active',
            createdAt: company.created_at,
            updatedAt: company.updated_at
        }
    } catch (error) {
        console.error('Error fetching company by ID:', error)
        return null
    }
}

export async function createCompany(company: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    await delay(500)
    const newCompany: Company = {
        ...company,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    }
    mockCompanies.push(newCompany)
    return newCompany
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    try {
        // Transform data to snake_case for API (only company fields, not owner fields)
        const apiData: any = {}

        if (data.name?.trim()) apiData.name = data.name.trim()
        if (data.legalName?.trim()) apiData.legal_name = data.legalName.trim()
        if (data.phone?.trim()) apiData.phone = data.phone.trim()
        if (data.email?.trim()) apiData.email = data.email.trim()
        if (data.address?.trim()) apiData.address = data.address.trim()
        if (data.website?.trim()) apiData.website = data.website.trim()
        if (data.description?.trim()) apiData.description = data.description.trim()
        if (data.nationalId?.trim()) apiData.national_id = data.nationalId.trim()
        if (data.economicCode?.trim()) apiData.economic_code = data.economicCode.trim()
        if (data.fieldOfActivity?.trim()) apiData.field_of_activity = data.fieldOfActivity.trim()
        if (data.status) apiData.status = data.status
        if (data.logo) apiData.logo = data.logo

        console.log('📝 Updating company data (Admin):', apiData)

        const response = await apiClient.put<{ data: any }>(
            `/companies/${id}`,
            apiData
        )

        const company = response.data

        // Map response back to frontend format
        return {
            id: company.id,
            name: company.name,
            legalName: company.legal_name || '',
            phone: company.phone || '',
            email: company.email || '',
            address: company.address || '',
            nationalId: company.national_id,
            economicCode: company.economic_code,
            fieldOfActivity: company.field_of_activity,
            logo: company.logo,
            website: company.website,
            description: company.description,
            owner_id: company.owner_id,
            owner: company.owner,
            ownerName: company.owner?.name || 'نامشخص',
            ownerEmail: company.owner?.email || '-',
            ownerPhone: company.owner?.phone || '-',
            managers_count: company.managers_count || 0,
            status: company.status || 'active',
            createdAt: company.created_at,
            updatedAt: company.updated_at
        }
    } catch (error) {
        console.error('Error updating company:', error)
        throw error
    }
}

export async function deleteCompany(id: string): Promise<void> {
    try {
        await apiClient.delete(`/companies/${id}`)
        console.log('🗑️ Company deleted:', id)
    } catch (error) {
        console.error('Error deleting company:', error)
        throw error
    }
}

// Manager services
export async function getManagersByCompany(companyId: number): Promise<Manager[]> {
    try {
        const response = await apiClient.get<{ data: Manager[] }>(API_ENDPOINTS.MANAGER.GET_BY_COMPANY(companyId))
        return response.data
    } catch (error) {
        console.error('Error fetching managers by company:', error)
        throw error
    }
}

export async function deleteManager(id: number): Promise<void> {
    try {
        await apiClient.delete(API_ENDPOINTS.MANAGER.DELETE(id))
    } catch (error) {
        console.error('Error deleting manager:', error)
        throw error
    }
}

// Assessment services
import {
    CompletedAssessment,
    mockCompletedAssessments,
    AssessmentTemplate,
    mockAssessmentTemplates
} from '@/mock/data/adminData'
import { AdminCompletedAssessmentListResponse, AdminCompletedAssessment } from '@/@types/adminAssessment'

export async function getCompletedAssessments(): Promise<AdminCompletedAssessment[]> {
    try {
        const response = await apiClient.get<AdminCompletedAssessmentListResponse>('/assessments/?status=submitted')

        if (response.success && Array.isArray(response.data)) {
            // Return the data directly with assignedExams initialized to empty array
            return response.data.map(item => ({
                ...item,
                assignedExams: item.assignedExams || []
            }))
        }
        return []
    } catch (error) {
        console.error('Error fetching completed assessments:', error)
        return []
    }
}

export async function getAssessmentById(id: string): Promise<CompletedAssessment | null> {
    try {
        // Since we don't have a direct /assessments/{id} endpoint mentioned in the prompt (only list),
        // we can fetch the list and find the item, OR if there is one, use it. 
        // Typically REST is /assessments/{id}. Let's try that or fallback to list filtering.
        // User provided: {{base}}/assessments/?status=submitted

        // Let's try to fetch the specific assessment. 
        // Assuming /assessments/{id} exists or filtering the list.

        const response = await apiClient.get<AdminCompletedAssessmentListResponse>(`/assessments/?status=submitted`)
        if (response.success && Array.isArray(response.data)) {
            const item = response.data.find(a => a.id.toString() === id)
            if (!item) return null

            // Now we need to fully hydrate this object for the view
            // 1. Get Template details to have Steps and Questions
            // 2. Map Answers to the Steps/Questions structure

            const templateId = item.template_id
            const template = await getAssessmentTemplate(templateId)

            if (!template) return null // Should't happen if data integrity is good

            // Parse Answers
            // The answers in API are either:
            // Type A: { "1": "Value", "2": "Value" } (Key is QuestionID)
            // Type B: { "4": { step_number: 0, question_number: 1, answer: "..." } }

            const mappedAnswers: Record<string, Record<string, any>> = {}

            // Initialize mapped answers structure based on template steps
            // template.steps.forEach(s => mappedAnswers[s.id] = {}) 
            // BUT template step IDs are numbers in API (e.g., 1), UI might expect strings 'step-1'.
            // The Mock data used string IDs 'step-1', 'q1'.
            // The Real API uses number IDs.
            // We need to adhere to the CompletedAssessment interface which uses `steps: AssessmentStep[]`.
            // And `AssessmentStep` has `id: string`.

            // Let's convert Template structure to the UI expected structure
            const uiSteps = template.steps.map(step => ({
                id: step.id.toString(),
                title: step.title,
                description: step.description,
                questions: step.questions.map(q => ({
                    id: q.id.toString(),
                    question: q.question,
                    type: q.type,
                    options: q.options,
                    required: q.required
                }))
            }))

            // Process Answers
            const rawAnswers = item.answers

            uiSteps.forEach(step => {
                const stepAnswers: Record<string, any> = {}
                step.questions.forEach(q => {
                    // Try to find answer for question q.id (e.g., "1")
                    const key = q.id

                    if (rawAnswers[key]) {
                        const val = rawAnswers[key]
                        // Check if it's complex object or direct value
                        if (val && typeof val === 'object' && 'answer' in val && !Array.isArray(val)) {
                            stepAnswers[key] = (val as any).answer
                        } else {
                            stepAnswers[key] = val
                        }
                    }
                })
                mappedAnswers[step.id] = stepAnswers
            })

            return {
                id: item.id.toString(),
                managerId: item.manager_id.toString(),
                managerName: `User ${item.manager.user_id}`, // In real app, fetch user name
                companyId: item.manager.company_id.toString(),
                companyName: `Company ${item.manager.company_id}`, // In real app, fetch company name
                ownerId: '0',
                ownerName: 'Unknown', // Need extra data
                templateId: item.template_id.toString(),
                templateName: item.template.name,
                steps: uiSteps,
                currentStep: item.current_step,
                answers: mappedAnswers,
                status: item.status as 'draft' | 'submitted',
                score: 0, // Removed score
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                submittedAt: item.submitted_at || undefined,
                assignedExams: [] // Placeholder
            }
        }

        return null
    } catch (error) {
        console.error('Error fetching assessment by ID:', error)
        return null
    }
}

export async function getAssessmentTemplates(): Promise<AssessmentTemplate[]> {
    await delay(500)
    return mockAssessmentTemplates
}

export async function getAssessmentTemplateById(id: string): Promise<AssessmentTemplate | null> {
    await delay(300)
    return mockAssessmentTemplates.find(template => template.id === id) || null
}

export async function updateAssessmentTemplate(id: string, data: Partial<AssessmentTemplate>): Promise<AssessmentTemplate> {
    await delay(500)
    const index = mockAssessmentTemplates.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Assessment template not found')

    mockAssessmentTemplates[index] = { ...mockAssessmentTemplates[index], ...data }
    return mockAssessmentTemplates[index]
}

export async function assignExamsToAssessment(assessmentId: string, examIds: string[]): Promise<void> {
    await delay(500)
    const assessment = mockCompletedAssessments.find(a => a.id === assessmentId)
    if (assessment) {
        assessment.assignedExams = examIds
    }
}

// Exam services
import { Exam, mockExams } from '@/mock/data/adminData'

export async function getExams(): Promise<Exam[]> {
    await delay(500)
    return mockExams
}

// Applicant Exam Sets services
import { ApplicantExamSet, mockApplicantExamSets, ExamItem, mockExamItems } from '@/mock/data/adminData'

export async function getApplicantExamSets(): Promise<ApplicantExamSet[]> {
    await delay(500)
    return mockApplicantExamSets
}

export async function getExamItems(): Promise<ExamItem[]> {
    await delay(300)
    return mockExamItems
}


import { AssessmentTemplate as ApiAssessmentTemplate, AssessmentTemplateListResponse } from '@/@types/assessment'

export async function getAssessmentTemplate(id: number = 1): Promise<ApiAssessmentTemplate | null> {
    try {
        const response = await apiClient.get<AssessmentTemplateListResponse>(`/assessment-templates/?template=${id}`)


        if (response.success && response.data.length > 0) {
            const apiData = response.data[0]

            // Map apiData (snake_case) to frontend model (camelCase)
            return {
                id: apiData.id,
                name: apiData.name,
                description: apiData.description,
                category: apiData.category,
                estimatedTime: apiData.estimated_time,
                status: apiData.status,
                createdBy: apiData.created_by,
                createdAt: apiData.created_at,
                updatedAt: apiData.updated_at,
                steps: apiData.steps ? apiData.steps.map(step => ({
                    id: step.id,
                    templateId: step.template_id,
                    title: step.title,
                    description: step.description,
                    order: step.order,
                    createdAt: step.created_at,
                    updatedAt: step.updated_at,
                    questions: step.questions ? step.questions.map(q => ({
                        id: q.id,
                        stepId: q.step_id,
                        question: q.question,
                        type: q.type,
                        options: q.options || [],
                        required: q.required,
                        order: q.order,
                        createdAt: q.created_at,
                        updatedAt: q.updated_at
                    })) : []
                })) : [],
                creator: apiData.creator ? {
                    id: apiData.creator.id,
                    name: apiData.creator.name,
                    email: apiData.creator.email,
                    phone: apiData.creator.phone,
                    role: apiData.creator.role,
                    status: apiData.creator.status,
                    avatar: apiData.creator.avatar,
                    lastLogin: apiData.creator.last_login,
                    createdAt: apiData.creator.created_at,
                    updatedAt: apiData.creator.updated_at
                } : undefined
            }
        }
        return null
    } catch (error) {
        console.error('Error fetching assessment template:', error)
        // Ensure we don't break the UI if API fails, return null
        return null
    }
}

// Step API
export async function createAssessmentStep(data: any): Promise<any> {
    try {
        const response = await apiClient.post<any>('/assessment-steps', {
            template_id: 1, // Fixed ID as requested for now
            title: data.title,
            description: data.description,
            order: data.order
        })
        return response
    } catch (error) {
        console.error('Error creating step:', error)
        throw error
    }
}

export async function updateAssessmentStep(id: number, data: any): Promise<any> {
    try {
        const response = await apiClient.put<any>(`/assessment-steps/${id}`, {
            title: data.title,
            description: data.description,
            order: data.order
        })
        return response
    } catch (error) {
        console.error('Error updating step:', error)
        throw error
    }
}

export async function deleteAssessmentStep(id: number): Promise<void> {
    try {
        await apiClient.delete(`/assessment-steps/${id}`)
    } catch (error) {
        console.error('Error deleting step:', error)
        throw error
    }
}

// Question API
export async function createAssessmentQuestion(data: any): Promise<any> {
    try {
        const response = await apiClient.post<any>('/assessment-questions', {
            step_id: data.stepId,
            question: data.question,
            type: data.type,
            options: data.options,
            required: data.required,
            order: data.order
        })
        return response
    } catch (error) {
        console.error('Error creating question:', error)
        throw error
    }
}

export async function updateAssessmentQuestion(id: number, data: any): Promise<any> {
    try {
        const response = await apiClient.put<any>(`/assessment-questions/${id}`, {
            step_id: data.stepId,
            question: data.question,
            type: data.type,
            options: data.options,
            required: data.required,
            order: data.order
        })
        return response
    } catch (error) {
        console.error('Error updating question:', error)
        throw error
    }
}

export async function deleteAssessmentQuestion(id: number): Promise<void> {
    try {
        await apiClient.delete(`/assessment-questions/${id}`)
    } catch (error) {
        console.error('Error deleting question:', error)
        throw error
    }
}

// Financial Documents
export async function getFinancialDocuments(params?: any) {
    try {
        const response = await apiClient.get('/financial-documents', { params })
        return response
    } catch (error) {
        console.error('Error fetching financial documents:', error)
        throw error
    }
}

export async function createFinancialDocument(data: any) {
    try {
        const response = await apiClient.post('/financial-documents', data)
        return response
    } catch (error) {
        console.error('Error creating financial document:', error)
        throw error
    }
}

export async function getFinancialDocument(id: number) {
    try {
        const response = await apiClient.get(`/financial-documents/${id}`)
        return response
    } catch (error) {
        console.error('Error fetching financial document:', error)
        throw error
    }
}

export async function updateFinancialDocument(id: number, data: any) {
    try {
        const response = await apiClient.put(`/financial-documents/${id}`, data)
        return response
    } catch (error) {
        console.error('Error updating financial document:', error)
        throw error
    }
}

export async function deleteFinancialDocument(id: number) {
    try {
        const response = await apiClient.delete(`/financial-documents/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting financial document:', error)
        throw error
    }
}

export async function createBillFromDocuments(data: {
    company_id: number
    financial_document_ids: number[]
    official_invoice_requested: boolean
}) {
    try {
        const response = await apiClient.post('/bills/from-documents', data)
        return response
    } catch (error) {
        console.error('Error creating bill from documents:', error)
        throw error
    }
}

export async function getBills(params?: any) {
    try {
        const response = await apiClient.get('/bills', { params })
        return response
    } catch (error) {
        console.error('Error fetching bills:', error)
        throw error
    }
}

export async function getBill(id: number) {
    try {
        const response = await apiClient.get(`/bills/${id}`)
        return response
    } catch (error) {
        console.error('Error fetching bill:', error)
        throw error
    }
}

export async function updateBill(id: number, data: any) {
    try {
        const response = await apiClient.put(`/bills/${id}`, data)
        return response
    } catch (error) {
        console.error('Error updating bill:', error)
        throw error
    }
}

export async function payBill(id: number) {
    try {
        const response = await apiClient.post(`/bills/${id}/pay`)
        return response
    } catch (error) {
        console.error('Error paying bill:', error)
        throw error
    }
}

export async function deleteBill(id: number) {
    try {
        const response = await apiClient.delete(`/bills/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting bill:', error)
        throw error
    }
}

export async function addDocumentToBill(billId: number, documentIds: number[]) {
    try {
        const response = await apiClient.post(`/bills/${billId}/documents`, {
            financial_document_ids: documentIds
        })
        return response
    } catch (error) {
        console.error('Error adding documents to bill:', error)
        throw error
    }
}

export async function removeDocumentFromBill(billId: number, documentId: number) {
    try {
        const response = await apiClient.delete(`/bills/${billId}/documents/${documentId}`)
        return response
    } catch (error) {
        console.error('Error removing document from bill:', error)
        throw error
    }
}

// Exams - REAL API
import { Exam as ApiExam, ExamListResponse } from '@/@types/exam'

export async function getExamsList(): Promise<ApiExam[]> {
    try {
        const response = await apiClient.get<ExamListResponse>('/exams')
        if (response.success && Array.isArray(response.data)) {
            return response.data
        }
        return []
    } catch (error) {
        console.error('Error fetching exams list:', error)
        throw error
    }
}

import { CreateExamRequest } from '@/@types/exam'

export async function createExam(data: CreateExamRequest): Promise<any> {
    try {
        const response = await apiClient.post('/exams', data)
        return response
    } catch (error) {
        console.error('Error creating exam:', error)
        throw error
    }
}

export async function getExam(id: string): Promise<any> {
    try {
        const response = await apiClient.get<any>(`/exams/${id}`)
        return response
    } catch (error) {
        console.error('Error fetching exam:', error)
        throw error
    }
}

export async function updateExam(id: string, data: any): Promise<any> {
    try {
        const response = await apiClient.put<any>(`/exams/${id}`, data)
        return response
    } catch (error) {
        console.error('Error updating exam:', error)
        throw error
    }
}

export async function addExamSection(examId: string, data: any): Promise<any> {
    try {
        const response = await apiClient.post<any>(`/exams/${examId}/sections`, data)
        return response
    } catch (error) {
        console.error('Error adding exam section:', error)
        throw error
    }
}

export async function deleteExamSection(sectionId: string): Promise<any> {
    try {
        const response = await apiClient.delete<any>(`/exam-sections/${sectionId}`)
        return response
    } catch (error) {
        console.error('Error deleting exam section:', error)
        throw error
    }
}

export async function updateExamSection(sectionId: string, data: any): Promise<any> {
    try {
        const response = await apiClient.put<any>(`/exam-sections/${sectionId}`, data)
        return response
    } catch (error) {
        console.error('Error updating exam section:', error)
        throw error
    }
}

// Add Question is currently under development as per user request
export async function addExamQuestion(sectionId: string, data: any): Promise<any> {
    // This might be updated later
    try {
        const response = await apiClient.post<any>(`/exam-sections/${sectionId}/questions`, data)
        return response
    } catch (error) {
        console.error('Error adding exam question:', error)
        throw error
    }
}

export async function deleteExamQuestion(questionId: string): Promise<any> {
    try {
        const response = await apiClient.delete<any>(`/questions/${questionId}`)
        return response
    } catch (error) {
        console.error('Error deleting exam question:', error)
        throw error
    }
}

export async function updateExamQuestion(questionId: string, data: any): Promise<any> {
    try {
        const response = await apiClient.put<any>(`/questions/${questionId}`, data)
        return response
    } catch (error) {
        console.error('Error updating exam question:', error)
        throw error
    }
}
