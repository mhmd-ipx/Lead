import { useEffect, useState } from 'react'
import { Card, Button, Input, Steps } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineArrowRight } from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'

interface Question {
    id: string
    question: string
    answer: string
}

interface StepData {
    title: string
    questions: Omit<Question, 'answer'>[]
}

// Predefined steps and questions
const ASSESSMENT_STEPS: StepData[] = [
    {
        title: 'اطلاعات پایه',
        questions: [
            { id: 'q1', question: 'سابقه کاری در حوزه مرتبط چند سال است؟' },
            { id: 'q2', question: 'بالاترین مدرک تحصیلی چیست؟' },
        ],
    },
    {
        title: 'مهارت‌ها و تخصص',
        questions: [
            { id: 'q3', question: 'آیا دوره‌های تخصصی مرتبط گذرانده‌اید؟ (در صورت مثبت، نام دوره‌ها را ذکر کنید)' },
            { id: 'q4', question: 'آشنایی با نرم‌افزارها و ابزارهای مرتبط با شغل را توضیح دهید' },
            { id: 'q5', question: 'چه مهارت‌هایی را می‌خواهید توسعه دهید؟' },
        ],
    },
    {
        title: 'تجربه مدیریت',
        questions: [
            { id: 'q6', question: 'تعداد تیم تحت مدیریت یا سرپرستی چند نفر بوده است؟' },
            { id: 'q7', question: 'نقاط قوت خود در محیط کاری را بیان کنید' },
        ],
    },
    {
        title: 'علایق و اهداف',
        questions: [
            { id: 'q8', question: 'علاقه‌مندی‌های اصلی شغلی کدامند؟' },
            { id: 'q9', question: 'اهداف شغلی کوتاه‌مدت و بلندمدت خود را بیان کنید' },
        ],
    },
]

const AssessmentForm = () => {
    const { managerId, assessmentId } = useParams<{ managerId: string; assessmentId: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [answers, setAnswers] = useState<Record<string, string>>({})

    const isEditMode = !!assessmentId

    useEffect(() => {
        if (isEditMode && managerId && assessmentId) {
            loadAssessment()
        }
    }, [isEditMode, managerId, assessmentId])

    const loadAssessment = async () => {
        setLoading(true)
        try {
            // Mock data for edit mode
            setTitle('نیازسنجی مهارت‌های فنی')
            setDescription('بررسی دانش فنی و تخصصی')
            setAnswers({
                q1: '3 سال',
                q2: 'کارشناسی مهندسی کامپیوتر',
                q3: 'React، Node.js، Docker',
                q4: 'Git, VS Code, Jira, Figma',
                q5: 'معماری نرم‌افزار، مدیریت پروژه',
                q6: '5 نفر',
                q7: 'کار تیمی، حل مسئله، یادگیری سریع',
                q8: 'توسعه وب و نرم‌افزار',
                q9: 'ارتقا به سطح ارشد در 2 سال، مدیریت تیم در 5 سال',
            })
        } catch (error) {
            console.error('Error loading assessment:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswerChange = (id: string, value: string) => {
        setAnswers({ ...answers, [id]: value })
    }

    const handleNext = () => {
        if (currentStep < ASSESSMENT_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            alert('لطفاً عنوان نیازسنجی را وارد کنید')
            return
        }

        const allQuestions = ASSESSMENT_STEPS.flatMap(step => step.questions)
        const hasEmptyAnswers = allQuestions.some(q => !answers[q.id]?.trim())
        if (hasEmptyAnswers) {
            alert('لطفاً تمام سوالات را پاسخ دهید')
            return
        }

        setLoading(true)
        try {
            // Mock submit
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Navigate back to list
            navigate(`/owner/managers/${managerId}/assessment`)
        } catch (error) {
            console.error('Error submitting assessment:', error)
            alert('خطا در ثبت نیازسنجی')
        } finally {
            setLoading(false)
        }
    }

    if (loading && isEditMode) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    const currentStepData = ASSESSMENT_STEPS[currentStep]
    const isLastStep = currentStep === ASSESSMENT_STEPS.length - 1

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate(`/owner/managers/${managerId}/assessment`)}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditMode ? 'ویرایش نیازسنجی' : 'ایجاد نیازسنجی جدید'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            پر کردن فرم نیازسنجی استاندارد برای متقاضی
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card className="p-6">
                <div className="space-y-6">
                    {/* Title & Description */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                عنوان نیازسنجی <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="مثال: نیازسنجی مهارت‌های مدیریتی"
                                value={title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                توضیحات
                            </label>
                            <Input
                                placeholder="توضیحات مختصر درباره این نیازسنجی..."
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <Steps current={currentStep}>
                            {ASSESSMENT_STEPS.map((step, index) => (
                                <Steps.Item key={index} title={step.title} />
                            ))}
                        </Steps>
                    </div>

                    {/* Questions for Current Step */}
                    <div className="space-y-4 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {currentStepData.title}
                        </h3>
                        {currentStepData.questions.map((q, index) => (
                            <div
                                key={q.id}
                                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            {q.question}
                                        </label>
                                        <Input
                                            placeholder="پاسخ خود را وارد کنید..."
                                            value={answers[q.id] || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleAnswerChange(q.id, e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="plain"
                            icon={<HiOutlineArrowRight />}
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                        >
                            قبلی
                        </Button>

                        <div className="flex gap-3">
                            <Button
                                variant="plain"
                                onClick={() => navigate(`/owner/managers/${managerId}/assessment`)}
                                disabled={loading}
                            >
                                انصراف
                            </Button>

                            {isLastStep ? (
                                <Button
                                    variant="solid"
                                    icon={<HiOutlineCheck />}
                                    onClick={handleSubmit}
                                    loading={loading}
                                >
                                    {isEditMode ? 'ذخیره تغییرات' : 'ثبت نیازسنجی'}
                                </Button>
                            ) : (
                                <Button
                                    variant="solid"
                                    icon={<HiOutlineArrowLeft />}
                                    onClick={handleNext}
                                >
                                    بعدی
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default AssessmentForm
