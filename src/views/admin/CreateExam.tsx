import { useState, useRef } from 'react'
import { Card, Button, Input, Notification, toast } from '@/components/ui'
import { createExam } from '@/services/AdminService'
import { CreateExamRequest } from '@/@types/exam'
import { Form, FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { useForm } from 'react-hook-form'
import {
    HiOutlineClipboardCheck,
    HiOutlineClock,
    HiOutlineTag,
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineViewList,
    HiOutlineMenuAlt2,
    HiOutlineCheckCircle,
    HiOutlineStar,
    HiOutlineDotsVertical,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineSave,
    HiOutlineX,
    HiOutlineSelector,
    HiOutlineArrowLeft,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
    HiOutlineEye
} from 'react-icons/hi'
import { MdDragIndicator } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
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
    priority: number
    content: string
    questions: Question[]
    isExpanded: boolean
}

interface ExamFormData {
    title: string
    description: string
    questionCount: number
    duration: number
    passing_score: number
}

const CreateExam = () => {
    const navigate = useNavigate()
    const [sections, setSections] = useState<ExamSection[]>([])
    const [addingToSection, setAddingToSection] = useState<string | null>(null)
    const [questionViewModalOpen, setQuestionViewModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()
    const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null)
    const questionFormRef = useRef<QuestionFormRef>(null)

    const {
        handleSubmit,
        formState: { errors },
        register,
    } = useForm<ExamFormData>()

    const onSubmit = async (data: ExamFormData) => {
        // 1. Handle and Validate Open Question Form
        let currentQuestion: Question | null = null
        if (questionFormRef.current && (addingToSection || editingQuestion)) {
            currentQuestion = questionFormRef.current.save()
            if (!currentQuestion) {
                toast.push(
                    <Notification type="danger" title="خطا">
                        لطفا اطلاعات سوال در حال ویرایش را تکمیل کنید (عنوان، گزینه‌ها و ...)
                    </Notification>
                )
                return
            }
        }

        let finalSections = [...sections]

        // Apply current question to sections
        if (currentQuestion) {
            let targetSectionId = addingToSection
            if (!targetSectionId && editingQuestion) {
                const section = finalSections.find(s => s.questions.some(q => q.id === editingQuestion.id))
                if (section) targetSectionId = section.id
            }

            if (targetSectionId) {
                finalSections = finalSections.map(section => {
                    if (section.id === targetSectionId) {
                        const existingIndex = section.questions.findIndex(q => q.id === currentQuestion!.id)
                        let updatedQuestions = [...section.questions]
                        if (existingIndex !== -1) {
                            updatedQuestions[existingIndex] = currentQuestion!
                        } else {
                            updatedQuestions = [...updatedQuestions, { ...currentQuestion!, priority: updatedQuestions.length + 1 }]
                        }
                        return { ...section, questions: updatedQuestions }
                    }
                    return section
                })
            }
        }

        // 2. Validate Sections presence
        if (finalSections.length === 0) {
            toast.push(
                <Notification type="danger" title="خطا">
                    آزمون باید حداقل یک بخش داشته باشد
                </Notification>
            )
            return
        }

        // 3. Validate Section Content and Questions
        for (const section of finalSections) {
            // Check content (strip HTML)
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = section.content || ''
            const textContent = tempDiv.textContent || tempDiv.innerText || ''

            if (!textContent.trim() && !section.content?.includes('<img')) { // Allow if it has images even if no text
                toast.push(
                    <Notification type="danger" title="خطا">
                        لطفا توضیحات (محتوا) را برای بخش {section.priority} وارد کنید
                    </Notification>
                )
                return
            }

            if (section.questions.length === 0) {
                toast.push(
                    <Notification type="danger" title="خطا">
                        بخش {section.priority} باید حداقل یک سوال داشته باشد
                    </Notification>
                )
                return
            }
        }

        const totalQuestions = finalSections.reduce((acc, curr) => acc + curr.questions.length, 0)
        // Redundant global check but good for safety
        if (totalQuestions === 0) {
            toast.push(
                <Notification type="danger" title="خطا">
                    آزمون باید حداقل یک سوال داشته باشد
                </Notification>
            )
            return
        }

        try {
            const apiData: CreateExamRequest = {
                title: data.title,
                description: data.description || '',
                duration: Number(data.duration),
                passing_score: 1,
                status: 'draft',
                sections: finalSections.map(section => ({
                    title: `بخش ${section.priority}`,
                    description: section.content || '',
                    order: section.priority,
                    questions: section.questions.map(q => {
                        let options: string[] = []
                        let correctAnswer = ''
                        let mappedType = 'multiple_choice'

                        // Map frontend types to backend supported types (multiple_choice, true_false, descriptive)
                        if (q.type === 'multiple_choice' || q.type === 'mixed' || q.type === 'ranking') {
                            mappedType = 'multiple_choice'

                            if (q.type === 'multiple_choice' || q.type === 'mixed') {
                                options = q.options.map(o => o.text || '')
                                const correctOpt = q.options.find(o => o.isCorrect)
                                if (correctOpt) {
                                    correctAnswer = correctOpt.text
                                } else if (options.length > 0) {
                                    // Fallback: use first option if none marked correct
                                    correctAnswer = options[0]
                                }
                            } else if (q.type === 'ranking') {
                                options = q.options.map(o => o.text || '')
                                if (options.length > 0) {
                                    correctAnswer = options[0]
                                }
                            }
                        } else if (q.type === 'descriptive') {
                            mappedType = 'descriptive'
                            correctAnswer = '-'
                        }

                        return {
                            question: q.title,
                            type: mappedType as 'multiple_choice' | 'descriptive',
                            options: options.length > 0 ? options : null,
                            correct_answer: correctAnswer,
                            score: 1,
                            difficulty: 'easy',
                            category: 'general'
                        }
                    })
                }))
            }

            console.log('Sending Exam Data:', apiData)
            const response = await createExam(apiData)

            if (response.success) {
                toast.push(
                    <Notification type="success" title="موفقیت">
                        آزمون با موفقیت ایجاد شد
                    </Notification>
                )
                navigate('/admin/exams')
            }
        } catch (error) {
            console.error('Error creating exam:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    خطا در ایجاد آزمون
                </Notification>
            )
        }
    }

    const addSection = () => {
        const newSection: ExamSection = {
            id: Date.now().toString(),
            priority: sections.length + 1,
            content: '',
            questions: [],
            isExpanded: true,
        }
        setSections([...sections, newSection])
    }

    const toggleSection = (sectionId: string) => {
        setSections(sections.map(s =>
            s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
        ))
    }

    const deleteSection = (sectionId: string) => {
        if (confirm('آیا از حذف این بخش اطمینان دارید؟')) {
            const updatedSections = sections
                .filter(s => s.id !== sectionId)
                .map((s, index) => ({ ...s, priority: index + 1 }))
            setSections(updatedSections)
        }
    }

    const updateSectionContent = (sectionId: string, content: string) => {
        setSections(sections.map(s =>
            s.id === sectionId ? { ...s, content } : s
        ))
    }

    const openQuestionForm = (sectionId: string, question?: Question) => {
        // Auto-save any currently open form before switching
        if (addingToSection || editingQuestion) {
            triggerQuestionSave()
        }

        // Use timeout to ensure state updates from save don't conflict with opening new form
        setTimeout(() => {
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
        }, 50)
    }

    const handleSaveQuestion = (question: Question) => {
        let targetSectionId = addingToSection

        if (!targetSectionId && editingQuestion) {
            const section = sections.find(s => s.questions.some(q => q.id === editingQuestion.id))
            if (section) targetSectionId = section.id
        }

        if (!targetSectionId) return

        setSections(sections.map(section => {
            if (section.id === targetSectionId) {
                const existingIndex = section.questions.findIndex(q => q.id === question.id)

                if (existingIndex !== -1) {
                    return {
                        ...section,
                        questions: section.questions.map(q => q.id === question.id ? question : q)
                    }
                } else {
                    return {
                        ...section,
                        questions: [...section.questions, { ...question, priority: section.questions.length + 1 }]
                    }
                }
            }
            return section
        }))

        setAddingToSection(null)
        setEditingQuestion(undefined)
    }

    const triggerQuestionSave = (): boolean => {
        if (questionFormRef.current) {
            const questionData = questionFormRef.current.save()
            if (questionData) {
                handleSaveQuestion(questionData)
                return true
            }
        }
        return false
    }

    const handleAddNewQuestion = (sectionId: string) => {
        if (addingToSection === sectionId) {
            // If already editing in this section, save first then reset for new
            if (triggerQuestionSave()) {
                // If save was successful, reset for a new question
                setTimeout(() => {
                    setAddingToSection(sectionId)
                    setEditingQuestion(undefined)
                }, 0)
            }
        } else {
            // Open new form for this section
            openQuestionForm(sectionId)
        }
    }

    const cancelQuestionForm = () => {
        setAddingToSection(null)
        setEditingQuestion(undefined)
    }

    const deleteQuestionFromSection = (sectionId: string, questionId: string) => {
        if (confirm('آیا از حذف این سوال اطمینان دارید؟')) {
            setSections(sections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        questions: section.questions
                            .filter(q => q.id !== questionId)
                            .map((q, index) => ({ ...q, priority: index + 1 }))
                    }
                }
                return section
            }))
        }
    }

    const viewQuestion = (question: Question) => {
        setViewingQuestion(question)
        setQuestionViewModalOpen(true)
    }

    const handleDragEnd = (result: DropResult, sectionId: string) => {
        const { source, destination } = result
        if (!destination) return

        setSections(sections.map(section => {
            if (section.id === sectionId) {
                const newQuestions = [...section.questions]
                const [movedQuestion] = newQuestions.splice(source.index, 1)
                newQuestions.splice(destination.index, 0, movedQuestion)

                return {
                    ...section,
                    questions: newQuestions.map((q, index) => ({ ...q, priority: index + 1 }))
                }
            }
            return section
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* Header Section */}
            <div className="relative bg-blue-400 from-primary-600 to-primary-800 rounded-2xl shadow-xl overflow-hidden text-gray p-8">
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
                            افزودن آزمون جدید
                        </h1>
                        <p className="text-lg text-gray font-medium opacity-100 max-w-2xl leading-relaxed drop-shadow-sm">
                            ایجاد آزمون جدید و مدیریت سوالات
                        </p>
                    </div>
                </div>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Basic Info Card */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            اطلاعات پایه آزمون
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem
                                label="عنوان آزمون"
                                invalid={Boolean(errors.title)}
                                errorMessage={errors.title?.message}
                            >
                                <Input
                                    {...register('title', { required: 'عنوان آزمون الزامی است' })}
                                    placeholder="عنوان آزمون را وارد کنید"
                                />
                            </FormItem>

                            <FormItem
                                label="تعداد سوالات"
                                invalid={Boolean(errors.questionCount)}
                                errorMessage={errors.questionCount?.message}
                            >
                                <Input
                                    type="number"
                                    {...register('questionCount', {
                                        required: 'تعداد سوالات الزامی است',
                                        min: { value: 1, message: 'حداقل 1 سوال' }
                                    })}
                                    placeholder="0"
                                />
                            </FormItem>

                            <FormItem
                                label="مدت زمان (دقیقه)"
                                invalid={Boolean(errors.duration)}
                                errorMessage={errors.duration?.message}
                            >
                                <Input
                                    type="number"
                                    {...register('duration', {
                                        required: 'مدت زمان الزامی است',
                                        min: { value: 1, message: 'حداقل 1 دقیقه' }
                                    })}
                                    placeholder="0"
                                />
                            </FormItem>

                            <FormItem
                                label="توضیحات"
                                invalid={Boolean(errors.description)}
                            >
                                <Input
                                    {...register('description')}
                                    placeholder="توضیحات کوتاه"
                                />
                            </FormItem>


                        </div>
                    </div>
                </Card>

                {/* Sections */}
                {/* Sections */}
                <Card className="border border-gray-200 dark:border-gray-700 my-6">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                بخش‌های آزمون ({sections.length} بخش)
                            </h2>
                        </div>

                        <div className="relative mt-8">
                            {/* Connector Line */}
                            <div className="absolute top-0 bottom-0 right-6 md:right-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0 h-full"></div>

                            <div className="space-y-12">
                                {sections.map((section, index) => (
                                    <div key={section.id} className="relative z-10">
                                        {/* Step Header */}
                                        <div className="flex items-center gap-4 mb-6 group">
                                            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 z-10 relative">
                                                <span className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => toggleSection(section.id)}>
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                                        بخش {index + 1}
                                                    </h2>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1" dangerouslySetInnerHTML={{ __html: section.content || 'بدون توضیحات' }} />
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="plain"
                                                        shape="circle"
                                                        size="sm"
                                                        icon={<HiOutlineTrash />}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            deleteSection(section.id)
                                                        }}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    />
                                                    {section.isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section Content */}
                                        {section.isExpanded && (
                                            <div className="mr-8 md:mr-12 space-y-6">

                                                {/* Rich Text Editor for Content */}
                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                                                    <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                                        محتوای بخش (متن و تصویر)
                                                    </h6>
                                                    <RichTextEditor
                                                        content={section.content}
                                                        onChange={({ html }) => updateSectionContent(section.id, html || '')}
                                                    />
                                                </div>

                                                {/* Questions */}
                                                <div>
                                                    <div className="space-y-4">
                                                        <DragDropContext onDragEnd={(result) => handleDragEnd(result, section.id)}>
                                                            <Droppable droppableId={`section-${section.id}-questions`}>
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.droppableProps}
                                                                        className="space-y-4"
                                                                    >
                                                                        {section.questions.map((question, qIndex) => (
                                                                            <Draggable
                                                                                key={question.id}
                                                                                draggableId={question.id}
                                                                                index={qIndex}
                                                                                isDragDisabled={!!editingQuestion}
                                                                            >
                                                                                {(provided) => (
                                                                                    <div
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                    >
                                                                                        {editingQuestion?.id === question.id ? (
                                                                                            <div className="border-2 border-primary-500 rounded-xl p-4 bg-white dark:bg-gray-800">

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
                                                                                                <Card
                                                                                                    className="hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary-500 group"
                                                                                                    bodyClass="p-5"
                                                                                                >
                                                                                                    <div className="flex items-start gap-4">
                                                                                                        {/* Icons based on type */}
                                                                                                        <div className="flex-shrink-0 mt-1">
                                                                                                            {question.type === 'multiple_choice' && <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><HiOutlineCheckCircle /></div>}
                                                                                                            {question.type === 'descriptive' && <div className="p-2 bg-green-50 text-green-600 rounded-lg"><HiOutlineMenuAlt2 /></div>}
                                                                                                            {question.type === 'mixed' && <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><HiOutlineClipboardCheck /></div>}
                                                                                                            {question.type === 'ranking' && <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><HiOutlineStar /></div>}
                                                                                                        </div>

                                                                                                        <div className="flex-1">
                                                                                                            <div className="flex justify-between items-start mb-3">
                                                                                                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg line-clamp-2">
                                                                                                                    <span dangerouslySetInnerHTML={{ __html: question.title }}></span>
                                                                                                                </h3>
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                                                                                                        {question.type === 'multiple_choice' ? 'تستی' :
                                                                                                                            question.type === 'descriptive' ? 'تشریحی' :
                                                                                                                                question.type === 'mixed' ? 'تستی-تشریحی' : 'اولویت‌بندی'}
                                                                                                                    </span>

                                                                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                                                                                                        <div {...provided.dragHandleProps} className="cursor-move p-1 text-gray-400 hover:text-gray-600">
                                                                                                                            <HiOutlineSelector />
                                                                                                                        </div>
                                                                                                                        <Button
                                                                                                                            variant="plain"
                                                                                                                            shape="circle"
                                                                                                                            size="xs"
                                                                                                                            icon={<HiOutlineEye />}
                                                                                                                            onClick={() => viewQuestion(question)}
                                                                                                                            className="text-gray-500 hover:text-gray-600"
                                                                                                                        />
                                                                                                                        <Button
                                                                                                                            variant="plain"
                                                                                                                            shape="circle"
                                                                                                                            size="xs"
                                                                                                                            icon={<HiOutlinePencil />}
                                                                                                                            onClick={() => openQuestionForm(section.id, question)}
                                                                                                                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                                                                                        />
                                                                                                                        <Button
                                                                                                                            variant="plain"
                                                                                                                            shape="circle"
                                                                                                                            size="xs"
                                                                                                                            icon={<HiOutlineTrash />}
                                                                                                                            onClick={() => deleteQuestionFromSection(section.id, question.id)}
                                                                                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div className="text-sm text-gray-500 flex gap-4">
                                                                                                                {(question as any).options?.length > 0 && <span>{(question as any).options.length} گزینه</span>}
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
                                                    </div>

                                                    {/* Inline Question Form */}
                                                    {addingToSection === section.id && (
                                                        <div id={`question-form-${section.id}`} className="mt-4 border-2 border-primary-500 rounded-xl p-4 bg-white dark:bg-gray-800">

                                                            <QuestionForm
                                                                ref={questionFormRef}
                                                                onSave={handleSaveQuestion}
                                                                onCancel={cancelQuestionForm}
                                                                existingQuestion={undefined}
                                                                questionNumber={section.questions.length + 1}
                                                            />

                                                        </div>
                                                    )}

                                                    <div className="flex justify-center mt-4">
                                                        <Button
                                                            type="button"
                                                            variant="plain"
                                                            size="sm"
                                                            icon={<HiOutlinePlus />}
                                                            onClick={() => handleAddNewQuestion(section.id)}
                                                            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                                        >
                                                            افزودن سوال جدید
                                                        </Button>
                                                    </div>
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

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={() => navigate('/admin/exams')}
                    >
                        انصراف
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        icon={<HiOutlineSave />}
                    >
                        ذخیره آزمون
                    </Button>
                </div>
            </Form>

            {/* Question View Modal */}
            <QuestionViewModal
                isOpen={questionViewModalOpen}
                onClose={() => {
                    setQuestionViewModalOpen(false)
                    setViewingQuestion(null)
                }}
                question={viewingQuestion}
            />
        </div >
    )
}

export default CreateExam
