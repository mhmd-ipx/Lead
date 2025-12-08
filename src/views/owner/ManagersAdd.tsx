import { useEffect, useState } from 'react'
import { Card, Button, Input, Select, Switcher, Upload, Avatar } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineCamera } from 'react-icons/hi'
import { getManagerById, createManager, updateManager } from '@/services/OwnerService'
import { useNavigate, useParams } from 'react-router-dom'

const ManagersAdd = () => {
  const { managerId } = useParams<{ managerId: string }>()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    canViewResults: false,
    avatar: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const navigate = useNavigate()
  const isEditMode = !!managerId

  useEffect(() => {
    if (isEditMode && managerId) {
      loadManagerData()
    }
  }, [managerId, isEditMode])

  const loadManagerData = async () => {
    if (!managerId) return

    setLoading(true)
    try {
      const manager = await getManagerById(managerId)
      if (manager) {
        setFormData({
          name: manager.name,
          email: manager.email,
          phone: manager.phone,
          position: manager.position,
          department: manager.department,
          canViewResults: manager.canViewResults,
          avatar: manager.avatar || ''
        })
      }
    } catch (error) {
      console.error('Error loading manager:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      // In a real application, you would upload the file to a server
      // For now, we'll create a data URL for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData(prev => ({
          ...prev,
          avatar: result
        }))
      }
      reader.readAsDataURL(file)
      setUploadedFiles([file])
    }
  }

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }))
    setUploadedFiles([])
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.position || !formData.department) {
      alert('لطفاً تمام فیلدهای ضروری را پر کنید.')
      return
    }

    setSaving(true)
    try {
      if (isEditMode && managerId) {
        await updateManager(managerId, formData)
        alert('مدیر با موفقیت بروزرسانی شد.')
      } else {
        await createManager({
          ...formData,
          status: 'active',
          assessmentStatus: 'not_started',
          examStatus: 'not_started'
        })
        alert('مدیر جدید با موفقیت اضافه شد.')
      }
      navigate('/owner/managers')
    } catch (error) {
      console.error('Error saving manager:', error)
      alert('خطا در ذخیره اطلاعات مدیر.')
    } finally {
      setSaving(false)
    }
  }

  const departmentOptions = [
    { value: 'فروش', label: 'فروش' },
    { value: 'بازاریابی', label: 'بازاریابی' },
    { value: 'HR', label: 'منابع انسانی' },
    { value: 'مالی', label: 'مالی' },
    { value: 'عملیات', label: 'عملیات' },
    { value: 'فنی', label: 'فنی' }
  ]

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
      <div className="flex items-center gap-4">
        <Button
          variant="plain"
          icon={<HiOutlineArrowLeft />}
          onClick={() => navigate('/owner/managers')}
        >
          بازگشت به لیست مدیران
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'ویرایش مدیر' : 'افزودن مدیر جدید'}
        </h1>
      </div>

      {/* Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar
                size="lg"
                src={formData.avatar || undefined}
                className="border-4 border-white shadow-lg"
              >
                {!formData.avatar && (
                  <span className="text-2xl font-semibold text-gray-400">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <Upload
                  accept="image/*"
                  beforeUpload={(files) => {
                    if (files && files.length > 0) {
                      const file = files[0]
                      if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        alert('حجم فایل نباید بیشتر از 5 مگابایت باشد.')
                        return false
                      }
                      if (!file.type.startsWith('image/')) {
                        alert('فقط فایل‌های تصویری مجاز هستند.')
                        return false
                      }
                    }
                    return true
                  }}
                  onChange={handleImageUpload}
                  showList={false}
                  uploadLimit={1}
                >
                  <Button
                    variant="solid"
                    size="sm"
                    icon={<HiOutlineCamera />}
                    className="rounded-full w-8 h-8 p-0"
                  >
                  </Button>
                </Upload>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تصویر پروفایل
              </p>
              {formData.avatar && (
                <Button
                  variant="plain"
                  size="sm"
                  color="red"
                  onClick={handleImageRemove}
                  className="mt-2"
                >
                  حذف تصویر
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نام و نام خانوادگی *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="نام و نام خانوادگی مدیر را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                پست سازمانی *
              </label>
              <Input
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="پست سازمانی مدیر را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ایمیل *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ایمیل مدیر را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                شماره تلفن *
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="شماره تلفن مدیر را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                بخش *
              </label>
              <Select
                value={formData.department ? { value: formData.department, label: formData.department } : null}
                onChange={(option) => handleInputChange('department', option?.value || '')}
                options={departmentOptions}
                placeholder="بخش مربوطه را انتخاب کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                دسترسی مشاهده نتایج آزمون
              </label>
              <div className="flex items-center gap-3">
                <Switcher
                  checked={formData.canViewResults}
                  onChange={(checked) => handleInputChange('canViewResults', checked)}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.canViewResults ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="plain"
              onClick={() => navigate('/owner/managers')}
            >
              انصراف
            </Button>
            <Button
              variant="solid"
              icon={<HiOutlineSave />}
              loading={saving}
              onClick={handleSubmit}
            >
              {isEditMode ? 'بروزرسانی' : 'ذخیره'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ManagersAdd
