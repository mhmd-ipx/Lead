import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Card, Button, Input, Checkbox, Upload, Progress, Notification, toast, Select } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import { HiOutlineX, HiOutlinePhotograph, HiOutlineTrash, HiOutlineRefresh } from 'react-icons/hi'
import { apiUploadFile } from '@/services/FileService'
import MultipleChoiceEditor from '../editors/MultipleChoiceEditor'
import DescriptiveEditor from '../editors/DescriptiveEditor'
import MixedEditor from '../editors/MixedEditor'
import RankingEditor from '../editors/RankingEditor'
import type { Question, QuestionType, MultipleChoiceQuestion, DescriptiveQuestion, MixedQuestion, OrderQuestion, CheckBoxQuestion } from '../types/QuestionTypes'

interface QuestionFormProps {
    onSave: (question: Question, addAnother?: boolean) => void
    onCancel: () => void
    existingQuestion?: Question
    questionNumber: number
}

export interface QuestionFormRef {
    save: () => Question | null
}

const questionTypeOptions = [
    { value: 'multiple_choice', label: 'تستی' },
    { value: 'descriptive', label: 'تشریحی' },
    { value: 'check_box', label: 'تستی (چند گزینه‌ای)' },
    { value: 'mixed', label: 'تشریحی-تستی' },
    { value: 'order', label: 'اولویت‌بندی' },
]

