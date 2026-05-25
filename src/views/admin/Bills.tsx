import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Tag, Tooltip, Skeleton, Select, Notification, toast, Input } from '@/components/ui'
import Cookies from 'js-cookie'
import {
    HiOutlineEye,
    HiOutlineTrash,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCreditCard,
    HiOutlineDocumentText,
    HiOutlineCash,
    HiOutlineFilter,
    HiOutlineSearch
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Table from '@/components/ui/Table'
import classNames from '@/utils/classNames'
import { getBills, deleteBill, updateBill, getCompanies } from '@/services/AdminService'
import type { Bill } from '@/@types/financialDocument'
import type { Company } from '@/mock/data/adminData'

const { Tr, Th, Td, THead, TBody } = Table

type FilterCategory = 'all' | 'paid' | 'unpaid'

type StatisticCardProps = {
    title: string
    value: number
    amount?: number // kept for consistency though not used in header stats currently
    icon: React.ReactNode
    iconClass: string
    label: FilterCategory
    active: boolean
    onClick: (label: FilterCategory) => void
    id?: string
}

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, label, icon, iconClass, active, onClick, id } = props

    return (
        <button
            id={id}
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
                        {value}
                    </h3>
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
        <Td><Skeleton width={20} /></Td>
        <Td><Skeleton width={100} /></Td>
        <Td><Skeleton width={120} /></Td>
        <Td><Skeleton width={80} /></Td>
        <Td><Skeleton width={100} /></Td>
        <Td><Skeleton width={60} /></Td>
        <Td><Skeleton width={100} /></Td>
        <Td><Skeleton width={100} /></Td>
        <Td>
            <div className="flex gap-2">
                <Skeleton width={30} height={30} variant="circle" />
                <Skeleton width={30} height={30} variant="circle" />
            </div>
        </Td>
    </Tr>
)

