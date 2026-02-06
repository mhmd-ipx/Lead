import { useEffect, useState } from 'react'
import { Card, Button, Input, Upload, Avatar, toast, Notification } from '@/components/ui'
import { HiOutlineOfficeBuilding, HiOutlineDocumentText, HiOutlinePhotograph, HiOutlineSave, HiOutlineArrowLeft, HiOutlineUser } from 'react-icons/hi'
import { getCompanyById, updateCompanyProfile, createCompany } from '@/services/OwnerService'
import { CompanyProfile } from '@/mock/data/ownerData'
import { useNavigate, useParams } from 'react-router-dom'

const emptyCompany: CompanyProfile = {
  id: '',
  name: '',
  legalName: '',
  phone: '',
  email: '',
  website: '',
  fieldOfActivity: '',
  nationalId: '',
  economicCode: '',
  address: '',
  description: '',
  logo: '',
  manager_name: '',
  manager_phone: ''
}

const Company = () => {
  const { companyId } = useParams()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const isEditMode = !!companyId

  useEffect(() => {
    const loadCompanyProfile = async () => {
      setLoading(true)
      try {
        if (isEditMode) {
          const data = await getCompanyById(companyId)
          setCompany(data)
          if (data?.logo) {
            setLogoPreview(data.logo)
          }
        } else {
          setCompany({ ...emptyCompany })
        }
      } catch (error) {
        console.error('Error loading company profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCompanyProfile()
  }, [companyId, isEditMode])

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate manager_name is required
    if (!company?.manager_name || !company.manager_name.trim()) {
      newErrors.manager_name = 'نام مدیر الزامی است'
    }

    // Validate manager_phone is required and format
    if (!company?.manager_phone || !company.manager_phone.trim()) {
      newErrors.manager_phone = 'شماره تماس مدیر الزامی است'
    } else {
      const phoneRegex = /^09\d{9}$/
      if (!phoneRegex.test(company.manager_phone.trim())) {
        newErrors.manager_phone = 'فرمت شماره تلفن باید 09XXXXXXXXX باشد'
      }
    }

    // Validate email format if provided
    if (company?.email && company.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(company.email.trim())) {
        newErrors.email = 'فرمت ایمیل معتبر نیست'
      }
    }

    // Validate website format if provided
    if (company?.website && company.website.trim()) {
      try {
        const url = new URL(company.website)
        if (url.protocol !== 'https:') {
          newErrors.website = 'آدرس وب‌سایت باید با https شروع شود'
        }
      } catch {
        newErrors.website = 'آدرس وب‌سایت معتبر نیست'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!company) return

    // Validate form
    if (!validateForm()) {
      toast.push(
        <Notification type="danger" duration={3000}>
          <div>
            <p className="font-semibold">خطا در اعتبارسنجی</p>
            <p className="text-sm">لطفاً فیلدهای قرمز را بررسی کنید</p>
          </div>
        </Notification>,
        {
          placement: 'top-center'
        }
      )
      return
    }

    setSaving(true)
    try {
      // Remove empty fields before sending
      const companyData: any = {}

      // Add ID for edit mode
      if (isEditMode && company.id) {
        companyData.id = company.id
      }

      if (company.name?.trim()) companyData.name = company.name.trim()
      if (company.legalName?.trim()) companyData.legalName = company.legalName.trim()
      if (company.phone?.trim()) companyData.phone = company.phone.trim()
      if (company.email?.trim()) companyData.email = company.email.trim()
      if (company.address?.trim()) companyData.address = company.address.trim()
      if (company.website?.trim()) companyData.website = company.website.trim()
      if (company.description?.trim()) companyData.description = company.description.trim()
      if (company.manager_name?.trim()) companyData.manager_name = company.manager_name.trim()
      if (company.manager_phone?.trim()) companyData.manager_phone = company.manager_phone.trim()
      if (logoPreview || company.logo) companyData.logo = logoPreview || company.logo

      if (isEditMode) {
        await updateCompanyProfile(companyData)
      } else {
        await createCompany(companyData)
      }

      toast.push(
        <Notification type="success" duration={3000}>
          <div>
            <p className="font-semibold">موفقیت‌آمیز</p>
            <p className="text-sm">{isEditMode ? 'اطلاعات سازمان با موفقیت ویرایش شد' : 'سازمان جدید با موفقیت ایجاد شد'}</p>
          </div>
        </Notification>,
        {
          placement: 'top-center'
        }
      )

      // Navigate back with reload flag to refresh the list
      navigate('/owner/companies', { state: { reload: true } })
    } catch (error: any) {
      console.error('Error saving company profile:', error)
      toast.push(
        <Notification type="danger" duration={4000}>
          <div>
            <p className="font-semibold">خطا در ذخیره</p>
            <p className="text-sm">{error?.message || 'خطا در ذخیره اطلاعات سازمان'}</p>
          </div>
        </Notification>,
        {
          placement: 'top-center'
        }
      )
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof CompanyProfile, value: string | number) => {
    if (company) {
      let processedValue = value

      // Auto-add https:// to website if user starts typing
      if (field === 'website' && typeof value === 'string' && value.trim() && !value.startsWith('http')) {
        processedValue = `https://${value}`
      }

      setCompany({
        ...company,
        [field]: processedValue
      })

      // Clear error for this field when user types
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
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
        <p className="text-gray-500 dark:text-gray-400">خطا در بارگذاری اطلاعات شرکت</p>
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
            onClick={() => navigate('/owner/companies')}
          >
            بازگشت
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'ویرایش سازمان' : 'افزودن سازمان جدید'}
          </h1>
        </div>
        <Button
          variant="solid"
          icon={<HiOutlineSave />}
          loading={saving}
          onClick={handleSave}
        >
          {isEditMode ? 'ذخیره تغییرات' : 'ایجاد سازمان'}
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
                انتخاب لوگو
              </Button>
            </Upload>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              فرمت‌های مجاز: JPG, PNG (حداکثر 5MB)
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
                  نام سازمان <span className="text-red-500">*</span>
                </label>
                <Input
                  value={company.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="نام سازمان"
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
                  placeholder="021-..."
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
                  placeholder="name@example.com"
                  invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وب‌سایت
                </label>
                <Input
                  value={company.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="example.com"
                  invalid={!!errors.website}
                />
                {errors.website && (
                  <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Manager Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5" />
              اطلاعات مدیر
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نام مدیر <span className="text-red-500">*</span>
                </label>
                <Input
                  value={company.manager_name || ''}
                  onChange={(e) => handleInputChange('manager_name', e.target.value)}
                  placeholder="نام و نام خانوادگی مدیر"
                  invalid={!!errors.manager_name}
                />
                {errors.manager_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.manager_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  شماره تماس مدیر <span className="text-red-500">*</span>
                </label>
                <Input
                  value={company.manager_phone || ''}
                  onChange={(e) => handleInputChange('manager_phone', e.target.value)}
                  placeholder="09XXXXXXXXX"
                  invalid={!!errors.manager_phone}
                />
                {errors.manager_phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.manager_phone}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Address & Description */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HiOutlineDocumentText className="w-5 h-5" />
              توضیحات و آدرس
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  آدرس
                </label>
                <Input
                  textArea
                  rows={2}
                  value={company.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                  placeholder="آدرس کامل شرکت"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  توضیحات
                </label>
                <Input
                  textArea
                  rows={3}
                  value={company.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="توضیحات تکمیلی"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="plain"
          onClick={() => navigate('/owner/companies')}
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

export default Company
