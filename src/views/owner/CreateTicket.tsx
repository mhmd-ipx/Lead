import { useState } from 'react'
import { Card, Button, Input, Select, Upload } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineTicket,
} from 'react-icons/hi'
import { FcImageFile } from 'react-icons/fc'
import { useNavigate } from 'react-router-dom'

const CreateTicket = () => {
    const navigate = useNavigate()

    const [newTicket, setNewTicket] = useState({
        subject: '',
        category: 'عمومی' as 'فنی' | 'مالی' | 'عمومی',
        priority: 'medium' as 'low' | 'medium' | 'high',
        message: '',
        files: [] as File[],
    })

    const handleCreateTicket = () => {
        // API call here
        console.log('Creating ticket:', newTicket)
        navigate('/owner/support/tickets')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/owner/support/tickets')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <HiOutlineTicket className="text-3xl" />
                            ایجاد تیکت جدید
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            لطفاً اطلاعات تیکت خود را وارد کنید
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card className="p-6">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">موضوع تیکت</label>
                        <Input
                            placeholder="موضوع تیکت را وارد کنید"
                            value={newTicket.subject}
                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">دسته‌بندی</label>
                            <Select
                                value={{ label: newTicket.category, value: newTicket.category }}
                                options={[
                                    { label: 'فنی', value: 'فنی' },
                                    { label: 'مالی', value: 'مالی' },
                                    { label: 'عمومی', value: 'عمومی' },
                                ]}
                                onChange={(option) => setNewTicket({ ...newTicket, category: option!.value as any })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">اولویت</label>
                            <Select
                                value={{
                                    label: newTicket.priority === 'high' ? 'فوری' : newTicket.priority === 'medium' ? 'متوسط' : 'کم',
                                    value: newTicket.priority
                                }}
                                options={[
                                    { label: 'فوری', value: 'high' },
                                    { label: 'متوسط', value: 'medium' },
                                    { label: 'کم', value: 'low' },
                                ]}
                                onChange={(option) => setNewTicket({ ...newTicket, priority: option!.value as any })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">شرح مسئله</label>
                        <Input
                            textArea
                            placeholder="لطفاً مسئله خود را به طور کامل شرح دهید..."
                            rows={6}
                            value={newTicket.message}
                            onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">پیوست فایل (اختیاری)</label>
                        <Upload draggable>
                            <div className="my-10 text-center">
                                <div className="text-6xl mb-4 flex justify-center">
                                    <FcImageFile />
                                </div>
                                <p className="font-semibold">
                                    <span className="text-gray-800 dark:text-white">
                                        فایل را اینجا رها کنید یا{' '}
                                    </span>
                                    <span className="text-blue-500">مرور کنید</span>
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    فرمت‌های مجاز: JPG, PNG, PDF, DOC (حداکثر 5MB)
                                </p>
                            </div>
                        </Upload>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="plain" onClick={() => navigate('/owner/support/tickets')}>
                            انصراف
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleCreateTicket}
                            disabled={!newTicket.subject || !newTicket.message}
                        >
                            ثبت تیکت
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default CreateTicket
