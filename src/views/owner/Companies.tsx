
import { useEffect, useState } from 'react'
import { Card, Button, Input, Checkbox, Avatar, Tooltip, Skeleton, Tag } from '@/components/ui'
import { HiOutlineOfficeBuilding, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi'
import { getCompanies } from '@/services/OwnerService'
import { CompanyProfile } from '@/mock/data/ownerData'
import { useNavigate, useLocation } from 'react-router-dom'

const Companies = () => {
    const [companies, setCompanies] = useState<CompanyProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [initialLoad, setInitialLoad] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Check if we should reload data (e.g., after adding/editing)
        const shouldReload = location.state?.reload

        if (initialLoad || shouldReload) {
            loadCompanies()
        }
    }, [initialLoad, location.state])

    const loadCompanies = async () => {
        try {
            setLoading(true)
            const data = await getCompanies()
            // Map snake_case API response to camelCase for frontend
            const mappedData = data.map((company: any) => ({
                id: company.id?.toString() || '',
                name: company.name || '',
                legalName: company.legal_name || '',
                phone: company.phone || '',
                email: company.email || '',
                website: company.website || '',
                fieldOfActivity: company.field_of_activity || '',
                nationalId: company.national_id || '',
                economicCode: company.economic_code || '',
                address: company.address || '',
                description: company.description || '',
                logo: company.logo || '',
                manager_name: company.manager_name || '',
                manager_phone: company.manager_phone || '',
                status: company.status || 'active'
            }))
            setCompanies(mappedData)
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

    // Filter companies
    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'active':
                return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">فعال</Tag>
            case 'inactive':
                return <Tag className="text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20 border-0">غیرفعال</Tag>
            default:
                return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">نامشخص</Tag>
        }
    }

    // Skeleton loading component
    const SkeletonRow = () => (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <Skeleton variant="circle" width={40} height={40} />
                    <div className="space-y-2">
                        <Skeleton width={150} height={16} />
                        <Skeleton width={100} height={12} />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-2">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={100} height={12} />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-2">
                    <Skeleton width={140} height={14} />
                    <Skeleton width={110} height={12} />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={100} height={14} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={60} height={24} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circle" width={32} height={32} />
                </div>
            </td>
        </tr>
    )

    // Empty state when no companies exist
    if (!loading && companies.length === 0) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            سازمان های من
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            مدیریت سازمان‌ها و شرکت‌های شما
                        </p>
                    </div>
                </div>

                {/* Empty State Card */}
                <Card>
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
                            <HiOutlineOfficeBuilding className="w-12 h-12 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            هنوز سازمانی ندارید
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                            برای شروع کار با سیستم، ابتدا باید اطلاعات سازمان خود را ثبت کنید.
                        </p>
                        <Button
                            variant="solid"
                            icon={<HiOutlinePlus />}
                            onClick={() => navigate('/owner/companies/add')}
                            size="lg"
                        >
                            ایجاد اولین سازمان
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
                <div id="companies-header">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        سازمان های من
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت سازمان‌ها و شرکت‌های شما
                    </p>
                </div>
                <div id="companies-search-filter" className="flex items-center gap-3">
                    <Input
                        className="w-64"
                        placeholder="جستجو..."
                        prefix={<HiOutlineSearch />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        onClick={() => navigate('/owner/companies/add')}
                    >
                        افزودن سازمان
                    </Button>
                </div>
            </div>

            {/* Companies Table */}
            <Card id="companies-table">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        نام سازمان
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        اطلاعات تماس
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        اطلاعات حقوقی
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        حوزه فعالیت
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        وضعیت
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        عملیات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    // Show skeleton rows while loading
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : filteredCompanies.length > 0 ? (
                                    // Show actual data
                                    filteredCompanies.map((company) => (
                                        <tr key={company.id || 'temp-id'} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        size="sm"
                                                        src={company.logo}
                                                        icon={<HiOutlineOfficeBuilding />}
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {company.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {company.website}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {company.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {company.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        شناسه ملی: {company.nationalId || '-'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        اقتصادی: {company.economicCode || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {company.fieldOfActivity || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusTag(company.status || 'active')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Tooltip title="ویرایش">
                                                        <Button
                                                            variant="plain"
                                                            size="sm"
                                                            icon={<HiOutlinePencil />}
                                                            onClick={() => navigate(`/owner/companies/${company.id || '1'}/edit`)}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Show empty state message
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="text-center py-12">
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {searchQuery
                                                        ? 'سازمانی با این مشخصات یافت نشد'
                                                        : 'هنوز سازمانی ثبت نشده است'}
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
        </div>
    )
}

export default Companies
