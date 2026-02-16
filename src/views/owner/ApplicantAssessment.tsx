import { useEffect, useState } from 'react'
import { Card, Button, Input, Select, Radio, Checkbox, Notification, toast, Skeleton, Dialog } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlinePencil, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import { getApplicantAssessment, submitApplicantAssessment, AssessmentSubmissionPayload } from '@/services/OwnerService'
import { Assessment, AssessmentQuestion } from '@/mock/data/ownerData'

const ApplicantAssessment = () => {
    const { managerId } = useParams<{ managerId: string }>()
    const navigate = useNavigate()

    const [assessment, setAssessment] = useState<Assessment | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [isEditing, setIsEditing] = useState(false)
    const [confirmDialogIsOpen, setConfirmDialogIsOpen] = useState(false)

    useEffect(() => {
        if (managerId) {
            loadAssessment()
        }
    }, [managerId])

    const loadAssessment = async () => {
        try {
            setLoading(true)
            const data = await getApplicantAssessment(managerId!)
            setAssessment(data)

            // Initialize answers from existing data if any
            if (data && data.answers) {
                // If the API returns answers in a specific structure, we might need to parse it.
                // Assuming data.answers is already in the format we can use or a simple key-value map.
                // For now, if it's the complex structure we send, we might need to extract values.
                // But typically draft returns what was saved. 
                // Let's assume for now it returns a map of questionId -> value or the complex object.
                // If it's the complex object:
                const initialAnswers: Record<string, any> = {}
                if (typeof data.answers === 'object') {
                    Object.keys(data.answers).forEach(key => {
                        const val = data.answers[key]
                        // If val is our complex object with 'answer' field
                        if (val && typeof val === 'object' && 'answer' in val) {
                            initialAnswers[key] = val.answer
                        } else {
                            initialAnswers[key] = val
                        }
                    })
                }
                setAnswers(initialAnswers)
            }
        } catch (error) {
            console.error('Error loading assessment:', error)
            toast.push(<Notification title="خطا" type="danger">خطا در بارگذاری نیازسنجی</Notification>)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))

        // Clear error if exists
        if (formErrors[questionId]) {
            setFormErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[questionId]
                return newErrors
            })
        }
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}
        let isValid = true

        if (!assessment) return false

        assessment.steps.forEach(step => {
            step.questions.forEach(question => {
                if (question.required) {
                    const ans = answers[question.id]
                    if (ans === undefined || ans === null || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
                        errors[question.id] = 'این سوال اجباری است'
                        isValid = false
                    }
                }
            })
        })

        setFormErrors(errors)
        return isValid
    }

    const handleSubmit = async () => {
        if (!assessment) return

        if (!validateForm()) {
            toast.push(<Notification title="خطا" type="danger">لطفا تمام سوالات اجباری را پاسخ دهید</Notification>)
            return
        }

        // Open Dialog instead of immediate submit
        setConfirmDialogIsOpen(true)
    }

    const confirmSubmit = async () => {
        if (!assessment) return

        try {
            setSubmitting(true)

            // Construct payload
            const payloadAnswers: Record<string, any> = {}

            assessment.steps.forEach(step => {
                step.questions.forEach(question => {
                    const value = answers[question.id]
                    // Always include answer if present, or if required check passed.
                    // Even if not required and empty, we can skip or send null.
                    if (value !== undefined) {
                        payloadAnswers[question.id] = {
                            step_number: step.order,
                            step_title: step.title,
                            question_number: question.order,
                            question_title: question.question,
                            question_type: question.type,
                            answer: value
                        }
                    }
                })
            })

            const payload: AssessmentSubmissionPayload = {
                answers: payloadAnswers
            }

            await submitApplicantAssessment(assessment.id, payload)

            toast.push(<Notification title="موفقیت" type="success">نیازسنجی با موفقیت ثبت شد</Notification>)

            // Reload to update status
            loadAssessment()
            // Exit edit mode if we were editing
            setIsEditing(false)

        } catch (error) {
            console.error('Error submitting assessment:', error)
            toast.push(<Notification title="خطا" type="danger">خطا در ثبت نیازسنجی</Notification>)
        } finally {
            setSubmitting(false)
            setConfirmDialogIsOpen(false)
        }
    }

    const renderQuestionInput = (question: AssessmentQuestion) => {
        const value = answers[question.id]
        const isReadOnly = assessment?.status === 'submitted' && !isEditing

        switch (question.type) {
            case 'text':
                return (
                    <Input
                        value={value || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="پاسخ خود را بنویسید..."
                        disabled={isReadOnly}
                        invalid={!!formErrors[question.id]}
                    />
                )
            case 'select':
                return (
                    <Select
                        options={question.options?.map(opt => ({ value: opt, label: opt })) || []}
                        value={value ? { value: value, label: value } : null}
                        onChange={(opt: any) => handleAnswerChange(question.id, opt?.value)}
                        isDisabled={isReadOnly}
                        placeholder="انتخاب کنید..."
                    />
                )
            case 'radio':
                return (
                    <div className="space-y-2">
                        <Radio.Group value={value} onChange={(val) => handleAnswerChange(question.id, val)} disabled={isReadOnly}>
                            {question.options?.map((opt, idx) => (
                                <Radio key={idx} value={opt}>{opt}</Radio>
                            ))}
                        </Radio.Group>
                    </div>
                )
            case 'checkbox':
                // Checkbox needs array value
                const selectedValues = Array.isArray(value) ? value : []
                return (
                    <div className="space-y-2">
                        {question.options?.map((opt, idx) => (
                            <Checkbox
                                key={idx}
                                checked={selectedValues.includes(opt)}
                                onChange={(checked) => {
                                    // checked is boolean here based on Checkbox component
                                    const newValues = checked
                                        ? [...selectedValues, opt]
                                        : selectedValues.filter((v: string) => v !== opt)
                                    handleAnswerChange(question.id, newValues)
                                }}
                                disabled={isReadOnly}
                            >
                                {opt}
                            </Checkbox>
                        ))}
                    </div>
                )
            case 'rating':
                // Custom star rating input
                const ratingValue = Number(value) || 0
                return (
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(rating => (
                                <div
                                    key={rating}
                                    className={`
                                       cursor-pointer transition-all transform hover:scale-110
                                       ${isReadOnly ? 'cursor-default' : ''}
                                   `}
                                    onClick={() => !isReadOnly && handleAnswerChange(question.id, rating)}
                                >
                                    <svg
                                        className={`w-10 h-10 ${rating <= ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        fill="none"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">از ۱ تا ۵ امتیاز دهید</span>
                    </div>
                )
            default:
                return <Input disabled placeholder="نوع سوال پشتیبانی نمی‌شود" />
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton height={200} className="rounded-2xl" />
                <div className="space-y-4">
                    <Skeleton height={150} />
                    <Skeleton height={150} />
                </div>
            </div>
        )
    }

    if (!assessment) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">نیازسنجی یافت نشد</h3>
                <p className="text-gray-500 mt-2">هیچ فرم نیازسنجی فعال برای این متقاضی وجود ندارد.</p>
                <Button className="mt-6" variant="solid" onClick={() => navigate(-1)}>بازگشت</Button>
            </div>
        )
    }

    const { templateName, managerName, status, steps } = assessment
    const isSubmitted = status === 'submitted'

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="relative bg-blue-600 from-primary-600 to-primary-800 rounded-2xl shadow-xl overflow-hidden text-white p-8">
                <div className="absolute top-0 left-0 p-4 opacity-5">
                    <HiOutlineCheckCircle className="w-64 h-64 transform rotate-12 translate-x-16 -translate-y-16" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="order-2 md:order-1">
                        <h1 className="text-3xl text-white md:text-4xl font-extrabold tracking-tight mb-2">
                            {templateName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/90">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <span className="opacity-80 text-sm">متقاضی:</span>
                                <span className="font-semibold">{managerName}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm ${isSubmitted ? 'bg-green-500/40 text-green-50' : 'bg-yellow-500/40 text-yellow-50'}`}>
                                {isSubmitted ? 'تکمیل شده' : 'پیش‌نویس'}
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 self-end md:self-center">
                        <Button
                            variant="plain"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={() => navigate('/owner/managers')}
                            icon={<HiOutlineArrowLeft className="text-xl" />}
                        />
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="relative">
                {/* Connector Line */}
                <div className="absolute top-0 bottom-0 right-6 md:right-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0 h-full"></div>

                <div className="space-y-12">
                    {steps.map((step, stepIndex) => (
                        <div key={step.id} className="relative z-10">
                            {/* Step Header */}
                            <div className="flex items-center gap-4 mb-6 group">
                                <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 z-10 relative">
                                    <span className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        {stepIndex + 1}
                                    </span>
                                </div>
                                <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                        {step.title}
                                    </h2>
                                    {step.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Questions List */}
                            <div className="mr-8 md:mr-12 space-y-4">
                                {step.questions.map((question, qIndex) => (
                                    <Card
                                        key={question.id}
                                        className={`hover:shadow-md transition-all duration-300 border-l-4 group ${formErrors[question.id] ? 'border-l-red-500 border-red-200' : 'border-l-transparent hover:border-l-primary-500'}`}
                                        bodyClass="p-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                {/* Question Type Icons matching Admin Panel */}
                                                {question.type === 'text' && <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg></div>}
                                                {question.type === 'select' && <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></div>}
                                                {question.type === 'radio' && <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>}
                                                {question.type === 'checkbox' && <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></div>}
                                                {question.type === 'rating' && <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></div>}
                                            </div>

                                            <div className="flex-1">
                                                <div className="mb-4">
                                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg flex items-center gap-2">
                                                        {question.question}
                                                        {question.required && <span className="text-red-500 text-sm" title="اجباری">*</span>}
                                                    </h3>
                                                </div>

                                                <div className="mt-2">
                                                    {renderQuestionInput(question)}
                                                    {formErrors[question.id] && (
                                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1 bg-red-50 p-2 rounded-lg inline-flex">
                                                            <HiOutlineExclamationCircle />
                                                            {formErrors[question.id]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="sticky bottom-6 mt-6 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                    {isSubmitted && !isEditing ? (
                        <div className="flex justify-between w-full items-center">
                            <span className="text-gray-500 text-sm">برای تغییر پاسخ‌ها وارد حالت ویرایش شوید</span>
                            <div className="flex gap-2">
                                <Button variant="plain" onClick={() => navigate('/owner/managers')}>
                                    بازگشت
                                </Button>
                                <Button
                                    variant="solid"
                                    icon={<HiOutlinePencil />}
                                    onClick={() => setIsEditing(true)}
                                >
                                    حالت ویرایش
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="plain"
                                onClick={() => {
                                    if (isSubmitted) {
                                        setIsEditing(false)
                                        // Reset answers to original load state if cancelled? 
                                        // For now just exit edit mode, keeping client state is ok or reload.
                                        loadAssessment()
                                    } else {
                                        navigate('/owner/managers')
                                    }
                                }}
                            >
                                انصراف
                            </Button>

                            <Button
                                variant="solid"
                                loading={submitting}
                                icon={<HiOutlineSave />}
                                onClick={handleSubmit}
                            >
                                {isSubmitted ? 'ذخیره تغییرات' : 'ثبت نهایی نیازسنجی'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                isOpen={confirmDialogIsOpen}
                onClose={() => setConfirmDialogIsOpen(false)}
                onRequestClose={() => setConfirmDialogIsOpen(false)}
            >
                <div className="flex flex-col h-full justify-between">
                    <h5 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <HiOutlineExclamationCircle className="text-yellow-500 text-2xl" />
                        تایید ثبت نهایی
                    </h5>
                    <div className="max-h-96 overflow-y-auto">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            آیا از ثبت نهایی پاسخ‌های خود اطمینان دارید؟
                        </p>
                        <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mt-4 rounded-md">
                            <p className="text-yellow-700 text-sm font-medium">
                                توجه: لطفاً پیش از ثبت، تمام موارد را به دقت بررسی کنید. پس از ثبت نهایی، امکان ویرایش پاسخ‌ها وجود نخواهد داشت.
                            </p>
                        </div>
                    </div>
                    <div className="text-right mt-6 flex justify-end gap-2">
                        <Button
                            variant="plain"
                            onClick={() => setConfirmDialogIsOpen(false)}
                        >
                            بررسی مجدد
                        </Button>
                        <Button
                            variant="solid"
                            onClick={confirmSubmit}
                            loading={submitting}
                        >
                            تایید و ثبت نهایی
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default ApplicantAssessment
