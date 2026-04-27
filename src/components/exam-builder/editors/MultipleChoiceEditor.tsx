import { useState } from 'react'
import { Button, Input, Upload } from '@/components/ui'
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePhotograph, HiOutlineRefresh } from 'react-icons/hi'
import { apiUploadFile } from '@/services/FileService'
import { Notification, toast } from '@/components/ui'
import { MdDragIndicator } from 'react-icons/md'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import QuestionFileImage from '../components/QuestionFileImage'
import type { QuestionOption } from '../types/QuestionTypes'

interface MultipleChoiceEditorProps {
    options: QuestionOption[]
    allowMultiple?: boolean // Kept optional just in case it's passed somewhere else, but not used internally
    onChange: (options: QuestionOption[]) => void
}

const MultipleChoiceEditor = ({ options, onChange }: MultipleChoiceEditorProps) => {
    const addOption = () => {
        const newOption: QuestionOption = {
            id: Date.now().toString(),
            text: '',
            isCorrect: false,
            file_id: undefined
        }
        onChange([...options, newOption])
    }

    const updateOption = (id: string, updates: Partial<QuestionOption>) => {
        onChange(
            options.map(opt => opt.id === id ? { ...opt, ...updates } : opt)
        )
    }

    const deleteOption = (id: string) => {
        onChange(options.filter(opt => opt.id !== id))
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const newOptions = [...options]
        const [removed] = newOptions.splice(result.source.index, 1)
        newOptions.splice(result.destination.index, 0, removed)

        onChange(newOptions)
    }

    const handleImageUpload = async (optionId: string, files: File[]) => {
        if (files && files[0]) {
            const localUrl = URL.createObjectURL(files[0])
            updateOption(optionId, { image: localUrl, file_id: 'uploading' })
            
            try {
                const res = await apiUploadFile(files[0])
                if (res && res.id) {
                    updateOption(optionId, { 
                        image: res.address || localUrl, 
                        file_id: res.id 
                    })
                }
            } catch (err) {
                toast.push(<Notification type="danger">خطا در آپلود تصویر</Notification>)
                updateOption(optionId, { image: undefined, file_id: undefined })
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                    گزینه‌های پاسخ
                </h6>
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

                                                            <div className="flex-1 flex items-start gap-2">
                                                                <Input
                                                                    placeholder={`گزینه ${index + 1}`}
                                                                    value={option.text}
                                                                    onChange={(e) => updateOption(option.id, { text: e.target.value })}
                                                                />
                                                                
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <Upload 
                                                                        showList={false}
                                                                        onChange={(files) => handleImageUpload(option.id, files)}
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="plain"
                                                                            icon={option.file_id === 'uploading' ? <HiOutlineRefresh className="animate-spin" /> : <HiOutlinePhotograph />}
                                                                            className={option.image ? 'text-primary-600' : 'text-gray-400'}
                                                                            disabled={option.file_id === 'uploading'}
                                                                        />
                                                                    </Upload>

                                                                    <Button
                                                                        type="button"
                                                                        variant="plain"
                                                                        size="xs"
                                                                        icon={<HiOutlineTrash />}
                                                                        onClick={() => deleteOption(option.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {(option.file_id || option.image) && (
                                                            <div className="mr-8 relative inline-block">
                                                                <QuestionFileImage 
                                                                    fileId={option.file_id}
                                                                    fallbackUrl={option.image}
                                                                    className="h-20 w-auto rounded border border-gray-200 dark:border-gray-700"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    size="xs"
                                                                    variant="plain"
                                                                    icon={<HiOutlineTrash />}
                                                                    onClick={() => updateOption(option.id, { image: undefined, file_id: undefined })}
                                                                    className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full text-red-600 shadow-sm"
                                                                />
                                                            </div>
                                                        )}
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
