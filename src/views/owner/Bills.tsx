import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Tag, Tooltip } from '@/components/ui'
import {
    HiOutlineEye,
    HiOutlinePencil,
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
import type { Bill } from '@/mock/data/ownerData'

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

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, amount, label, icon, iconClass, active, onClick } = props

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat('fa-IR').format(amt) + ' تومان'
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
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    {amount !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatCurrency(amount)}
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

const Bills = () => {
    const [bills, setBills] = useState<Bill[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
    const [deleteBillDialog, setDeleteBillDialog] = useState(false)
    const [billToDelete, setBillToDelete] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const mockBills: Bill[] = [
                {
                    id: 'bill-001',
                    billNumber: 'B-2024-001',
                    financialDocumentIds: ['fd-002'],
                    totalAmount: 300000,
                    currency: 'IRR',
                    status: 'paid',
                    createdDate: '2024-11-25T10:00:00Z',
                    paidDate: '2024-11-26T10:00:00Z',
                    officialInvoiceRequested: true,
                    officialInvoicePdfUrl: '/bills/bill-001.pdf',
                },
                {
                    id: 'bill-002',
                    billNumber: 'B-2024-002',
                    financialDocumentIds: ['fd-001', 'fd-003'],
                    totalAmount: 1250000,
                    currency: 'IRR',
                    status: 'pending',
                    createdDate: '2024-12-05T10:00:00Z',
                    dueDate: '2024-12-20T10:00:00Z',
                    officialInvoiceRequested: false,
                },
                {
                    id: 'bill-003',
                    billNumber: 'B-2024-003',
                    financialDocumentIds: ['fd-004'],
                    totalAmount: 600000,
                    currency: 'IRR',
                    status: 'paid',
                    createdDate: '2024-11-20T10:00:00Z',
                    paidDate: '2024-11-22T10:00:00Z',
                    officialInvoiceRequested: false,
                },
            ]
            setBills(mockBills)
        } catch (error) {
            console.error('Error loading bills:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteBill = (billId: string) => {
        setBillToDelete(billId)
        setDeleteBillDialog(true)
    }

    const confirmDeleteBill = () => {
        if (billToDelete) {
            setBills(bills.filter((b) => b.id !== billToDelete))
            setDeleteBillDialog(false)
            setBillToDelete(null)
        }
    }

    const handleRequestOfficialInvoice = async (billId: string) => {
        try {
            alert('درخواست فاکتور رسمی با موفقیت ثبت شد')
            loadData()
        } catch (error) {
            console.error('Error requesting invoice:', error)
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    صورتحساب‌ها
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    مشاهده و مدیریت صورتحساب‌های پرداخت
                </p>
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
                                {filteredBills.map((bill) => (
                                    <Tr key={bill.id}>
                                        <Td>
                                            <span className="font-mono font-semibold">
                                                {bill.billNumber}
                                            </span>
                                        </Td>
                                        <Td>{formatDate(bill.createdDate)}</Td>
                                        <Td>
                                            <span className="font-bold">
                                                {formatCurrency(bill.totalAmount)}
                                            </span>
                                        </Td>
                                        <Td>
                                            <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                                                {bill.financialDocumentIds.length} سند
                                            </Tag>
                                        </Td>
                                        <Td>{getStatusTag(bill.status)}</Td>
                                        <Td>
                                            {bill.officialInvoiceRequested ? (
                                                bill.officialInvoicePdfUrl ? (
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
                                                {bill.status === 'paid' && !bill.officialInvoiceRequested && (
                                                    <Tooltip title="درخواست فاکتور رسمی">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            icon={<HiOutlineDocumentText />}
                                                            onClick={() => handleRequestOfficialInvoice(bill.id)}
                                                        >
                                                            درخواست فاکتور
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                                {bill.status === 'pending' && (
                                                    <>
                                                        <Tooltip title="ویرایش">
                                                            <Button
                                                                variant="plain"
                                                                size="sm"
                                                                icon={<HiOutlinePencil />}
                                                                onClick={() => navigate(`/owner/accounting/bills/${bill.id}?edit=true`)}
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
                                                        <Tooltip title="پرداخت">
                                                            <Button
                                                                variant="solid"
                                                                size="sm"
                                                                icon={<HiOutlineCash />}
                                                                onClick={() => navigate(`/owner/accounting/bills/${bill.id}/payment`)}
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
                                ))}
                                {filteredBills.length === 0 && (
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
