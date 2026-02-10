import { useEffect, useState } from 'react'
import { Card, Badge, Tag, Skeleton, Avatar, Button, Input, Select, Switcher, Dialog, Notification, toast } from '@/components/ui'
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
    HiOutlineSelector
} from 'react-icons/hi'
import {
    getAssessmentTemplate,
    createAssessmentStep,
    updateAssessmentStep,
    deleteAssessmentStep,
    createAssessmentQuestion,
    updateAssessmentQuestion,
    deleteAssessmentQuestion
} from '@/services/AdminService'
import { AssessmentTemplate, AssessmentStep, AssessmentQuestion } from '@/@types/assessment'
import dayjs from 'dayjs'
import 'dayjs/locale/fa'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('fa')

const AssessmentForms = () => {
    const [template, setTemplate] = useState<AssessmentTemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Edit states
    const [editingStepId, setEditingStepId] = useState<number | null>(null)
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)

    // Form data states
    const [stepFormData, setStepFormData] = useState<Partial<AssessmentStep>>({})
    const [questionFormData, setQuestionFormData] = useState<Partial<AssessmentQuestion>>({})

    // New item states
    const [newStepMode, setNewStepMode] = useState(false)
    const [newQuestionStepId, setNewQuestionStepId] = useState<number | null>(null)

    // Delete confirmation
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean
        type: 'step' | 'question'
        id: number | null
        title: string
    }>({
        isOpen: false,
        type: 'step',
        id: null,
        title: ''
    })

    useEffect(() => {
        loadTemplate()
    }, [refreshTrigger])

    const loadTemplate = async () => {
        try {
            setLoading(true)
            const data = await getAssessmentTemplate(1)
            setTemplate(data)
        } catch (error) {
            console.error('Error loading template:', error)
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در بارگذاری فرم
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    const refreshData = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    // --- Step Actions ---

    const handleEditStep = (step: AssessmentStep) => {
        setEditingStepId(step.id)
        setStepFormData({
            title: step.title,
            description: step.description,
            order: step.order
        })
        setNewStepMode(false)
    }

    const handleSaveStep = async () => {
        if (!stepFormData.title) {
            toast.push(<Notification title="خطا" type="danger">عنوان مرحله الزامی است</Notification>)
            return
        }

        try {
            if (newStepMode) {
                await createAssessmentStep({
                    ...stepFormData,
                    order: (template?.steps.length || 0) + 1
                })
                toast.push(<Notification title="موفقیت" type="success">مرحله با موفقیت ایجاد شد</Notification>)
            } else if (editingStepId) {
                await updateAssessmentStep(editingStepId, stepFormData)
                toast.push(<Notification title="موفقیت" type="success">مرحله با موفقیت ویرایش شد</Notification>)
            }

            setEditingStepId(null)
            setNewStepMode(false)
            setStepFormData({})
            refreshData()
        } catch (error) {
            console.error('Error saving step:', error)
            toast.push(<Notification title="خطا" type="danger">خطا در ذخیره مرحله</Notification>)
        }
    }

    const handleDeleteStepClick = (step: AssessmentStep) => {
        setDeleteDialog({
            isOpen: true,
            type: 'step',
            id: step.id,
            title: `آیا از حذف مرحله "${step.title}" اطمینان دارید؟`
        })
    }

    // --- Question Actions ---

    const handleEditQuestion = (question: AssessmentQuestion) => {
        setEditingQuestionId(question.id)
        setQuestionFormData({
            ...question,
            options: question.options ? [...question.options] : []
        })
        setNewQuestionStepId(null)
    }

    const handleAddQuestionClick = (stepId: number) => {
        setNewQuestionStepId(stepId)
        setEditingQuestionId(null) // Ensure no other edit is open
        const step = template?.steps.find(s => s.id === stepId)
        const currentQuestionsCount = step?.questions?.length || 0
        setQuestionFormData({
            stepId: stepId,
            question: '',
            type: 'text',
            required: true,
            order: currentQuestionsCount + 1,
            options: []
        })
    }

    const handleSaveQuestion = async () => {
        if (!questionFormData.question) {
            toast.push(<Notification title="خطا" type="danger">متن سوال الزامی است</Notification>)
            return
        }


        // Filter out empty options
        const updatedFormData = {
            ...questionFormData,
            // Enforce required: true for all questions as requested
            required: true,
            options: questionFormData.options ? questionFormData.options.filter(o => o.trim() !== '') : []
        }

        try {
            if (newQuestionStepId) {
                await createAssessmentQuestion(updatedFormData)
                toast.push(<Notification title="موفقیت" type="success">سوال با موفقیت ایجاد شد</Notification>)
            } else if (editingQuestionId) {
                await updateAssessmentQuestion(editingQuestionId, updatedFormData)
                toast.push(<Notification title="موفقیت" type="success">سوال با موفقیت ویرایش شد</Notification>)
            }

            setEditingQuestionId(null)
            setNewQuestionStepId(null)
            setQuestionFormData({})
            refreshData()
        } catch (error) {
            console.error('Error saving question:', error)
            toast.push(<Notification title="خطا" type="danger">خطا در ذخیره سوال</Notification>)
        }
    }

    const handleDeleteQuestionClick = (question: AssessmentQuestion) => {
        setDeleteDialog({
            isOpen: true,
            type: 'question',
            id: question.id,
            title: `آیا از حذف سوال "${question.question}" اطمینان دارید؟`
        })
    }

    // --- Common ---

    const confirmDelete = async () => {
        try {
            if (deleteDialog.type === 'step' && deleteDialog.id) {
                await deleteAssessmentStep(deleteDialog.id)
                toast.push(<Notification title="موفقیت" type="success">مرحله با موفقیت حذف شد</Notification>)
            } else if (deleteDialog.type === 'question' && deleteDialog.id) {
                await deleteAssessmentQuestion(deleteDialog.id)
                toast.push(<Notification title="موفقیت" type="success">سوال با موفقیت حذف شد</Notification>)
            }
            refreshData()
        } catch (error) {
            console.error('Error deleting item:', error)
            toast.push(<Notification title="خطا" type="danger">خطا در حذف آیتم</Notification>)
        } finally {
            setDeleteDialog(prev => ({ ...prev, isOpen: false }))
        }
    }

    const handleCancel = () => {
        setEditingStepId(null)
        setEditingQuestionId(null)
        setNewStepMode(false)
        setNewQuestionStepId(null)
        setStepFormData({})
        setQuestionFormData({})
    }

    const handleOptionsChange = (newOptions: string[]) => {
        setQuestionFormData(prev => ({ ...prev, options: newOptions }))
    }

    if (loading && !template) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                {/* ... loading spinner ... */}
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-600">
                        <HiOutlineClipboardCheck className="text-xl" />
                    </div>
                </div>
                <p className="text-gray-500 font-medium">در حال بارگذاری فرم...</p>
            </div>
        )
    }

    if (!template && !loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] text-center">
                {/* ... error view ... */}
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4 shadow-inner">
                    <HiOutlineClipboardCheck className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">فرمی یافت نشد</h3>
            </div>
        )
    }

    return (
        <div className="w-full space-y-8 pb-10">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl overflow-hidden text-gray p-8">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <HiOutlineClipboardCheck className="w-64 h-64 transform rotate-12 translate-x-16 -translate-y-16" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="text-gray text-sm flex items-center gap-1 font-medium bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                            <HiOutlineClock className="text-lg" />
                            <span>آخرین بروزرسانی: {dayjs(template?.updatedAt).fromNow()}</span>
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-balck ">
                        {template?.name}
                    </h1>
                    <p className="text-lg text-gray font-medium opacity-100 max-w-2xl leading-relaxed drop-shadow-sm">
                        {template?.description}
                    </p>
                </div>
            </div>
            {/* Steps & Questions */}
            <div className="relative">
                {/* Connector Line */}
                <div className="absolute top-0 bottom-0 right-6 md:right-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0 h-full"></div>

                <div className="space-y-12">
                    {template?.steps?.map((step, stepIndex) => (
                        <div key={step.id} className="relative z-10">
                            {/* Step Header */}
                            {editingStepId === step.id ? (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-primary-500 mb-6 animate-fade-in-up">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <HiOutlinePencil /> ویرایش مرحله
                                    </h3>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">عنوان مرحله</label>
                                            <Input
                                                value={stepFormData.title || ''}
                                                onChange={(e) => setStepFormData({ ...stepFormData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">توضیحات</label>
                                            <Input
                                                textArea
                                                value={stepFormData.description || ''}
                                                onChange={(e: any) => setStepFormData({ ...stepFormData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button size="sm" onClick={handleCancel}>انصراف</Button>
                                            <Button size="sm" variant="solid" onClick={handleSaveStep}>ذخیره تغییرات</Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 mb-6 group">
                                    <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 z-10 relative">
                                        <span className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
                                            {stepIndex + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-shadow">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                                {step.title}
                                            </h2>
                                            {step.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {step.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="plain"
                                                shape="circle"
                                                size="sm"
                                                icon={<HiOutlineSelector />}
                                                className="text-gray-400 cursor-move"
                                                title="مرتب سازی"
                                            />
                                            <Button
                                                variant="plain"
                                                shape="circle"
                                                size="sm"
                                                icon={<HiOutlinePencil />}
                                                onClick={() => handleEditStep(step)}
                                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            />
                                            <Button
                                                variant="plain"
                                                shape="circle"
                                                size="sm"
                                                icon={<HiOutlineTrash />}
                                                onClick={() => handleDeleteStepClick(step)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Questions List */}
                            <div className="mr-8 md:mr-12 space-y-4">
                                {step.questions?.map((question, qIndex) => (
                                    <div key={question.id}>
                                        {editingQuestionId === question.id ? (
                                            <Card className="border-2 border-primary-500 mb-4" bodyClass="p-4">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-bold flex items-center gap-2">
                                                            <HiOutlinePencil /> ویرایش سوال
                                                        </h4>
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium">متن سوال</label>
                                                        <Input
                                                            value={questionFormData.question || ''}
                                                            onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium">نوع سوال</label>
                                                        <Select
                                                            options={[
                                                                { value: 'text', label: 'متنی' },
                                                                { value: 'select', label: 'انتخابی' },
                                                                { value: 'radio', label: 'تستی (تک انتخابی)' },
                                                                { value: 'checkbox', label: 'تستی (چند انتخابی)' },
                                                                { value: 'rating', label: 'امتیازدهی' },
                                                            ]}
                                                            value={{ value: questionFormData.type, label: getTypeLabel(questionFormData.type) }}
                                                            onChange={(opt: any) => setQuestionFormData({ ...questionFormData, type: opt.value })}
                                                        />
                                                    </div>
                                                    {['select', 'radio', 'checkbox'].includes(questionFormData.type || '') && (
                                                        <OptionsEditor
                                                            options={questionFormData.options || []}
                                                            onChange={handleOptionsChange}
                                                        />
                                                    )}
                                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                                        <Button size="sm" onClick={handleCancel}>انصراف</Button>
                                                        <Button size="sm" variant="solid" onClick={handleSaveQuestion}>ذخیره تغییرات</Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ) : (
                                            <Card
                                                className="hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary-500 group"
                                                bodyClass="p-5"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {question.type === 'text' && <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><HiOutlineMenuAlt2 /></div>}
                                                        {question.type === 'select' && <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><HiOutlineViewList /></div>}
                                                        {question.type === 'radio' && <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><HiOutlineCheckCircle /></div>}
                                                        {question.type === 'checkbox' && <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><HiOutlineClipboardCheck /></div>}
                                                        {question.type === 'rating' && <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><HiOutlineStar /></div>}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                                                                {question.question}
                                                                {question.required && (
                                                                    <span className="text-red-500 mr-2 text-sm" title="اجباری">*</span>
                                                                )}
                                                            </h3>
                                                            <div className="flex items-center gap-2">
                                                                <Tag className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-0">
                                                                    {getTypeLabel(question.type)}
                                                                </Tag>

                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                                                    <Button
                                                                        variant="plain"
                                                                        shape="circle"
                                                                        size="xs"
                                                                        icon={<HiOutlineSelector />}
                                                                        className="text-gray-400 cursor-move"
                                                                    />
                                                                    <Button
                                                                        variant="plain"
                                                                        shape="circle"
                                                                        size="xs"
                                                                        icon={<HiOutlinePencil />}
                                                                        onClick={() => handleEditQuestion(question)}
                                                                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                                    />
                                                                    <Button
                                                                        variant="plain"
                                                                        shape="circle"
                                                                        size="xs"
                                                                        icon={<HiOutlineTrash />}
                                                                        onClick={() => handleDeleteQuestionClick(question)}
                                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Visual Preview (Simplified for brevity as logic exists) */}
                                                        <QuestionPreview question={question} />
                                                    </div>
                                                </div>
                                            </Card>
                                        )}
                                    </div>
                                ))}

                                {/* Add Question Button */}
                                {newQuestionStepId === step.id ? (
                                    <Card className="border-2 border-primary-500 mb-4" bodyClass="p-4">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold flex items-center gap-2">
                                                    <HiOutlinePlus /> افزودن سوال جدید
                                                </h4>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium">متن سوال</label>
                                                <Input
                                                    value={questionFormData.question || ''}
                                                    onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                                                    placeholder="مثلا: سابقه کاری شما چقدر است؟"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium">نوع سوال</label>
                                                <Select
                                                    options={[
                                                        { value: 'text', label: 'متنی' },
                                                        { value: 'select', label: 'انتخابی' },
                                                        { value: 'radio', label: 'تستی (تک انتخابی)' },
                                                        { value: 'checkbox', label: 'تستی (چند انتخابی)' },
                                                        { value: 'rating', label: 'امتیازدهی' },
                                                    ]}
                                                    value={{ value: questionFormData.type, label: getTypeLabel(questionFormData.type) }}
                                                    onChange={(opt: any) => setQuestionFormData({ ...questionFormData, type: opt.value })}
                                                />
                                            </div>
                                            {['select', 'radio', 'checkbox'].includes(questionFormData.type || '') && (
                                                <OptionsEditor
                                                    options={questionFormData.options || []}
                                                    onChange={handleOptionsChange}
                                                />
                                            )}
                                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                                <Button size="sm" onClick={handleCancel}>انصراف</Button>
                                                <Button size="sm" variant="solid" onClick={handleSaveQuestion}>ایجاد سوال</Button>
                                            </div>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="flex justify-center mt-2">
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            icon={<HiOutlinePlus />}
                                            onClick={() => handleAddQuestionClick(step.id)}
                                            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                        >
                                            افزودن سوال جدید
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Step Button */}
                    {newStepMode ? (
                        <div className="bg-white dark:bg-gray-800 p-6  rounded-xl shadow-lg border-2 border-primary-500 mb-6 animate-fade-in-up md:mr-12">
                            <h3 className="text-lg font-bold mb-4  flex items-center gap-2">
                                <HiOutlinePlus /> افزودن مرحله جدید
                            </h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">عنوان مرحله</label>
                                    <Input
                                        value={stepFormData.title || ''}
                                        onChange={(e) => setStepFormData({ ...stepFormData, title: e.target.value })}
                                        placeholder="مثلا: اطلاعات تکمیلی"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">توضیحات</label>
                                    <Input
                                        textArea
                                        value={stepFormData.description || ''}
                                        onChange={(e: any) => setStepFormData({ ...stepFormData, description: e.target.value })}
                                        placeholder="توضیح مختصر درباره این مرحله"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button size="sm" onClick={handleCancel}>انصراف</Button>
                                    <Button size="sm" variant="solid" onClick={handleSaveStep}>ایجاد مرحله</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center md:mr-12 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-primary-400 transition-colors cursor-pointer group" onClick={() => { setNewStepMode(true); setEditingStepId(null); setStepFormData({ description: '' }) }}>
                            <div className="text-center text-gray-500 group-hover:text-primary-600 transition-colors">
                                <HiOutlinePlus className="mx-auto text-2xl mb-1 text-blue-600" />
                                <span className="font-medium text-blue-600">افزودن مرحله جدید</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
                onRequestClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
            >
                <div className="flex flex-col h-full justify-between">
                    <h5 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                        {deleteDialog.type === 'step' ? 'حذف مرحله' : 'حذف سوال'}
                    </h5>
                    <div className="max-h-96 overflow-y-auto">
                        <p className="text-gray-600 dark:text-gray-400">
                            {deleteDialog.title}
                        </p>
                        <p className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-2 rounded">
                            این عملیات غیرقابل بازگشت است.
                        </p>
                    </div>
                    <div className="text-right mt-6 flex justify-end gap-2">
                        <Button
                            variant="plain"
                            onClick={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
                        >
                            انصراف
                        </Button>
                        <Button
                            variant="solid"
                            color="red"
                            onClick={confirmDelete}
                        >
                            حذف
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div >
    )
}

// Helper component for question preview
const QuestionPreview = ({ question }: { question: AssessmentQuestion }) => {
    return (
        <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            {question.type === 'text' && (
                <div className="w-full h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center px-4 text-gray-400 text-sm">
                    پاسخ متنی خود را اینجا بنویسید...
                </div>
            )}

            {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                <div className="space-y-3">
                    {question.options && question.options.map((option, i) => (
                        <div key={i} className="flex items-center gap-3 group cursor-default">
                            {question.type === 'select' ? (
                                <div className="w-full p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                                    {i === 0 ? option : '...'}
                                </div>
                            ) : (
                                <>
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 
                                        border-2 border-gray-300 dark:border-gray-600 
                                        ${question.type === 'radio' ? 'rounded-full' : 'rounded-md'}
                                        group-hover:border-primary-400 transition-colors
                                    `}>
                                        {i === 0 && <div className={`w-2.5 h-2.5 bg-primary-500 ${question.type === 'radio' ? 'rounded-full' : 'rounded-sm'}`}></div>}
                                    </div>
                                    <span className={`text-sm ${i === 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {option}
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {question.type === 'rating' && (
                <div className="flex flex-col items-center sm:flex-row gap-4">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <div key={star} className="group cursor-pointer">
                                <HiOutlineStar className="w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 hover:text-yellow-400 transition-colors" />
                            </div>
                        ))}
                    </div>
                    <span className="text-xs text-gray-400">
                        از ۱ تا ۵ امتیاز دهید
                    </span>
                </div>
            )}
        </div>
    )
}

const getTypeLabel = (type?: string) => {
    switch (type) {
        case 'text': return 'متنی';
        case 'select': return 'انتخابی';
        case 'radio': return 'تستی (تک انتخابی)';
        case 'checkbox': return 'تستی (چند انتخابی)';
        case 'rating': return 'امتیازدهی';
        default: return type;
    }
}

const OptionsEditor = ({ options, onChange }: { options: string[], onChange: (options: string[]) => void }) => {
    const handleAddOption = () => {
        onChange([...options, ''])
    }

    const handleRemoveOption = (index: number) => {
        const newOptions = [...options]
        newOptions.splice(index, 1)
        onChange(newOptions)
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        onChange(newOptions)
    }

    return (
        <div>
            <label className="mb-2 block text-sm font-medium">گزینه‌ها</label>
            <div className="space-y-2">
                {options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Input
                            value={option}
                            onChange={e => handleOptionChange(index, e.target.value)}
                            placeholder={`گزینه ${index + 1}`}
                            size="sm"
                        />
                        <Button
                            type="button"
                            icon={<HiOutlineTrash />}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                        />
                    </div>
                ))}
                <Button
                    type="button"
                    size="sm"
                    icon={<HiOutlinePlus />}
                    onClick={handleAddOption}
                    className="w-full border-dashed text-primary-600 border-primary-300 hover:bg-primary-50 mt-2"
                >
                    افزودن گزینه جدید
                </Button>
            </div>
        </div>
    )
}

export default AssessmentForms
