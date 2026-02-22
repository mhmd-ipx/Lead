import { useState } from 'react'
import { Card, Button, Input, Avatar } from '@/components/ui'
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineSave } from 'react-icons/hi'

const UserProfile = () => {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: 'علی محمدی',
        email: 'ali.mohammadi@example.com',
        phone: '09121234567',
        jobTitle: 'مدیر منابع انسانی',
        company: 'شرکت تکنولوژی پیشرفته',
        address: 'تهران، خیابان ولیعصر، پلاک 123',
    })

    const handleSave = () => {
        // API call to save data
        setIsEditing(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div id="user-profile-header" className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        تنظیمات کاربری
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت اطلاعات حساب کاربری
                    </p>
                </div>
                {!isEditing ? (
                    <Button id="user-profile-edit-button" variant="solid" onClick={() => setIsEditing(true)}>
                        ویرایش اطلاعات
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="plain" onClick={() => setIsEditing(false)}>
                            انصراف
                        </Button>
                        <Button variant="solid" icon={<HiOutlineSave />} onClick={handleSave}>
                            ذخیره تغییرات
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <Card id="user-profile-form-section" className="p-6">
                <div id="user-profile-avatar-section" className="flex flex-col items-center mb-8">
                    <Avatar
                        size={100}
                        className="mb-4"
                        icon={<HiOutlineUser />}
                    />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {formData.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formData.jobTitle}
                    </p>
                </div>

                {/* Form */}
                <div className="max-w-2xl mx-auto space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">نام و نام خانوادگی</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                                prefix={<HiOutlineUser className="text-lg" />}
                            />
                        </div>

                        {/* Job Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2">سمت شغلی</label>
                            <Input
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Email - Read Only */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            ایمیل
                            <span className="text-xs text-gray-500 mr-2">(غیرقابل ویرایش)</span>
                        </label>
                        <Input
                            value={formData.email}
                            disabled
                            prefix={<HiOutlineMail className="text-lg" />}
                            className="bg-gray-50 dark:bg-gray-800"
                        />
                    </div>

                    {/* Phone - Read Only */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            شماره همراه
                            <span className="text-xs text-gray-500 mr-2">(غیرقابل ویرایش)</span>
                        </label>
                        <Input
                            value={formData.phone}
                            disabled
                            prefix={<HiOutlinePhone className="text-lg" />}
                            className="bg-gray-50 dark:bg-gray-800"
                        />
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-sm font-medium mb-2">نام سازمان</label>
                        <Input
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium mb-2">آدرس</label>
                        <Input
                            textArea
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </Card>

            {/* Additional Info */}
            <div id="user-profile-stats-section" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">تاریخ عضویت</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">1403/06/15</p>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">آخرین ورود</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">1403/09/23</p>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">وضعیت حساب</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">فعال</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default UserProfile
