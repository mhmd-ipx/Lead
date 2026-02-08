import type { ApiResponse } from './api'

export type NotificationType = 'system' | 'payment' | 'support' | 'assessment'

export interface Notification {
    id: number
    user_id: number
    title: string
    message: string
    type: NotificationType
    is_read: boolean
    action_url: string | null
    created_at: string
    updated_at: string
}

export type NotificationsResponse = ApiResponse<Notification[]>
export type ReadNotificationResponse = ApiResponse<Notification>