const QuestionForm = forwardRef<QuestionFormRef, QuestionFormProps>(({ onSave, onCancel, existingQuestion, questionNumber }, ref) => {
    const [questionType, setQuestionType] = useState<QuestionType>(existingQuestion?.type || 'multiple_choice')
    const [title, setTitle] = useState(existingQuestion?.title || '')
    const [image, setImage] = useState(existingQuestion?.image || '')
    const [fileId, setFileId] = useState<number | string | undefined>(existingQuestion?.file_id)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    // Multiple Choice / Checkbox / Mixed states
    const [mcOptions, setMcOptions] = useState<any[]>([])

    // Descriptive states
    const [maxLength, setMaxLength] = useState<number>()
    const [minLength, setMinLength] = useState<number>()
    const [placeholder, setPlaceholder] = useState<string>()

    // Mixed specific
    const [descriptionRequired, setDescriptionRequired] = useState(false)
    const [descriptionPlaceholder, setDescriptionPlaceholder] = useState<string>()

    // Ranking states
    const [rankingOptions, setRankingOptions] = useState<any[]>([])

    useEffect(() => {
        if (existingQuestion) {
            setQuestionType(existingQuestion.type)
            setTitle(existingQuestion.title)
            setImage(existingQuestion.image || '')
            setFileId(existingQuestion.file_id)

            switch (existingQuestion.type) {
                case 'multiple_choice':
                case 'check_box':
                    setMcOptions((existingQuestion as any).options || [])
                    break
                case 'descriptive':
                    setMaxLength((existingQuestion as DescriptiveQuestion).maxLength)
                    setMinLength((existingQuestion as DescriptiveQuestion).minLength)
                    setPlaceholder((existingQuestion as DescriptiveQuestion).placeholder)
                    break
                case 'mixed':
                    setMcOptions((existingQuestion as MixedQuestion).options || [])
                    setDescriptionRequired((existingQuestion as MixedQuestion).descriptionRequired)
                    setDescriptionPlaceholder((existingQuestion as MixedQuestion).descriptionPlaceholder)
                    break
                case 'order':
                    setRankingOptions((existingQuestion as OrderQuestion).options || [])
                    break
            }
        }
    }, [existingQuestion])

    const isValid = () => {
        if (!title.trim()) return false

        switch (questionType) {
            case 'multiple_choice':
            case 'check_box':
            case 'mixed':
                return mcOptions.length >= 2 && mcOptions.some(opt => opt.text.trim())
            case 'order':
                return rankingOptions.length >= 2 && rankingOptions.some(opt => opt.text.trim())
            case 'descriptive':
                return true
            default:
                return false
        }
    }

    const getQuestionData = (): Question | null => {
        if (!isValid()) return null

        const baseData = {
            id: existingQuestion?.id || Date.now().toString(),
            priority: existingQuestion?.priority || questionNumber,
            title,
            image,
            file_id: fileId,
            description: undefined,
            required: true,
            score: 1,
        }

        let questionData: Question

        switch (questionType) {
            case 'multiple_choice':
                questionData = {
                    ...baseData,
                    type: 'multiple_choice',
                    options: mcOptions,
                } as MultipleChoiceQuestion
                break

            case 'check_box':
                questionData = {
                    ...baseData,
                    type: 'check_box',
                    options: mcOptions,
                } as CheckBoxQuestion
                break

            case 'descriptive':
                questionData = {
                    ...baseData,
                    type: 'descriptive',
                    maxLength,
                    minLength,
                    placeholder,
                } as DescriptiveQuestion
                break

            case 'mixed':
                questionData = {
                    ...baseData,
                    type: 'mixed',
                    options: mcOptions,
                    descriptionRequired,
                    descriptionPlaceholder,
                } as MixedQuestion
                break

            case 'order':
                questionData = {
                    ...baseData,
                    type: 'order',
                    options: rankingOptions,
                } as OrderQuestion
                break

            default:
                return null
        }

        return questionData
    }

    useImperativeHandle(ref, () => ({
        save: getQuestionData
    }))

    return (
        <Card className="border-white">
            <div className="p-0 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                            {existingQuestion ? 'ویرایش سوال' : `افزودن سوال ${questionNumber}`}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            اطلاعات سوال را وارد کنید
                        </p>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="plain"
                        icon={<HiOutlineX />}
                        onClick={onCancel}
                    />
                </div>

                {/* Question Type */}
                <FormItem label="نوع سوال">
                    <Select
                        options={questionTypeOptions}
                        value={questionTypeOptions.find((o) => o.value === questionType)}
                        onChange={(val: any) => setQuestionType(val?.value as QuestionType)}
                        placeholder="نوع سوال را انتخاب کنید"
                    />
                </FormItem>

                {/* Title */}
                <FormItem label="متن سوال">
                    <Input
                        textArea
                        rows={3}
                        placeholder="متن سوال را وارد کنید..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                        <Upload 
                            showList={false}
                            onChange={async (files) => {
                                if (files[0]) {
                                    const localUrl = URL.createObjectURL(files[0])
                                    setImage(localUrl)
                                    setIsUploading(true)
                                    setUploadProgress(0)
                                    try {
                                        const res = await apiUploadFile(files[0], (p) => setUploadProgress(p))
                                        if (res && res.id) {
                                            setFileId(res.id)
                                            setImage(res.address || localUrl)
                                        }
                                    } catch (err) {
                                        toast.push(<Notification type="danger">خطا در آپلود تصویر</Notification>)
                                    } finally {
                                        setIsUploading(false)
                                    }
                                }
                            }}
                        >
                            <Button 
                                type="button" 
                                size="sm" 
                                variant="plain" 
                                icon={isUploading ? <HiOutlineRefresh className="animate-spin" /> : <HiOutlinePhotograph />}
                                disabled={isUploading}
                            >
                                {isUploading ? `در حال آپلود ${uploadProgress}%` : (image ? 'تغییر تصویر سوال' : 'افزودن تصویر به سوال')}
                            </Button>
                        </Upload>
                        {image && (
                            <div className="relative group">
                                <img src={image} alt="Question" className="h-20 w-auto rounded border shadow-sm" />
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="solid"
                                    shape="circle"
                                    icon={<HiOutlineTrash />}
                                    onClick={() => {
                                        setImage('')
                                        setFileId(undefined)
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        )}
                    </div>
                </FormItem>



                {/* Type-specific editors */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    {(questionType === 'multiple_choice' || questionType === 'check_box') && (
                        <MultipleChoiceEditor
                            options={mcOptions}
                            allowMultiple={questionType === 'check_box'} // Keep this prop if Editor still expects it, or pass false if we update Editor
                            onChange={(options) => {
                                setMcOptions(options)
                            }}
                        />
                    )}

                    {questionType === 'descriptive' && (
                        <DescriptiveEditor
                            maxLength={maxLength}
                            minLength={minLength}
                            placeholder={placeholder}
                            onChange={(data) => {
                                setMaxLength(data.maxLength)
                                setMinLength(data.minLength)
                                setPlaceholder(data.placeholder)
                            }}
                        />
                    )}

                    {questionType === 'mixed' && (
                        <MixedEditor
                            options={mcOptions}
                            allowMultiple={false}
                            descriptionRequired={descriptionRequired}
                            descriptionPlaceholder={descriptionPlaceholder}
                            onChange={(data) => {
                                setMcOptions(data.options)
                                setDescriptionRequired(data.descriptionRequired)
                                setDescriptionPlaceholder(data.descriptionPlaceholder)
                            }}
                        />
                    )}

                    {questionType === 'order' && (
                        <RankingEditor
                            options={rankingOptions}
                            onChange={setRankingOptions}
                        />
                    )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="plain" 
                        onClick={onCancel}
                        disabled={isUploading}
                    >
                        انصراف
                    </Button>
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="solid" 
                        onClick={() => {
                            const data = getQuestionData()
                            if (data) onSave(data, true)
                        }}
                        disabled={!isValid() || isUploading}
                    >
                        ذخیره و افزودن بعدی
                    </Button>
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="solid" 
                        onClick={() => {
                            const data = getQuestionData()
                            if (data) onSave(data, false)
                        }}
                        disabled={!isValid() || isUploading}
                    >
                        ذخیره سوال
                    </Button>
                </div>
            </div>
        </Card>
    )
})

QuestionForm.displayName = 'QuestionForm'

export default QuestionForm
