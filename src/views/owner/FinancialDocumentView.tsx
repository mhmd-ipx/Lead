import { useEffect, useState } from 'react'
import { Card, Button, Badge } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineCash,
    HiOutlineCheckCircle,
    HiOutlineClock,
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import type { FinancialDocument } from '@/mock/data/ownerData'

const FinancialDocumentView = () => {
    const { id } = useParams<{ id: string }>()
    const [document, setDocument] = useState<FinancialDocument | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (id) {
            loadDocument()
        }
    }, [id])

    const loadDocument = async () => {
        try {
            // TODO: Replace with actual API call
            const mockDoc: FinancialDocument = {
                id: 'fd-001',
                managerName: 'علی محمدی',
                title: 'هزینه آزمون مدیریتی',
                amount: 500000,
                currency: 'IRR',
                status: 'pending',
                createdDate: '2024-12-01T10:00:00Z',
                description: 'هزینه شرکت در آزمون مهارت‌های مدیریتی دوره پاییز 1403',
            }
            setDocument(mockDoc)
        } catch (error) {
            console.error('Error loading document:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    const getStatusBadge = (status: FinancialDocument['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge className="bg-green-500">
                        <HiOutlineCheckCircle className="w-3 h-3 mr-1" />
                        پرداخت شده
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge className="bg-orange-500">
                        <HiOutlineClock className="w-3 h-3 mr-1" />
                        در انتظار پرداخت
                    </Badge>
                )
            default:
                return <Badge>نامشخص</Badge>
        }
    }

    const handlePayment = async () => {
        if (!document) return

        setProcessing(true)
        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Navigate to bills page after payment
            alert('پرداخت با موفقیت انجام شد و صورتحساب ساخته شد')
            navigate('/owner/accounting/bills')
        } catch (error) {
            console.error('Error processing payment:', error)
            alert('خطا در پردخت')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!document) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">سند مالی مورد نظر یافت نشد</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="plain"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/owner/accounting/documents')}
                >
                    بازگشت به لیست اسناد
                </Button>
            </div>

            {/* Document Details */}
            <Card className="p-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            متقاضی
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {document.managerName}
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
                            {formatDate(document.createdDate)}
                        </p>
                    </div>

                    {document.paidDate && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                تاریخ پرداخت
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(document.paidDate)}
                            </p>
                        </div>
                    )}
                </div>

                {document.description && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            توضیحات
                        </label>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            {document.description}
                        </p>
                    </div>
                )}

                {/* Payment Section */}
                {document.status === 'pending' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                            <p className="text-sm text-blue-900 dark:text-blue-200">
                                با پرداخت این سند، یک صورتحساب جدید برای شما ایجاد می‌شود که می‌توانید از قسمت
                                صورتحساب‌ها مشاهده و دانلود کنید.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="plain"
                                onClick={() => navigate('/owner/accounting/documents')}
                            >
                                انصراف
                            </Button>
                            <Button
                                variant="solid"
                                icon={<HiOutlineCash />}
                                onClick={handlePayment}
                                loading={processing}
                            >
                                پرداخت {formatCurrency(document.amount)}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Paid Info */}
                {document.status === 'paid' && document.billId && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <p className="text-sm text-green-900 dark:text-green-200 mb-3">
                                این سند پرداخت شده است و در صورتحساب شماره {document.billId} قرار دارد.
                            </p>
                            <Button
                                variant="solid"
                                size="sm"
                                onClick={() => navigate(`/owner/accounting/bills/${document.billId}`)}
                            >
                                مشاهده صورتحساب
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default FinancialDocumentView
