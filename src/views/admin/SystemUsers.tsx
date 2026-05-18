import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, Button, Avatar, Tag, Tooltip, Input, Skeleton, Dialog, toast, Notification } from '@/components/ui'
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineSearch,
    HiOutlineCalendar,
    HiOutlineOfficeBuilding,
    HiOutlinePencil,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineShieldCheck
} from 'react-icons/hi'
import { getAdminUsers, updateAdminUser, SystemUser } from '@/services/AdminService'
import { getImageUrl } from '@/utils/imageUrl'
import Container from '@/components/shared/Container'

type RoleFilter = 'all' | 'admin' | 'owner' | 'user'

const SystemUsers = () => {
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState<RoleFilter>('all')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user' as 'admin' | 'owner' | 'user',
        status: 'active' as 'active' | 'inactive'
    })

    // Fetch users using SWR
    const { data, error, isLoading, mutate } = useSWR(
        `/admin/users?page=${page}`,
        () => getAdminUsers(page),
        {
            revalidateOnFocus: false,
            dedupingInterval: 15000,
        }
    )

    // Handle Edit dialog open
    const handleEditClick = (user: SystemUser) => {
        setEditingUser(user)
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role === 'manager' ? 'user' : user.role,
            status: user.status
        })
        setIsEditOpen(true)
    }

    // Save User details using PUT /api/admin/users/{id}
    const handleSaveEdit = async () => {
        if (!editingUser) return

        // ── Frontend Validations ─────────────────────────────────────────────
        if (!editForm.name.trim()) {
            toast.push(
                <Notification type="warning" duration={3500}>
                    <div>
                        <p className="font-semibold text-amber-600">خطای اعتبارسنجی</p>
                        <p className="text-sm mt-1">وارد کردن نام الزامی است.</p>
                    </div>
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        if (editForm.phone) {
            const phoneRegex = /^09[0-9]{9}$/
            if (!phoneRegex.test(editForm.phone)) {
                toast.push(
                    <Notification type="warning" duration={4000}>
                        <div>
                            <p className="font-semibold text-amber-600">خطای اعتبارسنجی</p>
                            <p className="text-sm mt-1">فرمت شماره همراه نامعتبر است. فرمت صحیح: 09XXXXXXXXX</p>
                        </div>
                    </Notification>,
                    { placement: 'top-center' }
                )
                return
            }
        }

        if (editForm.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(editForm.email)) {
                toast.push(
                    <Notification type="warning" duration={4000}>
                        <div>
                            <p className="font-semibold text-amber-600">خطای اعتبارسنجی</p>
                            <p className="text-sm mt-1">آدرس ایمیل وارد شده نامعتبر است.</p>
                        </div>
                    </Notification>,
                    { placement: 'top-center' }
                )
                return
            }
        }

        setIsSaving(true)
        try {
            await updateAdminUser(editingUser.id, editForm)
            
            toast.push(
                <Notification type="success" duration={3000}>
                    <div>
                        <p className="font-semibold text-emerald-600">بروزرسانی موفقیت‌آمیز</p>
                        <p className="text-sm mt-1">اطلاعات کاربر {editForm.name} با موفقیت ویرایش شد.</p>
                    </div>
                </Notification>,
                { placement: 'top-center' }
            )
            
            // Close modal & reset
            setIsEditOpen(false)
            setEditingUser(null)
            
            // Re-fetch users lists immediately
            mutate()
        } catch (err: any) {
            console.error('Error saving user edit:', err)
            toast.push(
                <Notification type="danger" duration={4000}>
                    <div>
                        <p className="font-semibold text-rose-600">خطا در ویرایش کاربر</p>
                        <p className="text-sm mt-1">{err?.message || 'خطایی رخ داد'}</p>
                    </div>
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsSaving(false)
        }
    }

    // Filter users locally based on query and role tab
    const allUsers = data?.data || []
    const filteredUsers = allUsers.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phone && user.phone.includes(searchQuery)) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesRole =
            selectedRole === 'all'
                ? true
                : selectedRole === 'user'
                ? (user.role === 'user' || user.role === 'manager')
                : user.role === selectedRole

        return matchesSearch && matchesRole
    })

    const totalPages = data?.last_page || 1

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400'
            case 'owner':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400'
            case 'user':
            case 'manager':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'مدیر سیستم'
            case 'owner':
                return 'کارفرما'
            case 'user':
            case 'manager':
                return 'متقاضی'
            default:
                return role
        }
    }

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400'
    }

    const getStatusLabel = (status: string) => {
        return status === 'active' ? 'فعال' : 'غیرفعال'
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <HiOutlineShieldCheck className="w-7 h-7 text-indigo-600" />
                            کاربران سیستم
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            لیست تمام کاربران ثبت شده در سامانه شامل مدیران، کارفرمایان و متقاضیان.
                        </p>
                    </div>
                </div>

                {/* Filters & Search */}
                <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <Button
                                size="sm"
                                variant={selectedRole === 'all' ? 'solid' : 'default'}
                                onClick={() => setSelectedRole('all')}
                                className="rounded-lg"
                            >
                                همه کاربران
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedRole === 'admin' ? 'solid' : 'default'}
                                onClick={() => setSelectedRole('admin')}
                                className="rounded-lg"
                            >
                                مدیران سیستم
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedRole === 'owner' ? 'solid' : 'default'}
                                onClick={() => setSelectedRole('owner')}
                                className="rounded-lg"
                            >
                                کارفرمایان
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedRole === 'user' ? 'solid' : 'default'}
                                onClick={() => setSelectedRole('user')}
                                className="rounded-lg"
                            >
                                متقاضیان
                            </Button>
                        </div>

                        {/* Search Input */}
                        <div className="w-full md:w-80">
                            <Input
                                placeholder="جستجو بر اساس نام، ایمیل، موبایل..."
                                prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-800/50"
                            />
                        </div>
                    </div>
                </Card>

                {/* Main Table Card */}
                <Card className="overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    <th className="p-4">کاربر</th>
                                    <th className="p-4">شماره همراه</th>
                                    <th className="p-4">ایمیل</th>
                                    <th className="p-4">نقش کاربری</th>
                                    <th className="p-4">سازمان / شرکت</th>
                                    <th className="p-4">وضعیت</th>
                                    <th className="p-4">آخرین ورود</th>
                                    <th className="p-4">تاریخ ثبت نام</th>
                                    <th className="p-4 text-center">عملیات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, idx) => (
                                        <tr key={idx}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton variant="circle" width={36} height={36} />
                                                    <Skeleton width={120} height={16} />
                                                </div>
                                            </td>
                                            <td className="p-4"><Skeleton width={80} height={14} /></td>
                                            <td className="p-4"><Skeleton width={140} height={14} /></td>
                                            <td className="p-4"><Skeleton width={70} height={20} /></td>
                                            <td className="p-4"><Skeleton width={90} height={14} /></td>
                                            <td className="p-4"><Skeleton width={50} height={20} /></td>
                                            <td className="p-4"><Skeleton width={95} height={14} /></td>
                                            <td className="p-4"><Skeleton width={80} height={14} /></td>
                                            <td className="p-4 text-center"><Skeleton width={40} height={28} className="mx-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-12 text-center text-gray-500 dark:text-gray-400">
                                            هیچ کاربری با مشخصات وارد شده یافت نشد.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150">
                                            {/* User Profile column */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        size={36}
                                                        src={getImageUrl(user.avatar)}
                                                        className="border border-gray-100 dark:border-gray-800"
                                                    >
                                                        {user.name?.charAt(0) || <HiOutlineUser />}
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {user.name || 'کاربر بدون نام'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            شناسه: {user.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phone */}
                                            <td className="p-4 font-mono text-xs text-left" dir="ltr">
                                                {user.phone || '-'}
                                            </td>

                                            {/* Email */}
                                            <td className="p-4 font-mono text-xs text-left text-gray-600 dark:text-gray-400" dir="ltr">
                                                {user.email || '-'}
                                            </td>

                                            {/* Role */}
                                            <td className="p-4">
                                                <Tag className={getRoleColor(user.role)}>
                                                    {getRoleLabel(user.role)}
                                                </Tag>
                                            </td>

                                            {/* Company */}
                                            <td className="p-4">
                                                {user.company ? (
                                                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                                        <HiOutlineOfficeBuilding className="text-gray-400 text-base" />
                                                        <span>{user.company.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="p-4">
                                                <Tag className={getStatusColor(user.status)}>
                                                    {getStatusLabel(user.status)}
                                                </Tag>
                                            </td>

                                            {/* Last Login */}
                                            <td className="p-4 text-xs text-gray-500">
                                                {user.last_login ? formatDate(user.last_login) : 'بدون ورود'}
                                            </td>

                                            {/* Created At */}
                                            <td className="p-4 text-xs text-gray-500">
                                                {formatDate(user.created_at)}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-center">
                                                <Tooltip title="ویرایش اطلاعات">
                                                    <Button
                                                        size="xs"
                                                        variant="twoTone"
                                                        icon={<HiOutlinePencil />}
                                                        onClick={() => handleEditClick(user)}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform"
                                                    />
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                            <span className="text-xs text-gray-500">
                                صفحه {page} از {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    icon={<HiOutlineChevronRight />}
                                >
                                    قبلی
                                </Button>
                                <Button
                                    size="sm"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                    icon={<HiOutlineChevronLeft />}
                                >
                                    بعدی
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Edit User Modal Dialog */}
            <Dialog
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onRequestClose={() => setIsEditOpen(false)}
                title="ویرایش کاربر سیستم"
                width={500}
            >
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            نام و نام خانوادگی
                        </label>
                        <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            prefix={<HiOutlineUser className="text-lg text-gray-400" />}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            شماره همراه
                        </label>
                        <Input
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            prefix={<HiOutlinePhone className="text-lg text-gray-400" />}
                            className="font-mono text-left"
                            dir="ltr"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            ایمیل
                        </label>
                        <Input
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            prefix={<HiOutlineMail className="text-lg text-gray-400" />}
                            className="font-mono text-left"
                            dir="ltr"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                نقش کاربری
                            </label>
                            <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="admin">مدیر سیستم</option>
                                <option value="owner">کارفرما</option>
                                <option value="user">متقاضی</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                وضعیت کاربری
                            </label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="active">فعال</option>
                                <option value="inactive">غیرفعال</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                        <Button
                            variant="plain"
                            onClick={() => setIsEditOpen(false)}
                            icon={<HiOutlineX />}
                        >
                            انصراف
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleSaveEdit}
                            icon={<HiOutlineCheck />}
                            loading={isSaving}
                        >
                            ذخیره تغییرات
                        </Button>
                    </div>
                </div>
            </Dialog>
        </Container>
    )
}

export default SystemUsers
