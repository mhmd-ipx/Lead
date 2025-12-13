import { Checkbox, Input } from '@/components/ui'
import MultipleChoiceEditor from './MultipleChoiceEditor'
import type { MultipleChoiceOption } from '../types/QuestionTypes'

interface MixedEditorProps {
    options: MultipleChoiceOption[]
    allowMultiple: boolean
    descriptionRequired: boolean
    descriptionPlaceholder?: string
    onChange: (data: {
        options: MultipleChoiceOption[]
        allowMultiple: boolean
        descriptionRequired: boolean
        descriptionPlaceholder?: string
    }) => void
}

const MixedEditor = ({
    options,
    allowMultiple,
    descriptionRequired,
    descriptionPlaceholder,
    onChange
}: MixedEditorProps) => {
    return (
        <div className="space-y-6">
            {/* Multiple Choice Part */}
            <div>
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    بخش تستی
                </h6>
                <MultipleChoiceEditor
                    options={options}
                    allowMultiple={allowMultiple}
                    onChange={(newOptions, newAllowMultiple) =>
                        onChange({
                            options: newOptions,
                            allowMultiple: newAllowMultiple,
                            descriptionRequired,
                            descriptionPlaceholder
                        })
                    }
                />
            </div>

            {/* Descriptive Part Settings */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    بخش تشریحی
                </h6>

                <div className="space-y-4">
                    <Checkbox
                        checked={descriptionRequired}
                        onChange={(checked) =>
                            onChange({
                                options,
                                allowMultiple,
                                descriptionRequired: checked,
                                descriptionPlaceholder
                            })
                        }
                    >
                        <span className="text-sm">توضیحات الزامی است</span>
                    </Checkbox>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            متن راهنمای بخش توضیحات
                        </label>
                        <Input
                            value={descriptionPlaceholder || ''}
                            onChange={(e) =>
                                onChange({
                                    options,
                                    allowMultiple,
                                    descriptionRequired,
                                    descriptionPlaceholder: e.target.value
                                })
                            }
                            placeholder="توضیحات خود را وارد کنید..."
                        />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            پیش‌نمایش بخش توضیحات:
                        </p>
                        <textarea
                            readOnly
                            placeholder={descriptionPlaceholder || 'توضیحات خود را وارد کنید...'}
                            className="w-full min-h-[100px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                        />
                        {descriptionRequired && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                * الزامی
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 در این نوع سوال، ابتدا آزمون‌دهنده یک گزینه را انتخاب می‌کند و سپس توضیحات خود را می‌نویسد.
                </p>
            </div>
        </div>
    )
}

export default MixedEditor
