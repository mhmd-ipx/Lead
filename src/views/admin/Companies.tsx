import { useEffect, useState } from 'react'
import { Card, Button, Tag, Tooltip, Input } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineSearch,
    HiOutlineOfficeBuilding,
} from 'react-icons/hi'
import { getCompanies, deleteCompany } from '@/services/AdminService'
import { Company } from '@/mock/data/adminData'
import { useNavigate } from 'react-router-dom'

const Companies = () => {
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadCompanies()
    }, [])

    const loadCompanies = async () => {
        try {
            const data = await getCompanies()
            setCompanies(data)
        } catch (error) {
            console.error('Error loading companies:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCompany = async () => {
        if (!selectedCompany) return

        try {
            await deleteCompany(selectedCompany.id)
            setCompanies(companies.filter(c => c.id !== selectedCompany.id))
            setDeleteDialogOpen(false)
            setSelectedCompany(null)
        } catch (error) {
            console.error('Error deleting company:', error)
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
        company.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        سازمان‌ها
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت سازمان‌ها و شرکت‌ها
                    </p>
                </div>
                <div className="flex items-center gap-3">
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
                        onClick={() => navigate('/admin/companies/add')}
                    >
                        افزودن سازمان
                    </Button>
                </div>
            </div>

            {/* Companies Table */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineOfficeBuilding className="w-5 h-5" />
                        لیست سازمان‌ها
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                            ({filteredCompanies.length} مورد)
                        </span>
                    </h2>
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
                                        شناسه ملی
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        حوزه فعالیت
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        ایجادکننده
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
                                {filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {company.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {company.legalName}
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
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {company.nationalId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Tag className="text-blue-600 bg-blue-100 dark:text-blue-100 dark:bg-blue-500/20 border-0">
                                                {company.fieldOfActivity}
                                            </Tag>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {company.ownerName}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {company.ownerEmail}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusTag(company.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Tooltip title="مشاهده جزئیات">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineEye />}
                                                        onClick={() => navigate(`/admin/companies/${company.id}`)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="ویرایش">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlinePencil />}
                                                        onClick={() => navigate(`/admin/companies/${company.id}/edit`)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineTrash />}
                                                        onClick={() => {
                                                            setSelectedCompany(company)
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    />
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCompanies.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="text-center py-12">
                                                <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {searchQuery
                                                        ? 'سازمانی با این فیلتر یافت نشد'
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
