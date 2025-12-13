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
                return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">فعال</Tag>
            case 'inactive':
                return <Tag className="text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20 border-0">غیرفعال</Tag>
            default:
                return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">نامشخص</Tag>
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
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/admin/companies')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {company.name}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {company.legalName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusTag(company.status)}
                    <Button
                        variant="solid"
                        icon={<HiOutlinePencil />}
                        onClick={() => navigate(`/admin/companies/${company.id}/edit`)}
                    >
                        ویرایش
                    </Button>
                    <Button
                        variant="plain"
                        icon={<HiOutlineTrash />}
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-600 hover:text-red-700"
                    >
                        حذف
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo Section */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineOfficeBuilding className="w-5 h-5" />
                        لوگو سازمان
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Avatar
                                size={120}
                                src={company.logo}
                                className="border-4 border-gray-200 dark:border-gray-700"
                            >
                                <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-400" />
                            </Avatar>
                        </div>
                    </div>
                </Card>

                {/* Company Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineOfficeBuilding className="w-5 h-5" />
                            اطلاعات پایه
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    نام سازمان
                                </label>
                                <p className="text-gray-900 dark:text-white">{company.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    نام حقوقی
                                </label>
                                <p className="text-gray-900 dark:text-white">{company.legalName}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <HiOutlinePhone className="w-4 h-4" />
                                    شماره تماس
                                </label>
                                <p className="text-gray-900 dark:text-white">{company.phone}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <HiOutlineMail className="w-4 h-4" />
                                    ایمیل
                                </label>
                                <p className="text-gray-900 dark:text-white">{company.email}</p>
                            </div>

                            {company.website && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                        <HiOutlineGlobe className="w-4 h-4" />
                                        وب‌سایت
                                    </label>
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:underline"
                                    >
                                        {company.website}
                                    </a>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    حوزه فعالیت
                                </label>
                                <p className="text-gray-900 dark:text-white">{company.fieldOfActivity}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Legal Information */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineDocumentText className="w-5 h-5" />
                            اطلاعات حقوقی
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    شناسه ملی
                                </label>
                                <p className="text-gray-900 dark:text-white font-mono">{company.nationalId}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    کد اقتصادی
                                </label>
                                <p className="text-gray-900 dark:text-white font-mono">{company.economicCode}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Owner Information */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineUser className="w-5 h-5" />
                            ایجادکننده سازمان
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    نام
                                </label>
                                <p className="text-gray-900 dark:text-white">{company.ownerName}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    ایمیل
                                </label>
                                <p className="text-gray-900 dark:text-white">{company.ownerEmail}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    شماره تماس
                                </label>
                                <p className="text-gray-900 dark:text-white">{company.ownerPhone}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Address */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineLocationMarker className="w-5 h-5" />
                            آدرس
                        </h3>

                        <div>
                            <p className="text-gray-900 dark:text-white">{company.address}</p>
                        </div>
                    </Card>

                    {/* Description */}
                    {company.description && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <HiOutlineDocumentText className="w-5 h-5" />
                                توضیحات
                            </h3>

                            <div>
                                <p className="text-gray-900 dark:text-white">{company.description}</p>
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
