import apiClient from '@/services/ApiClient'
import { Company, mockCompanies } from '@/mock/data/adminData'

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

// Assessment services
import {
    CompletedAssessment,
    mockCompletedAssessments,
    AssessmentTemplate,
    mockAssessmentTemplates
} from '@/mock/data/adminData'

export async function getCompletedAssessments(): Promise<CompletedAssessment[]> {
    await delay(500)
    return mockCompletedAssessments
}

export async function getAssessmentById(id: string): Promise<CompletedAssessment | null> {
    await delay(300)
    return mockCompletedAssessments.find(assessment => assessment.id === id) || null
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

