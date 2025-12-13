import { useEffect, useState } from 'react'
import { Card, Button, Tag, Table, Dialog, Checkbox, Alert } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiOutlineArrowLeft,
    HiOutlineCash,
    HiOutlineDocumentDownload,
    HiOutlineDocumentText,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePencil,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
} from 'react-icons/hi'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Bill, FinancialDocument } from '@/mock/data/ownerData'

const { Tr, Th, Td, THead, TBody } = Table

const BillView = () => {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const [bill, setBill] = useState<Bill | null>(null)
    const [documents, setDocuments] = useState<FinancialDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [addDocDialog, setAddDocDialog] = useState(false)
    const [deleteDocDialog, setDeleteDocDialog] = useState(false)
    const [saveConfirmDialog, setSaveConfirmDialog] = useState(false)
    const [docToDelete, setDocToDelete] = useState<string | null>(null)
    const [availableDocs, setAvailableDocs] = useState<FinancialDocument[]>([])
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        if (id) {
            loadBill()
        }
    }, [id])

    // Check if should open in edit mode
    useEffect(() => {
        if (searchParams.get('edit') === 'true' && bill?.status === 'pending') {
            setIsEditing(true)
        }
    }, [searchParams, bill])

    const loadBill = async () => {
        try {
            const mockBill: Bill = {
                id: 'bill-002',
                billNumber: 'B-2024-002',
                financialDocumentIds: ['fd-001', 'fd-003'],
                totalAmount: 1250000,
                currency: 'IRR',
                status: 'pending',
                createdDate: '2024-12-05T10:00:00Z',
                dueDate: '2024-12-20T10:00:00Z',
                officialInvoiceRequested: false,
                description: 'صورتحساب مربوط به هزینه‌های آموزشی و آزمون',
            }

            const mockDocs: FinancialDocument[] = [
                {
                    id: 'fd-001',
                    managerName: 'علی محمدی',
                    title: 'هزینه آزمون مدیریتی',
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

            const mockAvailable: FinancialDocument[] = [
                {
                    id: 'fd-004',
                    managerName: 'فاطمه کریمی',
                    title: 'هزینه دوره مدیریت',
                    amount: 600000,
                    currency: 'IRR',
                    status: 'pending',
                    createdDate: '2024-12-08T10:00:00Z',
                },
            ]

            setBill(mockBill)
            setDocuments(mockDocs)
            setAvailableDocs(mockAvailable)
        } catch (error) {
            console.error('Error loading bill:', error)
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

    const getStatusTag = (status: Bill['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                        پرداخت شده
                    </Tag>
                )
            case 'pending':
                return (
                    <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">
                        در انتظار پرداخت
                    </Tag>
                )
            case 'partially_paid':
                return (
                    <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                        پرداخت جزئی
                    </Tag>
                )
            default:
                return <Tag className="border-0">نامشخص</Tag>
        }
    }

    const handlePayment = async () => {
        if (!bill) return

        setProcessing(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            alert('پرداخت با موفقیت انجام شد')
            navigate('/owner/accounting/bills')
        } catch (error) {
            console.error('Error processing payment:', error)
            alert('خطا در پرداخت')
        } finally {
            setProcessing(false)
        }
    }

    const handleRequestOfficialInvoice = async () => {
        if (!bill) return

        setProcessing(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            alert('درخواست فاکتور رسمی با موفقیت ثبت شد')
            loadBill()
        } catch (error) {
            console.error('Error requesting invoice:', error)
            alert('خطا در ثبت درخواست')
        } finally {
            setProcessing(false)
        }
    }

    const handleRemoveDocument = (docId: string) => {
        setDocToDelete(docId)
        setDeleteDocDialog(true)
    }

    const confirmRemoveDocument = () => {
        if (docToDelete) {
            setDocuments(documents.filter((d) => d.id !== docToDelete))
            setDeleteDocDialog(false)
            setDocToDelete(null)
        }
    }

    const handleAddDocuments = () => {
        const docsToAdd = availableDocs.filter((d) => selectedDocIds.includes(d.id))
        setDocuments([...documents, ...docsToAdd])
        setAvailableDocs(availableDocs.filter((d) => !selectedDocIds.includes(d.id)))
        setSelectedDocIds([])
        setAddDocDialog(false)
    }

    const handleSaveEdits = () => {
        setSaveConfirmDialog(true)
    }

    const confirmSaveEdits = () => {
        setIsEditing(false)
        setSaveConfirmDialog(false)
        // Redirect back without edit param
        navigate(`/owner/accounting/bills/${id}`, { replace: true })
    }

    const totalAmount = documents.reduce((sum, doc) => sum + doc.amount, 0)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!bill) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">صورتحساب مورد نظر یافت نشد</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="plain"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/owner/accounting/bills')}
                >
                    بازگشت به لیست صورتحساب‌ها
                </Button>

                {bill.status === 'pending' && (
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <Button
                                variant="solid"
                                icon={<HiOutlinePencil />}
                                onClick={() => setIsEditing(true)}
                            >
                                ویرایش صورتحساب
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="plain"
                                    icon={<HiOutlineXCircle />}
                                    onClick={() => setIsEditing(false)}
                                >
                                    انصراف
                                </Button>
                                <Button
                                    variant="solid"
                                    icon={<HiOutlineCheckCircle />}
                                    onClick={handleSaveEdits}
                                >
                                    ذخیره تغییرات
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Mode Alert */}
            {isEditing && (
                <Alert showIcon type="info" className="mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <strong>حالت ویرایش فعال است</strong>
                            <p className="text-sm mt-1">
                                می‌توانید اسناد مالی را اضافه یا حذف کنید. پس از اتمام، روی "ذخیره تغییرات" کلیک کنید.
                            </p>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Bill Details */}
            <Card className={`p-6 ${isEditing ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            صورتحساب {bill.billNumber}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            شناسه: <span className="font-mono">#{bill.id}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                                در حال ویرایش
                            </Tag>
                        )}
                        {getStatusTag(bill.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            مبلغ کل
                        </label>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
                        {isEditing && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                محاسبه خودکار بر اساس اسناد
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            تاریخ صدور
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatDate(bill.createdDate)}
                        </p>
                    </div>

                    {bill.dueDate && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                سررسید
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(bill.dueDate)}
                            </p>
                        </div>
                    )}

                    {bill.paidDate && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                تاریخ پرداخت
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(bill.paidDate)}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            تعداد اسناد مالی
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {documents.length} سند
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            فاکتور رسمی
                        </label>
                        {bill.officialInvoiceRequested ? (
                            bill.officialInvoicePdfUrl ? (
                                <div className="flex items-center gap-2">
                                    <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                                        صادر شده
                                    </Tag>
                                    <Button variant="plain" size="xs" icon={<HiOutlineDocumentDownload />}>
                                        دانلود
                                    </Button>
                                </div>
                            ) : (
                                <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                                    در حال پردازش
                                </Tag>
                            )
                        ) : (
                            <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100 border-0">
                                درخواست نشده
                            </Tag>
                        )}
                    </div>
                </div>

                {bill.description && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            توضیحات
                        </label>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            {bill.description}
                        </p>
                    </div>
                )}

                {/* Financial Documents Table */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            اسناد مالی این صورتحساب
                        </h3>
                        {isEditing && (
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<HiOutlinePlus />}
                                onClick={() => setAddDocDialog(true)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                افزودن سند جدید
                            </Button>
                        )}
                    </div>

                    <div className={isEditing ? 'ring-2 ring-blue-200 dark:ring-blue-700 rounded-lg' : ''}>
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>شناسه</Th>
                                    <Th>عنوان</Th>
                                    <Th>متقاضی</Th>
                                    <Th>تاریخ</Th>
                                    <Th>مبلغ</Th>
                                    {isEditing && <Th className="text-center">عملیات</Th>}
                                </Tr>
                            </THead>
                            <TBody>
                                {documents.map((doc) => (
                                    <Tr key={doc.id} className={isEditing ? 'hover:bg-blue-50 dark:hover:bg-blue-900/10' : ''}>
                                        <Td>
                                            <span className="font-mono text-sm">#{doc.id}</span>
                                        </Td>
                                        <Td>{doc.title}</Td>
                                        <Td>{doc.managerName}</Td>
                                        <Td>{formatDate(doc.createdDate)}</Td>
                                        <Td className="font-semibold">{formatCurrency(doc.amount)}</Td>
                                        {isEditing && (
                                            <Td>
                                                <div className="flex justify-center">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineTrash />}
                                                        onClick={() => handleRemoveDocument(doc.id)}
                                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <span className="text-red-600 dark:text-red-400 font-medium">حذف</span>
                                                    </Button>
                                                </div>
                                            </Td>
                                        )}
                                    </Tr>
                                ))}
                                {documents.length === 0 && (
                                    <Tr>
                                        <Td colSpan={isEditing ? 6 : 5}>
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                {isEditing ? (
                                                    <div>
                                                        <p className="mb-2">هیچ سندی در این صورتحساب وجود ندارد</p>
                                                        <Button
                                                            variant="solid"
                                                            size="sm"
                                                            icon={<HiOutlinePlus />}
                                                            onClick={() => setAddDocDialog(true)}
                                                        >
                                                            افزودن اولین سند
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    'هیچ سندی در این صورتحساب وجود ندارد'
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </TBody>
                        </Table>
                    </div>
                </div>

                {/* Actions */}
                {!isEditing && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-3">
                                {bill.status === 'paid' && !bill.officialInvoiceRequested && (
                                    <Button
                                        variant="default"
                                        icon={<HiOutlineDocumentText />}
                                        onClick={handleRequestOfficialInvoice}
                                        loading={processing}
                                    >
                                        درخواست فاکتور رسمی
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {bill.status === 'pending' && (
                                    <>
                                        <Button variant="plain" onClick={() => navigate('/owner/accounting/bills')}>
                                            انصراف
                                        </Button>
                                        <Button
                                            variant="solid"
                                            icon={<HiOutlineCash />}
                                            onClick={handlePayment}
                                            loading={processing}
                                        >
                                            پرداخت {formatCurrency(totalAmount)}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Add Document Dialog */}
            <Dialog isOpen={addDocDialog} onClose={() => setAddDocDialog(false)} width={800}>
                <div className="mb-4">
                    <h5 className="text-lg font-semibold">افزودن سند به صورتحساب</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        اسناد مالی پرداخت نشده‌ای که به هیچ صورتحسابی متصل نیستند را انتخاب کنید
                    </p>
                </div>

                {availableDocs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>هیچ سند مالی برای افزودن وجود ندارد</p>
                    </div>
                ) : (
                    <>
                        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th className="w-12"></Th>
                                        <Th>شناسه</Th>
                                        <Th>عنوان</Th>
                                        <Th>متقاضی</Th>
                                        <Th>مبلغ</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {availableDocs.map((doc) => (
                                        <Tr
                                            key={doc.id}
                                            className={`cursor-pointer ${selectedDocIds.includes(doc.id) ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                            onClick={() => {
                                                if (selectedDocIds.includes(doc.id)) {
                                                    setSelectedDocIds(selectedDocIds.filter((id) => id !== doc.id))
                                                } else {
                                                    setSelectedDocIds([...selectedDocIds, doc.id])
                                                }
                                            }}
                                        >
                                            <Td>
                                                <Checkbox
                                                    checked={selectedDocIds.includes(doc.id)}
                                                    onChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedDocIds([...selectedDocIds, doc.id])
                                                        } else {
                                                            setSelectedDocIds(selectedDocIds.filter((id) => id !== doc.id))
                                                        }
                                                    }}
                                                />
                                            </Td>
                                            <Td>
                                                <span className="font-mono text-sm">#{doc.id}</span>
                                            </Td>
                                            <Td>{doc.title}</Td>
                                            <Td>{doc.managerName}</Td>
                                            <Td className="font-semibold">{formatCurrency(doc.amount)}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>

                        {selectedDocIds.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-900 dark:text-blue-200">
                                    <strong>{selectedDocIds.length} سند</strong> انتخاب شده •
                                    مجموع: <strong>{formatCurrency(
                                        availableDocs
                                            .filter(d => selectedDocIds.includes(d.id))
                                            .reduce((sum, d) => sum + d.amount, 0)
                                    )}</strong>
                                </p>
                            </div>
                        )}
                    </>
                )}

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="plain" onClick={() => {
                        setAddDocDialog(false)
                        setSelectedDocIds([])
                    }}>
                        انصراف
                    </Button>
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        onClick={handleAddDocuments}
                        disabled={selectedDocIds.length === 0}
                    >
                        افزودن {selectedDocIds.length > 0 && `(${selectedDocIds.length})`}
                    </Button>
                </div>
            </Dialog>

            {/* Delete Document Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDocDialog}
                type="danger"
                title="حذف سند از صورتحساب"
                confirmText="حذف کن"
                cancelText="انصراف"
                onClose={() => {
                    setDeleteDocDialog(false)
                    setDocToDelete(null)
                }}
                onRequestClose={() => {
                    setDeleteDocDialog(false)
                    setDocToDelete(null)
                }}
                onCancel={() => {
                    setDeleteDocDialog(false)
                    setDocToDelete(null)
                }}
                onConfirm={confirmRemoveDocument}
            >
                <p>آیا از حذف این سند از صورتحساب اطمینان دارید؟</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    این عملیات قابل بازگشت است و می‌توانید مجدداً سند را اضافه کنید.
                </p>
            </ConfirmDialog>

            {/* Save Changes Confirmation Dialog */}
            <ConfirmDialog
                isOpen={saveConfirmDialog}
                type="success"
                title="ذخیره تغییرات"
                confirmText="بله، ذخیره کن"
                cancelText="انصراف"
                onClose={() => setSaveConfirmDialog(false)}
                onRequestClose={() => setSaveConfirmDialog(false)}
                onCancel={() => setSaveConfirmDialog(false)}
                onConfirm={confirmSaveEdits}
            >
                <p>آیا می‌خواهید تغییرات را ذخیره کنید؟</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    تعداد اسناد: <strong>{documents.length}</strong> • مبلغ کل: <strong>{formatCurrency(totalAmount)}</strong>
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default BillView