const Bills = () => {
    const [bills, setBills] = useState<Bill[]>([])
    const [loading, setLoading] = useState(true)
    const [companies, setCompanies] = useState<{ label: string; value: number }[]>([])
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
    const [selectedCompany, setSelectedCompany] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteBillDialog, setDeleteBillDialog] = useState(false)
    const [billToDelete, setBillToDelete] = useState<number | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadCompanies()
        loadData()
    }, [])

    useEffect(() => {
        loadData()
    }, [selectedCompany])

    const loadCompanies = async () => {
        try {
            const data = await getCompanies()
            if (Array.isArray(data)) {
                setCompanies(data.map((c: any) => ({ label: c.name, value: c.id })))
            }
        } catch (error) {
            console.error('Error loading companies:', error)
        }
    }

    const loadData = async (forceUpdate = false) => {
        try {
            setLoading(true)

            if (!forceUpdate) {
                const cacheKey = selectedCompany
                    ? `admin_bills_cache_${selectedCompany}`
                    : 'admin_bills_cache_all'

                const cookieData = Cookies.get(cacheKey)
                if (cookieData) {
                    try {
                        setBills(JSON.parse(cookieData))
                        setLoading(false)
                        // Background refresh could happen here
                        // For now we trust cache + manual refresh/invalidation on actions
                    } catch (e) {
                        console.error('Error parsing cookie data', e)
                    }
                }
            }

            const params: any = {}
            if (selectedCompany) {
                params.company_id = selectedCompany
            }

            const response = await getBills(params)
            if (response.success && Array.isArray(response.data)) {
                setBills(response.data)

                const cacheKey = selectedCompany
                    ? `admin_bills_cache_${selectedCompany}`
                    : 'admin_bills_cache_all'

                Cookies.set(cacheKey, JSON.stringify(response.data), { expires: 1 })
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

                // Update cache
                const cacheKey = selectedCompany
                    ? `admin_bills_cache_${selectedCompany}`
                    : 'admin_bills_cache_all'
                Cookies.set(cacheKey, JSON.stringify(updatedBills), { expires: 1 })

                setDeleteBillDialog(false)
                setBillToDelete(null)
            } catch (error) {
                console.error('Error deleting bill:', error)
            }
        }
    }

    // Filter bills based on selected category (status)
    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            let matchesCategory = false
            switch (selectedCategory) {
                case 'paid':
                    matchesCategory = bill.status === 'paid'
                    break
                case 'unpaid':
                    matchesCategory = bill.status === 'pending'
                    break
                case 'all':
                default:
                    matchesCategory = true
            }

            if (!matchesCategory) return false

            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                return (
                    bill.bill_number.toLowerCase().includes(query) ||
                    bill.id.toString().includes(query) ||
                    (bill.company?.name && bill.company.name.toLowerCase().includes(query))
                )
            }

            return true
        })
    }, [bills, selectedCategory, searchQuery])

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div id="admin-bills-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        صورتحساب‌ها
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت و مشاهده صورتحساب‌های سیستم
                    </p>
                </div>
                <div id="admin-bills-filters" className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="w-full sm:w-64">
                        <Input
                            id="admin-bills-search"
                            placeholder="جستجو..."
                            prefix={<HiOutlineSearch className="text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <Select
                            placeholder="فیلتر بر اساس سازمان"
                            options={[{ label: 'همه سازمان‌ها', value: null }, ...companies]}
                            value={companies.find(c => c.value === selectedCompany) || { label: 'همه سازمان‌ها', value: null }}
                            onChange={(option: any) => setSelectedCompany(option?.value || null)}
                            isClearable
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="overflow-x-auto custom-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 pb-2 sm:pb-0">
                <div id="admin-bills-stats" className="flex sm:grid sm:grid-cols-3 gap-4 rounded-2xl sm:p-3 sm:bg-gray-100 sm:dark:bg-gray-700 min-w-max sm:min-w-0">
                    <div className="w-[80vw] sm:w-auto shrink-0 snap-center">
                        <StatisticCard
                            id="admin-bills-stats-all"
                            title="همه صورتحساب‌ها"
                            value={totalBills}
                            iconClass="bg-blue-200 text-blue-700"
                            icon={<HiOutlineCreditCard />}
                            label="all"
                            active={selectedCategory === 'all'}
                            onClick={setSelectedCategory}
                        />
                    </div>
                    <div className="w-[80vw] sm:w-auto shrink-0 snap-center">
                        <StatisticCard
                            id="admin-bills-stats-paid"
                            title="پرداخت شده"
                            value={paidBills}
                            iconClass="bg-emerald-200 text-emerald-700"
                            icon={<HiOutlineCheckCircle />}
                            label="paid"
                            active={selectedCategory === 'paid'}
                            onClick={setSelectedCategory}
                        />
                    </div>
                    <div className="w-[80vw] sm:w-auto shrink-0 snap-center">
                        <StatisticCard
                            id="admin-bills-stats-unpaid"
                            title="در انتظار پرداخت"
                            value={unpaidBills}
                            iconClass="bg-amber-200 text-amber-700"
                            icon={<HiOutlineClock />}
                            label="unpaid"
                            active={selectedCategory === 'unpaid'}
                            onClick={setSelectedCategory}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <Card id="admin-bills-table">
                <div className="p-4 sm:p-6">
                    <div className="hidden sm:block overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>شماره صورتحساب</Th>
                                    <Th>سازمان</Th>
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
                                            <Td>{bill.id}</Td>
                                            <Td>
                                                <span className="font-mono font-semibold">
                                                    {bill.bill_number}
                                                </span>
                                            </Td>
                                            <Td>{bill.company?.name || '-'}</Td>
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
                                                    <Tooltip title="مشاهده جزئیات">
                                                        <Button
                                                            variant="plain"
                                                            size="sm"
                                                            icon={<HiOutlineEye />}
                                                            onClick={() => navigate(`/admin/accounting/bills/${bill.id}`)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="حذف">
                                                        <Button
                                                            variant="plain"
                                                            size="sm"
                                                            icon={<HiOutlineTrash />}
                                                            onClick={() => handleDeleteBill(bill.id)}
                                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </TBody>
                        </Table>
                    </div>

                    {/* Mobile List View */}
                    <div className="sm:hidden flex flex-col gap-4 mt-4">
                        {loading ? (
                            <>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                                    <Skeleton width="60%" height={20} />
                                    <Skeleton width="40%" height={16} />
                                    <div className="flex justify-between">
                                        <Skeleton width="30%" height={24} />
                                        <Skeleton width="30%" height={24} />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                                    <Skeleton width="60%" height={20} />
                                    <Skeleton width="40%" height={16} />
                                    <div className="flex justify-between">
                                        <Skeleton width="30%" height={24} />
                                        <Skeleton width="30%" height={24} />
                                    </div>
                                </div>
                            </>
                        ) : filteredBills.length === 0 ? (
                            <div className="text-center py-8">
                                <HiOutlineDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-sm">صورتحسابی یافت نشد</p>
                            </div>
                        ) : (
                            filteredBills.map((bill) => (
                                <div key={bill.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                                                <HiOutlineDocumentText className="text-lg" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white font-mono text-sm">{bill.bill_number}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    {bill.company?.name || '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0">{getStatusTag(bill.status)}</div>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-sm">
                                        <span className="text-gray-500 text-xs">مبلغ کل:</span>
                                        <span className="font-bold text-green-600">{formatCurrency(bill.total_amount, bill.currency)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">تاریخ صدور:</span>
                                        <span className="text-gray-700 dark:text-gray-300">{formatDate(bill.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">فاکتور رسمی:</span>
                                        {bill.official_invoice_requested ? (
                                            bill.official_invoice_pdf_url ? (
                                                <Tag className="bg-emerald-100 text-emerald-600 text-[10px] border-0 py-0.5 px-2">صادر شده</Tag>
                                            ) : (
                                                <Tag className="bg-blue-100 text-blue-600 text-[10px] border-0 py-0.5 px-2">در حال پردازش</Tag>
                                            )
                                        ) : (
                                            <Tag className="bg-gray-100 text-gray-600 text-[10px] border-0 py-0.5 px-2">درخواست نشده</Tag>
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
                                        <Button size="sm" variant="plain" className="flex-1 text-xs" icon={<HiOutlineEye />} onClick={() => navigate(`/admin/accounting/bills/${bill.id}`)}>مشاهده</Button>
                                        <Button size="sm" variant="plain" className="flex-1 text-xs text-red-600" icon={<HiOutlineTrash />} onClick={() => handleDeleteBill(bill.id)}>حذف</Button>
                                    </div>
                                </div>
                            ))
                        )}
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
