import { useEffect, useState, useMemo, useRef } from 'react'
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
    icon: React.ReactNode
    iconClass: string
    label: FilterCategory
    active: boolean
    loading?: boolean
    onClick: (label: FilterCategory) => void
}

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, amount, label, icon, iconClass, active, loading, onClick } = props

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
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
                        {formatCurrency(parseFloat(row.original.amount))}
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
        enableRowSelection: (row) => row.original.status === 'pending',
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    اسناد مالی
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    مشاهده و مدیریت اسناد مالی متقاضیان
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
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
                />
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                {selectedRows.length} سند انتخاب شده
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                مجموع: {formatCurrency(selectedTotal)}
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            icon={<HiOutlineCash />}
                            onClick={handleBulkPayment}
                        >
                            ایجاد صورتحساب و پرداخت
                        </Button>
                    </div>
                </Card>
            )}

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
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
