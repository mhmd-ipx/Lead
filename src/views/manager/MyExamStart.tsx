import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Steps, Radio, Notification, toast, Input, Checkbox } from '@/components/ui'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { MdDragIndicator } from 'react-icons/md'
import Container from '@/components/shared/Container'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { apiGetExamQuestions, apiSubmitExam } from '@/services/ExamineeService'
import { useExaminerSessionStore } from '@/views/auth/SignIn/components/ExaminerSignInForm'
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheck } from 'react-icons/hi'
import Loading from '@/components/shared/Loading'
import QuestionFileImage from '@/components/exam-builder/components/QuestionFileImage'

const getOptionData = (opt: any) => {
    if (typeof opt === 'string') {
        try {
            const parsed = JSON.parse(opt);
            if (parsed.text !== undefined) return parsed;
        } catch (e) { }
        return { text: opt };
    }
    return opt || {};
}


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
                    // Initialize answers for ranking questions
                    const defaultAnswers: Record<number, string> = {};
                    questionsRes.data.sections?.forEach((sec: any) => {
                        sec.questions?.forEach((q: any) => {
                            if (q.type === 'order') {
                                defaultAnswers[q.id] = JSON.stringify(q.options || []);
                            }
                        })
                    })
                    setAnswers(prev => ({ ...prev, ...defaultAnswers }));
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
        const unansweredCount = allQuestions.filter((q: any) => {
            const ans = answers[q.id]
            if (!ans) return true
            if (q.type === 'check_box') {
                try { return JSON.parse(ans).length === 0 } catch { return true }
            }
            return false
        }).length

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
            // Build fully-structured answer JSON
            const unifiedAnswers = {
                exam_id: examDetails?.id,
                exam_title: examDetails?.title,
                sections: sections.map((section: any) => ({
                    section_id: section.id,
                    section_title: section.title,
                    questions: (section.questions || []).map((q: any, qIdx: number) => {
                        // Parse raw options from API (stored as JSON strings)
                        const rawOptions: any[] = q.options || []
                        const parsedOptions = rawOptions.map((opt: any, optIdx: number) => {
                            const data = getOptionData(opt)
                            return {
                                index: optIdx + 1,
                                text: data.text || '',
                                file_id: data.file_id || null
                            }
                        })

                        const rawAnswer = answers[q.id] || null

                        // Build type-aware answer structure
                        let answerPayload: any = null

                        if (q.type === 'descriptive') {
                            answerPayload = {
                                type: 'descriptive',
                                text: rawAnswer || ''
                            }

                        } else if (q.type === 'multiple_choice') {
                            // rawAnswer is the raw option string (same as in q.options)
                            const selectedIdx = rawOptions.findIndex((o: any) => o === rawAnswer)
                            const selectedData = rawAnswer ? getOptionData(rawAnswer) : null
                            answerPayload = {
                                type: 'multiple_choice',
                                selected_index: selectedIdx !== -1 ? selectedIdx + 1 : null,
                                selected_text: selectedData?.text || null,
                                selected_file_id: selectedData?.file_id || null
                            }

                        } else if (q.type === 'check_box') {
                            // rawAnswer is JSON array of selected indices (numbers)
                            let selectedIdxs: number[] = []
                            try { selectedIdxs = JSON.parse(rawAnswer || '[]') } catch { }
                            answerPayload = {
                                type: 'check_box',
                                selected_options: selectedIdxs.map(idx => {
                                    const opt = rawOptions[idx]
                                    const data = opt ? getOptionData(opt) : {}
                                    return {
                                        index: idx + 1,
                                        text: data.text || '',
                                        file_id: data.file_id || null
                                    }
                                })
                            }

                        } else if (q.type === 'mixed') {
                            // rawAnswer is JSON { selectedOption, descriptiveAnswer }
                            let mixedAns = { selectedOption: '', descriptiveAnswer: '' }
                            try { if (rawAnswer) mixedAns = JSON.parse(rawAnswer) } catch { }
                            const selectedIdx = rawOptions.findIndex((o: any) => o === mixedAns.selectedOption)
                            const selectedData = mixedAns.selectedOption ? getOptionData(mixedAns.selectedOption) : null
                            answerPayload = {
                                type: 'mixed',
                                selected_index: selectedIdx !== -1 ? selectedIdx + 1 : null,
                                selected_text: selectedData?.text || null,
                                selected_file_id: selectedData?.file_id || null,
                                descriptive_text: mixedAns.descriptiveAnswer || ''
                            }

                        } else if (q.type === 'order') {
                            // rawAnswer is JSON array of ordered option strings (user's ordering)
                            let orderedOpts: any[] = []
                            try { orderedOpts = JSON.parse(rawAnswer || '[]') } catch { }
                            answerPayload = {
                                type: 'order',
                                ordered_options: orderedOpts.map((opt: any, userPriority: number) => {
                                    const data = getOptionData(opt)
                                    const originalIdx = rawOptions.findIndex((o: any) => o === opt)
                                    return {
                                        user_priority: userPriority + 1,
                                        original_index: originalIdx !== -1 ? originalIdx + 1 : null,
                                        text: data.text || '',
                                        file_id: data.file_id || null
                                    }
                                })
                            }
                        }

                        return {
                            question_number: qIdx + 1,
                            question_id: q.id,
                            question_text: q.question,
                            question_file_id: q.file_id || null,
                            type: q.type,
                            options: parsedOptions,
                            answer: answerPayload
                        }
                    })
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
                                                <h4
                                                    className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed prose dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: q.question }}
                                                />
                                                {(q.file_id || q.file?.address) && (
                                                    <div className="mt-4">
                                                        <QuestionFileImage
                                                            fileId={q.file_id}
                                                            fallbackUrl={q.file?.address}
                                                            className="max-h-64 w-auto rounded-xl border object-contain shadow-sm"
                                                        />
                                                    </div>
                                                )}

                                            </div>
                                        </div>

                                        <div className="mr-14">
                                            {q.type === 'multiple_choice' && (
                                                <Radio.Group
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                                    value={answers[q.id]}
                                                    onChange={(val) => onAnswerChange(q.id, val)}
                                                >
                                                    {(q.options || []).map((option: any, optIndex: number) => {
                                                        const optData = getOptionData(option);
                                                        return (
                                                            <Radio
                                                                key={optIndex}
                                                                value={option}
                                                                className={`w-full p-4 border rounded-xl transition-all ${answers[q.id] === option
                                                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col gap-3 mt-1">
                                                                    {optData.text && (
                                                                        <span className="font-medium mr-2 text-gray-800 dark:text-gray-200 leading-relaxed">
                                                                            {optData.text}
                                                                        </span>
                                                                    )}
                                                                    {(optData.file_id || optData.image) && (
                                                                        <div className="mr-2">
                                                                            <QuestionFileImage
                                                                                fileId={optData.file_id}
                                                                                fallbackUrl={optData.image}
                                                                                className="max-h-40 w-auto rounded border shadow-sm object-contain"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Radio>
                                                        )
                                                    })}
                                                </Radio.Group>
                                            )}

                                            {q.type === 'check_box' && (() => {
                                                // Store selected INDICES (not option values) to avoid string comparison bugs
                                                let checkedIdxs: number[] = [];
                                                try {
                                                    if (answers[q.id]) {
                                                        const parsed = JSON.parse(answers[q.id]);
                                                        // Support both old format (array of options) and new format (array of indices)
                                                        if (Array.isArray(parsed)) {
                                                            if (parsed.length === 0) {
                                                                checkedIdxs = [];
                                                            } else if (typeof parsed[0] === 'number') {
                                                                // New format: array of indices
                                                                checkedIdxs = parsed;
                                                            } else {
                                                                // Old format: array of option strings - convert to indices
                                                                checkedIdxs = parsed.map((p: any) =>
                                                                    (q.options || []).findIndex((o: any) => o === p)
                                                                ).filter((i: number) => i !== -1);
                                                            }
                                                        }
                                                    }
                                                } catch(e) {}

                                                return (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(q.options || []).map((option: any, optIndex: number) => {
                                                            const optData = getOptionData(option);
                                                            const isChecked = checkedIdxs.includes(optIndex);

                                                            const toggleCheckbox = () => {
                                                                let newIdxs: number[];
                                                                if (isChecked) {
                                                                    newIdxs = checkedIdxs.filter(i => i !== optIndex);
                                                                } else {
                                                                    newIdxs = [...checkedIdxs, optIndex];
                                                                }
                                                                onAnswerChange(q.id, JSON.stringify(newIdxs));
                                                            };

                                                            return (
                                                                <div
                                                                    key={optIndex}
                                                                    onClick={toggleCheckbox}
                                                                    className={`w-full p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3 select-none ${isChecked
                                                                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
                                                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                                        }`}
                                                                >
                                                                    <div className={`mt-1 w-5 h-5 flex-shrink-0 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600'}`}>
                                                                        {isChecked && (
                                                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="flex flex-col gap-3 flex-1">
                                                                        {optData.text && (
                                                                            <span className="font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                                                                {optData.text}
                                                                            </span>
                                                                        )}
                                                                        {(optData.file_id || optData.image) && (
                                                                            <div>
                                                                                <QuestionFileImage
                                                                                    fileId={optData.file_id}
                                                                                    fallbackUrl={optData.image}
                                                                                    className="max-h-40 w-auto rounded border shadow-sm object-contain"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )
                                            })()}
                                            {q.type === 'descriptive' && (
                                                <div className="mt-4">
                                                    <Input
                                                        textArea
                                                        rows={5}
                                                        placeholder="پاسخ خود را اینجا بنویسید..."
                                                        value={answers[q.id] || ''}
                                                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                                                    />
                                                </div>
                                            )}

                                            {q.type === 'mixed' && (() => {
                                                let mixedAns = { selectedOption: '', descriptiveAnswer: '' };
                                                try {
                                                    if (answers[q.id]) mixedAns = JSON.parse(answers[q.id]);
                                                } catch(e) {}
                                                
                                                const setMixedAns = (newAns: Partial<typeof mixedAns>) => {
                                                    onAnswerChange(q.id, JSON.stringify({ ...mixedAns, ...newAns }));
                                                };

                                                return (
                                                    <div className="space-y-6 mt-4">
                                                        <Radio.Group
                                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                                            value={mixedAns.selectedOption}
                                                            onChange={(val) => setMixedAns({ selectedOption: val })}
                                                        >
                                                            {(q.options || []).map((option: any, optIndex: number) => {
                                                                const optData = getOptionData(option);
                                                                return (
                                                                    <Radio
                                                                        key={optIndex}
                                                                        value={option}
                                                                        className={`w-full p-4 border rounded-xl transition-all ${mixedAns.selectedOption === option
                                                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
                                                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                                            }`}
                                                                    >
                                                                        <div className="flex flex-col gap-3 mt-1">
                                                                            {optData.text && (
                                                                                <span className="font-medium mr-2 text-gray-800 dark:text-gray-200 leading-relaxed">
                                                                                    {optData.text}
                                                                                </span>
                                                                            )}
                                                                            {(optData.file_id || optData.image) && (
                                                                                <div className="mr-2">
                                                                                    <QuestionFileImage
                                                                                        fileId={optData.file_id}
                                                                                        fallbackUrl={optData.image}
                                                                                        className="max-h-40 w-auto rounded border shadow-sm object-contain"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </Radio>
                                                                )
                                                            })}
                                                        </Radio.Group>
                                                        
                                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">
                                                                پاسخ تشریحی (تکمیلی):
                                                            </label>
                                                            <Input
                                                                textArea
                                                                rows={4}
                                                                placeholder="توضیحات خود را اینجا بنویسید..."
                                                                value={mixedAns.descriptiveAnswer}
                                                                onChange={(e) => setMixedAns({ descriptiveAnswer: e.target.value })}
                                                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {q.type === 'order' && (() => {
                                                let currentOrder = q.options || [];
                                                try {
                                                    if (answers[q.id]) {
                                                        const parsed = JSON.parse(answers[q.id]);
                                                        if (Array.isArray(parsed)) currentOrder = parsed;
                                                    }
                                                } catch(e) {}

                                                return (
                                                    <div className="mt-4">
                                                        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-2 rounded-lg mb-4 inline-block">
                                                            گزینه‌ها را با کشیدن و رها کردن مرتب کنید
                                                        </div>
                                                        <DragDropContext onDragEnd={(result) => {
                                                            if (!result.destination) return;
                                                            const items = Array.from(currentOrder);
                                                            const [reorderedItem] = items.splice(result.source.index, 1);
                                                            items.splice(result.destination.index, 0, reorderedItem);
                                                            onAnswerChange(q.id, JSON.stringify(items));
                                                        }}>
                                                            <Droppable droppableId={`ranking-${q.id}`}>
                                                                {(provided) => (
                                                                    <div
                                                                        {...provided.droppableProps}
                                                                        ref={provided.innerRef}
                                                                        className="space-y-3"
                                                                    >
                                                                        {currentOrder.map((option: any, optIndex: number) => {
                                                                            const optData = getOptionData(option);
                                                                            const drgKey = typeof option === 'string' ? option : JSON.stringify(option);
                                                                            return (
                                                                                <Draggable key={drgKey} draggableId={drgKey} index={optIndex}>
                                                                                    {(provided) => (
                                                                                        <div
                                                                                            ref={provided.innerRef}
                                                                                            {...provided.draggableProps}
                                                                                            {...provided.dragHandleProps}
                                                                                            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-violet-400 dark:hover:border-violet-500 transition-colors cursor-move"
                                                                                        >
                                                                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold shrink-0 shadow-sm">
                                                                                                {optIndex + 1}
                                                                                            </div>
                                                                                            <MdDragIndicator className="text-gray-400 text-2xl shrink-0" />
                                                                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                                                {(optData.file_id || optData.image) && (
                                                                                                    <QuestionFileImage
                                                                                                        fileId={optData.file_id}
                                                                                                        fallbackUrl={optData.image}
                                                                                                        className="h-14 w-auto rounded-lg border shadow-sm object-contain shrink-0 bg-white"
                                                                                                    />
                                                                                                )}
                                                                                                {optData.text && (
                                                                                                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate text-base">
                                                                                                        {optData.text}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </Draggable>
                                                                            );
                                                                        })}
                                                                        {provided.placeholder}
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                        </DragDropContext>
                                                    </div>
                                                );
                                            })()}

                                            {!['multiple_choice', 'descriptive', 'check_box', 'mixed', 'order'].includes(q.type) && (
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
