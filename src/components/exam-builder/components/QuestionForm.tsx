import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Card, Button, Input, Checkbox, Radio } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { HiOutlineX } from 'react-icons/hi'
import MultipleChoiceEditor from '../editors/MultipleChoiceEditor'
import DescriptiveEditor from '../editors/DescriptiveEditor'
import MixedEditor from '../editors/MixedEditor'
import RankingEditor from '../editors/RankingEditor'
import type { Question, QuestionType, MultipleChoiceQuestion, DescriptiveQuestion, MixedQuestion, RankingQuestion } from '../types/QuestionTypes'

interface QuestionFormProps {
    onSave: (question: Question) => void
    onCancel: () => void
    existingQuestion?: Question
    questionNumber: number
}

export interface QuestionFormRef {
    save: () => Question | null
}

const questionTypeOptions = [
    { value: 'multiple_choice', label: 'تستی (چند گزینه‌ای)' },
    { value: 'descriptive', label: 'تشریحی' },
    { value: 'mixed', label: 'تستی-تشریحی' },
    { value: 'ranking', label: 'اولویت‌بندی' },
]

const QuestionForm = forwardRef<QuestionFormRef, QuestionFormProps>(({ onSave, onCancel, existingQuestion, questionNumber }, ref) => {
    const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice')
    const [title, setTitle] = useState('')


    // Multiple Choice / Mixed states
    const [mcOptions, setMcOptions] = useState<any[]>([])
    const [allowMultiple, setAllowMultiple] = useState(false)

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


            switch (existingQuestion.type) {
                case 'multiple_choice':
                    setMcOptions((existingQuestion as MultipleChoiceQuestion).options)
                    setAllowMultiple((existingQuestion as MultipleChoiceQuestion).allowMultiple)
                    break
                case 'descriptive':
                    setMaxLength((existingQuestion as DescriptiveQuestion).maxLength)
                    setMinLength((existingQuestion as DescriptiveQuestion).minLength)
                    setPlaceholder((existingQuestion as DescriptiveQuestion).placeholder)
                    break
                case 'mixed':
                    setMcOptions((existingQuestion as MixedQuestion).options)
                    setAllowMultiple((existingQuestion as MixedQuestion).allowMultiple)
                    setDescriptionRequired((existingQuestion as MixedQuestion).descriptionRequired)
                    setDescriptionPlaceholder((existingQuestion as MixedQuestion).descriptionPlaceholder)
                    break
                case 'ranking':
                    setRankingOptions((existingQuestion as RankingQuestion).options)
                    break
            }
        }
    }, [existingQuestion])

    const isValid = () => {
        if (!title.trim()) return false

        switch (questionType) {
            case 'multiple_choice':
            case 'mixed':
                return mcOptions.length >= 2 && mcOptions.some(opt => opt.text.trim())
            case 'ranking':
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
                    allowMultiple,
                } as MultipleChoiceQuestion
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
                    allowMultiple,
                    descriptionRequired,
                    descriptionPlaceholder,
                } as MixedQuestion
                break

            case 'ranking':
                questionData = {
                    ...baseData,
                    type: 'ranking',
                    options: rankingOptions,
                } as RankingQuestion
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
                    <Radio.Group
                        value={questionType}
                        onChange={(val) => setQuestionType(val as QuestionType)}
                    >
                        {questionTypeOptions.map((option) => (
                            <Radio key={option.value} value={option.value}>
                                {option.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                </FormItem>

                {/* Title */}
                <FormItem label="متن سوال" asterisk>
                    <RichTextEditor
                        content={title}
                        onChange={({ html }) => setTitle(html || '')}
                    />
                </FormItem>



                {/* Type-specific editors */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    {questionType === 'multiple_choice' && (
                        <MultipleChoiceEditor
                            options={mcOptions}
                            allowMultiple={allowMultiple}
                            onChange={(options, multiple) => {
                                setMcOptions(options)
                                setAllowMultiple(multiple)
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
                            allowMultiple={allowMultiple}
                            descriptionRequired={descriptionRequired}
                            descriptionPlaceholder={descriptionPlaceholder}
                            onChange={(data) => {
                                setMcOptions(data.options)
                                setAllowMultiple(data.allowMultiple)
                                setDescriptionRequired(data.descriptionRequired)
                                setDescriptionPlaceholder(data.descriptionPlaceholder)
                            }}
                        />
                    )}

                    {questionType === 'ranking' && (
                        <RankingEditor
                            options={rankingOptions}
                            onChange={setRankingOptions}
                        />
                    )}
                </div>
            </div>
        </Card>
    )
})

QuestionForm.displayName = 'QuestionForm'

export default QuestionForm
