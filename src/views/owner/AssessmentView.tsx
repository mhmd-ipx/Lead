import { useEffect, useState } from 'react'
import { Card, Button, Tag, Steps, Tabs } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineArrowRight, HiOutlineDocumentText, HiOutlineChartBar, HiOutlineInformationCircle } from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'

const { TabNav, TabList, TabContent } = Tabs

interface AssessmentData {
    id: string
    title: string
    description: string
    status: 'pending' | 'completed'
    steps: StepData[]
    result?: AssessmentResult
}

interface StepData {
    title: string
    questions: AssessmentQuestion[]
}

interface AssessmentQuestion {
    id: string
    question: string
    answer: string
}

interface AssessmentResult {
    examSetId: string
    examSetTitle: string
    description: string
    exams: ExamInSet[]
}

interface ExamInSet {
    id: string
    title: string
    description: string
}

const AssessmentView = () => {
    const { managerId, assessmentId } = useParams<{ managerId: string; assessmentId: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [assessment, setAssessment] = useState<AssessmentData | null>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [activeTab, setActiveTab] = useState('assessment')

    useEffect(() => {
        if (managerId && assessmentId) {
            loadAssessment()
        }
    }, [managerId, assessmentId])

    const loadAssessment = async () => {
        try {
            // Mock data
            const mockAssessment: AssessmentData = {
                id: assessmentId || '',
                title: 'نیازسنجی مهارت‌های مدیریتی',
                description: 'ارزیابی مهارت‌های مدیریت پروژه و رهبری تیم',
                status: (assessmentId === 'assessment-001' || assessmentId === 'assess-001') ? 'completed' : 'pending',
                steps: [
                    {
                        title: 'اطلاعات پایه',
                        questions: [
                            { id: 'q1', question: 'سابقه کاری در حوزه مرتبط چند سال است؟', answer: '5 سال' },
                            { id: 'q2', question: 'بالاترین مدرک تحصیلی چیست؟', answer: 'کارشناسی ارشد مدیریت' },
                        ],
                    },
                    {
                        title: 'مهارت‌ها و تخصص',
                        questions: [
                            { id: 'q3', question: 'آیا دوره‌های تخصصی مرتبط گذرانده‌اید؟', answer: 'بله، دوره PMP و Scrum Master' },
                            { id: 'q4', question: 'آشنایی با ابزارهای مدیریت پروژه', answer: 'Jira, Asana, MS Project' },
                            { id: 'q5', question: 'چه مهارت‌هایی را می‌خواهید توسعه دهید؟', answer: 'مدیریت ریسک و مذاکره' },
                        ],
                    },
                    {
                        title: 'تجربه مدیریت',
                        questions: [
                            { id: 'q6', question: 'تعداد تیم تحت مدیریت', answer: 'حدود 10-15 نفر' },
                            { id: 'q7', question: 'نقاط قوت در محیط کاری', answer: 'رهبری، برنامه‌ریزی استراتژیک' },
                        ],
                    },
                    {
                        title: 'علایق و اهداف',
                        questions: [
                            { id: 'q8', question: 'علاقه‌مندی‌های اصلی شغلی', answer: 'مدیریت پروژه‌های بزرگ' },
                            { id: 'q9', question: 'اهداف شغلی کوتاه‌مدت و بلندمدت', answer: 'ارتقا به مدیر ارشد در 3 سال' },
                        ],
                    },
                ],
                result: (assessmentId === 'assessment-001' || assessmentId === 'assess-001') ? {
                    examSetId: 'examset-001',
                    examSetTitle: 'مجموعه آزمون مدیریت پروژه',
                    description: 'بر اساس نیازسنجی انجام شده، متقاضی نیاز به تقویت مهارت‌های زیر را دارد و باید آزمون‌های مربوطه را بگذراند.',
                    exams: [
                        {
                            id: 'exam-001',
                            title: 'آزمون مبانی مدیریت پروژه',
                            description: 'ارزیابی دانش پایه در مدیریت پروژه',
                        },
                        {
                            id: 'exam-002',
                            title: 'آزمون رهبری تیم',
                            description: 'بررسی مهارت‌های رهبری و مدیریت تیم',
                        },
                        {
                            id: 'exam-003',
                            title: 'آزمون مدیریت ریسک',
                            description: 'شناسایی و مدیریت ریسک‌های پروژه',
                        },
                    ],
                } : undefined,
            }

            setAssessment(mockAssessment)
        } catch (error) {
            console.error('Error loading assessment:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        if (currentStep < (assessment?.steps.length || 0) - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!assessment) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">نیازسنجی مورد نظر یافت نشد</p>
            </div>
        )
    }

    const currentStepData = assessment.steps[currentStep]

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
                            {assessment.title}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {assessment.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {assessment.status === 'completed' ? (
                        <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                            تکمیل شده
                        </Tag>
                    ) : (
                        <>
                            <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">
                                در انتظار
                            </Tag>
                            <Button
                                variant="default"
                                size="sm"
                                icon={<HiOutlinePencil />}
                                onClick={() => navigate(`/owner/managers/${managerId}/assessment/${assessmentId}/edit`)}
                            >
                                ویرایش
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Card>
                <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                    <TabList className="px-6 pt-4">
                        <TabNav value="assessment">
                            <div className="flex items-center gap-2">
                                <HiOutlineDocumentText />
                                <span>نیازسنجی</span>
                            </div>
                        </TabNav>
                        <TabNav value="result">
                            <div className="flex items-center gap-2">
                                <HiOutlineChartBar />
                                <span>نتیجه نیازسنجی</span>
                            </div>
                        </TabNav>
                    </TabList>

                    <div className="p-6">
                        {/* Assessment Tab */}
                        <TabContent value="assessment">
                            <div className="space-y-6">
                                {/* Steps Navigation */}
                                <Steps current={currentStep}>
                                    {assessment.steps.map((step, index) => (
                                        <Steps.Item
                                            key={index}
                                            title={step.title}
                                        />
                                    ))}
                                </Steps>

                                {/* Questions */}
                                {currentStepData && (
                                    <div className="space-y-4">
                                        {currentStepData.questions.map((q) => (
                                            <div
                                                key={q.id}
                                                className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                        <HiOutlineInformationCircle className="text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                            {q.question}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {q.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        variant="plain"
                                        icon={<HiOutlineArrowRight />}
                                        onClick={handlePrevious}
                                        disabled={currentStep === 0}
                                    >
                                        قبلی
                                    </Button>

                                    <Button
                                        variant="plain"
                                        icon={<HiOutlineArrowLeft />}
                                        onClick={handleNext}
                                        disabled={currentStep === assessment.steps.length - 1}
                                    >
                                        بعدی
                                    </Button>
                                </div>
                            </div>
                        </TabContent>

                        {/* Result Tab */}
                        <TabContent value="result">
                            {assessment.result ? (
                                <div className="space-y-6">
                                    {/* Exam Set Info */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800 lg:col-span-2">
                                            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                                {assessment.result.examSetTitle}
                                            </h3>
                                            <p className="text-sm text-purple-800 dark:text-purple-200 mb-4">
                                                {assessment.result.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-purple-700 dark:text-purple-300">📝</span>
                                                    <span className="text-purple-900 dark:text-purple-100">
                                                        {assessment.result.exams.length} آزمون
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-purple-700 dark:text-purple-300">⏰</span>
                                                    <span className="text-purple-900 dark:text-purple-100">
                                                        مدت زمان تخمینی: {assessment.result.exams.length * 30} دقیقه
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                                وضعیت آزمون
                                            </h3>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-blue-700 dark:text-blue-300">وضعیت:</span>
                                                    <Tag className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100 border-0">
                                                        تکمیل شده
                                                    </Tag>
                                                </div>
                                            </div>
                                            <Button
                                                variant="solid"
                                                className="w-full"
                                                onClick={() => navigate(`/owner/managers/${managerId}/exams/${assessment.result?.examSetId}/results`)}
                                            >
                                                مشاهده نتایج
                                            </Button>
                                        </Card>
                                    </div>

                                    {/* Exams List */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            لیست آزمون‌های مجموعه ({assessment.result.exams.length} آزمون)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {assessment.result.exams.map((exam, index) => (
                                                <div
                                                    key={exam.id}
                                                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                                {exam.title}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {exam.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        در انتظار تخصیص مجموعه آزمون توسط ادمین
                                    </p>
                                </div>
                            )}
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default AssessmentView
