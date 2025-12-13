import { useEffect, useState } from 'react'
import { Card, Button, Input, Select } from '@/components/ui'
import {
    HiOutlineClipboardCheck,
    HiOutlinePencil,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineSave,
} from 'react-icons/hi'
import { getAssessmentTemplates, updateAssessmentTemplate } from '@/services/AdminService'
import { AssessmentTemplate, AssessmentStep, AssessmentQuestion } from '@/mock/data/adminData'

const AssessmentForms = () => {
    const [template, setTemplate] = useState<AssessmentTemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        loadTemplate()
    }, [])

    const loadTemplate = async () => {
        try {
            const templates = await getAssessmentTemplates()
            // فقط اولین فرم رو بارگذاری می‌کنیم چون فقط یک فرم داریم
            if (templates.length > 0) {
                setTemplate(templates[0])
            }
        } catch (error) {
            console.error('Error loading template:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!template) return

        setSaving(true)
        try {
            await updateAssessmentTemplate(template.id, template)
            alert('فرم با موفقیت ذخیره شد')
            setIsEditing(false)
        } catch (error) {
            console.error('Error saving template:', error)
            alert('خطا در ذخیره فرم')
        } finally {
            setSaving(false)
        }
    }

    const handleTemplateChange = (field: keyof AssessmentTemplate, value: any) => {
        if (template) {
            setTemplate({ ...template, [field]: value })
        }
    }

    const handleStepChange = (stepIndex: number, field: keyof AssessmentStep, value: any) => {
        if (template) {
            const newSteps = [...template.steps]
            newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value }
            setTemplate({ ...template, steps: newSteps })
        }
    }

    const handleQuestionChange = (stepIndex: number, questionIndex: number, field: keyof AssessmentQuestion, value: any) => {
        if (template) {
            const newSteps = [...template.steps]
            const newQuestions = [...newSteps[stepIndex].questions]
            newQuestions[questionIndex] = { ...newQuestions[questionIndex], [field]: value }
            newSteps[stepIndex] = { ...newSteps[stepIndex], questions: newQuestions }
            setTemplate({ ...template, steps: newSteps })
        }
    }

    const addQuestion = (stepIndex: number) => {
        if (template) {
            const newSteps = [...template.steps]
            const newQuestion: AssessmentQuestion = {
                id: `q${Date.now()}`,
                question: '',
                type: 'text',
                required: false
            }
            newSteps[stepIndex].questions.push(newQuestion)
            setTemplate({ ...template, steps: newSteps })
        }
    }

    const removeQuestion = (stepIndex: number, questionIndex: number) => {
        if (template) {
            const newSteps = [...template.steps]
            newSteps[stepIndex].questions.splice(questionIndex, 1)
            setTemplate({ ...template, steps: newSteps })
        }
    }

    const addStep = () => {
        if (template) {
            const newStep: AssessmentStep = {
                id: `step-${Date.now()}`,
                title: '',
                description: '',
                questions: []
            }
            setTemplate({ ...template, steps: [...template.steps, newStep] })
        }
    }

    const removeStep = (stepIndex: number) => {
        if (template) {
            const newSteps = [...template.steps]
            newSteps.splice(stepIndex, 1)
            setTemplate({ ...template, steps: newSteps })
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!template) {
        return (
            <div className="text-center py-12">
                <HiOutlineClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">فرم نیازسنجی یافت نشد</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        فرم نیازسنجی
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مشاهده و ویرایش فرم نیازسنجی
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Button
                                variant="plain"
                                onClick={() => {
                                    setIsEditing(false)
                                    loadTemplate()
                                }}
                            >
                                انصراف
                            </Button>
                            <Button
                                variant="solid"
                                icon={<HiOutlineSave />}
                                loading={saving}
                                onClick={handleSave}
                            >
                                ذخیره تغییرات
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="solid"
                            icon={<HiOutlinePencil />}
                            onClick={() => setIsEditing(true)}
                        >
                            ویرایش فرم
                        </Button>
                    )}
                </div>
            </div>

            {/* Template Info */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                        <HiOutlineClipboardCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        نام فرم
                                    </label>
                                    <Input
                                        value={template.name}
                                        onChange={(e) => handleTemplateChange('name', e.target.value)}
                                        placeholder="نام فرم نیازسنجی"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        دسته‌بندی
                                    </label>
                                    <Input
                                        value={template.category}
                                        onChange={(e) => handleTemplateChange('category', e.target.value)}
                                        placeholder="دسته‌بندی"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        توضیحات
                                    </label>
                                    <Input
                                        textArea
                                        rows={2}
                                        value={template.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTemplateChange('description', e.target.value)}
                                        placeholder="توضیحات فرم"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        زمان تخمینی (دقیقه)
                                    </label>
                                    <Input
                                        type="number"
                                        value={template.estimatedTime}
                                        onChange={(e) => handleTemplateChange('estimatedTime', parseInt(e.target.value))}
                                        placeholder="زمان به دقیقه"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {template.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {template.category} • {template.estimatedTime} دقیقه
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {template.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Steps */}
            <div className="space-y-4">
                {template.steps.map((step, stepIndex) => (
                    <Card key={step.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                عنوان مرحله {stepIndex + 1}
                                            </label>
                                            <Input
                                                value={step.title}
                                                onChange={(e) => handleStepChange(stepIndex, 'title', e.target.value)}
                                                placeholder="عنوان مرحله"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                توضیحات
                                            </label>
                                            <Input
                                                textArea
                                                rows={2}
                                                value={step.description || ''}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleStepChange(stepIndex, 'description', e.target.value)}
                                                placeholder="توضیحات مرحله"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            مرحله {stepIndex + 1}: {step.title}
                                        </h3>
                                        {step.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            {isEditing && template.steps.length > 1 && (
                                <Button
                                    variant="plain"
                                    size="sm"
                                    icon={<HiOutlineTrash />}
                                    onClick={() => removeStep(stepIndex)}
                                    className="text-red-600 hover:text-red-700"
                                />
                            )}
                        </div>

                        {/* Questions */}
                        <div className="space-y-4 mt-6">
                            {step.questions.map((question, questionIndex) => (
                                <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            سوال {questionIndex + 1}
                                                        </label>
                                                        <Input
                                                            value={question.question}
                                                            onChange={(e) => handleQuestionChange(stepIndex, questionIndex, 'question', e.target.value)}
                                                            placeholder="متن سوال"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                نوع سوال
                                                            </label>
                                                            <Select
                                                                value={question.type}
                                                                onChange={(e) => handleQuestionChange(stepIndex, questionIndex, 'type', e.target.value as any)}
                                                            >
                                                                <option value="text">متنی</option>
                                                                <option value="select">انتخابی (یکی)</option>
                                                                <option value="radio">رادیو باتن</option>
                                                                <option value="checkbox">چندگزینه‌ای</option>
                                                                <option value="rating">امتیازدهی</option>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={question.required}
                                                                    onChange={(e) => handleQuestionChange(stepIndex, questionIndex, 'required', e.target.checked)}
                                                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                                                />
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    اجباری
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                گزینه‌ها (با کاما جدا کنید)
                                                            </label>
                                                            <Input
                                                                value={question.options?.join(', ') || ''}
                                                                onChange={(e) => handleQuestionChange(stepIndex, questionIndex, 'options', e.target.value.split(',').map(o => o.trim()))}
                                                                placeholder="گزینه 1, گزینه 2, گزینه 3"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="plain"
                                                    size="sm"
                                                    icon={<HiOutlineTrash />}
                                                    onClick={() => removeQuestion(stepIndex, questionIndex)}
                                                    className="text-red-600 hover:text-red-700"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {questionIndex + 1}. {question.question}
                                                        {question.required && <span className="text-red-500 mr-1">*</span>}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        نوع: {
                                                            question.type === 'text' ? 'متنی' :
                                                                question.type === 'select' ? 'انتخابی' :
                                                                    question.type === 'radio' ? 'رادیو باتن' :
                                                                        question.type === 'checkbox' ? 'چندگزینه‌ای' :
                                                                            'امتیازدهی'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {question.options && question.options.length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {question.options.map((option, i) => (
                                                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                                                            • {option}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isEditing && (
                                <Button
                                    variant="plain"
                                    size="sm"
                                    icon={<HiOutlinePlus />}
                                    onClick={() => addQuestion(stepIndex)}
                                >
                                    افزودن سوال
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}

                {isEditing && (
                    <Button
                        variant="plain"
                        icon={<HiOutlinePlus />}
                        onClick={addStep}
                    >
                        افزودن مرحله جدید
                    </Button>
                )}
            </div>
        </div>
    )
}

export default AssessmentForms
