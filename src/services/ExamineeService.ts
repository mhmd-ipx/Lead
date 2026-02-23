import apiClient from './ApiClient'

export async function apiStartExam(examId: number | string, collectionId: number | string, userId: number | string) {
    return apiClient.post<{ success: boolean; message: string; data: any }>('/exam-results', {
        exam_id: examId,
        exam_collection_id: collectionId,
        user_id: userId
    })
}

export async function apiGetMyAssignments() {
    return apiClient.get<{ success: boolean; data: any[] }>('/exam-collections/my-assignments')
}

export async function apiGetCollectionProgress(collectionId: number | string, userId: number | string) {
    return apiClient.get<{ success: boolean; data: any }>(`/exam-collections/${collectionId}/progress?user_id=${userId}`)
}

export async function apiGetExamResults(userId: number) {
    return apiClient.get<{ success: boolean; data: any[] }>(`/exam-results?user_id=${userId}`)
}

export async function apiGetExamQuestions(examId: string) {
    return apiClient.get<{ success: boolean; data: any }>(`/exams/${examId}`)
}

export async function apiSubmitExam(resultId: number | string, answers: any) {
    return apiClient.post<{ success: boolean; message: string; data: any }>(`/exam-results/${resultId}/submit`, {
        answers
    })
}
