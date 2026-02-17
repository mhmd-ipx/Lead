import { useEffect, useState, useRef, type ChangeEvent } from 'react'
import { Card, Button, Tag, Table, Dialog, Checkbox, Alert, toast, Notification, Skeleton } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiOutlineArrowLeft,
    HiOutlineCash,
    HiOutlineDocumentDownload,
    HiOutlineDocumentText,
    HiOutlinePlus,
    HiOutlineTrash,

} from 'react-icons/hi'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getBill, updateBill, payBill, getFinancialDocuments, addDocumentToBill, removeDocumentFromBill } from '@/services/AdminService'
import type { Bill, FinancialDocument } from '@/@types/financialDocument'
import type { CheckboxProps } from '@/components/ui/Checkbox'

type CheckBoxChangeEvent = ChangeEvent<HTMLInputElement>

interface IndeterminateCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
    onChange: (event: CheckBoxChangeEvent) => void
    indeterminate: boolean
}

function IndeterminateCheckbox({
    indeterminate,
    onChange,
    ...rest
}: IndeterminateCheckboxProps) {
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (typeof indeterminate === 'boolean' && ref.current) {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
    }, [ref, indeterminate, rest.checked])

    return <Checkbox ref={ref} onChange={(_, e) => onChange(e)} {...rest} />
}


const { Tr, Th, Td, THead, TBody } = Table

