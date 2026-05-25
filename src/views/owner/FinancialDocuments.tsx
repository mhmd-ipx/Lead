import { useEffect, useState, useMemo, useRef } from 'react'
import Cookies from 'js-cookie'
import { Card, Button, Tag, Tooltip, Checkbox, Skeleton, toast, Notification, Dialog } from '@/components/ui'
import {
    HiOutlineDocumentDownload,
    HiOutlineEye,
    HiOutlineDocumentText,
    HiOutlineCreditCard,
    HiOutlineCash,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineXCircle,
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import Table from '@/components/ui/Table'
import classNames from '@/utils/classNames'
import type { ChangeEvent } from 'react'
import type { CheckboxProps } from '@/components/ui/Checkbox'
import { getFinancialDocuments, createBillFromDocuments } from '@/services/AdminService'
import type { FinancialDocument } from '@/@types/financialDocument'

const { Tr, Th, Td, THead, TBody } = Table

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

type FilterCategory = 'all' | 'pending' | 'paid' | 'cancelled'

type StatisticCardProps = {
    title: string
    value: number
    amount?: number
    currency?: string
    icon: React.ReactNode
    iconClass: string
    label: FilterCategory
    active: boolean
    loading?: boolean
    onClick: (label: FilterCategory) => void
}

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, amount, label, icon, iconClass, active, loading, onClick, currency = 'IRR' } = props

    const formatCurrency = (amt: number) => {
        const formatted = new Intl.NumberFormat('fa-IR').format(amt)
        return `${formatted} ${currency === 'IRR' ? 'ریال' : currency}`
    }

    return (
        <button
            className={classNames(
                'p-4 rounded-2xl cursor-pointer text-right transition duration-150 outline-none w-full min-w-[240px] md:min-w-0 shrink-0 md:shrink-1',
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
                        {loading ? <Skeleton width={60} /> : value}
                    </h3>
                    {amount !== undefined && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {loading ? <Skeleton width={100} className="mt-1" /> : formatCurrency(amount)}
                        </div>
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
        <Td><Skeleton width={20} /></Td>
        <Td><Skeleton width={60} /></Td>
        <Td><Skeleton width={150} /></Td>
        <Td><Skeleton width={120} /></Td>
        <Td><Skeleton width={100} /></Td>
        <Td><Skeleton width={100} /></Td>
        <Td><Skeleton width={80} /></Td>
        <Td>
            <div className="flex gap-2">
                <Skeleton width={30} height={30} variant="circle" />
                <Skeleton width={30} height={30} variant="circle" />
            </div>
        </Td>
    </Tr>
)

const FinancialDocuments = () => {
    const [documents, setDocuments] = useState<FinancialDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
    const [rowSelection, setRowSelection] = useState({})
    const [billDialogOpen, setBillDialogOpen] = useState(false)
    const [officialInvoiceRequested, setOfficialInvoiceRequested] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    }, [])

    // Reset row selection when category changes
    useEffect(() => {
        setRowSelection({})
    }, [selectedCategory])

    const loadData = async (forceUpdate = false) => {
        try {
            setLoading(true)

            const response = await getFinancialDocuments()
            if (response.success && Array.isArray(response.data)) {
                setDocuments(response.data)
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter documents based on selected category
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            if (selectedCategory === 'all') return true
            return doc.status === selectedCategory
        })
    }, [documents, selectedCategory])

    // Calculate statistics
    const totalDocuments = documents.length
    const paidDocuments = documents.filter(d => d.status === 'paid').length
    const pendingDocuments = documents.filter(d => d.status === 'pending').length
    const cancelledDocuments = documents.filter(d => d.status === 'cancelled').length

    const totalAmount = documents.reduce((sum, d) => sum + parseFloat(d.amount), 0)
    const paidAmount = documents.filter(d => d.status === 'paid').reduce((sum, d) => sum + parseFloat(d.amount), 0)
    const pendingAmount = documents.filter(d => d.status === 'pending').reduce((sum, d) => sum + parseFloat(d.amount), 0)
    const cancelledAmount = documents.filter(d => d.status === 'cancelled').reduce((sum, d) => sum + parseFloat(d.amount), 0)

    const formatCurrency = (amount: number, currency: string = 'IRR') => {
        const formatted = new Intl.NumberFormat('fa-IR').format(amount)
        return `${formatted} ${currency === 'IRR' ? 'ریال' : currency}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    const getStatusTag = (status: FinancialDocument['status']) => {
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
                        در انتظار
                    </Tag>
                )
            case 'cancelled':
                return (
                    <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100 border-0">
                        لغو شده
                    </Tag>
                )
            default:
                return null
        }
    }

    const columns = useMemo<ColumnDef<FinancialDocument>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <IndeterminateCheckbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
                enableSorting: false,
            },
            {
                header: 'شناسه',
                accessorKey: 'id',
                cell: ({ row }) => (
                    <span className="font-mono text-sm">#{row.original.id}</span>
                ),
            },
            {
                header: 'عنوان',
                accessorKey: 'title',
            },
            {
                header: 'سازمان',
                accessorKey: 'company.name',
                cell: ({ row }) => row.original.company?.name || '-',
            },
            {
                header: 'مبلغ',
                accessorKey: 'amount',
                cell: ({ row }) => (
                    <span className="font-semibold">
                        {formatCurrency(parseFloat(row.original.amount), row.original.currency)}
                    </span>
                ),
            },
            {
                header: 'تاریخ ایجاد',
                accessorKey: 'created_date',
                cell: ({ row }) => formatDate(row.original.created_date),
            },
            {
                header: 'وضعیت',
                accessorKey: 'status',
                cell: ({ row }) => getStatusTag(row.original.status),
            },
            {
                header: 'عملیات',
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Tooltip title="مشاهده جزئیات">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlineEye />}
                                onClick={() =>
                                    navigate(
                                        `/owner/accounting/documents/${row.original.id}`,
                                    )
                                }
                            />
                        </Tooltip>
                    </div>
                ),
            },
        ],
        [navigate],
    )

    const table = useReactTable({
        data: filteredDocuments,
        columns,
        state: {
            rowSelection,
        },
        enableRowSelection: (row) => row.original.status === 'pending' && !row.original.bills_exists,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const selectedRows = table.getSelectedRowModel().rows
    const selectedTotal = selectedRows.reduce(
        (sum, row) => sum + parseFloat(row.original.amount),
        0,
    )

    const handleBulkPayment = () => {
        if (selectedRows.length === 0) {
            toast.push(
                <Notification type="warning" title="هشدار">
                    لطفاً حداقل یک سند را انتخاب کنید
                </Notification>
            )
            return
        }
        // Open dialog to confirm and select invoice type
        setOfficialInvoiceRequested(false)
        setBillDialogOpen(true)
    }

    const confirmBillCreation = async () => {
        try {
            setBillDialogOpen(false)
            setLoading(true)

            // Get company_id from first selected document (all should be same company in owner panel)
            const companyId = selectedRows[0].original.company_id
            const selectedIds = selectedRows.map((row) => row.original.id)

            const response = await createBillFromDocuments({
                company_id: companyId,
                financial_document_ids: selectedIds,
                official_invoice_requested: officialInvoiceRequested,
            })

            if (response.success) {
                // Clear bills cache so the new bill appears in the list
                Cookies.remove('owner_bills_cache')

                toast.push(
                    <Notification type="success" title="موفقیت">
                        {response.message || 'صورتحساب با موفقیت ایجاد شد'}
                    </Notification>
                )
                // Navigate to bill view
                if (response.data?.id) {
                    navigate(`/owner/accounting/bills/${response.data.id}`)
                }
                // Refresh documents
                loadData(true)
            }
        } catch (error: any) {
            console.error('Error creating bill:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.message || 'خطا در ایجاد صورتحساب'}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div id="financial-documents-header">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    اسناد مالی
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    مشاهده و مدیریت اسناد مالی متقاضیان
                </p>
            </div>

            {/* Stats Cards */}
            <div id="financial-documents-stats-cards" className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-2 md:pb-0 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
                <StatisticCard
                    title="همه اسناد"
                    value={totalDocuments}
                    amount={totalAmount}
                    iconClass="bg-blue-200 text-blue-700"
                    icon={<HiOutlineDocumentText />}
                    label="all"
                    active={selectedCategory === 'all'}
                    loading={loading}
                    onClick={setSelectedCategory}
                    currency={documents[0]?.currency}
                />
                <StatisticCard
                    title="در انتظار"
                    value={pendingDocuments}
                    amount={pendingAmount}
                    iconClass="bg-amber-200 text-amber-700"
                    icon={<HiOutlineClock />}
                    label="pending"
                    active={selectedCategory === 'pending'}
                    loading={loading}
                    onClick={setSelectedCategory}
                    currency={documents[0]?.currency}
                />
                <StatisticCard
                    title="پرداخت شده"
                    value={paidDocuments}
                    amount={paidAmount}
                    iconClass="bg-emerald-200 text-emerald-700"
                    icon={<HiOutlineCheckCircle />}
                    label="paid"
                    active={selectedCategory === 'paid'}
                    loading={loading}
                    onClick={setSelectedCategory}
                    currency={documents[0]?.currency}
                />
                <StatisticCard
                    title="لغو شده"
                    value={cancelledDocuments}
                    amount={cancelledAmount}
                    iconClass="bg-red-200 text-red-700"
                    icon={<HiOutlineXCircle />}
                    label="cancelled"
                    active={selectedCategory === 'cancelled'}
                    loading={loading}
                    onClick={setSelectedCategory}
                    currency={documents[0]?.currency}
                />
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
                <Card id="financial-documents-bulk-actions-anchor" className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                {selectedRows.length} سند انتخاب شده
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                مجموع: {formatCurrency(selectedTotal, selectedRows[0]?.original.currency)}
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            icon={<HiOutlineCash />}
                            onClick={handleBulkPayment}
                            className="w-full sm:w-auto"
                        >
                            ایجاد صورتحساب و پرداخت
                        </Button>
                    </div>
                </Card>
            )
            }

            {/* Table */}
            <Card id="financial-documents-table" className="p-0">
                {/* Mobile Select All */}
                <div className="lg:hidden p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <IndeterminateCheckbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        انتخاب همه اسناد قابل پرداخت
                    </span>
                </div>
                
                <div className="overflow-x-auto hidden lg:block">
                    <Table>
                        <THead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <Th key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                        </Th>
                                    ))}
                                </Tr>
                            ))}
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
                                table.getRowModel().rows.map((row) => (
                                    <Tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Td>
                                        ))}
                                    </Tr>
                                ))
                            )}
                        </TBody>
                    </Table>
                </div>

                {/* Mobile List View */}
                <div className="lg:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? (
                        [...Array(3)].map((_, index) => (
                            <div key={index} className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton width={20} height={20} />
                                    <Skeleton width={150} height={16} />
                                </div>
                                <Skeleton width="100%" height={24} />
                            </div>
                        ))
                    ) : table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                            <div key={row.id} className="p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-3">
                                <div className="mt-1">
                                    <IndeterminateCheckbox
                                        checked={row.getIsSelected()}
                                        disabled={!row.getCanSelect()}
                                        indeterminate={row.getIsSomeSelected()}
                                        onChange={row.getToggleSelectedHandler()}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="pr-2">
                                            <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
                                                {row.original.title}
                                            </div>
                                            <div className="font-mono text-xs text-gray-500 mb-1">
                                                #{row.original.id}
                                            </div>
                                            <div className="text-[11px] text-gray-500">
                                                تاریخ: {formatDate(row.original.created_date)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="w-fit scale-[0.85] origin-left">{getStatusTag(row.original.status)}</div>
                                            <div className="font-bold text-sm">
                                                {formatCurrency(parseFloat(row.original.amount), row.original.currency)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {row.original.company?.name || '-'}
                                        </div>
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            icon={<HiOutlineEye />}
                                            onClick={() => navigate(`/owner/accounting/documents/${row.original.id}`)}
                                            className="text-gray-500"
                                        >
                                            جزئیات
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            سندی یافت نشد
                        </div>
                    )}
                </div>
            </Card>

            {/* Bill Creation Dialog */}
            <Dialog
                isOpen={billDialogOpen}
                onClose={() => setBillDialogOpen(false)}
                onRequestClose={() => setBillDialogOpen(false)}
            >
                <h5 className="mb-4">ایجاد صورتحساب</h5>
                <p className="mb-4 text-sm">
                    آیا می‌خواهید صورتحساب برای {selectedRows.length} سند انتخاب شده ایجاد کنید؟
                </p>
                <div className="mb-6">
                    <Checkbox
                        checked={officialInvoiceRequested}
                        onChange={(checked) => setOfficialInvoiceRequested(checked)}
                    >
                        درخواست فاکتور رسمی
                    </Checkbox>
                    <p className="text-xs text-gray-500 mt-2 mr-6">
                        در صورت انتخاب این گزینه، فاکتور رسمی برای صورتحساب صادر خواهد شد.
                    </p>
                </div>
                <div className="text-left mt-6 flex gap-2 justify-end">
                    <Button
                        size="sm"
                        variant="plain"
                        onClick={() => setBillDialogOpen(false)}
                    >
                        انصراف
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        onClick={confirmBillCreation}
                    >
                        ایجاد صورتحساب
                    </Button>
                </div>
            </Dialog>
        </div >
    )
}

export default FinancialDocuments
