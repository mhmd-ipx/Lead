import { useMemo, useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { DragDropContext, Draggable } from '@hello-pangea/dnd'
import { MdDragIndicator } from 'react-icons/md'
import { StrictModeDroppable } from '@/components/shared'
import { getExamsList } from '@/services/AdminService'
import { Exam } from '@/@types/exam'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import type { DropResult } from '@hello-pangea/dnd'

type ExamWithPriority = Exam & {
    priority: number
}

const { Tr, Th, Td, THead, TBody } = Table

const Exams = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<ExamWithPriority[]>([])

    const loadExams = async () => {
        try {
            const exams = await getExamsList()
            // Add priority (index + 1) since API doesn't return it yet
            const examsWithPriority = exams.map((exam, index) => ({
                ...exam,
                priority: index + 1
            }))
            setData(examsWithPriority)

            // Cache specific fields for initial render
            const simpleExams = examsWithPriority.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description,
                priority: e.priority,
                questionCount: e.questions.length,
                duration: e.duration
            }))
            localStorage.setItem('admin_exams_list_cache', JSON.stringify(simpleExams))

        } catch (error) {
            console.error('Error loading exams:', error)
        } finally {
            setLoading(false)
        }
    }

    // Load from cache initially
    useEffect(() => {
        const cached = localStorage.getItem('admin_exams_list_cache')
        if (cached) {
            try {
                const parsed = JSON.parse(cached)
                const hydrated = parsed.map((p: any) => ({
                    ...p,
                    questions: Array(p.questionCount || 0).fill({}),
                    status: 'draft',
                    created_by: 0,
                    created_at: '',
                    updated_at: '',
                    creator: {}
                }))
                setData(hydrated)
                setLoading(false)
            } catch (e) {
                console.error('Cache parse error', e)
            }
        }
        loadExams()
    }, [])

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
        // In real app, call API to save order here
    }

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return
        reorderData(source.index, destination.index)
    }

    const handleDelete = (exam: ExamWithPriority) => {
        if (confirm(`آیا از حذف آزمون "${exam.title}" اطمینان دارید؟`)) {
            // In real app, call API to delete
            setData(data.filter(e => e.id !== exam.id))
            alert('آزمون حذف شد (فعلا فقط از لیست لوکال)')
        }
    }

    const handleView = (exam: ExamWithPriority) => {
        navigate(`/admin/exams/${exam.id}`)
    }

    const columns: ColumnDef<ExamWithPriority>[] = useMemo(
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
                accessorFn: (row) => row.questions.length,
                id: 'questionCount',
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
                                title="مشاهده و ویرایش"
                            />
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlineTrash />}
                                onClick={() => handleDelete(exam)}
                                className="text-red-600 hover:text-red-700"
                                title="حذف"
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

    if (loading && data.length === 0) {
        return (
            <div className="space-y-6">
                {/* Skeleton loading same as before */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <Card>
                    <div className="p-6">
                        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                        <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    </div>
                                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div id="admin-exams-header" className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        مدیریت آزمون‌ها
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت آزمون‌ها و تعیین اولویت آن‌ها
                    </p>
                </div>
                <Button id="admin-exams-add-btn" variant="solid" icon={<HiOutlinePlus />} onClick={() => navigate('/admin/exams/create')}>
                    افزودن آزمون
                </Button>
            </div>

            {/* Info Card */}
            <Card id="admin-exams-info" className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 برای تغییر اولویت آزمون‌ها، آن‌ها را بکشید و در جای مورد نظر رها کنید.
                </p>
            </Card>

            {/* Table Card */}
            <Card id="admin-exams-table-container">
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
        </div>
    )
}

export default Exams
