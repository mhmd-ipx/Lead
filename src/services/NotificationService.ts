import ApiService from './ApiService'
import type { NotificationsResponse, ReadNotificationResponse } from '@/@types/notification'

export async function apiGetNotifications() {
    return ApiService.fetchDataWithAxios<NotificationsResponse>({
        url: '/notifications',
        method: 'get',
    })
}

export async function apiGetUnreadNotifications() {
    return ApiService.fetchDataWithAxios<NotificationsResponse>({
        url: '/notifications?is_read=0',
        method: 'get',
    })
}

export async function apiMarkNotificationAsRead(id: number) {
    return ApiService.fetchDataWithAxios<ReadNotificationResponse>({
        url: `/notifications/${id}/read`,
        method: 'put',
    })
}
