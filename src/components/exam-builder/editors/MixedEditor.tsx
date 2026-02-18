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
                <MultipleChoiceEditor
                    options={options}
                    allowMultiple={allowMultiple}
                    onChange={(newOptions, newAllowMultiple) =>
                        onChange({
                            options: newOptions,
                            allowMultiple: newAllowMultiple,
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
