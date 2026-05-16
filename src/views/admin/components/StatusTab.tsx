import { useState } from 'react'
import { Card, Button, Tag, Notification, toast } from '@/components/ui'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineSave } from 'react-icons/hi'
import { updateExamCollection } from '@/services/AdminService'

interface StatusTabProps {
    collectionId: string
    collectionStatus: string
    applicantName: string
    companyName: string
    totalExams: number
    completedExams: number
    averageScore: number
    onStatusChanged: () => void
}

const StatusTab = ({
    collectionId,
    collectionStatus,
    applicantName,
    companyName,
    totalExams,
    completedExams,
    averageScore,
    onStatusChanged,
}: StatusTabProps) => {
    const [saving, setSaving] = useState(false)

    const isVisible = collectionStatus === 'archived'

    const handleToggleVisibility = async () => {
        setSaving(true)
        try {
            const newStatus = isVisible ? 'active' : 'archived'
            await updateExamCollection(collectionId, { status: newStatus })
            toast.push(
                <Notification type="success">
                    وضعیت نمایش نتایج {isVisible ? 'غیرقابل مشاهده' : 'قابل مشاهده'} شد
                </Notification>
            )
            onStatusChanged()
        } catch (error) {
            toast.push(<Notification type="danger">خطا در تغییر وضعیت</Notification>)
        } finally {
            setSaving(false)
        }
    }

    const getStatusTag = () => {
        switch (collectionStatus) {
            case 'active':
                return <Tag className="bg-blue-500 text-white border-0">فعال - غیرقابل مشاهده توسط سازمان</Tag>
            case 'archived':
                return <Tag className="bg-emerald-500 text-white border-0">قابل مشاهده توسط سازمان</Tag>
            case 'draft':
                return <Tag className="bg-gray-500 text-white border-0">پیش‌نویس</Tag>
            default:
                return <Tag className="bg-gray-400 text-white border-0">{collectionStatus}</Tag>
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">اطلاعات متقاضی</h4>
                <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">متقاضی</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{applicantName}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">سازمان</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{companyName}</span>
                    </div>
                </div>
            </Card>

            <Card>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">آمار آزمون</h4>
                <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">تعداد آزمون‌ها</span>
                        <span className="font-bold text-gray-900 dark:text-white">{completedExams}/{totalExams}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">میانگین نمره</span>
                        <span className="font-bold text-2xl text-green-600 dark:text-green-400">{averageScore}%</span>
                    </div>
                </div>
            </Card>

            <Card className="lg:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    وضعیت نمایش نتایج به سازمان
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">وضعیت فعلی مجموعه آزمون</p>
                            <div className="mt-2">{getStatusTag()}</div>
                        </div>
                    </div>

                    <Button
                        variant="solid"
                        color={isVisible ? 'red-600' : 'emerald-600'}
                        icon={isVisible ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                        onClick={handleToggleVisibility}
                        loading={saving}
                        block
                        className="mt-4"
                    >
                        {isVisible ? 'غیرقابل مشاهده کردن نتایج' : 'قابل مشاهده کردن نتایج برای سازمان'}
                    </Button>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            💡 با تغییر وضعیت به «قابل مشاهده»، سازمان قادر به دیدن نتایج آزمون خواهد بود.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default StatusTab
