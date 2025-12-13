import { Company, mockCompanies } from '@/mock/data/adminData'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getCompanies(): Promise<Company[]> {
    await delay(500)
    return mockCompanies
}

export async function getCompanyById(id: string): Promise<Company | null> {
    await delay(300)
    return mockCompanies.find(company => company.id === id) || null
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
    await delay(500)
    const index = mockCompanies.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Company not found')

    mockCompanies[index] = { ...mockCompanies[index], ...data }
    return mockCompanies[index]
}

export async function deleteCompany(id: string): Promise<void> {
    await delay(500)
    const index = mockCompanies.findIndex(c => c.id === id)
    if (index !== -1) {
        mockCompanies.splice(index, 1)
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

