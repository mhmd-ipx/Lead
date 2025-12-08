import { useEffect, useState } from 'react'
import { Card, Button, Input, Upload, Avatar } from '@/components/ui'
import { HiOutlineOfficeBuilding, HiOutlineDocumentText, HiOutlinePhotograph, HiOutlineSave, HiOutlineArrowLeft } from 'react-icons/hi'
import { getCompanyProfile, updateCompanyProfile } from '@/services/OwnerService'
import { CompanyProfile } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'

const Company = () => {
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        const data = await getCompanyProfile()
        setCompany(data)
        if (data.logo) {
          setLogoPreview(data.logo)
        }
      } catch (error) {
        console.error('Error loading company profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCompanyProfile()
  }, [])

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
    if (!company) return

    setSaving(true)
    try {
      // In a real implementation, you would upload the logo file first
      // and get the URL, then update the company profile
      const updatedCompany = {
        ...company,
        logo: logoPreview || company.logo
      }

      await updateCompanyProfile(updatedCompany)
      setCompany(updatedCompany)

      // Show success message (you could use a toast notification here)
      alert('پروفایل شرکت با موفقیت ذخیره شد!')
    } catch (error) {
      console.error('Error saving company profile:', error)
      alert('خطا در ذخیره پروفایل شرکت')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
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
            onClick={() => navigate('/owner/dashboard')}
          >
            بازگشت
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            پروفایل شرکت
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
            لوگو شرکت
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
                  نام شرکت
                </label>
                <Input
                  value={company.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="نام شرکت را وارد کنید"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نام حقوقی
                </label>
                <Input
                  value={company.legalName}
                  onChange={(e) => handleInputChange('legalName', e.target.value)}
                  placeholder="نام حقوقی شرکت"
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
                  placeholder="حوزه فعالیت شرکت"
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
                placeholder="آدرس کامل شرکت را وارد کنید"
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
                درباره شرکت
              </label>
              <Input
                textArea
                rows={4}
                value={company.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="توضیحاتی درباره شرکت، مأموریت، ارزش‌ها و غیره"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="plain"
          onClick={() => navigate('/owner/dashboard')}
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
