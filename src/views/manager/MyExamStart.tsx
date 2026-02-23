import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Steps, Radio, Notification, toast } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { apiGetExamQuestions, apiSubmitExam } from '@/services/ExamineeService'
import { useExaminerSessionStore } from '@/views/auth/SignIn/components/ExaminerSignInForm'
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheck } from 'react-icons/hi'
import Loading from '@/components/shared/Loading'

const MyExamStart = () => {
    const { examId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const resultIdFromState = location.state?.resultId
    const { examData, setExamData } = useExaminerSessionStore()

    const [loading, setLoading] = useState(true)
    const [examDetails, setExamDetails] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const initExam = async () => {
            if (!examId) return

            try {
                // Get Questions
                const questionsRes = await apiGetExamQuestions(examId)
                if (questionsRes.success) {
                    setExamDetails(questionsRes.data)
                } else {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در دریافت سوالات آزمون
                        </Notification>
                    )
                }
            } catch (error) {
                console.error('Error initializing exam:', error)
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در دریافت اطلاعات آزمون. لطفاً دوباره تلاش کنید.
                    </Notification>
                )
            } finally {
                setLoading(false)
            }
        }

        initExam()
    }, [examId])

    const sections = useMemo(() => {
        return examDetails?.sections || []
    }, [examDetails])

    const handleNext = () => {
        if (currentStep < sections.length - 1) {
            setCurrentStep(currentStep + 1)
            window.scrollTo(0, 0)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
            window.scrollTo(0, 0)
        }
    }

    const onAnswerChange = (questionId: number, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }))
    }

    const handleSubmit = async () => {
        // Validation: Ensure all questions in all sections are answered
        const sections = examDetails.sections || []
        const allQuestions = sections.flatMap((s: any) => s.questions || [])
        const unansweredCount = allQuestions.filter((q: any) => !answers[q.id]).length

        if (unansweredCount > 0) {
            toast.push(
                <Notification title="هشدار" type="warning">
                    لطفاً به تمام سوالات ({unansweredCount} سوال باقیمانده) پاسخ دهید.
                </Notification>
            )
            return
        }

        if (!resultIdFromState) {
            toast.push(<Notification title="خطا" type="danger">آیدی نتیجه آزمون یافت نشد. لطفاً مجدداً از لیست شروع کنید.</Notification>)
            return
        }

        setSubmitting(true)
        try {
            // Construct the Unified JSON structure
            const unifiedAnswers = {
                exam_id: examDetails?.id,
                exam_title: examDetails?.title,
                sections: sections.map((section: any) => ({
                    section_id: section.id,
                    section_title: section.title,
                    questions: section.questions?.map((q: any) => ({
                        question_id: q.id,
                        question_text: q.question,
                        type: q.type,
                        options: q.options || [],
                        selected_answer: answers[q.id] || null,
                        category: q.category || null
                    }))
                }))
            }

            const response = await apiSubmitExam(resultIdFromState, unifiedAnswers)

            if (response.success) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        آزمون با موفقیت ثبت شد.
                    </Notification>
                )
                navigate('/manager/exams')
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'خطا در ثبت آزمون.'}
                    </Notification>
                )
            }
        } catch (error: any) {
            console.error('Error submitting exam:', error)
            const errorMsg = error?.response?.data?.message || 'خطا در برقراری ارتباط با سرور.'
            toast.push(
                <Notification title="خطا" type="danger">
                    {errorMsg}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <Loading loading={true} />
            </div>
        )
    }

    if (!examDetails) {
        return (
            <Container>
                <div className="mt-10 text-center">
                    <h3 className="text-xl font-bold">آزمون یافت نشد.</h3>
                    <Button className="mt-4" onClick={() => navigate('/manager/exams')}>بازگشت به لیست</Button>
                </div>
            </Container>
        )
    }

    const currentSection = sections[currentStep]
    const isLastStep = currentStep === sections.length - 1

    return (
        <Container>
            <div className="space-y-6 mt-4 pb-10">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                {examDetails.title}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                {examDetails.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-violet-50 dark:bg-violet-900/20 px-4 py-2 rounded-xl border border-violet-100 dark:border-violet-800">
                                <span className="text-xs text-violet-600 dark:text-violet-400 font-bold block uppercase">زمان باقی‌مانده</span>
                                <span className="text-lg font-black text-violet-700 dark:text-violet-300">--:--</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                {sections.length > 1 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
                        <Steps current={currentStep}>
                            {sections.map((section: any, index: number) => (
                                <Steps.Item key={index} title={section.title} />
                            ))}
                        </Steps>
                    </div>
                )}

                {/* Questions Area */}
                {sections.length > 0 && currentSection ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
                            <h2 className="text-xl font-black text-gray-800 dark:text-gray-200">
                                {currentSection.title}
                            </h2>
                        </div>

                        {currentSection.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                {currentSection.description}
                            </p>
                        )}

                        <div className="space-y-6">
                            {(currentSection.questions || []).map((q: any, index: number) => (
                                <Card
                                    key={q.id}
                                    className={`transition-all duration-300 ${answers[q.id]
                                        ? 'border-emerald-200 dark:border-emerald-800 ring-4 ring-emerald-50 dark:ring-emerald-900/10'
                                        : 'border-gray-100 dark:border-gray-700'
                                        }`}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${answers[q.id]
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
                                                    {q.question}
                                                </h4>
                                                {q.category && (
                                                    <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-md">
                                                        {q.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mr-14">
                                            {q.type === 'multiple_choice' && (
                                                <Radio.Group
                                                    vertical
                                                    className="space-y-2"
                                                    value={answers[q.id]}
                                                    onChange={(val) => onAnswerChange(q.id, val)}
                                                >
                                                    {(q.options || []).map((option: string, optIndex: number) => (
                                                        <Radio
                                                            key={optIndex}
                                                            value={option}
                                                            className={`w-full p-4 border rounded-xl transition-all ${answers[q.id] === option
                                                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
                                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                                }`}
                                                        >
                                                            <span className="font-medium mr-2">{option}</span>
                                                        </Radio>
                                                    ))}
                                                </Radio.Group>
                                            )}
                                            {q.type !== 'multiple_choice' && (
                                                <p className="text-amber-500 text-sm italic">این نوع سوال فعلاً پشتیبانی نمی‌شود.</p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-gray-500 font-bold">این آزمون فاقد سوال یا بخش است.</p>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowRight />}
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="rounded-xl"
                    >
                        مرحله قبلی
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            variant="plain"
                            onClick={() => {
                                if (confirm('آیا از خروج اطمینان دارید؟ پاسخ‌های شما ذخیره نمی‌شود.')) {
                                    navigate('/manager/exams')
                                }
                            }}
                            className="rounded-xl font-bold"
                        >
                            انصراف و خروج
                        </Button>

                        {isLastStep ? (
                            <Button
                                variant="solid"
                                icon={<HiOutlineCheck />}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-none shadow-lg px-8 rounded-xl"
                                onClick={handleSubmit}
                                loading={submitting}
                            >
                                ثبت و پایان آزمون
                            </Button>
                        ) : (
                            <Button
                                variant="solid"
                                icon={<HiOutlineArrowLeft />}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-none shadow-lg px-8 rounded-xl"
                                onClick={handleNext}
                            >
                                مرحله بعدی
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default MyExamStart
