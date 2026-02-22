import { useState, useEffect, useRef } from 'react'
import { Card, Button, Input, Notification, toast, Skeleton } from '@/components/ui'
import { getExam, updateExam, addExamSection, deleteExamSection, updateExamSection, addExamQuestion, updateExamQuestion, deleteExamQuestion } from '@/services/AdminService'
import { CreateExamRequest } from '@/@types/exam'
import { Form, FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { useForm } from 'react-hook-form'
import {
    HiOutlineClipboardCheck,
    HiOutlineArrowLeft,
    HiOutlineTrash,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
    HiOutlinePencil,
    HiOutlinePlus,
    HiOutlineSave,
    HiOutlineCheckCircle,
    HiOutlineMenuAlt2,
    HiOutlineStar,
    HiOutlineSelector,
    HiOutlineEye
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import type { Question } from '@/components/exam-builder/types/QuestionTypes'
import QuestionForm, { QuestionFormRef } from '@/components/exam-builder/components/QuestionForm'
import QuestionViewModal from '@/components/exam-builder/modals/QuestionViewModal'
import dayjs from 'dayjs'
import 'dayjs/locale/fa'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('fa')

interface ExamSection {
    id: string
    title: string
    priority: number
    content: string
    questions: Question[]
    isExpanded: boolean // Local UI state
    isNew?: boolean
}

interface ExamFormData {
    title: string
    description: string
    questionCount: number
    duration: number
    passing_score: number
}

const ExamDetails = () => {
    const { examId } = useParams<{ examId: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [sections, setSections] = useState<ExamSection[]>([])
    const [addingToSection, setAddingToSection] = useState<string | null>(null)
    const [questionViewModalOpen, setQuestionViewModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()
    const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null)
    const questionFormRef = useRef<QuestionFormRef>(null)

    // For editing section title locally before save
    const [editingSectionTitle, setEditingSectionTitle] = useState<{ id: string, title: string } | null>(null)

    const {
        handleSubmit,
        formState: { errors },
        register,
        setValue,
        getValues,
        control
    } = useForm<ExamFormData>()

    useEffect(() => {
        if (examId) {
            fetchExamData(examId)
        }
    }, [examId])

    const fetchExamData = async (id: string) => {
        try {
            setLoading(true)
            const response = await getExam(id)
            if (response.success && response.data) {
                const exam = response.data
                setValue('title', exam.title)
                setValue('description', exam.description)
                setValue('duration', exam.duration)
                setValue('passing_score', exam.passing_score)
                setValue('questionCount', exam.questions?.length || 0) // Approximation if API structure differs

                // Map sections
                if (exam.sections && Array.isArray(exam.sections)) {
                    const mappedSections = exam.sections.map((s: any) => ({
                        id: s.id.toString(),
                        title: s.title,
                        priority: s.order || 1,
                        content: s.description || '', // Mapping description to content as per API usage
                        isExpanded: false,
                        questions: s.questions ? s.questions.map((q: any) => ({
                            id: q.id.toString(),
                            title: q.question,
                            type: q.type,
                            options: q.options ? q.options.map((opt: string) => ({ text: opt })) : [],
                            score: q.score,
                            order: q.order
                            // ... other fields
                        })) : []
                    })).sort((a: any, b: any) => a.priority - b.priority)
                    setSections(mappedSections)
                }
            }
        } catch (error) {
            console.error('Error fetching exam:', error)
            toast.push(<Notification type="danger">خطا در دریافت اطلاعات آزمون</Notification>)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateExamInfo = async (data: ExamFormData) => {
        if (!examId) return
        try {
            await updateExam(examId, {
                title: data.title,
                description: data.description,
                duration: Number(data.duration),
                passing_score: 1, // Hardcoded as per previous request
                status: 'active' // Or keep existing? User request implied 'active' in JSON body
            })
            toast.push(<Notification type="success">اطلاعات آزمون بروزرسانی شد</Notification>)
        } catch (error) {
            toast.push(<Notification type="danger">خطا در بروزرسانی آزمون</Notification>)
        }
    }

    const addSection = () => {
        const newOrder = sections.length + 1
        const newSection: ExamSection = {
            id: `temp-${Date.now()}`,
            title: `بخش ${newOrder}`,
            priority: newOrder,
            content: '',
            questions: [],
            isExpanded: true,
            isNew: true
        }
        setSections([...sections, newSection])
    }

    const deleteSection = async (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId)
        if (!section) return

        if (section.isNew) {
            setSections(sections.filter(s => s.id !== sectionId))
            return
        }

        if (confirm('آیا از حذف این بخش اطمینان دارید؟')) {
            try {
                await deleteExamSection(sectionId)
                setSections(sections.filter(s => s.id !== sectionId))
                toast.push(<Notification type="success">بخش حذف شد</Notification>)
            } catch (error) {
                toast.push(<Notification type="danger">خطا در حذف بخش</Notification>)
            }
        }
    }

    const saveSectionChanges = async (section: ExamSection) => {
        if (!examId) return

        if (!section.title || !section.title.trim()) {
            toast.push(<Notification type="danger">عنوان بخش نمی‌تواند خالی باشد</Notification>)
            return
        }

        try {
            if (section.isNew) {
                // Create
                const response = await addExamSection(examId, {
                    title: section.title,
                    description: section.content,
                    order: section.priority
                })
                if (response.success && response.data) {
                    setSections(sections.map(s => s.id === section.id ? {
                        ...s,
                        id: response.data.id.toString(),
                        isNew: false
                    } : s))
                    toast.push(<Notification type="success">بخش ایجاد شد</Notification>)
                }
            } else {
                // Update
                await updateExamSection(section.id, {
                    title: section.title,
                    description: section.content,
                    order: section.priority
                })
                toast.push(<Notification type="success">تغییرات بخش ذخیره شد</Notification>)
            }
        } catch (error) {
            toast.push(<Notification type="danger">خطا در ذخیره بخش</Notification>)
        }
    }

    const toggleSection = (sectionId: string) => {
        setSections(sections.map(s =>
            s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
        ))
    }

    const updateSectionState = (sectionId: string, updates: Partial<ExamSection>) => {
        setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s))
    }

    // Question Handlers (Placeholder / Local State for UI only, as API is pending)
    const openQuestionForm = (sectionId: string, question?: Question) => {
        // Just UI logic for now
        if (question) {
            setEditingQuestion(question)
            setAddingToSection(null)
        } else {
            setAddingToSection(sectionId)
            setEditingQuestion(undefined)
            setTimeout(() => {
                const formElement = document.getElementById(`question-form-${sectionId}`)
                if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }, 100)
        }
    }

    const handleSaveQuestion = async (question: Question) => {
        try {
            let targetSectionId = addingToSection
            if (!targetSectionId && editingQuestion) {
                // Check if we can find the section for the editing question
                const section = sections.find(s => s.questions.some(q => q.id === editingQuestion.id))
                if (section) targetSectionId = section.id
            }

            if (!targetSectionId) return

            const section = sections.find(s => s.id === targetSectionId)
            if (!section) return

            // Prepare payload
            const order = question.priority || (editingQuestion ? editingQuestion.priority : section.questions.length + 1)

            let options: string[] = []
            let correctAnswer = '-'

            // Map frontend types to backend supported types (multiple_choice, descriptive)
            if (question.type === 'multiple_choice' || question.type === 'mixed' || question.type === 'ranking') {
                const qOptions = (question as any).options || []
                options = qOptions.map((o: any) => o.text)

                const correctOpt = qOptions.find((o: any) => o.isCorrect)
                if (correctOpt) {
                    correctAnswer = correctOpt.text
                } else if (options.length > 0) {
                    correctAnswer = options[0]
                }
            }

            const payload = {
                question: question.title,
                type: question.type === 'descriptive' ? 'descriptive' : 'multiple_choice',
                options: options.length > 0 ? options : null,
                correct_answer: correctAnswer,
                score: question.score,
                difficulty: 'medium', // Default
                category: 'general',   // Default
                order: order
            }

            if (editingQuestion && editingQuestion.id) {
                // Update existing
                await updateExamQuestion(editingQuestion.id, payload)

                setSections(sections.map(s => {
                    if (s.id === targetSectionId) {
                        return {
                            ...s,
                            questions: s.questions.map(q => q.id === editingQuestion.id ? { ...question, id: q.id, priority: order } : q)
                        }
                    }
                    return s
                }))
                toast.push(<Notification type="success">سوال بروزرسانی شد</Notification>)
            } else {
                // Add new
                const response = await addExamQuestion(targetSectionId, payload)
                if (response && response.data) {
                    const newPriority = response.data.order || order
                    // Explicitly construct new question with type
                    const newQuestion = {
                        ...question,
                        id: response.data.id.toString(),
                        priority: newPriority
                    } as Question

                    setSections(sections.map(s => {
                        if (s.id === targetSectionId) {
                            return { ...s, questions: [...s.questions, newQuestion] }
                        }
                        return s
                    }))
                    toast.push(<Notification type="success">سوال جدید اضافه شد</Notification>)
                }
            }
            setAddingToSection(null)
            setEditingQuestion(undefined)
        } catch (error) {
            console.error(error)
            toast.push(<Notification type="danger">خطا در ذخیره سوال</Notification>)
        }
    }


    const cancelQuestionForm = () => {
        setAddingToSection(null)
        setEditingQuestion(undefined)
    }

    const deleteQuestionFromSection = async (sectionId: string, questionId: string) => {
        if (confirm('آیا از حذف این سوال اطمینان دارید؟')) {
            try {
                await deleteExamQuestion(questionId)
                setSections(sections.map(s => s.id === sectionId ? { ...s, questions: s.questions.filter(q => q.id !== questionId) } : s))
                toast.push(<Notification type="success">سوال حذف شد</Notification>)
            } catch (error) {
                toast.push(<Notification type="danger">خطا در حذف سوال</Notification>)
            }
        }
    }

    // Stub for trigger
    const triggerQuestionSave = () => false
    const handleAddNewQuestion = (sectionId: string) => {
        openQuestionForm(sectionId)
    }
    const viewQuestion = (question: Question) => {
        setViewingQuestion(question)
        setQuestionViewModalOpen(true)
    }
    const handleDragEnd = (result: DropResult, sectionId: string) => {
        // Reorder logic (local only for now)
    }


    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden p-8 h-48 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col gap-4">
                        <Skeleton width={100} height={40} className="mb-2" />
                        <Skeleton width={300} height={40} />
                        <Skeleton width={200} />
                    </div>
                </div>

                {/* Form Skeleton */}
                <Card>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton width={150} height={24} />
                            <Skeleton width={120} height={36} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton width={100} height={20} />
                                <Skeleton height={44} />
                            </div>
                            <div className="space-y-2">
                                <Skeleton width={100} height={20} />
                                <Skeleton height={44} />
                            </div>
                            <div className="space-y-2">
                                <Skeleton width={100} height={20} />
                                <Skeleton height={44} />
                            </div>
                            <div className="space-y-2">
                                <Skeleton width={100} height={20} />
                                <Skeleton height={44} />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Sections Skeleton */}
                <Card className="border border-gray-200 dark:border-gray-700 my-6">
                    <div className="p-6">
                        <Skeleton width={200} height={24} className="mb-8" />

                        <div className="relative mt-8">
                            <div className="space-y-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton variant="circle" width={64} height={64} />
                                        <div className="flex-1 p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-2 w-full">
                                                    <Skeleton width="40%" height={24} />
                                                    <Skeleton width="70%" />
                                                </div>
                                                <Skeleton width={80} height={32} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div id="admin-exam-details-header" className="relative bg-blue-400 from-primary-600 to-primary-800 rounded-2xl shadow-xl overflow-hidden text-gray p-8">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <HiOutlineClipboardCheck className="w-64 h-64 transform rotate-12 translate-x-16 -translate-y-16" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Button
                            variant="plain"
                            className="text-white hover:bg-white/20 mb-2"
                            icon={<HiOutlineArrowLeft className="text-white" />}
                            onClick={() => navigate('/admin/exams')}
                        >
                            بازگشت
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-balck ">
                            {getValues('title') || 'جزئیات آزمون'}
                        </h1>
                        <p className="text-lg text-gray font-medium opacity-100 max-w-2xl leading-relaxed drop-shadow-sm">
                            مدیریت و ویرایش آزمون
                        </p>
                    </div>
                </div>
            </div>

            <Form onSubmit={handleSubmit(handleUpdateExamInfo)}>
                <Card>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                اطلاعات پایه آزمون
                            </h2>
                            <Button type="submit" variant="solid" size="sm" icon={<HiOutlineSave />}>
                                ذخیره تغییرات کلی
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem label="عنوان آزمون" invalid={Boolean(errors.title)} errorMessage={errors.title?.message}>
                                <Input {...register('title', { required: 'الزامی' })} />
                            </FormItem>
                            <FormItem label="تعداد سوالات (نمایشی)" invalid={Boolean(errors.questionCount)}>
                                <Input {...register('questionCount')} readOnly disabled className="bg-gray-100" />
                            </FormItem>
                            <FormItem label="مدت زمان (دقیقه)" invalid={Boolean(errors.duration)} errorMessage={errors.duration?.message}>
                                <Input type="number" {...register('duration', { required: 'الزامی' })} />
                            </FormItem>
                            <FormItem label="توضیحات">
                                <Input {...register('description')} />
                            </FormItem>
                        </div>
                    </div>
                </Card>
            </Form>

            <Card id="admin-exam-details-sections" className="border border-gray-200 dark:border-gray-700 my-6">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            بخش‌های آزمون ({sections.length} بخش)
                        </h2>
                    </div>

                    <div className="relative mt-8">
                        <div className="absolute top-0 bottom-0 right-6 md:right-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0 h-full"></div>
                        <div className="space-y-12">
                            {sections.map((section, index) => (
                                <div key={section.id} className="relative z-10">
                                    {/* Header */}
                                    <div className="flex items-center gap-4 mb-6 group">
                                        <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 z-10 relative">
                                            <span className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => toggleSection(section.id)}>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                                    {section.title}
                                                </h2>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1" dangerouslySetInnerHTML={{ __html: section.content || 'بدون توضیحات' }} />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="plain" shape="circle" size="sm" icon={<HiOutlineTrash />} onClick={(e) => { e.stopPropagation(); deleteSection(section.id) }} className="text-red-500 hover:text-red-600 hover:bg-red-50" />
                                                {section.isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    {section.isExpanded && (
                                        <div className="mr-8 md:mr-12 space-y-6">
                                            {/* Edit Section Form */}
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        ویرایش بخش
                                                    </h6>
                                                    <Button size="xs" variant="solid" onClick={() => saveSectionChanges(section)}>
                                                        {section.isNew ? 'ایجاد بخش' : 'ذخیره تغییرات بخش'}
                                                    </Button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm">عنوان بخش</label>
                                                        <Input value={section.title} onChange={(e) => updateSectionState(section.id, { title: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm mb-1 block">محتوا</label>
                                                        <RichTextEditor content={section.content} onChange={({ html }) => updateSectionState(section.id, { content: html })} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Questions List (Read Only / Mock) */}
                                            <div>
                                                <DragDropContext onDragEnd={(r) => handleDragEnd(r, section.id)}>
                                                    <Droppable droppableId={`section-${section.id}-questions`}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                                                                {section.questions.map((question, qIndex) => (
                                                                    <Draggable key={question.id || `temp-${qIndex}`} draggableId={question.id || `temp-${qIndex}`} index={qIndex} isDragDisabled={true}>
                                                                        {(provided) => (
                                                                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                                                                {editingQuestion?.id === question.id && question.id ? (
                                                                                    <div className="border-2 border-primary-500 rounded-xl p-4 bg-white">
                                                                                        <QuestionForm
                                                                                            ref={questionFormRef}
                                                                                            onSave={handleSaveQuestion}
                                                                                            onCancel={cancelQuestionForm}
                                                                                            existingQuestion={editingQuestion}
                                                                                            questionNumber={qIndex + 1}
                                                                                        />
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="relative group">
                                                                                        <Card className="hover:shadow-md border-l-4 border-l-transparent hover:border-l-primary-500 group" bodyClass="p-5">
                                                                                            <div className="flex items-start gap-4">
                                                                                                <div className="flex-1">
                                                                                                    <h3 className="font-semibold text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: question.title }}></h3>
                                                                                                    <div className="flex items-center gap-2 mt-2">
                                                                                                        <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                                                                                                            {question.type === 'multiple_choice' ? 'تستی' : 'تشریحی'}
                                                                                                        </span>
                                                                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                            <Button size="xs" variant="plain" icon={<HiOutlinePencil />} onClick={() => openQuestionForm(section.id, question)} />
                                                                                                            <Button size="xs" variant="plain" icon={<HiOutlineTrash />} onClick={() => deleteQuestionFromSection(section.id, question.id!)} className="text-red-500" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </Card>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                </DragDropContext>

                                                {/* Inline Add Question */}
                                                {addingToSection === section.id && (
                                                    <div className="mt-4 border-2 border-primary-500 rounded-xl p-4 bg-white">
                                                        <QuestionForm
                                                            ref={questionFormRef}
                                                            onSave={handleSaveQuestion}
                                                            onCancel={cancelQuestionForm}
                                                            existingQuestion={undefined}
                                                            questionNumber={section.questions.length + 1}
                                                        />
                                                    </div>
                                                )}

                                                {!section.isNew && (
                                                    <div className="flex justify-center mt-4">
                                                        <Button variant="plain" size="sm" icon={<HiOutlinePlus />} onClick={() => handleAddNewQuestion(section.id)}>
                                                            افزودن سوال جدید
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add Section Button */}
                            <div className="flex justify-center md:mr-12 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-primary-400 transition-colors cursor-pointer group" onClick={addSection}>
                                <div className="text-center text-gray-500 group-hover:text-primary-600 transition-colors">
                                    <HiOutlinePlus className="mx-auto text-2xl mb-1 text-blue-600" />
                                    <span className="font-medium text-blue-600">افزودن بخش جدید</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <QuestionViewModal isOpen={questionViewModalOpen} onClose={() => { setQuestionViewModalOpen(false); setViewingQuestion(null) }} question={viewingQuestion} />
        </div>
    )
}

export default ExamDetails
