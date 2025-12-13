import { useEffect, useState } from 'react'
import { Card, Button, Table } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlineCash } from 'react-icons/hi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { FinancialDocument } from '@/mock/data/ownerData'

const { Tr, Th, Td, THead, TBody } = Table

const BulkPayment = () => {
    const [searchParams] = useSearchParams()
    const [documents, setDocuments] = useState<FinancialDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const documentIds = searchParams.get('documents')?.split(',') || []
        if (documentIds.length > 0) {
            loadDocuments(documentIds)
        } else {
            setLoading(false)
        }
    }, [searchParams])

    const loadDocuments = async (ids: string[]) => {
        try {
            // TODO: Replace with actual API call
            const mockDocs: FinancialDocument[] = [
                {
                    id: 'fd-001',
                    managerName: 'علی محمدی',
                    title: 'هزینه آزمون مدیرتی',
                    amount: 500000,
                    currency: 'IRR',
                    status: 'pending',
                    createdDate: '2024-12-01T10:00:00Z',
                },
                {
                    id: 'fd-003',
                    managerName: 'حسن رضایی',
                    title: 'هزینه آموزش',
                    amount: 750000,
                    currency: 'IRR',
                    status: 'pending',
                    createdDate: '2024-12-05T10:00:00Z',
                },
            ]
            setDocuments(mockDocs.filter((d) => ids.includes(d.id)))
        } catch (error) {
            console.error('Error loading documents:', error)
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

    const totalAmount = documents.reduce((sum, doc) => sum + doc.amount, 0)

    const handleBulkPayment = async () => {
        setProcessing(true)
        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 2000))

            alert(`پرداخت ${documents.length} سند با موفقیت انجام شد و صورتحساب ساخته شد`)
            navigate('/owner/accounting/bills')
        } catch (error) {
            console.error('Error processing bulk payment:', error)
            alert('خطا در پرداخت گروهی')
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

    if (documents.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    هیچ سند مالی برای پرداخت انتخاب نشده است
                </p>
                <Button onClick={() => navigate('/owner/accounting/documents')}>
                    بازگشت به اسناد مالی
                </Button>
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

            {/* Payment Summary */}
            <Card className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    پرداخت گروهی
                </h1>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                        شما در حال پرداخت گروهی {documents.length} سند مالی هستید. پس از پرداخت، یک
                        صورتحساب شامل تمام این اسناد برای شما ایجاد می‌شود.
                    </p>
                </div>

                {/* Documents Table */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        اسناد مالی منتخب
                    </h3>
                    <Table>
                        <THead>
                            <Tr>
                                <Th>شناسه</Th>
                                <Th>عنوان</Th>
                                <Th>متقاضی</Th>
                                <Th>تاریخ</Th>
                                <Th>مبلغ</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {documents.map((doc) => (
                                <Tr key={doc.id}>
                                    <Td>
                                        <span className="font-mono text-sm">#{doc.id}</span>
                                    </Td>
                                    <Td>{doc.title}</Td>
                                    <Td>{doc.managerName}</Td>
                                    <Td>{formatDate(doc.createdDate)}</Td>
                                    <Td className="font-semibold">{formatCurrency(doc.amount)}</Td>
                                </Tr>
                            ))}
                            <Tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                                <Td colSpan={4} className="text-left">
                                    جمع کل:
                                </Td>
                                <Td className="text-primary text-lg">{formatCurrency(totalAmount)}</Td>
                            </Tr>
                        </TBody>
                    </Table>
                </div>

                {/* Payment Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                مبلغ قابل پرداخت
                            </p>
                            <p className="text-3xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="plain"
                                onClick={() => navigate('/owner/accounting/documents')}
                            >
                                انصراف
                            </Button>
                            <Button
                                variant="solid"
                                icon={<HiOutlineCash />}
                                onClick={handleBulkPayment}
                                loading={processing}
                                size="lg"
                            >
                                پرداخت گروهی
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default BulkPayment
