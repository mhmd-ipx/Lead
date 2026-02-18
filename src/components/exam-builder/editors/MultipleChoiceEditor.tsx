import { useState } from 'react'
import { Button, Input, Checkbox, Upload } from '@/components/ui'
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePhotograph } from 'react-icons/hi'
import { MdDragIndicator } from 'react-icons/md'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import RichTextEditor from '@/components/shared/RichTextEditor'
import type { MultipleChoiceOption } from '../types/QuestionTypes'

interface MultipleChoiceEditorProps {
    options: MultipleChoiceOption[]
    allowMultiple: boolean
    onChange: (options: MultipleChoiceOption[], allowMultiple: boolean) => void
}

const MultipleChoiceEditor = ({ options, allowMultiple, onChange }: MultipleChoiceEditorProps) => {
    const addOption = () => {
        const newOption: MultipleChoiceOption = {
            id: Date.now().toString(),
            text: '',
            isCorrect: false,
        }
        onChange([...options, newOption], allowMultiple)
    }

    const updateOption = (id: string, updates: Partial<MultipleChoiceOption>) => {
        onChange(
            options.map(opt => opt.id === id ? { ...opt, ...updates } : opt),
            allowMultiple
        )
    }

    const deleteOption = (id: string) => {
        onChange(options.filter(opt => opt.id !== id), allowMultiple)
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const newOptions = [...options]
        const [removed] = newOptions.splice(result.source.index, 1)
        newOptions.splice(result.destination.index, 0, removed)

        onChange(newOptions, allowMultiple)
    }

    const handleImageUpload = (optionId: string, fileList: File[]) => {
        if (fileList && fileList[0]) {
            // در اینجا باید تصویر آپلود بشه و URL برگردونده بشه
            // فعلا یه placeholder URL می‌ذاریم
            const imageUrl = URL.createObjectURL(fileList[0])
            updateOption(optionId, { image: imageUrl })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                    گزینه‌های پاسخ
                </h6>
                <div className="flex items-center gap-4">
                    <Checkbox
                        checked={allowMultiple}
                        onChange={(checked) => onChange(options, checked)}
                    >
                        <span className="text-sm">چند گزینه‌ای</span>
                    </Checkbox>
                </div>
            </div>

            {options.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        گزینه‌ای اضافه نشده است
                    </p>
                    <Button
                        type="button"
                        size="sm"
                        variant="plain"
                        icon={<HiOutlinePlus />}
                        onClick={addOption}
                    >
                        افزودن اولین گزینه
                    </Button>
                </div>
            ) : (
                <>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="options-list">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="space-y-3"
                                >
                                    {options.map((option, index) => (
                                        <Draggable key={option.id} draggableId={option.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`p-4 border rounded-lg ${snapshot.isDragging
                                                        ? 'bg-gray-50 dark:bg-gray-800 border-primary-500'
                                                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                        }`}
                                                >
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className="cursor-move text-gray-400 hover:text-gray-600 mt-2"
                                                            >
                                                                <MdDragIndicator className="w-5 h-5" />
                                                            </div>

                                                            <div className="flex-1">
                                                                <RichTextEditor
                                                                    content={option.text}
                                                                    onChange={({ html }) => updateOption(option.id, { text: html || '' })}
                                                                />
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant="plain"
                                                                size="xs"
                                                                icon={<HiOutlineTrash />}
                                                                onClick={() => deleteOption(option.id)}
                                                                className="text-red-600 hover:text-red-700"
                                                            />
                                                        </div>

                                                        {/* Image Upload */}
                                                        <div className="mr-8">
                                                            <Upload onChange={(files) => handleImageUpload(option.id, files)}>
                                                                <Button
                                                                    type="button"
                                                                    size="xs"
                                                                    variant="plain"
                                                                    icon={<HiOutlinePhotograph />}
                                                                >
                                                                    {option.image ? 'تغییر تصویر' : 'افزودن تصویر'}
                                                                </Button>
                                                            </Upload>
                                                            {option.image && (
                                                                <div className="mt-2 relative inline-block">
                                                                    <img
                                                                        src={option.image}
                                                                        alt="Option"
                                                                        className="h-20 w-auto rounded border border-gray-200 dark:border-gray-700"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        size="xs"
                                                                        variant="plain"
                                                                        icon={<HiOutlineTrash />}
                                                                        onClick={() => updateOption(option.id, { image: undefined })}
                                                                        className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full text-red-600"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <Button
                        type="button"
                        variant="plain"
                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:border-primary-500 hover:text-primary-600"
                        icon={<HiOutlinePlus />}
                        onClick={addOption}
                    >
                        افزودن گزینه جدید
                    </Button>
                </>
            )}
        </div>
    )
}

export default MultipleChoiceEditor
