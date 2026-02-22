import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Tag, Tooltip, Skeleton } from '@/components/ui'
import Cookies from 'js-cookie'
import {
    HiOutlineEye,

    HiOutlineTrash,
    HiOutlineCash,
    HiOutlineDocumentText,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCreditCard,
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Table from '@/components/ui/Table'
import classNames from '@/utils/classNames'
import { getBills, deleteBill, updateBill } from '@/services/AdminService'
import type { Bill } from '@/@types/financialDocument'
import { toast, Notification } from '@/components/ui'

const { Tr, Th, Td, THead, TBody } = Table

type FilterCategory = 'all' | 'paid' | 'unpaid'

type StatisticCardProps = {
    title: string
    value: number
    amount?: number
    icon: React.ReactNode
    iconClass: string
    label: FilterCategory
    active: boolean
    onClick: (label: FilterCategory) => void
}

const StatisticCard = (props: StatisticCardProps & { currency?: string }) => {
    const { title, value, amount, label, icon, iconClass, active, onClick, currency = 'IRR' } = props

    const formatCurrency = (amt: number, currency: string = 'IRR') => {
        const formatted = new Intl.NumberFormat('fa-IR').format(amt)
        return `${formatted} ${currency === 'IRR' ? 'ریال' : currency}`
    }

    return (
        <button
            className={classNames(
                'p-4 rounded-2xl cursor-pointer text-right transition duration-150 outline-none w-full',
                active && 'bg-white dark:bg-gray-900 shadow-md',
            )}
            onClick={() => onClick(label)}
        >
            <div className="flex justify-between items-center">
                <div>
                    <div className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {title}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {/* Skeleton handled in parent or here if needed, but usually stats load fast or can use simple skeleton */}
                        {value}
                    </h3>
                    {amount !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatCurrency(amount, currency)}
                        </p>
                    )}
                </div>
                <div
                    className={classNames(
                        'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 rounded-full text-2xl',
                        iconClass,
                    )}
                >
                    {icon}
                </div>
            </div>
        </button>
    )
}

const SkeletonRow = () => (
    <Tr>
        <Td><Skeleton width={100} /></Td>
        <Td><Skeleton width={80} /></Td>
        <Td><Skeleton width={120} /></Td>
        <Td><Skeleton width={60} /></Td>
        <Td><Skeleton width={100} /></Td>
        <Td><Skeleton width={100} /></Td>
        <Td>
            <div className="flex gap-2">
                <Skeleton width={30} height={30} variant="circle" />
                <Skeleton width={30} height={30} variant="circle" />
                <Skeleton width={30} height={30} variant="circle" />
            </div>
        </Td>
    </Tr>
)

