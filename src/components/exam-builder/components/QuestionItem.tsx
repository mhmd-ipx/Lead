import { Button } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi'
import { MdDragIndicator } from 'react-icons/md'
import type { Question } from '../types/QuestionTypes'

interface QuestionItemProps {
    question: Question
    onEdit: () => void
    onDelete: () => void
    onView: () => void
    dragHandleProps?: any
}

const QuestionItem = ({ question, onEdit, onDelete, onView, dragHandleProps }: QuestionItemProps) => {
    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'تستی'
            case 'descriptive':
                return 'تشریحی'
            case 'mixed':
                return 'تستی-تشریحی'
            case 'ranking':
                return 'اولویت‌بندی'
            default:
                return type
        }
    }

    const getQuestionTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            case 'descriptive':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            case 'mixed':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            case 'ranking':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV')
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ''
    }

    return (
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors">
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div
                    {...dragHandleProps}
                    className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1"
                >
                    <MdDragIndicator className="w-5 h-5" />
                </div>

                {/* Priority Badge */}
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center shrink-0">
                    {question.priority}
                </div>

                {/* Question Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                        <h6 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {stripHtml(question.title)}
                        </h6>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getQuestionTypeBadgeColor(question.type)} shrink-0`}>
                            {getQuestionTypeLabel(question.type)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>امتیاز: {question.score}</span>
                        {question.required && (
                            <span className="text-orange-600 dark:text-orange-400">الزامی</span>
                        )}
                        {question.type === 'multiple_choice' && (
                            <span>
                                {(question as any).options?.length || 0} گزینه
                            </span>
                        )}
                        {question.type === 'ranking' && (
                            <span>
                                {(question as any).options?.length || 0} مورد
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        type="button"
                        variant="plain"
                        size="xs"
                        icon={<HiOutlineEye />}
                        onClick={onView}
                    />
                    <Button
                        type="button"
                        variant="plain"
                        size="xs"
                        icon={<HiOutlinePencilAlt />}
                        onClick={onEdit}
                    />
                    <Button
                        type="button"
                        variant="plain"
                        size="xs"
                        icon={<HiOutlineTrash />}
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-700"
                    />
                </div>
            </div>
        </div>
    )
}

export default QuestionItem
