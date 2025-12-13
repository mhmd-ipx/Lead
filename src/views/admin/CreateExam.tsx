import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { Form, FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { useForm } from 'react-hook-form'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineArrowLeft, HiOutlineSave, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi'
import { MdDragIndicator } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import type { Question } from '@/components/exam-builder/types/QuestionTypes'
import QuestionForm from '@/components/exam-builder/components/QuestionForm'
import QuestionViewModal from '@/components/exam-builder/modals/QuestionViewModal'
import QuestionItem from '@/components/exam-builder/components/QuestionItem'

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
}

const CreateExam = () => {
    const navigate = useNavigate()
    const [sections, setSections] = useState<ExamSection[]>([])
    const [addingToSection, setAddingToSection] = useState<string | null>(null)
    const [questionViewModalOpen, setQuestionViewModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()
    const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null)

    const {
        handleSubmit,
        formState: { errors },
        register,
    } = useForm<ExamFormData>()

    const onSubmit = (data: ExamFormData) => {
        console.log('Exam Data:', data)
        console.log('Sections:', sections)
        alert('آزمون ذخیره شد')
        navigate('/admin/exams')
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
        setAddingToSection(sectionId)
        setEditingQuestion(question)

        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById(`question-form-${sectionId}`)
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 100)
    }

    const handleSaveQuestion = (question: Question) => {
        if (!addingToSection) return

        setSections(sections.map(section => {
            if (section.id === addingToSection) {
                const existingIndex = section.questions.findIndex(q => q.id === question.id)

                if (existingIndex !== -1) {
                    // Update existing question
                    return {
                        ...section,
                        questions: section.questions.map(q => q.id === question.id ? question : q)
                    }
                } else {
                    // Add new question
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
            <div className="flex items-center gap-4">
                <Button
                    variant="plain"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/admin/exams')}
                >
                    بازگشت
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        افزودن آزمون جدید
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        ایجاد آزمون جدید با فرم‌ساز
                    </p>
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
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                بخش‌های آزمون ({sections.length} بخش)
                            </h2>
                            <Button
                                type="button"
                                variant="solid"
                                size="sm"
                                icon={<HiOutlinePlus />}
                                onClick={addSection}
                            >
                                افزودن بخش
                            </Button>
                        </div>

                        {sections.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">
                                    هنوز بخشی اضافه نشده است
                                </p>
                                <Button
                                    type="button"
                                    variant="plain"
                                    size="sm"
                                    icon={<HiOutlinePlus />}
                                    onClick={addSection}
                                    className="mt-4"
                                >
                                    افزودن اولین بخش
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sections.map((section) => (
                                    <Card key={section.id} className="border border-gray-200 dark:border-gray-700">
                                        {/* Section Header */}
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            onClick={() => toggleSection(section.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center">
                                                    {section.priority}
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    بخش {section.priority}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    ({section.questions.length} سوال)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="plain"
                                                    size="xs"
                                                    icon={<HiOutlineTrash />}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteSection(section.id)
                                                    }}
                                                    className="text-red-600 hover:text-red-700"
                                                />
                                                {section.isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                                            </div>
                                        </div>

                                        {/* Section Content */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${section.isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                        >
                                            <div className="p-6 pt-4 space-y-6 border-t border-gray-200 dark:border-gray-700">
                                                {/* Rich Text Editor for Content */}
                                                <div>
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
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            سوالات بخش
                                                        </h6>
                                                        {addingToSection !== section.id && (
                                                            <Button
                                                                type="button"
                                                                variant="solid"
                                                                size="xs"
                                                                icon={<HiOutlinePlus />}
                                                                onClick={() => openQuestionForm(section.id)}
                                                            >
                                                                افزودن سوال
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Question Form - Inline */}
                                                    {addingToSection === section.id && (
                                                        <div id={`question-form-${section.id}`} className="mb-4">
                                                            <QuestionForm
                                                                onSave={handleSaveQuestion}
                                                                onCancel={cancelQuestionForm}
                                                                existingQuestion={editingQuestion}
                                                                questionNumber={section.questions.length + 1}
                                                            />
                                                        </div>
                                                    )}

                                                    {section.questions.length === 0 && addingToSection !== section.id ? (
                                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                سوالی اضافه نشده است
                                                            </p>
                                                        </div>
                                                    ) : section.questions.length > 0 ? (
                                                        <DragDropContext onDragEnd={(result) => handleDragEnd(result, section.id)}>
                                                            <Droppable droppableId={`section-${section.id}-questions`}>
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.droppableProps}
                                                                        className="space-y-3"
                                                                    >
                                                                        {section.questions.map((question, qIndex) => (
                                                                            <Draggable
                                                                                key={question.id}
                                                                                draggableId={question.id}
                                                                                index={qIndex}
                                                                            >
                                                                                {(provided) => (
                                                                                    <div
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                    >
                                                                                        <QuestionItem
                                                                                            question={question}
                                                                                            onEdit={() => openQuestionForm(section.id, question)}
                                                                                            onDelete={() => deleteQuestionFromSection(section.id, question.id)}
                                                                                            onView={() => viewQuestion(question)}
                                                                                            dragHandleProps={provided.dragHandleProps}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </Draggable>
                                                                        ))}
                                                                        {provided.placeholder}
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                        </DragDropContext>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
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
        </div>
    )
}

export default CreateExam
