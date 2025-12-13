import { useMemo, useState, useEffect } from 'react'
import { Card, Button, Dialog, Input } from '@/components/ui'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { DragDropContext, Draggable } from '@hello-pangea/dnd'
import { MdDragIndicator } from 'react-icons/md'
import { StrictModeDroppable } from '@/components/shared'
import { getExamItems } from '@/services/AdminService'
import { ExamItem } from '@/mock/data/adminData'
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencilAlt, HiOutlineEye } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import type { DropResult } from '@hello-pangea/dnd'

const { Tr, Th, Td, THead, TBody } = Table

const Exams = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<ExamItem[]>([])
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null)

    useEffect(() => {
        loadExams()
    }, [])

    const loadExams = async () => {
        try {
            const exams = await getExamItems()
            // Sort by priority
            const sortedExams = exams.sort((a, b) => a.priority - b.priority)
            setData(sortedExams)
        } catch (error) {
            console.error('Error loading exams:', error)
        } finally {
            setLoading(false)
        }
    }

    const reorderData = (startIndex: number, endIndex: number) => {
        const newData = [...data]
        const [movedRow] = newData.splice(startIndex, 1)
        newData.splice(endIndex, 0, movedRow)

        // Update priorities
        const updatedData = newData.map((item, index) => ({
            ...item,
            priority: index + 1
        }))

        setData(updatedData)
        alert('ترتیب آزمون‌ها ذخیره شد')
    }

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return
        reorderData(source.index, destination.index)
    }

    const handleDelete = (exam: ExamItem) => {
        if (confirm(`آیا از حذف آزمون "${exam.title}" اطمینان دارید؟`)) {
            setData(data.filter(e => e.id !== exam.id))
            alert('آزمون حذف شد')
        }
    }

    const handleEdit = (exam: ExamItem) => {
        setSelectedExam(exam)
        setEditDialogOpen(true)
    }

    const handleView = (exam: ExamItem) => {
        setSelectedExam(exam)
        setViewDialogOpen(true)
    }

    const handleSaveEdit = () => {
        if (selectedExam) {
            const updatedData = data.map(e =>
                e.id === selectedExam.id ? selectedExam : e
            )
            setData(updatedData)
            setEditDialogOpen(false)
            alert('تغییرات ذخیره شد')
        }
    }

    const columns: ColumnDef<ExamItem>[] = useMemo(
        () => [
            {
                id: 'dragger',
                header: '',
                accessorKey: 'dragger',
                cell: () => (
                    <span className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MdDragIndicator className="w-5 h-5" />
                    </span>
                ),
                size: 50,
            },
            {
                header: 'اولویت',
                accessorKey: 'priority',
                cell: (info) => (
                    <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center">
                            {info.getValue() as number}
                        </div>
                    </div>
                ),
                size: 80,
            },
            {
                header: 'عنوان آزمون',
                accessorKey: 'title',
                cell: (info) => (
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {info.getValue() as string}
                        </div>
                    </div>
                ),
            },
            {
                header: 'توضیحات',
                accessorKey: 'description',
                cell: (info) => (
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                        {info.getValue() as string}
                    </div>
                ),
            },
            {
                header: 'تعداد سوالات',
                accessorKey: 'questionCount',
                cell: (info) => (
                    <div className="font-medium text-gray-900 dark:text-white">
                        {info.getValue() as number} سوال
                    </div>
                ),
                size: 120,
            },
            {
                header: 'مدت زمان',
                accessorKey: 'duration',
                cell: (info) => (
                    <div className="font-medium text-gray-900 dark:text-white">
                        {info.getValue() as number} دقیقه
                    </div>
                ),
                size: 100,
            },
            {
                id: 'actions',
                header: 'عملیات',
                cell: (info) => {
                    const exam = info.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlineEye />}
                                onClick={() => handleView(exam)}
                            />
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlinePencilAlt />}
                                onClick={() => handleEdit(exam)}
                            />
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlineTrash />}
                                onClick={() => handleDelete(exam)}
                                className="text-red-600 hover:text-red-700"
                            />
                        </div>
                    )
                },
                size: 150,
            },
        ],
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        مدیریت آزمون‌ها
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت آزمون‌ها و تعیین اولویت آن‌ها
                    </p>
                </div>
                <Button variant="solid" icon={<HiOutlinePlus />} onClick={() => navigate('/admin/exams/create')}>
                    افزودن آزمون
                </Button>
            </div>

            {/* Info Card */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 برای تغییر اولویت آزمون‌ها، آن‌ها را بکشید و در جای مورد نظر رها کنید.
                </p>
            </Card>

            {/* Table Card */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        لیست آزمون‌ها ({data.length} آزمون)
                    </h2>
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <THead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <Tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <Th key={header.id} colSpan={header.colSpan}>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </Th>
                                            )
                                        })}
                                    </Tr>
                                ))}
                            </THead>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <StrictModeDroppable droppableId="exams-table-body">
                                    {(provided) => (
                                        <TBody
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {table.getRowModel().rows.map((row) => {
                                                return (
                                                    <Draggable
                                                        key={row.id}
                                                        draggableId={row.id}
                                                        index={row.index}
                                                    >
                                                        {(provided, snapshot) => {
                                                            const { style } = provided.draggableProps
                                                            return (
                                                                <Tr
                                                                    ref={provided.innerRef}
                                                                    className={
                                                                        snapshot.isDragging
                                                                            ? 'table bg-gray-50 dark:bg-gray-800'
                                                                            : ''
                                                                    }
                                                                    style={style}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    {row
                                                                        .getVisibleCells()
                                                                        .map((cell) => {
                                                                            return (
                                                                                <Td key={cell.id}>
                                                                                    {flexRender(
                                                                                        cell.column.columnDef.cell,
                                                                                        cell.getContext()
                                                                                    )}
                                                                                </Td>
                                                                            )
                                                                        })}
                                                                </Tr>
                                                            )
                                                        }}
                                                    </Draggable>
                                                )
                                            })}
                                            {provided.placeholder}
                                        </TBody>
                                    )}
                                </StrictModeDroppable>
                            </DragDropContext>
                        </Table>
                    </div>
                </div>
            </Card>

            {/* Edit Dialog */}
            <Dialog
                isOpen={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onRequestClose={() => setEditDialogOpen(false)}
                width={700}
            >
                <h5 className="mb-4">ویرایش آزمون</h5>
                {selectedExam && (
                    <div className="space-y-4">
                        <Input
                            placeholder="عنوان آزمون"
                            value={selectedExam.title}
                            onChange={(e) => setSelectedExam({ ...selectedExam, title: e.target.value })}
                        />
                        <textarea
                            className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="توضیحات"
                            value={selectedExam.description}
                            onChange={(e) => setSelectedExam({ ...selectedExam, description: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                placeholder="تعداد سوالات"
                                value={selectedExam.questionCount}
                                onChange={(e) => setSelectedExam({ ...selectedExam, questionCount: parseInt(e.target.value) })}
                            />
                            <Input
                                type="number"
                                placeholder="مدت زمان (دقیقه)"
                                value={selectedExam.duration}
                                onChange={(e) => setSelectedExam({ ...selectedExam, duration: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="plain" onClick={() => setEditDialogOpen(false)}>
                                انصراف
                            </Button>
                            <Button variant="solid" onClick={handleSaveEdit}>
                                ذخیره تغییرات
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* View Dialog */}
            <Dialog
                isOpen={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                onRequestClose={() => setViewDialogOpen(false)}
                width={600}
            >
                <h5 className="mb-4">مشاهده جزئیات آزمون</h5>
                {selectedExam && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h6 className="font-semibold text-gray-900 dark:text-white mb-2">عنوان آزمون</h6>
                            <p className="text-gray-700 dark:text-gray-300">{selectedExam.title}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h6 className="font-semibold text-gray-900 dark:text-white mb-2">توضیحات</h6>
                            <p className="text-gray-700 dark:text-gray-300">{selectedExam.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h6 className="font-semibold text-gray-900 dark:text-white mb-2">تعداد سوالات</h6>
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {selectedExam.questionCount}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h6 className="font-semibold text-gray-900 dark:text-white mb-2">مدت زمان</h6>
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {selectedExam.duration} دقیقه
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="solid" onClick={() => setViewDialogOpen(false)}>
                                بستن
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default Exams