const Bills = () => {
    const [bills, setBills] = useState<Bill[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
    const [deleteBillDialog, setDeleteBillDialog] = useState(false)
    const [billToDelete, setBillToDelete] = useState<number | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async (forceUpdate = false) => {
        try {
            setLoading(true)

            if (!forceUpdate) {
                const cookieData = Cookies.get('owner_bills_cache')
                if (cookieData) {
                    try {
                        setBills(JSON.parse(cookieData))
                        setLoading(false)
                        // Background refresh if needed, or just return
                        // return 
                        // Let's return cached data immediately but still fetch fresh data if needed?
                        // Usually cache-first strategy returns and maybe re-fetches.
                        // Here we just return cached data.
                        return
                    } catch (e) {
                        console.error('Error parsing cookie data', e)
                    }
                }
            }

            const response = await getBills()
            if (response.success && Array.isArray(response.data)) {
                setBills(response.data)
                Cookies.set('owner_bills_cache', JSON.stringify(response.data), { expires: 1 })
            }
        } catch (error) {
            console.error('Error loading bills:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteBill = (billId: number) => {
        setBillToDelete(billId)
        setDeleteBillDialog(true)
    }

    const confirmDeleteBill = async () => {
        if (billToDelete) {
            try {
                await deleteBill(billToDelete)
                const updatedBills = bills.filter((b) => b.id !== billToDelete)
                setBills(updatedBills)
                Cookies.set('owner_bills_cache', JSON.stringify(updatedBills), { expires: 1 })
                setDeleteBillDialog(false)
                setBillToDelete(null)
            } catch (error) {
                console.error('Error deleting bill:', error)
            }
        }
    }

    const handleRequestOfficialInvoice = async (billId: number) => {
        try {
            const response = await updateBill(billId, { official_invoice_requested: true })
            if (response.success) {
                toast.push(
                    <Notification type="success" title="موفقیت">
                        درخواست فاکتور رسمی ثبت شد
                    </Notification>
                )
                // Update the bill in state
                const updatedBills = bills.map(b => b.id === billId
                    ? { ...b, official_invoice_requested: true, status: 'paid' as const }
                    : b
                )

                setBills(updatedBills)
                Cookies.set('owner_bills_cache', JSON.stringify(updatedBills), { expires: 1 })
                // loadData(true) // No need to reload if state is updated correctly
            }
        } catch (error: any) {
            console.error('Error requesting invoice:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.message || 'خطا در ثبت درخواست'}
                </Notification>
            )
        }
    }

    // Filter bills based on selected category
    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            switch (selectedCategory) {
                case 'paid':
                    return bill.status === 'paid'
                case 'unpaid':
                    return bill.status === 'pending'
                case 'all':
                default:
                    return true
            }
        })
    }, [bills, selectedCategory])

    // Calculate statistics
    const totalBills = bills.length
    const paidBills = bills.filter(b => b.status === 'paid').length
    const unpaidBills = bills.filter(b => b.status === 'pending').length

    const formatCurrency = (amount: string | number, currency: string = 'IRR') => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount
        const formatted = new Intl.NumberFormat('fa-IR').format(num)
        return `${formatted} ${currency === 'IRR' ? 'ریال' : currency}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    const getStatusTag = (status: Bill['status']) => {
        if (status === 'paid') {
            return (
                <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                    پرداخت شده
                </Tag>
            )
        }
        return (
            <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">
                در انتظار پرداخت
            </Tag>
        )
    }

    // Loading check moved to Table body for skeleton
    // if (loading) { ... }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div id="bills-header">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    صورتحساب‌ها
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    مشاهده و مدیریت صورتحساب‌های پرداخت
                </p>
            </div>

            {/* Stats Cards */}
            <div id="bills-stats-cards" className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
                <StatisticCard
                    title="همه صورتحساب‌ها"
                    value={totalBills}
                    iconClass="bg-blue-200 text-blue-700"
                    icon={<HiOutlineCreditCard />}
                    label="all"
                    active={selectedCategory === 'all'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="پرداخت شده"
                    value={paidBills}
                    iconClass="bg-emerald-200 text-emerald-700"
                    icon={<HiOutlineCheckCircle />}
                    label="paid"
                    active={selectedCategory === 'paid'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="در انتظار پرداخت"
                    value={unpaidBills}
                    iconClass="bg-amber-200 text-amber-700"
                    icon={<HiOutlineClock />}
                    label="unpaid"
                    active={selectedCategory === 'unpaid'}
                    onClick={setSelectedCategory}
                />
            </div>

            {/* Table */}
            <Card id="bills-table">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        لیست صورتحساب‌ها
                        {selectedCategory !== 'all' && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredBills.length} مورد)
                            </span>
                        )}
                    </h2>
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>شماره صورتحساب</Th>
                                    <Th>تاریخ صدور</Th>
                                    <Th>مبلغ</Th>
                                    <Th>تعداد اسناد</Th>
                                    <Th>وضعیت</Th>
                                    <Th>فاکتور رسمی</Th>
                                    <Th>عملیات</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {loading ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : (
                                    filteredBills.map((bill) => (
                                        <Tr key={bill.id}>
                                            <Td>
                                                <span className="font-mono font-semibold">
                                                    {bill.bill_number}
                                                </span>
                                            </Td>
                                            <Td>{formatDate(bill.created_at)}</Td>
                                            <Td>
                                                <span className="font-bold">
                                                    {formatCurrency(bill.total_amount, bill.currency)}
                                                </span>
                                            </Td>
                                            <Td>
                                                <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                                                    {bill.financial_documents_count || 0} سند
                                                </Tag>
                                            </Td>
                                            <Td>{getStatusTag(bill.status)}</Td>
                                            <Td>
                                                {bill.official_invoice_requested ? (
                                                    bill.official_invoice_pdf_url ? (
                                                        <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                                                            صادر شده
                                                        </Tag>
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
                                            </Td>
                                            <Td>
                                                <div className="flex items-center gap-2">
                                                    {bill.status === 'paid' && !bill.official_invoice_requested && (
                                                        <Tooltip title="درخواست فاکتور رسمی">
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                icon={<HiOutlineDocumentText />}
                                                                onClick={() => handleRequestOfficialInvoice(bill.id)}
                                                                className="bills-action-invoice"
                                                            >
                                                                درخواست فاکتور
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                    {bill.status === 'pending' && (
                                                        <>

                                                            <Tooltip title="حذف">
                                                                <Button
                                                                    variant="plain"
                                                                    size="sm"
                                                                    icon={<HiOutlineTrash />}
                                                                    onClick={() => handleDeleteBill(bill.id)}
                                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title="پرداخت">
                                                                <Button
                                                                    variant="solid"
                                                                    size="sm"
                                                                    icon={<HiOutlineCash />}
                                                                    onClick={() => navigate(`/owner/accounting/bills/${bill.id}/payment`)}
                                                                    className="bills-action-pay"
                                                                >
                                                                    پرداخت
                                                                </Button>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    <Tooltip title="مشاهده جزئیات">
                                                        <Button
                                                            variant="plain"
                                                            size="sm"
                                                            icon={<HiOutlineEye />}
                                                            onClick={() => navigate(`/owner/accounting/bills/${bill.id}`)}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                                {!loading && filteredBills.length === 0 && (
                                    <Tr>
                                        <Td colSpan={7}>
                                            <div className="text-center py-12">
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    صورتحسابی با این فیلتر یافت نشد
                                                </p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </TBody>
                        </Table>
                    </div>
                </div>
            </Card>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteBillDialog}
                type="danger"
                title="حذف صورتحساب"
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                onClose={() => {
                    setDeleteBillDialog(false)
                    setBillToDelete(null)
                }}
                onRequestClose={() => {
                    setDeleteBillDialog(false)
                    setBillToDelete(null)
                }}
                onCancel={() => {
                    setDeleteBillDialog(false)
                    setBillToDelete(null)
                }}
                onConfirm={confirmDeleteBill}
            >
                <p>آیا از حذف این صورتحساب اطمینان دارید؟</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    با حذف صورتحساب، اسناد مالی مرتبط حذف نمی‌شوند و به حالت پرداخت نشده برمی‌گردند.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default Bills
