import { useEffect, useState } from 'react'
import { Card, Button, Badge, Skeleton, Table, Tag } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineXCircle,
    HiOutlineEye
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import { getFinancialDocument } from '@/services/AdminService'
import type { FinancialDocument } from '@/@types/financialDocument'

const { Tr, Th, Td, THead, TBody } = Table

const FinancialDocumentView = () => {
    const { id } = useParams<{ id: string }>()
    const [document, setDocument] = useState<FinancialDocument | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (id) {
            loadDocument()
        }
    }, [id])

    const loadDocument = async () => {
        try {
            setLoading(true)
            const response = await getFinancialDocument(Number(id))
            if (response.success && response.data) {
                setDocument(response.data)
            }
        } catch (error) {
            console.error('Error loading document:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount
        return new Intl.NumberFormat('fa-IR').format(num) + ' تومان'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    const getStatusBadge = (status: FinancialDocument['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge className="bg-emerald-500">
                        <HiOutlineCheckCircle className="w-3 h-3 mr-1" />
                        پرداخت شده
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge className="bg-amber-500">
                        <HiOutlineClock className="w-3 h-3 mr-1" />
                        در انتظار پرداخت
                    </Badge>
                )
            case 'cancelled':
                return (
                    <Badge className="bg-red-500">
                        <HiOutlineXCircle className="w-3 h-3 mr-1" />
                        لغو شده
                    </Badge>
                )
            default:
                return <Badge>نامشخص</Badge>
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton width={200} height={40} />
                </div>
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <Skeleton width={180} height={32} className="mb-2" />
                            <Skeleton width={100} height={20} />
                        </div>
                        <Skeleton width={100} height={32} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Skeleton height={20} width={150} />
                        <Skeleton height={20} width={150} />
                        <Skeleton height={20} width={150} />
                        <Skeleton height={20} width={150} />
                    </div>
                </Card>
            </div>
        )
    }

    if (!document) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">سند مالی مورد نظر یافت نشد</p>
                <Button variant="plain" onClick={() => navigate('/admin/accounting/documents')} className="mt-4">
                    بازگشت
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div id="admin-financial-doc-view-header" className="flex items-center gap-4">
                <Button
                    variant="plain"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/admin/accounting/documents')}
                >
                    بازگشت به لیست اسناد
                </Button>
            </div>

            {/* Document Details */}
            <Card id="admin-financial-doc-view-details" className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {document.title}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            شناسه: <span className="font-mono">#{document.id}</span>
                        </p>
                    </div>
                    {getStatusBadge(document.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            شرکت / سازمان
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {document.company.name}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            مبلغ
                        </label>
                        <p className="text-2xl font-bold text-primary">
                            {formatCurrency(document.amount)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            تاریخ ایجاد
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatDate(document.created_date)}
                        </p>
                    </div>

                    {document.paid_date && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                تاریخ پرداخت
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(document.paid_date)}
                            </p>
                        </div>
                    )}
                </div>

                {document.description && (
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            توضیحات
                        </label>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            {document.description}
                        </p>
                    </div>
                )}

                {/* Associated Bills Section */}
                {document.bills && document.bills.length > 0 && (
                    <div id="admin-financial-doc-view-bills" className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            صورتحساب‌های مرتبط
                        </h3>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th>شماره صورتحساب</Th>
                                        <Th>تاریخ صدور</Th>
                                        <Th>مبلغ کل</Th>
                                        <Th>وضعیت</Th>
                                        <Th>عملیات</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {document.bills.map((bill) => (
                                        <Tr key={bill.id}>
                                            <Td>
                                                <span className="font-mono text-sm font-semibold">{bill.bill_number}</span>
                                            </Td>
                                            <Td>{formatDate(bill.created_at)}</Td>
                                            <Td>{formatCurrency(bill.total_amount)}</Td>
                                            <Td>
                                                {bill.status === 'paid' ? (
                                                    <Tag className="bg-emerald-100 text-emerald-600 border-0">پرداخت شده</Tag>
                                                ) : (
                                                    <Tag className="bg-amber-100 text-amber-600 border-0">در انتظار</Tag>
                                                )}
                                            </Td>
                                            <Td>
                                                <Button
                                                    size="xs"
                                                    icon={<HiOutlineEye />}
                                                    onClick={() => navigate(`/admin/accounting/bills/${bill.id}`)}
                                                >
                                                    مشاهده
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default FinancialDocumentView
