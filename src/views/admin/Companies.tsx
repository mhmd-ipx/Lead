import { useEffect, useState } from 'react'
import { Card, Button, Tag, Tooltip, Input, Skeleton, toast, Notification } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineSearch,
    HiOutlineOfficeBuilding,
    HiOutlineUserGroup,
} from 'react-icons/hi'
import { getCompanies, deleteCompany } from '@/services/AdminService'
import { Company } from '@/mock/data/adminData'
import { useNavigate, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'

const Companies = () => {
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [initialLoad, setInitialLoad] = useState(true)
    const [searchQuery, setSearchQuery] = useState(
        Cookies.get('companies_search') || ''
    )
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Check if we should reload data (e.g., after adding/editing)
        const shouldReload = location.state?.reload

        if (initialLoad || shouldReload) {
            loadCompanies()
        }
    }, [initialLoad, location.state])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        Cookies.set('companies_search', value)
    }

    const loadCompanies = async () => {
        try {
            setLoading(true)
            const data = await getCompanies()
            setCompanies(data)
            setInitialLoad(false)

            // Clear reload state
            if (location.state?.reload) {
                navigate(location.pathname, { replace: true, state: {} })
            }
        } catch (error) {
            console.error('Error loading companies:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCompany = async () => {
        if (!selectedCompany) return

        try {
            await deleteCompany(selectedCompany.id.toString())
            setCompanies(companies.filter(c => c.id !== selectedCompany.id))
            setDeleteDialogOpen(false)
            setSelectedCompany(null)

            toast.push(
                <Notification type="success" duration={3000}>
                    <div>
                        <p className="font-semibold">حذف موفق</p>
                        <p className="text-sm">سازمان با موفقیت حذف شد</p>
                    </div>
                </Notification>,
                {
                    placement: 'top-center'
                }
            )
        } catch (error: any) {
            console.error('Error deleting company:', error)
            toast.push(
                <Notification type="danger" duration={4000}>
                    <div>
                        <p className="font-semibold">خطا در حذف</p>
                        <p className="text-sm">{error?.message || 'خطا در حذف سازمان'}</p>
                    </div>
                </Notification>,
                {
                    placement: 'top-center'
                }
            )
        }
    }

    const getStatusTag = (status: Company['status']) => {
        switch (status) {
            case 'active':
                return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">فعال</Tag>
            case 'inactive':
                return <Tag className="text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20 border-0">غیرفعال</Tag>
            default:
                return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">نامشخص</Tag>
        }
    }

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Skeleton loading component
    const SkeletonRow = () => (
        <tr>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="space-y-2">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={90} height={12} />
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="space-y-2">
                    <Skeleton width={110} height={14} />
                    <Skeleton width={80} height={12} />
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <Skeleton width={60} height={20} />
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="space-y-2">
                    <Skeleton width={100} height={14} />
                    <Skeleton width={80} height={12} />
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <Skeleton width={50} height={20} />
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1">
                    <Skeleton variant="circle" width={28} height={28} />
                    <Skeleton variant="circle" width={28} height={28} />
                    <Skeleton variant="circle" width={28} height={28} />
                    <Skeleton variant="circle" width={28} height={28} />
                </div>
            </td>
        </tr>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div id="admin-companies-header">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        سازمان‌ها
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت سازمان‌ها و شرکت‌ها
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <Input
                        id="admin-companies-search"
                        className="w-full sm:w-64 text-sm"
                        placeholder="جستجو..."
                        prefix={<HiOutlineSearch />}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Button
                        id="admin-companies-add-button"
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        className="w-full sm:w-auto text-sm"
                        onClick={() => navigate('/admin/companies/add')}
                    >
                        افزودن سازمان
                    </Button>
                </div>
            </div>

            {/* Companies Table */}
            <Card id="admin-companies-table">
                <div className="p-3 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineOfficeBuilding className="w-5 h-5" />
                        لیست سازمان‌ها
                        <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                            ({filteredCompanies.length} مورد)
                        </span>
                    </h2>

                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden sm:block">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        نام سازمان
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        اطلاعات تماس
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        تعداد متقاضیان
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        ایجادکننده
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        وضعیت
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        عملیات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : filteredCompanies.length > 0 ? (
                                    filteredCompanies.map((company) => (
                                        <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {company.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {company.legalName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {company.email}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {company.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Tag className="text-purple-600 bg-purple-100 dark:text-purple-100 dark:bg-purple-500/20 border-0 text-xs">
                                                    <HiOutlineUserGroup className="inline-block ml-1" />
                                                    {company.managers_count || 0}
                                                </Tag>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {company.ownerName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {company.ownerPhone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {getStatusTag(company.status)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Tooltip title="متقاضیان">
                                                        <Button variant="plain" size="sm" icon={<HiOutlineUserGroup />} onClick={() => navigate(`/admin/companies/${company.id}/managers`)} />
                                                    </Tooltip>
                                                    <Tooltip title="مشاهده جزئیات">
                                                        <Button variant="plain" size="sm" icon={<HiOutlineEye />} onClick={() => navigate(`/admin/companies/${company.id}`)} />
                                                    </Tooltip>
                                                    <Tooltip title="ویرایش">
                                                        <Button variant="plain" size="sm" icon={<HiOutlinePencil />} onClick={() => navigate(`/admin/companies/${company.id}/edit`)} />
                                                    </Tooltip>
                                                    <Tooltip title="حذف">
                                                        <Button variant="plain" size="sm" icon={<HiOutlineTrash />} onClick={() => { setSelectedCompany(company); setDeleteDialogOpen(true) }} className="text-red-600 hover:text-red-700" />
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="text-center py-12">
                                                <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                    {searchQuery ? 'سازمانی با این فیلتر یافت نشد' : 'هنوز سازمانی ثبت نشده است'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards / List */}
                    <div className="sm:hidden flex flex-col divide-y divide-gray-200 dark:divide-gray-700 mt-2 border-t border-gray-200 dark:border-gray-700">
                        {loading ? (
                            <>
                                <div className="py-4 space-y-3">
                                    <Skeleton width="60%" height={20} />
                                    <Skeleton width="40%" height={16} />
                                    <Skeleton width="80%" height={40} />
                                </div>
                                <div className="py-4 space-y-3">
                                    <Skeleton width="60%" height={20} />
                                    <Skeleton width="40%" height={16} />
                                    <Skeleton width="80%" height={40} />
                                </div>
                            </>
                        ) : filteredCompanies.length > 0 ? (
                            filteredCompanies.map((company) => (
                                <div key={company.id} className="py-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{company.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{company.legalName}</div>
                                        </div>
                                        <div>
                                            {getStatusTag(company.status)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4 text-xs bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <span className="text-gray-400 block mb-1">تلفن:</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{company.phone}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block mb-1">ایمیل:</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium break-all">{company.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block mb-1">ایجادکننده:</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{company.ownerName}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block mb-1">متقاضیان:</span>
                                            <Tag className="text-purple-600 bg-purple-100 dark:text-purple-100 dark:bg-purple-500/20 border-0 text-[10px] px-1.5 py-0">
                                                {company.managers_count || 0}
                                            </Tag>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-500 font-medium">عملیات:</span>
                                        <div className="flex items-center gap-1">
                                            <Button variant="plain" size="xs" icon={<HiOutlineUserGroup className="text-base" />} onClick={() => navigate(`/admin/companies/${company.id}/managers`)} className="p-1" />
                                            <Button variant="plain" size="xs" icon={<HiOutlineEye className="text-base" />} onClick={() => navigate(`/admin/companies/${company.id}`)} className="p-1" />
                                            <Button variant="plain" size="xs" icon={<HiOutlinePencil className="text-base" />} onClick={() => navigate(`/admin/companies/${company.id}/edit`)} className="p-1" />
                                            <Button variant="plain" size="xs" icon={<HiOutlineTrash className="text-base" />} onClick={() => { setSelectedCompany(company); setDeleteDialogOpen(true) }} className="text-red-600 hover:text-red-700 p-1" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <HiOutlineOfficeBuilding className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    {searchQuery ? 'سازمانی با این فیلتر یافت نشد' : 'هنوز سازمانی ثبت نشده است'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="حذف سازمان"
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                onClose={() => {
                    setDeleteDialogOpen(false)
                    setSelectedCompany(null)
                }}
                onRequestClose={() => {
                    setDeleteDialogOpen(false)
                    setSelectedCompany(null)
                }}
                onCancel={() => {
                    setDeleteDialogOpen(false)
                    setSelectedCompany(null)
                }}
                onConfirm={handleDeleteCompany}
            >
                <p>آیا مطمئن هستید که می‌خواهید سازمان "{selectedCompany?.name}" را حذف کنید?</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    این عملیات قابل برگشت نیست و تمام اطلاعات مربوط به این سازمان حذف خواهند شد.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default Companies
