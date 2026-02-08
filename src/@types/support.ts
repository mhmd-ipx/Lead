
import type { ApiResponse } from './api'

export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketCategory = 'financial' | 'technical' | 'general'

export interface SupportTicketUser {
    id: number
    name: string
    email: string | null
    phone: string
    role: string
    avatar: string | null
    status?: string
    last_login?: string | null
    email_verified_at?: string | null
    created_at?: string
    updated_at?: string
}

export interface TicketMessage {
    id: number
    ticket_id: number
    user_id: number
    message: string
    type: 'user' | 'admin' | 'system'
    attachments: any | null
    is_read: boolean
    created_at: string
    updated_at: string
    user?: SupportTicketUser
}

export interface SupportTicket {
    id: number
    user_id: number
    ticket_number: string
    subject: string
    category: TicketCategory | string
    priority: TicketPriority
    status: TicketStatus
    closed_at: string | null
    created_at: string
    updated_at: string
    user?: SupportTicketUser
    messages?: TicketMessage[]
}

export interface CreateTicketRequest {
    subject: string
    category: string
    priority: string
    message: string
}

export interface ReplyTicketRequest {
    message: string
    attachments: string[] | null
}

export interface UpdateTicketRequest {
    status?: TicketStatus
    priority?: TicketPriority
}

export type CreateTicketResponse = ApiResponse<SupportTicket>
export type ReplyTicketResponse = ApiResponse<TicketMessage>
export type SupportTicketsResponse = ApiResponse<SupportTicket[]>
