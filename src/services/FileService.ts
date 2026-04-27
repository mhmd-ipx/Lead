import apiClient from './ApiClient'
import type { ApiResponse } from '@/@types/api'

export interface FileResponse {
    id: number
    name: string
    size: number
    type: string
    address: string
    created_at: string
    updated_at: string
    parent_id?: number | null
    is_folder?: number
}

/**
 * آپلود فایل
 * POST /files/upload
 */
export async function apiUploadFile(file: File | Blob, onProgress?: (progress: number) => void) {
    return apiClient.uploadFile<FileResponse>(
        '/files/upload',
        file,
        'file',
        undefined,
        {
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress(percentCompleted)
                }
            }
        }
    )
}

/**
 * دریافت اطلاعات فایل
 * GET /files/{id}
 */
export async function apiGetFileInfo(id: number | string) {
    return apiClient.get<FileResponse>(`/files/${id}`)
}

const FileService = {
    apiUploadFile,
    apiGetFileInfo
}

export default FileService
