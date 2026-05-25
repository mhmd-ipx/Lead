import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Tag } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiOutlineOfficeBuilding,
    HiOutlineDocumentText,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineArrowLeft,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineGlobe,
    HiOutlineLocationMarker,
    HiOutlineUser,
} from 'react-icons/hi'
import { getCompanyById, deleteCompany } from '@/services/AdminService'
import { Company } from '@/mock/data/adminData'
import { useNavigate, useParams } from 'react-router-dom'

const CompanyDetails = () => {
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    useEffect(() => {
        if (id) {
            loadCompany(id)
        }
    }, [id])

    const loadCompany = async (companyId: string) => {
        try {
            const data = await getCompanyById(companyId)
            setCompany(data)
        } catch (error) {
            console.error('Error loading company:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCompany = async () => {
        if (!company) return

        try {
            await deleteCompany(company.id)
            setDeleteDialogOpen(false)
            navigate('/admin/companies')
        } catch (error) {
            console.error('Error deleting company:', error)
        }
    }

    const getStatusTag = (status: Company['status']) => {
        switch (status) {
            case 'active':
                return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0 px-2 py-0.5 text-xs sm:text-sm">فعال</Tag>
            case 'inactive':
                return <Tag className="text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20 border-0 px-2 py-0.5 text-xs sm:text-sm">غیرفعال</Tag>
            default:
                return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0 px-2 py-0.5 text-xs sm:text-sm">نامشخص</Tag>
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="text-center py-12">
                <HiOutlineOfficeBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">سازمان یافت نشد</p>
                <Button
                    variant="solid"
                    className="mt-4"
                    onClick={() => navigate('/admin/companies')}
                >
                    بازگشت به لیست سازمان‌ها
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/admin/companies')}
                        className="self-start sm:self-auto"
                    >
                        بازگشت
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {company.name}
                            </h1>
                            {getStatusTag(company.status)}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {company.legalName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant="solid"
                        icon={<HiOutlinePencil />}
                        onClick={() => navigate(`/admin/companies/${company.id}/edit`)}
                        className="flex-1 md:flex-none text-sm sm:text-base"
                    >
                        ویرایش
                    </Button>
                    <Button
                        variant="plain"
                        icon={<HiOutlineTrash />}
                        onClick={() => setDeleteDialogOpen(true)}
                        className="flex-1 md:flex-none text-sm sm:text-base text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 md:bg-transparent md:hover:bg-transparent"
                    >
                        حذف
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Logo Section */}
                <Card className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineOfficeBuilding className="w-5 h-5" />
                        لوگو سازمان
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Avatar
                                size={120}
                                src={company.logo}
                                className="border-4 border-gray-100 dark:border-gray-800 shadow-sm w-24 h-24 sm:w-32 sm:h-32"
                            >
                                <HiOutlineOfficeBuilding className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                            </Avatar>
                        </div>
                    </div>
                </Card>

                {/* Company Information */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Basic Information */}
                    <Card className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineOfficeBuilding className="w-5 h-5" />
                            اطلاعات پایه
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    نام سازمان
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium sm:font-normal">{company.name}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    نام حقوقی
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium sm:font-normal">{company.legalName}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <HiOutlinePhone className="w-4 h-4" />
                                    شماره تماس
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium sm:font-normal">{company.phone}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <HiOutlineMail className="w-4 h-4" />
                                    ایمیل
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium sm:font-normal break-all">{company.email}</p>
                            </div>

                            {company.website && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                        <HiOutlineGlobe className="w-4 h-4" />
                                        وب‌سایت
                                    </label>
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm sm:text-base text-primary-600 hover:underline font-medium sm:font-normal break-all"
                                    >
                                        {company.website}
                                    </a>
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    حوزه فعالیت
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium sm:font-normal">{company.fieldOfActivity}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Legal Information */}
                    <Card className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineDocumentText className="w-5 h-5" />
                            اطلاعات حقوقی
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    شناسه ملی
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-mono font-medium sm:font-normal">{company.nationalId}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    کد اقتصادی
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-mono font-medium sm:font-normal">{company.economicCode}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Owner Information */}
                    <Card className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineUser className="w-5 h-5" />
                            ایجادکننده سازمان
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    نام
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium sm:font-normal">{company.ownerName}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    ایمیل
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium sm:font-normal break-all">{company.ownerEmail}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    شماره تماس
                                </label>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium sm:font-normal">{company.ownerPhone}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Address */}
                    <Card className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineLocationMarker className="w-5 h-5" />
                            آدرس
                        </h3>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                            <p className="text-sm sm:text-base text-gray-900 dark:text-white leading-relaxed">{company.address}</p>
                        </div>
                    </Card>

                    {/* Description */}
                    {company.description && (
                        <Card className="p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <HiOutlineDocumentText className="w-5 h-5" />
                                توضیحات
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white leading-relaxed">{company.description}</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="حذف سازمان"
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                onClose={() => setDeleteDialogOpen(false)}
                onRequestClose={() => setDeleteDialogOpen(false)}
                onCancel={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteCompany}
            >
                <p>آیا مطمئن هستید که می‌خواهید سازمان "{company.name}" را حذف کنید؟</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    این عملیات قابل برگشت نیست و تمام اطلاعات مربوط به این سازمان حذف خواهند شد.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default CompanyDetails
