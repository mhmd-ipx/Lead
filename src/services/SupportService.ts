
import ApiService from './ApiService'
import API_ENDPOINTS from '@/constants/api.endpoints'
import type { SupportTicketsResponse, CreateTicketRequest, CreateTicketResponse, ReplyTicketRequest, ReplyTicketResponse, UpdateTicketRequest } from '@/@types/support'

export async function apiGetSupportTickets() {
    return ApiService.fetchDataWithAxios<SupportTicketsResponse>({
        url: API_ENDPOINTS.SUPPORT.GET_TICKETS,
        method: 'get',
    })
}

export async function apiCreateTicket(data: CreateTicketRequest) {
    return ApiService.fetchDataWithAxios<CreateTicketResponse, CreateTicketRequest>({
        url: API_ENDPOINTS.SUPPORT.CREATE_TICKET,
        method: 'post',
        data,
    })
}

export async function apiGetTicketDetail(id: string) {
    return ApiService.fetchDataWithAxios<CreateTicketResponse>({
        url: API_ENDPOINTS.SUPPORT.GET_TICKET_DETAIL(id),
        method: 'get',
    })
}

export async function apiReplyTicket(id: string, data: ReplyTicketRequest) {
    return ApiService.fetchDataWithAxios<ReplyTicketResponse, ReplyTicketRequest>({
        url: API_ENDPOINTS.SUPPORT.REPLY_TICKET(id),
        method: 'post',
        data,
    })
}

export async function apiUpdateTicket(id: string, data: UpdateTicketRequest) {
    return ApiService.fetchDataWithAxios<CreateTicketResponse, UpdateTicketRequest>({
        url: API_ENDPOINTS.SUPPORT.GET_TICKET_DETAIL(id),
        method: 'put',
        data,
    })
}