const BillView = () => {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const [bill, setBill] = useState<Bill | null>(null)
    const [documents, setDocuments] = useState<FinancialDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [addDocDialog, setAddDocDialog] = useState(false)
    const [deleteDocDialog, setDeleteDocDialog] = useState(false)
    const [availableDocs, setAvailableDocs] = useState<FinancialDocument[]>([])
    const [selectedDocIds, setSelectedDocIds] = useState<number[]>([])
    const [docToDelete, setDocToDelete] = useState<number | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (id) {
            loadBill()
        }
    }, [id])

    const loadBill = async () => {
        try {
            setLoading(true)
            const response = await getBill(Number(id))
            if (response.success && response.data) {
                setBill(response.data)
                // Extract documents from items if available, or financial_documents if direct
                const docs = response.data.items?.map((item: any) => item.financial_document)
                    || response.data.financial_documents
                    || []
                setDocuments(docs)
            }
        } catch (error) {
            console.error('Error loading bill:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: string | number, currency: string = 'IRR') => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount
        const formatted = new Intl.NumberFormat('fa-IR').format(num)
        return `${formatted} ${currency === 'IRR' ? 'ریال' : currency}`
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
            const response = await payBill(bill.id)
            if (response.success) {
                toast.push(
                    <Notification type="success" title="موفقیت">
                        پرداخت با موفقیت انجام شد
                    </Notification>
                )
                loadBill()
            }
        } catch (error: any) {
            console.error('Error processing payment:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.message || 'خطا در عملیات پرداخت'}
                </Notification>
            )
        } finally {
            setProcessing(false)
        }
    }

    const handleRequestOfficialInvoice = async () => {
        if (!bill) return
        setProcessing(true)
        try {
            const response = await updateBill(bill.id, { official_invoice_requested: true })
            if (response.success) {
                toast.push(
                    <Notification type="success" title="موفقیت">
                        درخواست فاکتور رسمی ثبت شد
                    </Notification>
                )
                loadBill()
            }
        } catch (error: any) {
            console.error('Error requesting invoice:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.message || 'خطا در ثبت درخواست'}
                </Notification>
            )
        } finally {
            setProcessing(false)
        }
    }

    const handleRemoveDocument = (docId: number) => {
        setDocToDelete(docId)
        setDeleteDocDialog(true)
    }

    const confirmRemoveDocument = async () => {
        if (docToDelete && bill) {
            try {
                // Call API to remove document
                const response = await removeDocumentFromBill(bill.id, docToDelete)
                if (response.success) {
                    toast.push(
                        <Notification type="success" title="موفقیت">
                            سند با موفقیت از صورتحساب حذف شد
                        </Notification>
                    )
                    // Reload bill to update list and totals
                    loadBill()
                }
            } catch (error: any) {
                console.error('Error removing document:', error)
                toast.push(
                    <Notification type="danger" title="خطا">
                        {error?.response?.data?.message || 'خطا در حذف سند'}
                    </Notification>
                )
            } finally {
                setDeleteDocDialog(false)
                setDocToDelete(null)
            }
        }
    }

    const [isLoadingDocs, setIsLoadingDocs] = useState(false)

    const handleAddDocuments = () => {
        setAddDocDialog(true)
        setAvailableDocs([])
        setSelectedDocIds([])
        fetchAvailableDocuments()
    }

    const fetchAvailableDocuments = async () => {
        if (!bill) return

        setIsLoadingDocs(true)
        try {
            // Fetch all financial documents
            const response = await getFinancialDocuments()

            if (response.success && Array.isArray(response.data)) {
                console.log('All Documents:', response.data)

                // Filter logic:
                // 1. Must belong to the same company as the bill
                // 2. Must be 'pending' (unpaid)
                // 3. Must NOT be associated with another bill (bills_exists is falsy)
                // 4. Must NOT be already in the ALL documents list of ANY bill (if bills_exists covers this, good, but explicit check matches UI)
                // 5. Must NOT be in current displayed documents list

                const currentDocIds = documents.map(d => d.id)

                const validDocs = response.data.filter((doc: FinancialDocument) => {
                    // Check Company
                    if (doc.company_id !== bill.company_id) return false

                    // Check Status
                    if (doc.status !== 'pending') return false

                    // Check Bill Existence (API flag)
                    if (doc.bills_exists) return false

                    // Check if already in current list (Client side safety)
                    if (currentDocIds.includes(doc.id)) return false

                    return true
                })

                console.log('Filtered Valid Docs:', validDocs)
                setAvailableDocs(validDocs)
            }
        } catch (error) {
            console.error('Error fetching available docs:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    خطا در دریافت لیست اسناد
                </Notification>
            )
        } finally {
            setIsLoadingDocs(false)
        }
    }

    const toggleDocumentSelection = (id: number) => {
        setSelectedDocIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const confirmAddDocuments = async () => {
        if (!bill || selectedDocIds.length === 0) return

        try {
            setProcessing(true)
            const response = await addDocumentToBill(bill.id, selectedDocIds)

            if (response.success) {
                toast.push(
                    <Notification type="success" title="موفقیت">
                        {response.message || 'اسناد با موفقیت افزوده شدند'}
                    </Notification>
                )
                setAddDocDialog(false)
                setSelectedDocIds([])
                // Refresh full bill data
                loadBill()
            }
        } catch (error: any) {
            console.error('Error adding documents:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.message || 'خطا در افزودن اسناد'}
                </Notification>
            )
        } finally {
            setProcessing(false)
        }
    }

    // ... (rest of component render)

    const totalCalculated = documents.reduce((sum, doc) => sum + parseFloat(doc.amount), 0)

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton width={200} height={40} />
                    <Skeleton width={150} height={40} />
                </div>
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <Skeleton width={180} height={32} className="mb-2" />
                            <Skeleton width={100} height={20} />
                        </div>
                        <Skeleton width={120} height={32} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <Skeleton width={80} height={20} className="mb-2" />
                            <Skeleton width={120} height={32} />
                        </div>
                        <div>
                            <Skeleton width={80} height={20} className="mb-2" />
                            <Skeleton width={120} height={28} />
                        </div>
                        <div>
                            <Skeleton width={80} height={20} className="mb-2" />
                            <Skeleton width={100} height={28} />
                        </div>
                    </div>
                    <div>
                        <Skeleton width={200} height={28} className="mb-4" />
                        <div className="space-y-3">
                            <Skeleton height={50} />
                            <Skeleton height={50} />
                            <Skeleton height={50} />
                        </div>
                    </div>
                </Card>
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
            </div>

            {/* Bill Details */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            صورتحساب {bill.bill_number}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            شناسه: <span className="font-mono">#{bill.id}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusTag(bill.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            مبلغ کل
                        </label>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(bill.total_amount, bill.currency)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            تاریخ صدور
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatDate(bill.created_at)}
                        </p>
                    </div>

                    {bill.due_date && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                سررسید
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(bill.due_date)}
                            </p>
                        </div>
                    )}

                    {bill.paid_date && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                تاریخ پرداخت
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(bill.paid_date)}
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
                        {bill.official_invoice_requested ? (
                            bill.official_invoice_pdf_url ? (
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
                        {bill.status === 'pending' && (
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<HiOutlinePlus />}
                                onClick={handleAddDocuments}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                افزودن سند جدید
                            </Button>
                        )}
                    </div>

                    <div className="rounded-lg">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>شناسه</Th>
                                    <Th>عنوان</Th>
                                    <Th>تاریخ</Th>
                                    <Th>مبلغ</Th>
                                    <Th className="text-center">عملیات</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {documents.map((doc) => (
                                    <Tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <Td>
                                            <span className="font-mono text-sm">#{doc.id}</span>
                                        </Td>
                                        <Td>{doc.title}</Td>
                                        <Td>{formatDate(doc.created_date)}</Td>
                                        <Td className="font-semibold">{formatCurrency(doc.amount, doc.currency)}</Td>
                                        <Td>
                                            <div className="flex justify-center">
                                                {bill.status === 'pending' && (
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineTrash />}
                                                        onClick={() => handleRemoveDocument(doc.id)}
                                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <span className="text-red-600 dark:text-red-400 font-medium">حذف</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                                {documents.length === 0 && (
                                    <Tr>
                                        <Td colSpan={5}>
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                {bill.status === 'pending' ? (
                                                    <div>
                                                        <p className="mb-2">هیچ سندی در این صورتحساب وجود ندارد</p>
                                                        <Button
                                                            variant="solid"
                                                            size="sm"
                                                            icon={<HiOutlinePlus />}
                                                            onClick={handleAddDocuments}
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
            </Card>

            {/* Add Document Dialog */}
            <Dialog
                isOpen={addDocDialog}
                onClose={() => setAddDocDialog(false)}
                width={800}
            // Prevent closing when clicking outside if needed, but default is fine
            >
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h5 className="text-lg font-semibold">افزودن سند به صورتحساب</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            فقط اسناد تأیید نشده که در صورتحساب دیگری نیستند نمایش داده می‌شوند.
                        </p>
                    </div>
                </div>

                <div className="min-h-[200px] max-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg mb-4 relative">
                    {isLoadingDocs ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
                            <div className="flex flex-col items-center">
                                <Skeleton variant="circle" width={40} height={40} className="mb-2" />
                                <span className="text-sm text-gray-500">در حال دریافت اسناد...</span>
                            </div>
                        </div>
                    ) : availableDocs.length > 0 ? (
                        <Table>
                            <THead>
                                <Tr>
                                    <Th className="w-10">
                                        <IndeterminateCheckbox
                                            checked={availableDocs.length > 0 && selectedDocIds.length === availableDocs.length}
                                            indeterminate={selectedDocIds.length > 0 && selectedDocIds.length < availableDocs.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDocIds(availableDocs.map(d => d.id))
                                                } else {
                                                    setSelectedDocIds([])
                                                }
                                            }}
                                        />
                                    </Th>
                                    <Th>شناسه</Th>
                                    <Th>عنوان</Th>
                                    <Th>تاریخ</Th>
                                    <Th>مبلغ</Th>
                                    <Th>وضعیت</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {availableDocs.map((doc) => (
                                    <Tr key={doc.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                        onClick={() => toggleDocumentSelection(doc.id)}
                                    >
                                        <Td>
                                            <Checkbox
                                                checked={selectedDocIds.includes(doc.id)}
                                                onChange={() => { }} // Handled by row click
                                            />
                                        </Td>
                                        <Td>
                                            <span className="font-mono text-sm">#{doc.id}</span>
                                        </Td>
                                        <Td>{doc.title}</Td>
                                        <Td>{formatDate(doc.created_date)}</Td>
                                        <Td className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(doc.amount, doc.currency)}
                                        </Td>
                                        <Td>{getStatusTag(doc.status)}</Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">
                            <HiOutlineDocumentText className="text-4xl mb-3 opacity-20" />
                            <p>هیچ سند قابل افزودنی یافت نشد</p>
                            <p className="text-xs mt-1 opacity-70">
                                (شرایط: وضعیت در انتظار + عدم وجود در صورتحساب دیگر)
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedDocIds.length > 0 ? (
                            <span>{selectedDocIds.length} سند برای افزودن انتخاب شده است</span>
                        ) : (
                            <span className="text-gray-400">هیچ سندی انتخاب نشده است</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="plain"
                            onClick={() => setAddDocDialog(false)}
                            disabled={processing}
                        >
                            انصراف
                        </Button>
                        <Button
                            variant="solid"
                            disabled={selectedDocIds.length === 0 || processing}
                            loading={processing}
                            onClick={confirmAddDocuments}
                        >
                            افزودن به صورتحساب
                        </Button>
                    </div>
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
        </div >
    )
}

export default BillView
