import { useState, useEffect, useMemo } from 'react'
import { Card, Button, Input, Tag, Tooltip, Skeleton, Notification, toast, Dialog, Select, FormItem, FormContainer, Badge, Spinner } from '@/components/ui'
import { HiOutlineDocumentText, HiOutlineSearch, HiOutlinePlus, HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineOfficeBuilding, HiOutlineCash, HiOutlineCheckCircle, HiOutlineCog, HiOutlineClock, HiOutlineXCircle } from 'react-icons/hi'
import { getFinancialDocuments, createFinancialDocument, getCompanies, getFinancialDocument, updateFinancialDocument, deleteFinancialDocument } from '@/services/AdminService'
import type { FinancialDocument } from '@/@types/financialDocument'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import classNames from '@/utils/classNames'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

type FilterType = 'all' | 'pending' | 'paid' | 'cancelled'

const FinancialDocuments = () => {
    const navigate = useNavigate()
    const [documents, setDocuments] = useState<FinancialDocument[]>([])
    const [companies, setCompanies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState<FinancialDocument | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<string>('all')

    useEffect(() => {
        fetchDocuments()
        fetchCompanies()
    }, [])

    const fetchDocuments = async (forceUpdate = false) => {
        try {
            setLoading(true)

            // Check cache first if not forced update
            if (!forceUpdate) {
                // Try Cookies first as requested
                const cookieData = Cookies.get('financial_documents_cache')
                if (cookieData) {
                    try {
                        setDocuments(JSON.parse(cookieData))
                        setLoading(false)
                        return
                    } catch (e) {
                        console.error('Error parsing cookie data', e)
                    }
                }

                // Fallback to localStorage
                const localData = localStorage.getItem('financial_documents_cache')
                if (localData) {
                    setDocuments(JSON.parse(localData))
                    setLoading(false)
                    return
                }
            }

            const response = await getFinancialDocuments()
            if (response.success && Array.isArray(response.data)) {
                setDocuments(response.data)

                // Save to cache (Cookie and LocalStorage)
                try {
                    const jsonString = JSON.stringify(response.data)
                    Cookies.set('financial_documents_cache', jsonString, { expires: 1 }) // 1 day expiration
                    localStorage.setItem('financial_documents_cache', jsonString)
                } catch (e) {
                    console.error('Error saving to cache', e)
                }
            }
        } catch (error) {
            console.error('Error fetching financial documents:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    خطا در دریافت اسناد مالی
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    const fetchCompanies = async () => {
        try {
            const companiesData = await getCompanies()
            setCompanies(companiesData)
        } catch (error) {
            console.error('Error fetching companies:', error)
        }
    }

    const validationSchema = Yup.object().shape({
        company_id: Yup.number().required('انتخاب سازمان الزامی است'),
        title: Yup.string().required('عنوان الزامی است').max(255, 'عنوان نباید بیشتر از 255 کاراکتر باشد'),
        amount: Yup.number().required('مبلغ الزامی است').min(1, 'مبلغ باید بیشتر از صفر باشد'),
        currency: Yup.string().required('واحد پول الزامی است'),
        status: Yup.string().required('وضعیت الزامی است').oneOf(['pending', 'paid', 'cancelled']),
        description: Yup.string().nullable(),
    })

    const handleCreateDocument = async (values: any, { resetForm }: any) => {
        try {
            setSubmitting(true)
            // Add type as invoice and current date
            const payload = {
                ...values,
                type: 'invoice',
                created_date: new Date().toISOString().split('T')[0],
            }
            const response = await createFinancialDocument(payload)

            if (response.success) {
                toast.push(
                    <Notification type="success" title="موفق">
                        {response.message || 'سند مالی با موفقیت ایجاد شد'}
                    </Notification>
                )
                setCreateDialogOpen(false)
                resetForm()
                fetchDocuments(true) // Force update cache
            }
        } catch (error: any) {
            console.error('Error creating financial document:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.message || 'خطا در ایجاد سند مالی'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesFilter = selectedFilter === 'all' || doc.status === selectedFilter
            const matchesCompany = selectedCompany === 'all' || doc.company_id.toString() === selectedCompany
            const query = searchQuery.toLowerCase()
            const matchesSearch = (
                doc.title.toLowerCase().includes(query) ||
                doc.company.name.toLowerCase().includes(query) ||
                (doc.description && doc.description.toLowerCase().includes(query))
            )
            return matchesFilter && matchesSearch && matchesCompany
        })
    }, [documents, selectedFilter, searchQuery, selectedCompany])

    const companyOptions = useMemo(() => {
        const uniqueCompanies = Array.from(new Set(documents.map(d => JSON.stringify({ id: d.company_id, name: d.company.name }))))
            .map((s: string) => JSON.parse(s))

        return [
            { value: 'all', label: 'همه سازمان‌ها' },
            ...uniqueCompanies.map((c: any) => ({ value: c.id.toString(), label: c.name }))
        ]
    }, [documents])

    const pendingCount = useMemo(() => documents.filter(d => d.status === 'pending').length, [documents])
    const paidCount = useMemo(() => documents.filter(d => d.status === 'paid').length, [documents])
    const cancelledCount = useMemo(() => documents.filter(d => d.status === 'cancelled').length, [documents])

    const getTypeTag = (type: string) => {
        const typeConfig = {
            invoice: { label: 'فاکتور', className: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100' },
            income: { label: 'درآمد', className: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100' },
            expense: { label: 'هزینه', className: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100' },
        }
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.invoice
        return <Tag className={`${config.className} border-0`}>{config.label}</Tag>
    }

    const getStatusTag = (status: string) => {
        const statusConfig = {
            pending: { label: 'در انتظار', className: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-100' },
            paid: { label: 'پرداخت شده', className: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100' },
            cancelled: { label: 'لغو شده', className: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100' },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
        return <Tag className={`${config.className} border-0`}>{config.label}</Tag>
    }

    const formatAmount = (amount: string | number, currency: string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount
        const formatted = new Intl.NumberFormat('fa-IR').format(num)
        return `${formatted} ${currency === 'IRR' ? 'ریال' : currency}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    const fetchDocumentDetails = async (id: number) => {
        try {
            setDetailLoading(true)
            const response = await getFinancialDocument(id)
            if (response.data) {
                setSelectedDocument(response.data)
            }
        } catch (error) {
            console.error('Error fetching document details:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    خطا در دریافت جزئیات سند
                </Notification>
            )
        } finally {
            setDetailLoading(false)
        }
    }

    const handleView = (document: FinancialDocument) => {
        navigate(`/admin/accounting/documents/${document.id}`)
    }

    const handleEdit = async (document: FinancialDocument) => {
        setSelectedDocument(document)
        setEditDialogOpen(true)
        await fetchDocumentDetails(document.id)
    }

    const handleDelete = (document: FinancialDocument) => {
        setSelectedDocument(document)
        setDeleteDialogOpen(true)
    }

    const handleUpdateDocument = async (values: any, { resetForm }: any) => {
        if (!selectedDocument) return

        try {
            setSubmitting(true)
            const payload = {
                title: values.title,
                amount: values.amount,
                currency: values.currency,
                type: 'invoice', // Always invoice based on logic
                status: values.status,
                description: values.description,
                paid_date: values.paid_date || null
            }

            const response = await updateFinancialDocument(selectedDocument.id, payload)

            if (response.success) {
                toast.push(
                    <Notification type="success" title="موفق">
                        {response.message || 'سند مالی با موفقیت بروزرسانی شد'}
                    </Notification>
                )
                setEditDialogOpen(false)
                fetchDocuments(true) // Force update cache
            }
        } catch (error: any) {
            console.error('Error updating financial document:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.message || 'خطا در بروزرسانی سند مالی'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    const confirmDelete = async () => {
        if (!selectedDocument) return

        try {
            setSubmitting(true)
            const response = await deleteFinancialDocument(selectedDocument.id)

            // Check if response is successful (204 No Content or success flag)
            // If the response has a status code property (axios response), check for 204
            // Or if it's the data directly, it might be empty or have success: true
            if (response?.status === 204 || response?.success || !response) {
                toast.push(
                    <Notification type="success" title="موفق">
                        سند مالی با موفقیت حذف شد
                    </Notification>
                )
                setDeleteDialogOpen(false)
                fetchDocuments(true) // Force update cache
            }
        } catch (error: any) {
            console.error('Error deleting financial document:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.message || 'خطا در حذف سند مالی'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }
    const SkeletonRow = () => (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={150} height={16} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={120} height={14} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={100} height={14} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={80} height={20} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={80} height={20} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circle" width={32} height={32} />
                    <Skeleton variant="circle" width={32} height={32} />
                    <Skeleton variant="circle" width={32} height={32} />
                </div>
            </td>
        </tr>
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                        <Skeleton width={200} height={32} className="mb-2" />
                        <Skeleton width={300} height={20} />
                    </div>
                    <Skeleton width={120} height={40} />
                </div>

                <div className="flex gap-4">
                    <Skeleton width={300} height={40} className="flex-1" />
                </div>

                <Card>
                    <div className="p-6">
                        <Skeleton width={150} height={24} className="mb-4" />
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineDocumentText className="w-4 h-4" />
                                                عنوان
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineOfficeBuilding className="w-4 h-4" />
                                                سازمان
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineCash className="w-4 h-4" />
                                                مبلغ
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineCheckCircle className="w-4 h-4" />
                                                وضعیت
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineDocumentText className="w-4 h-4" />
                                                وضعیت صورتحساب
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineCog className="w-4 h-4" />
                                                عملیات
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        اسناد مالی
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت و مشاهده اسناد مالی سیستم
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-48">
                        <Select
                            size="sm"
                            placeholder="فیلتر سازمان"
                            options={companyOptions}
                            value={companyOptions.find((c: any) => c.value === selectedCompany)}
                            onChange={(option: any) => setSelectedCompany(option?.value || 'all')}
                        />
                    </div>
                    <Input
                        placeholder="جستجو..."
                        prefix={<HiOutlineSearch className="text-gray-400" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        ثبت سند جدید
                    </Button>
                </div>
            </div>

            {/* Stats / Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'all' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('all')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">همه</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{documents.length}</h3>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineDocumentText className="text-xl text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'pending' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('pending')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">در انتظار</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</h3>
                        </div>
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineClock className="text-xl text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </Card>

                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'paid' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('paid')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">پرداخت شده</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{paidCount}</h3>
                        </div>
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineCheckCircle className="text-xl text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>

                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'cancelled' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('cancelled')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">لغو شده</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{cancelledCount}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineXCircle className="text-xl text-gray-600 dark:text-gray-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineDocumentText className="w-5 h-5" />
                        لیست اسناد مالی
                        {(searchQuery || selectedFilter !== 'all') && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredDocuments.length} مورد)
                            </span>
                        )}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineDocumentText className="w-4 h-4" />
                                            عنوان
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineOfficeBuilding className="w-4 h-4" />
                                            سازمان
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineCash className="w-4 h-4" />
                                            مبلغ
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineCheckCircle className="w-4 h-4" />
                                            وضعیت
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineDocumentText className="w-4 h-4" />
                                            وضعیت صورتحساب
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineCog className="w-4 h-4" />
                                            عملیات
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredDocuments.map((document) => (
                                    <tr key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-start gap-2">
                                                <HiOutlineDocumentText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {document.title}
                                                    </div>
                                                    {document.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {document.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineOfficeBuilding className="w-5 h-5 text-gray-400" />
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {document.company.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineCash className="w-5 h-5 text-green-500" />
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {formatAmount(document.amount, document.currency)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusTag(document.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {document.bills_exists ? (
                                                <Tag className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100 border-0">
                                                    در صورتحساب
                                                </Tag>
                                            ) : (
                                                <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100 border-0">
                                                    آزاد
                                                </Tag>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Tooltip title="مشاهده جزئیات">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineEye />}
                                                        onClick={() => handleView(document)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="ویرایش">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlinePencil />}
                                                        onClick={() => handleEdit(document)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    />
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineTrash />}
                                                        onClick={() => handleDelete(document)}
                                                        className="text-red-600 hover:text-red-700"
                                                    />
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDocuments.length === 0 && (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="text-center py-12">
                                                <HiOutlineDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {searchQuery
                                                        ? 'سند مالی با این فیلتر یافت نشد'
                                                        : 'هنوز سند مالی‌ای ثبت نشده است'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>

            {/* Create Dialog */}
            <Dialog
                isOpen={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onRequestClose={() => setCreateDialogOpen(false)}
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ثبت سند مالی جدید
                </h3>

                <Formik
                    initialValues={{
                        company_id: 0,
                        title: '',
                        amount: 0,
                        currency: 'IRR',
                        status: 'pending' as 'pending' | 'paid' | 'cancelled',
                        description: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleCreateDocument}
                >
                    {({ values, errors, touched, setFieldValue }) => (
                        <Form>
                            <FormContainer>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem
                                        label="سازمان"
                                        invalid={Boolean(errors.company_id && touched.company_id)}
                                        errorMessage={errors.company_id}
                                    >
                                        <Field name="company_id">
                                            {({ field }: any) => (
                                                <Select
                                                    {...field}
                                                    placeholder="انتخاب سازمان"
                                                    options={companies.map(company => ({
                                                        value: company.id,
                                                        label: company.name
                                                    }))}
                                                    value={companies.find(c => c.id === values.company_id) ? {
                                                        value: values.company_id,
                                                        label: companies.find(c => c.id === values.company_id)?.name
                                                    } : null}
                                                    onChange={(option: any) => setFieldValue('company_id', option?.value || 0)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label="عنوان"
                                        invalid={Boolean(errors.title && touched.title)}
                                        errorMessage={errors.title}
                                    >
                                        <Field name="title" as={Input} placeholder="عنوان سند" />
                                    </FormItem>

                                    <FormItem
                                        label="مبلغ"
                                        invalid={Boolean(errors.amount && touched.amount)}
                                        errorMessage={errors.amount}
                                    >
                                        <Field name="amount" type="number" as={Input} placeholder="مبلغ" />
                                    </FormItem>

                                    <FormItem
                                        label="واحد پول"
                                        invalid={Boolean(errors.currency && touched.currency)}
                                        errorMessage={errors.currency}
                                    >
                                        <Field name="currency">
                                            {({ field }: any) => (
                                                <Select
                                                    {...field}
                                                    placeholder="انتخاب واحد پول"
                                                    options={[
                                                        { value: 'IRR', label: 'ریال' },
                                                        { value: 'USD', label: 'دلار' },
                                                        { value: 'EUR', label: 'یورو' },
                                                    ]}
                                                    value={{ value: values.currency, label: values.currency === 'IRR' ? 'ریال' : values.currency }}
                                                    onChange={(option: any) => setFieldValue('currency', option?.value || 'IRR')}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label="وضعیت"
                                        invalid={Boolean(errors.status && touched.status)}
                                        errorMessage={errors.status}
                                    >
                                        <Field name="status">
                                            {({ field }: any) => (
                                                <Select
                                                    {...field}
                                                    placeholder="انتخاب وضعیت"
                                                    options={[
                                                        { value: 'pending', label: 'در انتظار' },
                                                        { value: 'paid', label: 'پرداخت شده' },
                                                        { value: 'cancelled', label: 'لغو شده' },
                                                    ]}
                                                    value={{ value: values.status, label: values.status === 'pending' ? 'در انتظار' : values.status === 'paid' ? 'پرداخت شده' : 'لغو شده' }}
                                                    onChange={(option: any) => setFieldValue('status', option?.value || 'pending')}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label="توضیحات (اختیاری)"
                                        invalid={Boolean(errors.description && touched.description)}
                                        errorMessage={errors.description}
                                        className="md:col-span-2"
                                    >
                                        <Field name="description" as={Input} textArea placeholder="توضیحات سند" />
                                    </FormItem>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <Button
                                        type="button"
                                        variant="plain"
                                        onClick={() => setCreateDialogOpen(false)}
                                        disabled={submitting}
                                    >
                                        انصراف
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        loading={submitting}
                                    >
                                        ثبت سند
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                isOpen={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onRequestClose={() => setEditDialogOpen(false)}
                width={700}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        ویرایش سند مالی #{selectedDocument?.id}
                    </h3>
                    {detailLoading && <Spinner />}
                </div>

                {selectedDocument && (
                    <Formik
                        initialValues={{
                            company_id: selectedDocument.company_id,
                            title: selectedDocument.title,
                            amount: parseFloat(selectedDocument.amount as unknown as string),
                            currency: selectedDocument.currency,
                            status: selectedDocument.status,
                            description: selectedDocument.description || '',
                            paid_date: selectedDocument.paid_date ? (selectedDocument.paid_date as string).split('T')[0] : '',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleUpdateDocument}
                        enableReinitialize
                    >
                        {({ values, errors, touched, setFieldValue }) => (
                            <Form>
                                <FormContainer>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center gap-3 mb-2">
                                            <HiOutlineOfficeBuilding className="text-xl text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <span className="block text-xs text-blue-600 dark:text-blue-300">سازمان (غیرقابل تغییر)</span>
                                                <span className="font-semibold text-blue-800 dark:text-blue-100">{selectedDocument.company.name}</span>
                                            </div>
                                        </div>

                                        <FormItem
                                            label="عنوان"
                                            invalid={Boolean(errors.title && touched.title)}
                                            errorMessage={errors.title as string}
                                        >
                                            <Field name="title" as={Input} placeholder="عنوان سند" />
                                        </FormItem>

                                        <FormItem
                                            label="مبلغ"
                                            invalid={Boolean(errors.amount && touched.amount)}
                                            errorMessage={errors.amount as string}
                                        >
                                            <Field name="amount" type="number" as={Input} placeholder="مبلغ" />
                                        </FormItem>

                                        <FormItem
                                            label="واحد پول"
                                            invalid={Boolean(errors.currency && touched.currency)}
                                            errorMessage={errors.currency as string}
                                        >
                                            <Field name="currency">
                                                {({ field }: any) => (
                                                    <Select
                                                        {...field}
                                                        placeholder="انتخاب واحد پول"
                                                        options={[
                                                            { value: 'IRR', label: 'ریال' },
                                                            { value: 'USD', label: 'دلار' },
                                                            { value: 'EUR', label: 'یورو' },
                                                        ]}
                                                        value={{ value: values.currency, label: values.currency === 'IRR' ? 'ریال' : values.currency }}
                                                        onChange={(option: any) => setFieldValue('currency', option?.value || 'IRR')}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="وضعیت"
                                            invalid={Boolean(errors.status && touched.status)}
                                            errorMessage={errors.status as string}
                                        >
                                            <Field name="status">
                                                {({ field }: any) => (
                                                    <Select
                                                        {...field}
                                                        placeholder="انتخاب وضعیت"
                                                        options={[
                                                            { value: 'pending', label: 'در انتظار' },
                                                            { value: 'paid', label: 'پرداخت شده' },
                                                            { value: 'cancelled', label: 'لغو شده' },
                                                        ]}
                                                        value={{ value: values.status, label: values.status === 'pending' ? 'در انتظار' : values.status === 'paid' ? 'پرداخت شده' : 'لغو شده' }}
                                                        onChange={(option: any) => setFieldValue('status', option?.value || 'pending')}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        {values.status === 'paid' && (
                                            <FormItem
                                                label="تاریخ پرداخت"
                                                invalid={Boolean(errors.paid_date && touched.paid_date)}
                                                errorMessage={errors.paid_date as string}
                                            >
                                                <Field name="paid_date" type="date" as={Input} />
                                            </FormItem>
                                        )}

                                        <FormItem
                                            label="توضیحات (اختیاری)"
                                            invalid={Boolean(errors.description && touched.description)}
                                            errorMessage={errors.description as string}
                                            className="md:col-span-2"
                                        >
                                            <Field name="description" as={Input} textArea placeholder="توضیحات سند" />
                                        </FormItem>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-6">
                                        <Button
                                            type="button"
                                            variant="plain"
                                            onClick={() => setEditDialogOpen(false)}
                                            disabled={submitting}
                                        >
                                            انصراف
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="solid"
                                            loading={submitting}
                                        >
                                            ذخیره تغییرات
                                        </Button>
                                    </div>
                                </FormContainer>
                            </Form>
                        )}
                    </Formik>
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onRequestClose={() => setDeleteDialogOpen(false)}
            >
                <div className="p-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        حذف سند مالی
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        آیا از حذف سند مالی <span className="font-semibold text-gray-900 dark:text-white">"{selectedDocument?.title}"</span> اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="plain"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={submitting}
                        >
                            انصراف
                        </Button>
                        <Button
                            variant="solid"
                            color="red-600"
                            onClick={confirmDelete}
                            loading={submitting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            حذف سند
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default FinancialDocuments
