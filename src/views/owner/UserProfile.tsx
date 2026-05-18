import { useState, useEffect } from 'react'
import { Card, Button, Input, Upload, Avatar, toast, Notification } from '@/components/ui'
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlinePhotograph,
    HiOutlineSave
} from 'react-icons/hi'
import { useSessionUser } from '@/store/authStore'
import { apiUpdateProfile } from '@/services/AuthService'
import { apiUploadFile } from '@/services/FileService'
import Container from '@/components/shared/Container'
import { getImageUrl } from '@/utils/imageUrl'

const UserProfile = () => {
    const { user, setUser } = useSessionUser((state) => ({
        user: state.user,
        setUser: state.setUser
    }))

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    
    const [avatarPreview, setAvatarPreview] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Load initial user details from session storage
    useEffect(() => {
        if (user) {
            setName(user.userName || '')
            setEmail(user.email || '')
            setPhone(user.phone || '')
            setAvatarPreview(user.avatar || '')
        }
    }, [user])

    const handleFileChange = async (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]
            setAvatarFile(file)

            // Create local preview immediately
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const beforeUpload = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0]
            if (file.size > 2000000) { // 2MB
                return 'حجم فایل نباید بیشتر از 2 مگابایت باشد'
            }
        }
        return true
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.push(
                <Notification type="danger" duration={3000}>
                    لطفاً نام خود را وارد کنید
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        setSaving(true)
        try {
            let uploadedAvatarId: number | null = null
            let uploadedAvatarUrl = avatarPreview

            // 1. Upload avatar file if one was selected
            if (avatarFile) {
                setUploading(true)
                try {
                    const uploadRes = await apiUploadFile(avatarFile)
                    if (uploadRes && uploadRes.id) {
                        uploadedAvatarId = uploadRes.id
                        uploadedAvatarUrl = uploadRes.address
                    }
                } catch (err) {
                    console.error('Error uploading avatar:', err)
                    toast.push(
                        <Notification type="danger" duration={3000}>
                            خطا در آپلود تصویر پروفایل
                        </Notification>,
                        { placement: 'top-center' }
                    )
                } finally {
                    setUploading(false)
                }
            }

            // 2. Build FormData for multipart request
            const formData = new FormData()
            formData.append('name', name)
            formData.append('email', email)

            if (avatarFile) {
                // Send the actual binary file
                formData.append('avatar', avatarFile)
                // Also send the uploaded file ID just in case
                if (uploadedAvatarId) {
                    formData.append('avatar_id', uploadedAvatarId.toString())
                }
            }

            // 3. Make API call to update profile
            const response = await apiUpdateProfile(formData)

            // 4. Update the global session user in Zustand to immediately reflect changes in Header
            setUser({
                userName: name,
                email: email,
                avatar: uploadedAvatarUrl || user.avatar,
                phone: phone
            })

            toast.push(
                <Notification type="success" duration={3000}>
                    <div>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">موفقیت‌آمیز</p>
                        <p className="text-sm mt-1">اطلاعات حساب کاربری شما با موفقیت بروزرسانی شد</p>
                    </div>
                </Notification>,
                { placement: 'top-center' }
            )
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.push(
                <Notification type="danger" duration={4000}>
                    <div>
                        <p className="font-semibold text-rose-600 dark:text-rose-400">خطا در بروزرسانی</p>
                        <p className="text-sm mt-1">{error?.message || 'خطایی در بروزرسانی اطلاعات کاربری رخ داد'}</p>
                    </div>
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        تنظیمات کاربری
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت اطلاعات حساب کاربری و تصویر پروفایل.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Avatar Management */}
                    <Card className="p-6 flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <HiOutlinePhotograph className="w-5 h-5 text-indigo-600" />
                            تصویر پروفایل
                        </h3>

                        <div className="space-y-6 flex flex-col items-center">
                            <div className="relative group cursor-pointer rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                                <Avatar
                                    size={140}
                                    src={getImageUrl(avatarPreview)}
                                    className="object-cover"
                                >
                                    <HiOutlineUser className="w-16 h-16 text-gray-400" />
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <HiOutlinePhotograph className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <Upload
                                accept="image/*"
                                beforeUpload={beforeUpload}
                                showList={false}
                                onChange={handleFileChange}
                                className="w-full"
                            >
                                <Button variant="default" className="w-full" loading={uploading}>
                                    انتخاب تصویر جدید
                                </Button>
                            </Upload>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                فرمت‌های مجاز: JPG، PNG (حداکثر 2 مگابایت)
                            </p>
                        </div>
                    </Card>

                    {/* Right Panel: Account Details Form */}
                    <Card className="lg:col-span-2 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <HiOutlineUser className="w-5 h-5 text-indigo-600" />
                            اطلاعات کاربری
                        </h3>

                        <div className="space-y-5">
                            {/* Full Name & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        نام و نام خانوادگی
                                    </label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="نام خود را وارد کنید"
                                        prefix={<HiOutlineUser className="text-lg text-gray-400" />}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        شماره همراه
                                        <span className="text-xs text-gray-500 mr-2 font-normal">(غیرقابل تغییر)</span>
                                    </label>
                                    <Input
                                        value={phone}
                                        disabled
                                        prefix={<HiOutlinePhone className="text-lg text-gray-400" />}
                                        className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed font-mono text-left"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    ایمیل
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your-email@example.com"
                                    prefix={<HiOutlineMail className="text-lg text-gray-400" />}
                                    className="font-mono text-left"
                                    dir="ltr"
                                />
                            </div>

                            {/* Save Actions */}
                            <div className="flex justify-end pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
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
                    </Card>
                </div>
            </div>
        </Container>
    )
}

export default UserProfile
