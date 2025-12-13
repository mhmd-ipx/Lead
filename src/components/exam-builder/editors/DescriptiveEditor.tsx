import { Input } from '@/components/ui'

interface DescriptiveEditorProps {
    maxLength?: number
    minLength?: number
    placeholder?: string
    onChange: (data: { maxLength?: number; minLength?: number; placeholder?: string }) => void
}

const DescriptiveEditor = ({ maxLength, minLength, placeholder, onChange }: DescriptiveEditorProps) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        حداقل تعداد کاراکتر
                    </label>
                    <Input
                        type="number"
                        value={minLength || ''}
                        onChange={(e) => onChange({
                            maxLength,
                            minLength: parseInt(e.target.value) || undefined,
                            placeholder
                        })}
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        حداکثر تعداد کاراکتر
                    </label>
                    <Input
                        type="number"
                        value={maxLength || ''}
                        onChange={(e) => onChange({
                            maxLength: parseInt(e.target.value) || undefined,
                            minLength,
                            placeholder
                        })}
                        placeholder="نامحدود"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    متن راهنما (Placeholder)
                </label>
                <Input
                    value={placeholder || ''}
                    onChange={(e) => onChange({
                        maxLength,
                        minLength,
                        placeholder: e.target.value
                    })}
                    placeholder="پاسخ خود را وارد کنید..."
                />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    پیش‌نمایش:
                </p>
                <textarea
                    readOnly
                    placeholder={placeholder || 'پاسخ خود را وارد کنید...'}
                    className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                />
                {(minLength || maxLength) && (
                    <p className="text-xs text-gray-500 mt-2">
                        {minLength && `حداقل: ${minLength} کاراکتر`}
                        {minLength && maxLength && ' | '}
                        {maxLength && `حداکثر: ${maxLength} کاراکتر`}
                    </p>
                )}
            </div>
        </div>
    )
}

export default DescriptiveEditor
