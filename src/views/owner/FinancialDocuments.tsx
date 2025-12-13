import { useEffect, useState, useMemo, useRef } from 'react'
import { Card, Button, Tag, Tooltip, Checkbox } from '@/components/ui'
import {
    HiOutlineDocumentDownload,
    HiOutlineEye,
    HiOutlineDocumentText,
    HiOutlineCreditCard,
    HiOutlineCash,
    HiOutlineCheckCircle,
    HiOutlineClock,
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
import type { FinancialDocument } from '@/mock/data/ownerData'

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

const FinancialDocuments = () => {
    const [documents, setDocuments] = useState<FinancialDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
    const [rowSelection, setRowSelection] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    }, [])

    // Reset row selection when category changes
    useEffect(() => {
        setRowSelection({})
    }, [selectedCategory])

    const loadData = async () => {
        try {
            const mockData: FinancialDocument[] = [
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
                    id: 'fd-002',
                    managerName: 'مریم احمدی',
                    title: 'هزینه نیازسنجی',
                    amount: 300000,
                    currency: 'IRR',
                    status: 'paid',
                    createdDate: '2024-11-25T10:00:00Z',
                    paidDate: '2024-11-26T10:00:00Z',
                    billId: 'bill-001',
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
                {
                    id: 'fd-004',
                    managerName: 'فاطمه کریمی',
                    title: 'هزینه دوره مدیریت',
                    amount: 600000,
                    currency: 'IRR',
                    status: 'paid',
                    createdDate: '2024-11-20T10:00:00Z',
                    paidDate: '2024-11-22T10:00:00Z',
                    billId: 'bill-002',
                },
            ]
            setDocuments(mockData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter documents based on selected category
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            switch (selectedCategory) {
                case 'paid':
                    return doc.status === 'paid'
                case 'unpaid':
                    return doc.status === 'pending'
                case 'all':
                default:
                    return true
            }
        })
    }, [documents, selectedCategory])

    // Calculate statistics
    const totalDocuments = documents.length
    const paidDocuments = documents.filter(d => d.status === 'paid').length
    const unpaidDocuments = documents.filter(d => d.status === 'pending').length

    const totalAmount = documents.reduce((sum, d) => sum + d.amount, 0)
    const paidAmount = documents.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0)
    const unpaidAmount = documents.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    const getStatusTag = (status: FinancialDocument['status']) => {
        if (status === 'paid') {
            return (
                <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                    پرداخت شده
                </Tag>
            )
        }
        return (
            <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">
                پرداخت نشده
            </Tag>
        )
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
                header: 'متقاضی',
                accessorKey: 'managerName',
            },
            {
                header: 'مبلغ',
                accessorKey: 'amount',
                cell: ({ row }) => (
                    <span className="font-semibold">
                        {formatCurrency(row.original.amount)}
                    </span>
                ),
            },
            {
                header: 'تاریخ ایجاد',
                accessorKey: 'createdDate',
                cell: ({ row }) => formatDate(row.original.createdDate),
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
                        {row.original.status === 'pending' && (
                            <Tooltip title="پرداخت">
                                <Button
                                    variant="solid"
                                    size="sm"
                                    icon={<HiOutlineCash />}
                                    onClick={() =>
                                        navigate(
                                            `/owner/accounting/documents/${row.original.id}`,
                                        )
                                    }
                                >
                                    پرداخت
                                </Button>
                            </Tooltip>
                        )}
                        {row.original.billId && (
                            <Tooltip title="مشاهده صورتحساب">
                                <Button
                                    variant="plain"
                                    size="sm"
                                    icon={<HiOutlineCreditCard />}
                                    onClick={() =>
                                        navigate(
                                            `/owner/accounting/bills/${row.original.billId}`,
                                        )
                                    }
                                />
                            </Tooltip>
                        )}
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
        (sum, row) => sum + row.original.amount,
        0,
    )

    const handleBulkPayment = () => {
        const selectedIds = selectedRows.map((row) => row.original.id)
        navigate('/owner/accounting/bulk-payment', {
            state: { selectedDocumentIds: selectedIds },
        })
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
                    اسناد مالی
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    مشاهده و مدیریت اسناد مالی متقاضیان
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
                <StatisticCard
                    title="همه اسناد"
                    value={totalDocuments}
                    amount={totalAmount}
                    iconClass="bg-blue-200 text-blue-700"
                    icon={<HiOutlineDocumentText />}
                    label="all"
                    active={selectedCategory === 'all'}
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
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="پرداخت نشده"
                    value={unpaidDocuments}
                    amount={unpaidAmount}
                    iconClass="bg-amber-200 text-amber-700"
                    icon={<HiOutlineClock />}
                    label="unpaid"
                    active={selectedCategory === 'unpaid'}
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
                            پرداخت گروهی
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
                            {table.getRowModel().rows.map((row) => (
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
                            ))}
                        </TBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}

export default FinancialDocuments
