import { useState, useEffect } from 'react'
import { Card, Button, Input, Checkbox, Radio } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { HiOutlineSave, HiOutlineX } from 'react-icons/hi'
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

const questionTypeOptions = [
    { value: 'multiple_choice', label: 'تستی (چند گزینه‌ای)' },
    { value: 'descriptive', label: 'تشریحی' },
    { value: 'mixed', label: 'تستی-تشریحی' },
    { value: 'ranking', label: 'اولویت‌بندی' },
]

const QuestionForm = ({ onSave, onCancel, existingQuestion, questionNumber }: QuestionFormProps) => {
    const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice')
    const [title, setTitle] = useState('')
    const [required, setRequired] = useState(true)
    const [score, setScore] = useState(10)

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
            setRequired(existingQuestion.required)
            setScore(existingQuestion.score)

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

    const handleSave = () => {
        const baseData = {
            id: existingQuestion?.id || Date.now().toString(),
            priority: existingQuestion?.priority || questionNumber,
            title,
            description: undefined,
            required,
            score,
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
                return
        }

        onSave(questionData)
    }

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

    return (
        <Card className="border-2 border-primary-500 dark:border-primary-600">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="p-6 space-y-6">
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

                    {/* Settings Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormItem label="امتیاز سوال">
                            <Input
                                type="number"
                                value={score}
                                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                                min={0}
                            />
                        </FormItem>

                        <div className="flex items-center pt-8">
                            <Checkbox
                                checked={required}
                                onChange={setRequired}
                            >
                                <span className="text-sm">پاسخ الزامی است</span>
                            </Checkbox>
                        </div>
                    </div>

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

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="plain" onClick={onCancel}>
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            icon={<HiOutlineSave />}
                            disabled={!isValid()}
                        >
                            ذخیره سوال
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    )
}

export default QuestionForm
