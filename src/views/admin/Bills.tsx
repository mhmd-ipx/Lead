import { Card } from '@/components/ui'
import { HiOutlineDocumentDuplicate } from 'react-icons/hi'

const Bills = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        صورتحساب‌ها
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت و مشاهده صورتحساب‌های سیستم
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <Card>
                <div className="p-6">
                    <div className="text-center py-12">
                        <HiOutlineDocumentDuplicate className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            صورتحساب‌ها
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            این بخش در حال توسعه است
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Bills
