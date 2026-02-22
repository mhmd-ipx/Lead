import useSWR from 'swr'
import { Card, Button, Avatar, Tag, Tooltip, Input, Skeleton, toast, Notification } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineSearch,
    HiOutlineClipboardCheck,
    HiOutlineAcademicCap,
    HiOutlineUserGroup,
    HiOutlineCheckCircle,
    HiOutlineArrowLeft,
} from 'react-icons/hi'
import { getManagersByCompany, getCompanyById, deleteManager } from '@/services/AdminService'
import { Manager } from '@/mock/data/ownerData'
import { Company } from '@/mock/data/adminData'
import { useNavigate, useParams } from 'react-router-dom'
import classNames from '@/utils/classNames'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

type FilterCategory = 'all' | 'active' | 'inactive' | 'assessmentDone' | 'examDone'

// Statistic Card Component
const StatisticCard = ({ icon, label, value, color, loading }: {
    icon: React.ReactNode
    label: string
    value: number
    color: string
    loading?: boolean
}) => {
    const iconClass = classNames(
        'w-12 h-12 rounded-lg flex items-center justify-center',
        color
    )

    return (
        <button className="w-full text-right hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={iconClass}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                    {loading ? (
                        <Skeleton width={60} height={36} />
                    ) : (
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    )}
                </div>
            </div>
        </button>
    )
}

// Skeleton for table rows
const TableRowSkeleton = () => (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
                <Skeleton variant="circle" width={32} height={32} />
                <div className="space-y-2">
                    <Skeleton width={120} height={16} />
                    <Skeleton width={80} height={14} />
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton width={100} height={16} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton width={80} height={24} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton width={90} height={24} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton width={90} height={24} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex gap-2">
                <Skeleton variant="circle" width={32} height={32} />
                <Skeleton variant="circle" width={32} height={32} />
                <Skeleton variant="circle" width={32} height={32} />
            </div>
        </td>
    </tr>
)

