export interface FinancialDocument {
    id: number
    payment_id: number | null
    title: string
    amount: string
    currency: string
    type: 'invoice' | 'income' | 'expense'
    status: 'pending' | 'paid' | 'cancelled'
    description: string | null
    created_date: string
    paid_date: string | null
    created_at: string
    updated_at: string
    company_id: number
    company: {
        id: number
        name: string
        legal_name: string
        phone: string | null
        email: string | null
        address: string | null
        national_id: string | null
        economic_code: string | null
        field_of_activity: string | null
        logo: string | null
        website: string | null
        description: string | null
        owner_id: number
        status: string
        created_at: string
        updated_at: string
    }
}

export interface CreateFinancialDocumentRequest {
    company_id: number
    title: string
    amount: number
    currency: string
    type: 'invoice' | 'income' | 'expense'
    status: 'pending' | 'paid' | 'cancelled'
    description?: string
    created_date: string
    paid_date?: string
}

export interface FinancialDocumentsResponse {
    success: boolean
    data: FinancialDocument[]
}

export interface CreateFinancialDocumentResponse {
    success: boolean
    message: string
    data: FinancialDocument
}

export interface UpdateFinancialDocumentRequest {
    title: string
    amount: number
    currency: string
    type: 'invoice' | 'income' | 'expense'
    status: 'pending' | 'paid' | 'cancelled'
    description?: string
    paid_date?: string
}

export interface UpdateFinancialDocumentResponse {
    success: boolean
    message: string
    data: FinancialDocument
}

export interface FinancialDocumentDetailResponse {
    success: boolean
    data: FinancialDocument
}

export interface DeleteFinancialDocumentResponse {
    success: boolean
    message: string
}

export interface CreateBillFromDocumentsRequest {
    company_id: number
    financial_document_ids: number[]
    official_invoice_requested: boolean
}

export interface Bill {
    id: number
    company_id: number
    official_invoice_requested: boolean
    bill_number: string
    currency: string
    description: string | null
    due_date: string
    paid_date: string | null
    total_amount: string
    status: string
    created_at: string
    updated_at: string
    official_invoice_pdf_url: string | null
    financial_documents_count?: number
    financial_documents?: FinancialDocument[]
    items?: {
        id: number
        bill_id: number
        financial_document_id: number
        financial_document: FinancialDocument
    }[]
    company?: {
        id: number
        name: string
        // other company fields...
    }
}

export interface CreateBillFromDocumentsResponse {
    success: boolean
    message: string
    data: Bill
}

