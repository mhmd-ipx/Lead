import { Dialog, Button } from '@/components/ui'
import type { Question } from '../types/QuestionTypes'

interface QuestionViewModalProps {
    isOpen: boolean
    onClose: () => void
    question: Question | null
}

const QuestionViewModal = ({ isOpen, onClose, question }: QuestionViewModalProps) => {
    if (!question) return null

    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'تستی (چند گزینه‌ای)'
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

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={700}
        >
            <div className="space-y-6">
                <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        پیش‌نمایش سوال {question.priority}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {getQuestionTypeLabel(question.type)}
                    </p>
                </div>

                {/* Question Content */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="mb-4">
                        <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            متن سوال:
                        </h6>
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: question.title }}
                        />
                    </div>

                    {question.description && (
                        <div className="mb-4">
                            <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                توضیحات:
                            </h6>
                            <div
                                className="prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: question.description }}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                            امتیاز: <strong>{question.score}</strong>
                        </span>
                        {question.required && (
                            <span className="text-orange-600 dark:text-orange-400 font-medium">
                                * الزامی
                            </span>
                        )}
                    </div>
                </div>

                {/* Type-specific content */}
                {question.type === 'multiple_choice' && (
                    <div>
                        <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            گزینه‌ها ({(question as any).allowMultiple ? 'چند گزینه‌ای' : 'تک گزینه‌ای'}):
                        </h6>
                        <div className="space-y-2">
                            {(question as any).options?.map((option: any, index: number) => (
                                <div
                                    key={option.id}
                                    className={`p-3 rounded-lg border ${option.isCorrect
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-sm font-medium text-gray-500">
                                            {index + 1}.
                                        </span>
                                        <div className="flex-1">
                                            <div
                                                className="prose dark:prose-invert max-w-none text-sm"
                                                dangerouslySetInnerHTML={{ __html: option.text }}
                                            />
                                            {option.image && (
                                                <img
                                                    src={option.image}
                                                    alt="Option"
                                                    className="mt-2 h-24 w-auto rounded"
                                                />
                                            )}
                                        </div>
                                        {option.isCorrect && (
                                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                ✓ صحیح
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {question.type === 'descriptive' && (
                    <div>
                        <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            تنظیمات پاسخ تشریحی:
                        </h6>
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 text-sm">
                            {(question as any).minLength && (
                                <p>حداقل تعداد کاراکتر: <strong>{(question as any).minLength}</strong></p>
                            )}
                            {(question as any).maxLength && (
                                <p>حداکثر تعداد کاراکتر: <strong>{(question as any).maxLength}</strong></p>
                            )}
                            {(question as any).placeholder && (
                                <p>متن راهنما: <em>"{(question as any).placeholder}"</em></p>
                            )}
                        </div>
                    </div>
                )}

                {question.type === 'mixed' && (
                    <div className="space-y-4">
                        <div>
                            <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                بخش تستی ({(question as any).allowMultiple ? 'چند گزینه‌ای' : 'تک گزینه‌ای'}):
                            </h6>
                            <div className="space-y-2">
                                {(question as any).options?.map((option: any, index: number) => (
                                    <div
                                        key={option.id}
                                        className={`p-3 rounded-lg border ${option.isCorrect
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-sm font-medium text-gray-500">
                                                {index + 1}.
                                            </span>
                                            <div className="flex-1">
                                                <div
                                                    className="prose dark:prose-invert max-w-none text-sm"
                                                    dangerouslySetInnerHTML={{ __html: option.text }}
                                                />
                                                {option.image && (
                                                    <img
                                                        src={option.image}
                                                        alt="Option"
                                                        className="mt-2 h-24 w-auto rounded"
                                                    />
                                                )}
                                            </div>
                                            {option.isCorrect && (
                                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                    ✓ صحیح
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                بخش تشریحی:
                            </h6>
                            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 text-sm">
                                <p>
                                    {(question as any).descriptionRequired ? (
                                        <span className="text-orange-600 dark:text-orange-400">الزامی</span>
                                    ) : (
                                        <span>اختیاری</span>
                                    )}
                                </p>
                                {(question as any).descriptionPlaceholder && (
                                    <p>متن راهنما: <em>"{(question as any).descriptionPlaceholder}"</em></p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {question.type === 'ranking' && (
                    <div>
                        <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            ترتیب صحیح:
                        </h6>
                        <div className="space-y-2">
                            {(question as any).options?.map((option: any) => (
                                <div
                                    key={option.id}
                                    className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center shrink-0">
                                            {option.correctOrder}
                                        </div>
                                        <div className="flex-1">
                                            <div
                                                className="prose dark:prose-invert max-w-none text-sm"
                                                dangerouslySetInnerHTML={{ __html: option.text }}
                                            />
                                            {option.image && (
                                                <img
                                                    src={option.image}
                                                    alt="Option"
                                                    className="mt-2 h-24 w-auto rounded"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="solid" onClick={onClose}>
                        بستن
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default QuestionViewModal
