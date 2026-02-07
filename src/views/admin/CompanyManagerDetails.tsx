import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Badge, Tabs, Tag, Skeleton } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlinePencil } from 'react-icons/hi'
import { getManagerByIdFromAPI } from '@/services/OwnerService'
import { Manager } from '@/mock/data/ownerData'
import { useNavigate, useParams } from 'react-router-dom'

const { TabContent, TabList, TabNav } = Tabs

const CompanyManagerDetails = () => {
    const { companyId, managerId } = useParams<{ companyId: string; managerId: string }>()
    const [manager, setManager] = useState<Manager | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (managerId) {
            loadManagerData()
        }
    }, [managerId])

    const loadManagerData = async () => {
        if (!managerId) return

        try {
            const managerData = await getManagerByIdFromAPI(parseInt(managerId))
            setManager(managerData)
        } catch (error) {
            console.error('Error loading manager data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: Manager['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500">فعال</Badge>
            case 'inactive':
                return <Badge className="bg-red-500">غیرفعال</Badge>
            default:
                return <Badge>نامشخص</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton width={200} height={40} />
                </div>

                {/* Profile Card Skeleton */}
                <Card className="p-6">
                    <div className="flex items-start gap-6">
                        <Skeleton variant="circle" width={80} height={80} />
                        <div className="flex-1 space-y-4">
                            <Skeleton width={200} height={32} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Skeleton width="100%" height={20} />
                                <Skeleton width="100%" height={20} />
                                <Skeleton width="100%" height={20} />
                                <Skeleton width="100%" height={20} />
                            </div>
                            <div className="flex gap-4">
                                <Skeleton width={120} height={16} />
                                <Skeleton width={120} height={16} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton width={100} height={40} />
                        </div>
                    </div>
                </Card>

                {/* Statistics Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="p-4">
                            <div className="text-center space-y-2">
                                <Skeleton width={60} height={32} className="mx-auto" />
                                <Skeleton width={120} height={16} className="mx-auto" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!manager) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">متقاضی مورد نظر یافت نشد</p>
                <Button
                    variant="solid"
                    className="mt-4"
                    onClick={() => navigate(`/admin/companies/${companyId}/managers`)}
                >
                    بازگشت به لیست
                </Button>
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
                    onClick={() => navigate(`/admin/companies/${companyId}/managers`)}
                >
                    بازگشت به لیست متقاضیان
                </Button>
            </div>

            {/* Manager Profile Card */}
            <Card className="p-6">
                <div className="flex items-start gap-6">
                    <Avatar size="lg" src={manager.user.avatar || undefined}>
                        {manager.user.name.charAt(0)}
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {manager.user.name}
                            </h1>
                            {getStatusBadge(manager.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <HiOutlineOfficeBuilding className="w-5 h-5" />
                                <span>{manager.position}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <HiOutlineMail className="w-5 h-5" />
                                <span>{manager.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <HiOutlinePhone className="w-5 h-5" />
                                <span>{manager.user.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span>بخش: {manager.department}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                آخرین ورود: {manager.user.last_login ? formatDate(manager.user.last_login) : 'هرگز'}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                تاریخ عضویت: {formatDate(manager.created_at)}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="solid"
                            icon={<HiOutlinePencil />}
                            onClick={() => navigate(`/admin/companies/${companyId}/managers/${manager.id}/edit`)}
                        >
                            ویرایش
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {manager.assessment_status === 'completed' ? '1' : '0'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            نیازسنجی انجام شده
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {manager.exam_status === 'completed' ? '1' : '0'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            آزمون‌های شرکت کرده
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${manager.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {manager.status === 'active' ? 'فعال' : 'غیرفعال'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            وضعیت حساب
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs for detailed information */}
            <Tabs defaultValue="info">
                <TabList>
                    <TabNav value="info">اطلاعات تکمیلی</TabNav>
                    <TabNav value="permissions">دسترسی‌ها</TabNav>
                </TabList>

                <div className="mt-6">
                    <TabContent value="info">
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    اطلاعات تکمیلی متقاضی
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            شناسه متقاضی
                                        </label>
                                        <p className="text-gray-900 dark:text-white">#{manager.id}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            پست سازمانی
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{manager.position}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            بخش
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{manager.department}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            وضعیت نیازسنجی
                                        </label>
                                        <Tag className={
                                            manager.assessment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                manager.assessment_status === 'incomplete' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }>
                                            {manager.assessment_status === 'completed' ? 'انجام شده' :
                                                manager.assessment_status === 'incomplete' ? 'ناتمام' :
                                                    'شروع نشده'}
                                        </Tag>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            وضعیت آزمون
                                        </label>
                                        <Tag className={
                                            manager.exam_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                manager.exam_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }>
                                            {manager.exam_status === 'completed' ? 'انجام شده' :
                                                manager.exam_status === 'in_progress' ? 'در حال انجام' :
                                                    'شروع نشده'}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabContent>

                    <TabContent value="permissions">
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    تنظیمات دسترسی
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                وضعیت حساب کاربری
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                وضعیت فعال بودن حساب متقاضی
                                            </div>
                                        </div>
                                        {getStatusBadge(manager.status)}
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                دسترسی به سیستم
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                امکان ورود به سیستم و مشاهده اطلاعات
                                            </div>
                                        </div>
                                        <Badge className={manager.status === 'active' ? "bg-green-500" : "bg-red-500"}>
                                            {manager.status === 'active' ? "فعال" : "غیرفعال"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabContent>
                </div>
            </Tabs>

        </div>
    )
}

export default CompanyManagerDetails
