import { useEffect, useState } from 'react'
import { Card, Button, Input, Upload, Avatar } from '@/components/ui'
import {
    HiOutlineOfficeBuilding,
    HiOutlineDocumentText,
    HiOutlinePhotograph,
    HiOutlineSave,
    HiOutlineArrowLeft,
    HiOutlineUser
} from 'react-icons/hi'
import { getCompanyById, updateCompany } from '@/services/AdminService'
import { Company } from '@/mock/data/adminData'
import { useNavigate, useParams } from 'react-router-dom'

const CompanyEdit = () => {
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>('')
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
            if (data?.logo) {
                setLogoPreview(data.logo)
            }
        } catch (error) {
            console.error('Error loading company:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogoChange = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]
            setLogoFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const beforeUpload = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0]
            if (file.size > 5000000) { // 5MB
                return 'حجم فایل نباید بیشتر از 5 مگابایت باشد'
            }
        }
        return true
    }

    const handleSave = async () => {
        if (!company || !id) return

        setSaving(true)
        try {
            // In a real implementation, you would upload the logo file first
            // and get the URL, then update the company
            const updatedCompany = {
                ...company,
                logo: logoPreview || company.logo
            }

            await updateCompany(id, updatedCompany)
            setCompany(updatedCompany)

            // Show success message (you could use a toast notification here)
            alert('اطلاعات سازمان با موفقیت ذخیره شد!')
            navigate(`/admin/companies/${id}`)
        } catch (error) {
            console.error('Error saving company:', error)
            alert('خطا در ذخیره اطلاعات سازمان')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: keyof Company, value: string) => {
        if (company) {
            setCompany({
                ...company,
                [field]: value
            })
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
                <p className="text-gray-500 dark:text-gray-400">خطا در بارگذاری اطلاعات سازمان</p>
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
                        onClick={() => navigate(`/admin/companies/${id}`)}
                    >
                        بازگشت
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        ویرایش سازمان
                    </h1>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlineSave />}
                    loading={saving}
                    onClick={handleSave}
                >
                    ذخیره تغییرات
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo Section */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlinePhotograph className="w-5 h-5" />
                        لوگو سازمان
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Avatar
                                size={120}
                                src={logoPreview}
                                className="border-4 border-gray-200 dark:border-gray-700"
                            >
                                <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-400" />
                            </Avatar>
                        </div>

                        <Upload
                            accept="image/*"
                            beforeUpload={beforeUpload}
                            showList={false}
                            onChange={handleLogoChange}
                            className="w-full"
                        >
                            <Button variant="default" className="w-full">
                                انتخاب لوگو جدید
                            </Button>
                        </Upload>

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            فرمت‌های مجاز: JPG, PNG, GIF (حداکثر 5MB)
                        </p>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    نام سازمان
                                </label>
                                <Input
                                    value={company.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="نام سازمان را وارد کنید"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    نام حقوقی
                                </label>
                                <Input
                                    value={company.legalName}
                                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                                    placeholder="نام حقوقی سازمان"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    شماره تماس
                                </label>
                                <Input
                                    value={company.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="021-12345678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    ایمیل
                                </label>
                                <Input
                                    type="email"
                                    value={company.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="info@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    وب‌سایت
                                </label>
                                <Input
                                    value={company.website || ''}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    placeholder="https://www.company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    حوزه فعالیت
                                </label>
                                <Input
                                    value={company.fieldOfActivity}
                                    onChange={(e) => handleInputChange('fieldOfActivity', e.target.value)}
                                    placeholder="حوزه فعالیت سازمان"
                                />
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    شناسه ملی
                                </label>
                                <Input
                                    value={company.nationalId}
                                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                                    placeholder="شناسه ملی 10 رقمی"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    کد اقتصادی
                                </label>
                                <Input
                                    value={company.economicCode}
                                    onChange={(e) => handleInputChange('economicCode', e.target.value)}
                                    placeholder="کد اقتصادی 12 رقمی"
                                />
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    نام
                                </label>
                                <Input
                                    value={company.ownerName}
                                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                                    placeholder="نام ایجادکننده"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    ایمیل
                                </label>
                                <Input
                                    type="email"
                                    value={company.ownerEmail}
                                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    شماره تماس
                                </label>
                                <Input
                                    value={company.ownerPhone}
                                    onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                                    placeholder="09123456789"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Address */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineOfficeBuilding className="w-5 h-5" />
                            آدرس
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                آدرس کامل
                            </label>
                            <Input
                                textArea
                                rows={3}
                                value={company.address}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                                placeholder="آدرس کامل سازمان را وارد کنید"
                            />
                        </div>
                    </Card>

                    {/* Description */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineDocumentText className="w-5 h-5" />
                            توضیحات
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                درباره سازمان
                            </label>
                            <Input
                                textArea
                                rows={4}
                                value={company.description || ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                placeholder="توضیحاتی درباره سازمان، مأموریت، ارزش‌ها و غیره"
                            />
                        </div>
                    </Card>

                    {/* Status */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            وضعیت
                        </h3>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={company.status === 'active'}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">فعال</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="inactive"
                                    checked={company.status === 'inactive'}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">غیرفعال</span>
                            </label>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button
                    variant="plain"
                    onClick={() => navigate(`/admin/companies/${id}`)}
                >
                    انصراف
                </Button>
                <Button
                    variant="solid"
                    icon={<HiOutlineSave />}
                    loading={saving}
                    onClick={handleSave}
                >
                    ذخیره تغییرات
                </Button>
            </div>
        </div>
    )
}

export default CompanyEdit
