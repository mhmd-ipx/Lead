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
const StatisticCard = ({ icon, label, value, color, loading, id, isActive, onClick }: {
    icon: React.ReactNode
    label: string
    value: number
    color: string
    loading?: boolean
    id?: string
    isActive?: boolean
    onClick?: () => void
}) => {
    const iconClass = classNames(
        'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
        color
    )

    return (
        <button 
            id={id} 
            onClick={onClick} 
            className={classNames(
                "w-full text-right transition-all p-4 rounded-xl border-2 flex items-center gap-4",
                isActive 
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" 
                    : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
            )}
        >
            <div className={iconClass}>
                {icon}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
                {loading ? (
                    <Skeleton width={60} height={32} className="mt-1" />
                ) : (
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</h3>
                )}
            </div>
        </button>
    )
}

// Skeleton for table rows
const TableRowSkeleton = () => (
    <tr>
        <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex items-center gap-3">
                <Skeleton variant="circle" width={32} height={32} />
                <div className="space-y-2">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={80} height={12} />
                </div>
            </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
            <Skeleton width={90} height={14} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
            <Skeleton width={70} height={20} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
            <Skeleton width={80} height={20} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
            <Skeleton width={80} height={20} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex gap-2">
                <Skeleton variant="circle" width={28} height={28} />
                <Skeleton variant="circle" width={28} height={28} />
                <Skeleton variant="circle" width={28} height={28} />
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/admin/companies')}
                        className="self-start sm:self-auto"
                    >
                        بازگشت
                    </Button>
                    <div id="admin-company-managers-header">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <HiOutlineUserGroup className="w-6 h-6 sm:w-7 sm:h-7" />
                            متقاضیان {company?.name ? `- ${company.name}` : ''}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            مدیریت متقاضیان و نیازسنجی‌ها
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <Input
                        id="admin-company-managers-search"
                        className="w-full sm:w-64 bg-white dark:bg-gray-900 text-sm shadow-sm order-2 sm:order-1"
                        placeholder="جستجو متقاضی..."
                        prefix={<HiOutlineSearch />}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Button
                        id="admin-company-managers-add-button"
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        className="w-full sm:w-auto text-sm shrink-0 order-1 sm:order-2"
                        onClick={() => navigate(`/admin/companies/${companyId}/managers/add`)}
                    >
                        افزودن متقاضی
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div id="admin-company-managers-stats" className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 scrollbar-hide">
                <div className="w-[70vw] sm:w-auto shrink-0 snap-start">
                    <StatisticCard
                        id="admin-company-managers-stats-total"
                        icon={<HiOutlineUserGroup className="w-6 h-6 text-white" />}
                        label="کل متقاضیان"
                        value={stats.total}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                        loading={isLoading}
                        isActive={selectedCategory === 'all'}
                        onClick={() => handleCategoryChange('all')}
                    />
                </div>
                <div className="w-[70vw] sm:w-auto shrink-0 snap-start">
                    <StatisticCard
                        id="admin-company-managers-stats-active"
                        icon={<HiOutlineCheckCircle className="w-6 h-6 text-white" />}
                        label="فعال"
                        value={stats.active}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                        loading={isLoading}
                        isActive={selectedCategory === 'active'}
                        onClick={() => handleCategoryChange('active')}
                    />
                </div>
                <div className="w-[70vw] sm:w-auto shrink-0 snap-start">
                    <StatisticCard
                        id="admin-company-managers-stats-assessment"
                        icon={<HiOutlineClipboardCheck className="w-6 h-6 text-white" />}
                        label="نیازسنجی شده"
                        value={stats.assessmentDone}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                        loading={isLoading}
                        isActive={selectedCategory === 'assessmentDone'}
                        onClick={() => handleCategoryChange('assessmentDone')}
                    />
                </div>
                <div className="w-[70vw] sm:w-auto shrink-0 snap-start">
                    <StatisticCard
                        id="admin-company-managers-stats-exam"
                        icon={<HiOutlineAcademicCap className="w-6 h-6 text-white" />}
                        label="آزمون داده‌اند"
                        value={stats.examDone}
                        color="bg-gradient-to-br from-amber-500 to-amber-600"
                        loading={isLoading}
                        isActive={selectedCategory === 'examDone'}
                        onClick={() => handleCategoryChange('examDone')}
                    />
                </div>
            </div>



            {/* Table & Mobile List */}
            <Card id="admin-company-managers-table" className="p-1 sm:p-0">
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    متقاضی
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    تماس
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    وضعیت
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    نیازسنجی
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    آزمون
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {searchQuery || selectedCategory !== 'all'
                                                ? 'متقاضی با این فیلتر یافت نشد'
                                                : 'هنوز متقاضی‌ای ثبت نشده است'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredManagers.map((manager) => (
                                    <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar size={32} src={manager.user.avatar || undefined}>
                                                    {manager.user.name.charAt(0)}
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {manager.user.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {manager.position} - {manager.department}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {manager.user.phone}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Tag className={`${getStatusColor(manager.status)} text-xs border-0`}>
                                                {getStatusLabel(manager.status)}
                                            </Tag>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Tag className={`${getAssessmentStatusColor(manager.assessment_status)} text-xs border-0`}>
                                                {getAssessmentStatusLabel(manager.assessment_status)}
                                            </Tag>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Tag className={`${getAssessmentStatusColor(manager.exam_status)} text-xs border-0`}>
                                                {getAssessmentStatusLabel(manager.exam_status)}
                                            </Tag>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                <Tooltip title="مشاهده">
                                                    <Button size="sm" variant="plain" icon={<HiOutlineEye />} onClick={() => navigate(`/admin/companies/${companyId}/managers/${manager.id}`)} />
                                                </Tooltip>
                                                <Tooltip title="ویرایش">
                                                    <Button size="sm" variant="plain" icon={<HiOutlinePencil />} onClick={() => navigate(`/admin/companies/${companyId}/managers/${manager.id}/edit`)} />
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <Button size="sm" variant="plain" icon={<HiOutlineTrash />} className="text-red-500 hover:text-red-600" onClick={() => { setSelectedManager(manager); setDeleteDialogOpen(true) }} />
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile List */}
                <div className="sm:hidden flex flex-col divide-y divide-gray-200 dark:divide-gray-700 px-3">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="py-4 space-y-3">
                                <div className="flex gap-3 items-center">
                                    <Skeleton variant="circle" width={36} height={36} />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton width="60%" height={16} />
                                        <Skeleton width="40%" height={12} />
                                    </div>
                                </div>
                                <Skeleton width="100%" height={70} />
                            </div>
                        ))
                    ) : filteredManagers.length === 0 ? (
                        <div className="text-center py-8">
                            <HiOutlineUserGroup className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                                {searchQuery || selectedCategory !== 'all' ? 'متقاضی با این فیلتر یافت نشد' : 'هنوز متقاضی‌ای ثبت نشده است'}
                            </p>
                        </div>
                    ) : (
                        filteredManagers.map((manager) => (
                            <div key={manager.id} className="py-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar size={36} src={manager.user.avatar || undefined}>
                                            {manager.user.name.charAt(0)}
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{manager.user.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{manager.position} - {manager.department}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4 text-xs bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                                    <div>
                                        <span className="text-gray-400 block mb-1">شماره تماس:</span>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{manager.user.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block mb-1">وضعیت حساب:</span>
                                        <Tag className={`${getStatusColor(manager.status)} text-[10px] px-1.5 py-0 border-0 mt-0.5`}>
                                            {getStatusLabel(manager.status)}
                                        </Tag>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block mb-1">نیازسنجی:</span>
                                        <Tag className={`${getAssessmentStatusColor(manager.assessment_status)} text-[10px] px-1.5 py-0 border-0 mt-0.5`}>
                                            {getAssessmentStatusLabel(manager.assessment_status)}
                                        </Tag>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block mb-1">آزمون:</span>
                                        <Tag className={`${getAssessmentStatusColor(manager.exam_status)} text-[10px] px-1.5 py-0 border-0 mt-0.5`}>
                                            {getAssessmentStatusLabel(manager.exam_status)}
                                        </Tag>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500 font-medium px-1">عملیات:</span>
                                    <div className="flex items-center gap-1">
                                        <Button variant="plain" size="xs" icon={<HiOutlineEye className="text-base" />} onClick={() => navigate(`/admin/companies/${companyId}/managers/${manager.id}`)} className="p-1" />
                                        <Button variant="plain" size="xs" icon={<HiOutlinePencil className="text-base" />} onClick={() => navigate(`/admin/companies/${companyId}/managers/${manager.id}/edit`)} className="p-1" />
                                        <Button variant="plain" size="xs" icon={<HiOutlineTrash className="text-base" />} className="text-red-500 hover:text-red-600 p-1" onClick={() => { setSelectedManager(manager); setDeleteDialogOpen(true) }} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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
