import { Checkbox, Input } from '@/components/ui'
import MultipleChoiceEditor from './MultipleChoiceEditor'
import type { QuestionOption } from '../types/QuestionTypes'

interface MixedEditorProps {
    options: QuestionOption[]
    allowMultiple?: boolean // Keep optional for backwards compatibility but unused
    descriptionRequired: boolean
    descriptionPlaceholder?: string
    onChange: (data: {
        options: QuestionOption[]
        descriptionRequired: boolean
        descriptionPlaceholder?: string
    }) => void
}

const MixedEditor = ({
    options,
    descriptionRequired,
    descriptionPlaceholder,
    onChange
}: MixedEditorProps) => {
    return (
        <div className="space-y-6">
            {/* Multiple Choice Part */}
            <div>
                <MultipleChoiceEditor
                    options={options}
                    onChange={(newOptions) =>
                        onChange({
                            options: newOptions,
                            descriptionRequired: true, // Always required
                            descriptionPlaceholder
                        })
                    }
                />
            </div>
        </div>
    )
}

export default MixedEditor
