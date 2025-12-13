import { useState } from 'react'
import { Button, Input, Upload } from '@/components/ui'
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePhotograph } from 'react-icons/hi'
import { MdDragIndicator } from 'react-icons/md'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import RichTextEditor from '@/components/shared/RichTextEditor'
import type { RankingOption } from '../types/QuestionTypes'

interface RankingEditorProps {
    options: RankingOption[]
    onChange: (options: RankingOption[]) => void
}

const RankingEditor = ({ options, onChange }: RankingEditorProps) => {
    const addOption = () => {
        const newOption: RankingOption = {
            id: Date.now().toString(),
            text: '',
            correctOrder: options.length + 1,
        }
        onChange([...options, newOption])
    }

    const updateOption = (id: string, updates: Partial<RankingOption>) => {
        onChange(options.map(opt => opt.id === id ? { ...opt, ...updates } : opt))
    }

    const deleteOption = (id: string) => {
        const filtered = options.filter(opt => opt.id !== id)
        // Re-assign correct order after deletion
        onChange(filtered.map((opt, index) => ({ ...opt, correctOrder: index + 1 })))
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const newOptions = [...options]
        const [removed] = newOptions.splice(result.source.index, 1)
        newOptions.splice(result.destination.index, 0, removed)

        // Update correct order based on new positions
        const updatedOptions = newOptions.map((opt, index) => ({
            ...opt,
            correctOrder: index + 1
        }))

        onChange(updatedOptions)
    }

    const handleImageUpload = (optionId: string, fileList: File[]) => {
        if (fileList && fileList[0]) {
            const imageUrl = URL.createObjectURL(fileList[0])
            updateOption(optionId, { image: imageUrl })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                        گزینه‌های اولویت‌بندی
                    </h6>
                    <p className="text-xs text-gray-500 mt-1">
                        ترتیب فعلی گزینه‌ها، ترتیب صحیح آن‌ها است
                    </p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={addOption}
                >
                    افزودن گزینه
                </Button>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 آزمون‌دهنده باید گزینه‌ها را به ترتیب صحیح مرتب کند. با کشیدن گزینه‌ها، ترتیب صحیح را تعیین کنید.
                </p>
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
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="ranking-options">
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

                                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center shrink-0 mt-2">
                                                            {option.correctOrder}
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
            )}
        </div>
    )
}

export default RankingEditor
