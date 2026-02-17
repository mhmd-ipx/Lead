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
}

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, label, icon, iconClass, active, onClick } = props

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        صورتحساب‌ها
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت و مشاهده صورتحساب‌های سیستم
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <Input
                            placeholder="جستجو..."
                            prefix={<HiOutlineSearch className="text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            placeholder="فیلتر بر اساس شرکت"
                            options={[{ label: 'همه شرکت‌ها', value: null }, ...companies]}
                            value={companies.find(c => c.value === selectedCompany) || { label: 'همه شرکت‌ها', value: null }}
                            onChange={(option) => setSelectedCompany(option?.value || null)}
                            isClearable
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
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
            <Card>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>شماره صورتحساب</Th>
                                    <Th>شرکت</Th>
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
                                {!loading && filteredBills.length === 0 && (
                                    <Tr>
                                        <Td colSpan={9}>
                                            <div className="text-center py-12">
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    صورتحسابی یافت نشد
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
