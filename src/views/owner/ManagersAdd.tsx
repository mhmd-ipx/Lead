import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, Button, Input, Select, Skeleton } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi'
import { createManager, updateManager, getManagerByIdFromAPI, getMyManagers } from '@/services/OwnerService'
import { useNavigate, useParams } from 'react-router-dom'
import { CreateManagerRequest, UpdateManagerRequest } from '@/mock/data/ownerData'
import { toast, Notification } from '@/components/ui'

const ManagersAdd = () => {
  const { managerId } = useParams<{ managerId: string }>()
  const isEditMode = !!managerId
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEditMode)
  const [formData, setFormData] = useState<CreateManagerRequest | UpdateManagerRequest>({
    company_id: 0,
    name: '',
    phone: '',
    position: '',
    department: ''
  })
  const navigate = useNavigate()

  // Fetch companies using SWR
  const { data: companiesWithManagers, isLoading: companiesLoading } = useSWR(
    '/managers/my-managers',
    getMyManagers,
    {
      revalidateOnFocus: false,
    }
  )

  // Load manager data if in edit mode
  useEffect(() => {
    if (isEditMode && managerId) {
      loadManagerData(parseInt(managerId))
    }
  }, [isEditMode, managerId])

  const loadManagerData = async (id: number) => {
    setLoading(true)
    try {
      const manager = await getManagerByIdFromAPI(id)
      setFormData({
        company_id: manager.company_id,
        name: manager.user.name,
        phone: manager.user.phone,
        position: manager.position,
        department: manager.department
      })
    } catch (error: any) {
      console.error('Error loading manager:', error)
      toast.push(
        <Notification type="danger" title="خطا">
          {error?.response?.data?.message || 'خطا در بارگذاری اطلاعات متقاضی.'}
        </Notification>,
        { placement: 'top-center' }
      )
      navigate('/owner/managers')
    } finally {
      setLoading(false)
    }
  }

  // Get active companies only
  const activeCompanies = companiesWithManagers?.filter(c => c.status === 'active') || []

  const handleInputChange = (field: keyof (CreateManagerRequest | UpdateManagerRequest), value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.company_id || !formData.name || !formData.phone || !formData.position || !formData.department) {
      toast.push(
        <Notification type="warning" title="خطا در اعتبارسنجی">
          لطفاً تمام فیلدهای ضروری را پر کنید.
        </Notification>,
        { placement: 'top-center' }
      )
      return
    }

    // Phone validation
    const phoneRegex = /^09\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.push(
        <Notification type="warning" title="خطا در اعتبارسنجی">
          شماره تلفن باید با 09 شروع شود و 11 رقم باشد.
        </Notification>,
        { placement: 'top-center' }
      )
      return
    }

    setSaving(true)
    try {
      if (isEditMode && managerId) {
        const response = await updateManager(parseInt(managerId), formData as UpdateManagerRequest)
        toast.push(
          <Notification type="success" title="موفقیت">
            {response.message || 'اطلاعات متقاضی با موفقیت بروزرسانی شد.'}
          </Notification>,
          { placement: 'top-center' }
        )
      } else {
        const response = await createManager(formData as CreateManagerRequest)
        toast.push(
          <Notification type="success" title="موفقیت">
            {response.message || 'متقاضی با موفقیت اضافه شد.'}
          </Notification>,
          { placement: 'top-center' }
        )
      }

      // Navigate back and trigger revalidation
      navigate('/owner/managers', { state: { reload: true } })
    } catch (error: any) {
      console.error('Error saving manager:', error)
      toast.push(
        <Notification type="danger" title="خطا">
          {error?.response?.data?.message || 'خطا در ذخیره اطلاعات متقاضی.'}
        </Notification>,
        { placement: 'top-center' }
      )
    } finally {
      setSaving(false)
    }
  }

  const departmentOptions = [
    { value: 'فروش', label: 'فروش' },
    { value: 'بازاریابی', label: 'بازاریابی' },
    { value: 'منابع انسانی', label: 'منابع انسانی' },
    { value: 'مالی', label: 'مالی' },
    { value: 'عملیات', label: 'عملیات' },
    { value: 'فنی', label: 'فنی' },
    { value: 'پشتیبانی', label: 'پشتیبانی' },
    { value: 'تحقیق و توسعه', label: 'تحقیق و توسعه' }
  ]

  // Skeleton Loading State
  if (loading || companiesLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton width={180} height={40} />
          <Skeleton width={200} height={32} />
        </div>

        {/* Form Skeleton */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Field */}
              <div className="md:col-span-2">
                <Skeleton width={100} height={20} className="mb-2" />
                <Skeleton width="100%" height={40} />
                <Skeleton width={200} height={14} className="mt-1" />
              </div>

              {/* Name Field */}
              <div>
                <Skeleton width={150} height={20} className="mb-2" />
                <Skeleton width="100%" height={40} />
              </div>

              {/* Phone Field */}
              <div>
                <Skeleton width={100} height={20} className="mb-2" />
                <Skeleton width="100%" height={40} />
                <Skeleton width={250} height={14} className="mt-1" />
              </div>

              {/* Position Field */}
              <div>
                <Skeleton width={120} height={20} className="mb-2" />
                <Skeleton width="100%" height={40} />
              </div>

              {/* Department Field */}
              <div>
                <Skeleton width={80} height={20} className="mb-2" />
                <Skeleton width="100%" height={40} />
              </div>
            </div>

            {/* Info Box Skeleton (only in add mode) */}
            {!isEditMode && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <Skeleton width={120} height={20} className="mb-2" />
                <div className="space-y-2">
                  <Skeleton width="90%" height={16} />
                  <Skeleton width="85%" height={16} />
                  <Skeleton width="80%" height={16} />
                </div>
              </div>
            )}

            {/* Actions Skeleton */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Skeleton width={80} height={40} />
              <Skeleton width={180} height={40} />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="plain"
          icon={<HiOutlineArrowLeft />}
          onClick={() => navigate('/owner/managers')}
        >
          بازگشت به لیست متقاضیان
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'ویرایش متقاضی' : 'افزودن متقاضی جدید'}
        </h1>
      </div>

      {/* Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                سازمان *
              </label>
              <Select
                value={
                  formData.company_id
                    ? activeCompanies.find(c => c.id === formData.company_id)
                      ? { value: formData.company_id, label: activeCompanies.find(c => c.id === formData.company_id)!.name }
                      : null
                    : null
                }
                onChange={(option: any) => handleInputChange('company_id', option?.value || 0)}
                options={activeCompanies.map(company => ({
                  value: company.id,
                  label: company.name
                }))}
                placeholder="سازمان مربوطه را انتخاب کنید"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                فقط سازمان‌های فعال نمایش داده می‌شوند
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نام و نام خانوادگی *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="نام و نام خانوادگی متقاضی را وارد کنید"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                شماره تلفن *
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="09123456789"
                maxLength={11}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                شماره تلفن باید با 09 شروع شود و 11 رقم باشد
              </p>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                پست سازمانی *
              </label>
              <Input
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="مثال: مدیر منابع انسانی"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                بخش *
              </label>
              <Select
                value={formData.department ? { value: formData.department, label: formData.department } : null}
                onChange={(option: any) => handleInputChange('department', option?.value || '')}
                options={departmentOptions}
                placeholder="بخش مربوطه را انتخاب کنید"
              />
            </div>
          </div>

          {/* Info Box */}
          {!isEditMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                📋 نکات مهم:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>پس از افزودن متقاضی، ارزیابی‌ها به صورت خودکار به او تخصیص داده می‌شوند</li>
                <li>وضعیت اولیه متقاضی "فعال" خواهد بود</li>
                <li>متقاضی می‌تواند با شماره تلفن وارد شده وارد سیستم شود</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="plain"
              onClick={() => navigate('/owner/managers')}
              disabled={saving}
            >
              انصراف
            </Button>
            <Button
              variant="solid"
              icon={<HiOutlineSave />}
              loading={saving}
              onClick={handleSubmit}
            >
              {isEditMode ? 'بروزرسانی اطلاعات' : 'ذخیره و افزودن متقاضی'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ManagersAdd