const CompanyManagers = () => {
    const { companyId } = useParams<{ companyId: string }>()

    // Initialize state from cookies or default
    const [searchQuery, setSearchQuery] = useState(
        Cookies.get('companyManagers_search') || ''
    )
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(
        (Cookies.get('companyManagers_category') as FilterCategory) || 'all'
    )

    const [company, setCompany] = useState<Company | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
    const navigate = useNavigate()

    const handleCategoryChange = (category: FilterCategory) => {
        setSelectedCategory(category)
        Cookies.set('companyManagers_category', category)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        Cookies.set('companyManagers_search', value)
    }

    // Use SWR for data fetching with caching
    const { data: managers, error, isLoading, mutate } = useSWR(
        companyId ? `/managers/company/${companyId}` : null,
        () => getManagersByCompany(parseInt(companyId!)),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 60000, // 1 minute
        }
    )

    // Fetch company data
    useEffect(() => {
        if (companyId) {
            loadCompanyData()
        }
    }, [companyId])

    const loadCompanyData = async () => {
        try {
            const companyData = await getCompanyById(companyId!)
            setCompany(companyData)
        } catch (error) {
            console.error('Error loading company:', error)
        }
    }

    // Filter managers
    const filteredManagers = managers?.filter(manager => {
        // Search filter
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
            manager.user.name.toLowerCase().includes(searchLower) ||
            manager.position.toLowerCase().includes(searchLower) ||
            manager.department.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false

        // Category filter
        if (selectedCategory === 'all') return true
        if (selectedCategory === 'active') return manager.status === 'active'
        if (selectedCategory === 'inactive') return manager.status === 'inactive'
        if (selectedCategory === 'assessmentDone') return manager.assessment_status === 'completed'
        if (selectedCategory === 'examDone') return manager.exam_status === 'completed'

        return true
    }) || []

    const handleDeleteManager = async () => {
        if (!selectedManager) return

        try {
            await deleteManager(selectedManager.id)
            mutate() // Revalidate SWR cache
            setDeleteDialogOpen(false)
            setSelectedManager(null)

            toast.push(
                <Notification type="success" duration={3000}>
                    <div>
                        <p className="font-semibold">حذف موفق</p>
                        <p className="text-sm">متقاضی با موفقیت حذف شد</p>
                    </div>
                </Notification>,
                {
                    placement: 'top-center'
                }
            )
        } catch (error: any) {
            console.error('Error deleting manager:', error)
            toast.push(
                <Notification type="danger" duration={4000}>
                    <div>
                        <p className="font-semibold">خطا در حذف</p>
                        <p className="text-sm">{error?.message || 'خطا در حذف متقاضی'}</p>
                    </div>
                </Notification>,
                {
                    placement: 'top-center'
                }
            )
        }
    }

    // Statistics
    const stats = {
        total: managers?.length || 0,
        active: managers?.filter(m => m.status === 'active').length || 0,
        assessmentDone: managers?.filter(m => m.assessment_status === 'completed').length || 0,
        examDone: managers?.filter(m => m.exam_status === 'completed').length || 0,
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
            case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getAssessmentStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
            case 'not_started': return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'فعال'
            case 'inactive': return 'غیرفعال'
            default: return status
        }
    }

    const getAssessmentStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'انجام شده'
            case 'in_progress': return 'در حال انجام'
            case 'not_started': return 'شروع نشده'
            default: return status
        }
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">خطا در بارگذاری اطلاعات متقاضیان</p>
                <Button variant="solid" className="mt-4" onClick={() => mutate()}>
                    تلاش مجدد
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/admin/companies')}
                    >
                        بازگشت به لیست سازمان‌ها
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <HiOutlineUserGroup className="w-7 h-7" />
                            متقاضیان سازمان {company?.name && `- ${company.name}`}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            مدیریت متقاضیان و نیازسنجی‌ها
                        </p>
                    </div>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => navigate(`/admin/companies/${companyId}/managers/add`)}
                >
                    افزودن متقاضی
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <StatisticCard
                        icon={<HiOutlineUserGroup className="w-6 h-6 text-white" />}
                        label="کل متقاضیان"
                        value={stats.total}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                        loading={isLoading}
                    />
                </Card>
                <Card className="p-4">
                    <StatisticCard
                        icon={<HiOutlineCheckCircle className="w-6 h-6 text-white" />}
                        label="فعال"
                        value={stats.active}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                        loading={isLoading}
                    />
                </Card>
                <Card className="p-4">
                    <StatisticCard
                        icon={<HiOutlineClipboardCheck className="w-6 h-6 text-white" />}
                        label="نیازسنجی شده"
                        value={stats.assessmentDone}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                        loading={isLoading}
                    />
                </Card>
                <Card className="p-4">
                    <StatisticCard
                        icon={<HiOutlineAcademicCap className="w-6 h-6 text-white" />}
                        label="آزمون داده‌اند"
                        value={stats.examDone}
                        color="bg-gradient-to-br from-amber-500 to-amber-600"
                        loading={isLoading}
                    />
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            size="sm"
                            variant={selectedCategory === 'all' ? 'solid' : 'default'}
                            onClick={() => handleCategoryChange('all')}
                        >
                            همه ({stats.total})
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedCategory === 'active' ? 'solid' : 'default'}
                            onClick={() => handleCategoryChange('active')}
                        >
                            فعال ({stats.active})
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedCategory === 'inactive' ? 'solid' : 'default'}
                            onClick={() => handleCategoryChange('inactive')}
                        >
                            غیرفعال ({stats.total - stats.active})
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedCategory === 'assessmentDone' ? 'solid' : 'default'}
                            onClick={() => handleCategoryChange('assessmentDone')}
                        >
                            نیازسنجی شده ({stats.assessmentDone})
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedCategory === 'examDone' ? 'solid' : 'default'}
                            onClick={() => handleCategoryChange('examDone')}
                        >
                            آزمون داده‌اند ({stats.examDone})
                        </Button>
                    </div>
                    <Input
                        className="w-64 bg-white dark:bg-gray-900"
                        placeholder="جستجو..."
                        prefix={<HiOutlineSearch />}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    متقاضی
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    تماس
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    وضعیت
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    نیازسنجی
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    آزمون
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    عملیات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRowSkeleton key={index} />
                                ))
                            ) : filteredManagers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchQuery || selectedCategory !== 'all'
                                                ? 'متقاضی با این فیلتر یافت نشد'
                                                : 'هنوز متقاضی‌ای ثبت نشده است'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredManagers.map((manager) => (
                                    <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar size={32} src={manager.user.avatar || undefined}>
                                                    {manager.user.name.charAt(0)}
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {manager.user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {manager.position} - {manager.department}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {manager.user.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Tag className={getStatusColor(manager.status)}>
                                                {getStatusLabel(manager.status)}
                                            </Tag>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Tag className={getAssessmentStatusColor(manager.assessment_status)}>
                                                {getAssessmentStatusLabel(manager.assessment_status)}
                                            </Tag>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Tag className={getAssessmentStatusColor(manager.exam_status)}>
                                                {getAssessmentStatusLabel(manager.exam_status)}
                                            </Tag>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <Tooltip title="مشاهده">
                                                    <Button
                                                        size="sm"
                                                        variant="plain"
                                                        icon={<HiOutlineEye />}
                                                        onClick={() => navigate(`/admin/companies/${companyId}/managers/${manager.id}`)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="ویرایش">
                                                    <Button
                                                        size="sm"
                                                        variant="plain"
                                                        icon={<HiOutlinePencil />}
                                                        onClick={() => navigate(`/admin/companies/${companyId}/managers/${manager.id}/edit`)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <Button
                                                        size="sm"
                                                        variant="plain"
                                                        icon={<HiOutlineTrash />}
                                                        className="text-red-500 hover:text-red-600"
                                                        onClick={() => {
                                                            setSelectedManager(manager)
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                    />
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="حذف متقاضی"
                confirmText="حذف"
                cancelText="لغو"
                onClose={() => setDeleteDialogOpen(false)}
                onCancel={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteManager}
            >
                <div>
                    <p>آیا از حذف این متقاضی اطمینان دارید؟</p>
                    {selectedManager && (
                        <p className="font-semibold mt-2">{selectedManager.user.name}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">این عمل قابل بازگشت نیست.</p>
                </div>
            </ConfirmDialog>
        </div>
    )
}

export default CompanyManagers
