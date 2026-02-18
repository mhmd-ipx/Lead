import { Input } from '@/components/ui'

interface DescriptiveEditorProps {
    maxLength?: number
    minLength?: number
    placeholder?: string
    onChange: (data: { maxLength?: number; minLength?: number; placeholder?: string }) => void
}

const DescriptiveEditor = ({ maxLength, minLength, placeholder, onChange }: DescriptiveEditorProps) => {
    return null
}

export default DescriptiveEditor
