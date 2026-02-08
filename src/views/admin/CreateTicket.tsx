import { useState } from 'react'
import { Card, Button, Input, Select, Upload, Notification, toast, FormItem } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineTicket,
} from 'react-icons/hi'
import { FcImageFile } from 'react-icons/fc'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiCreateTicket } from '@/services/SupportService'
import type { CreateTicketRequest } from '@/@types/support'

const validationSchema = z.object({
    subject: z.string().min(1, 'موضوع تیکت الزامی است'),
    category: z.string().min(1, 'دسته‌بندی الزامی است'),
    priority: z.string().min(1, 'اولویت الزامی است'),
    message: z.string().min(1, 'شرح مسئله الزامی است'),
})

const CreateTicket = () => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateTicketRequest>({
        defaultValues: {
            subject: '',
            category: 'general',
            priority: 'medium',
            message: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (values: CreateTicketRequest) => {
        setIsSubmitting(true)
        try {
            const response = await apiCreateTicket(values)
            if (response.success) {
                toast.push(
                    <Notification title={'موفقیت'} type="success">
                        تیکت با موفقیت ایجاد شد
                    </Notification>
                )
                navigate('/admin/support/tickets')
            }
        } catch (error) {
            toast.push(
                <Notification title={'خطا'} type="danger">
                    خطا در ایجاد تیکت. لطفا مجددا تلاش کنید.
                </Notification>
            )
            console.error('Error creating ticket:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const categoryOptions = [
        { label: 'فنی', value: 'technical' },
        { label: 'مالی', value: 'financial' },
        { label: 'عمومی', value: 'general' },
    ]

    const priorityOptions = [
        { label: 'فوری', value: 'high' },
        { label: 'متوسط', value: 'medium' },
        { label: 'کم', value: 'low' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/admin/support/tickets')}
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <FormItem
                        label="موضوع تیکت"
                        invalid={Boolean(errors.subject)}
                        errorMessage={errors.subject?.message}
                    >
                        <Controller
                            name="subject"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder="موضوع تیکت را وارد کنید"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem
                            label="دسته‌بندی"
                            invalid={Boolean(errors.category)}
                            errorMessage={errors.category?.message}
                        >
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={categoryOptions}
                                        value={categoryOptions.find(option => option.value === field.value)}
                                        onChange={(option) => field.onChange(option?.value)}
                                        placeholder="انتخاب کنید"
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="اولویت"
                            invalid={Boolean(errors.priority)}
                            errorMessage={errors.priority?.message}
                        >
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={priorityOptions}
                                        value={priorityOptions.find(option => option.value === field.value)}
                                        onChange={(option) => field.onChange(option?.value)}
                                        placeholder="انتخاب کنید"
                                    />
                                )}
                            />
                        </FormItem>
                    </div>

                    <FormItem
                        label="شرح مسئله"
                        invalid={Boolean(errors.message)}
                        errorMessage={errors.message?.message}
                    >
                        <Controller
                            name="message"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    textArea
                                    placeholder="لطفاً مسئله خود را به طور کامل شرح دهید..."
                                    rows={6}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    {/* Disabled Upload Section */}
                    <div className="opacity-50 pointer-events-none relative">
                        <label className="block text-sm font-medium mb-2">پیوست فایل (غیرفعال)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 dark:bg-gray-800">
                            <div className="text-6xl mb-4 flex justify-center grayscale">
                                <FcImageFile />
                            </div>
                            <p className="font-semibold text-gray-400">
                                امکان آپلود فایل فعلاً غیرفعال است
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="plain" type="button" onClick={() => navigate('/admin/support/tickets')}>
                            انصراف
                        </Button>
                        <Button
                            variant="solid"
                            type="submit"
                            loading={isSubmitting}
                        >
                            ثبت تیکت
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default CreateTicket
