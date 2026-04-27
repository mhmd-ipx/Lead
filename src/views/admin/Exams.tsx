import { useMemo, useState, useEffect } from 'react'
import { Card, Button, Input, Dialog, Notification, toast } from '@/components/ui'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { DragDropContext, Draggable } from '@hello-pangea/dnd'
import { MdDragIndicator } from 'react-icons/md'
import { StrictModeDroppable } from '@/components/shared'
import { getExamsList, deleteExam, createExam } from '@/services/AdminService'
import { Exam } from '@/@types/exam'
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePencil,
    HiOutlineX,
    HiOutlineClipboardCheck,
    HiOutlineClock,
    HiOutlineMenuAlt2,
} from 'react-icons/hi'
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
    const [deletingId, setDeletingId] = useState<number | null>(null)

    // Quick-create modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState({
        title: '',
        duration: '',
        description: '',
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const loadExams = async () => {
        try {
            const exams = await getExamsList()
            const examsWithPriority = exams.map((exam, index) => ({
                ...exam,
                priority: index + 1
            }))
            setData(examsWithPriority)

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
        const updatedData = newData.map((item, index) => ({
            ...item,
            priority: index + 1
        }))
        setData(updatedData)
    }

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return
        reorderData(source.index, destination.index)
    }

    const handleDelete = async (exam: ExamWithPriority) => {
        if (!confirm(`آیا از حذف آزمون "${exam.title}" اطمینان دارید؟\nاین عملیات برگشت‌پذیر نیست.`)) return

        setDeletingId(exam.id)
        try {
            await deleteExam(exam.id)
            const updated = data.filter(e => e.id !== exam.id).map((item, index) => ({
                ...item,
                priority: index + 1
            }))
            setData(updated)
            const simpleExams = updated.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description,
                priority: e.priority,
                questionCount: e.questions.length,
                duration: e.duration
            }))
            localStorage.setItem('admin_exams_list_cache', JSON.stringify(simpleExams))
        } catch (error) {
            console.error('Delete exam error:', error)
            alert('خطا در حذف آزمون. لطفاً دوباره تلاش کنید.')
        } finally {
            setDeletingId(null)
        }
    }

    const handleView = (exam: ExamWithPriority) => {
        navigate(`/admin/exams/${exam.id}`)
    }

    // ── Quick-create modal handlers ──────────────────────────────────────────
    const openModal = () => {
        setForm({ title: '', duration: '', description: '' })
        setFormErrors({})
        setModalOpen(true)
    }

    const closeModal = () => {
        if (creating) return
        setModalOpen(false)
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}
        if (!form.title.trim()) errors.title = 'عنوان آزمون الزامی است'
        if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0)
            errors.duration = 'مدت زمان معتبر وارد کنید (دقیقه)'
        return errors
    }

    const handleCreateExam = async () => {
        const errors = validateForm()
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        setCreating(true)
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                duration: Number(form.duration),
                passing_score: 1,
                status: 'draft' as any,
                sections: [
                    {
                        title: 'بخش اول',
                        description: 'توضیحات بخش اول',
                        order: 1,
                        questions: [
                            {
                                question: 'سوال نمونه (ویرایش کنید)',
                                type: 'multiple_choice' as any,
                                options: [
                                    JSON.stringify({ text: 'گزینه الف', file_id: null }),
                                    JSON.stringify({ text: 'گزینه ب', file_id: null }),
                                ],
                                correct_answer: 'گزینه الف',
                                score: 1,
                                difficulty: 'medium',
                                category: 'general',
                                file_id: null,
                            }
                        ]
                    }
                ]
            }

            const response = await createExam(payload)
            if (response.success) {
                toast.push(
                    <Notification type="success" title="موفقیت">
                        آزمون با موفقیت ایجاد شد
                    </Notification>
                )
                setModalOpen(false)

                // Try to extract new exam ID from various response shapes
                const newExamId =
                    response?.data?.id ||
                    response?.data?.exam?.id ||
                    response?.id ||
                    response?.exam?.id ||
                    null

                if (newExamId) {
                    navigate(`/admin/exams/${newExamId}`)
                } else {
                    // Fallback: reload exams and navigate to the newest one
                    const freshExams = await getExamsList()
                    if (freshExams && freshExams.length > 0) {
                        // Take the last exam in list (most recently created)
                        const sorted = [...freshExams].sort((a, b) => b.id - a.id)
                        navigate(`/admin/exams/${sorted[0].id}`)
                    }
                }
            }
        } catch (error) {
            console.error('Create exam error:', error)
            toast.push(
                <Notification type="danger" title="خطا">
                    خطا در ایجاد آزمون. لطفاً دوباره تلاش کنید.
                </Notification>
            )
        } finally {
            setCreating(false)
        }
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
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {info.getValue() as string}
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
                                variant="solid"
                                icon={<HiOutlinePencil />}
                                onClick={() => handleView(exam)}
                            >
                                مشاهده و ویرایش
                            </Button>
                            <Button
                                size="sm"
                                variant="plain"
                                icon={deletingId === exam.id ? undefined : <HiOutlineTrash />}
                                loading={deletingId === exam.id}
                                onClick={() => handleDelete(exam)}
                                className="text-red-600 hover:text-red-700"
                                title="حذف"
                                disabled={deletingId !== null}
                            />
                        </div>
                    )
                },
                size: 180,
            },
        ],
        [data, deletingId]
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (loading && data.length === 0) {
        return (
            <div className="space-y-6">
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
                <Button
                    id="admin-exams-add-btn"
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={openModal}
                >
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
                                        {headerGroup.headers.map((header) => (
                                            <Th key={header.id} colSpan={header.colSpan}>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </Th>
                                        ))}
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
                                            {table.getRowModel().rows.map((row) => (
                                                <Draggable
                                                    key={row.id}
                                                    draggableId={row.id}
                                                    index={row.index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <Tr
                                                            ref={provided.innerRef}
                                                            className={
                                                                snapshot.isDragging
                                                                    ? 'table bg-gray-50 dark:bg-gray-800'
                                                                    : ''
                                                            }
                                                            style={provided.draggableProps.style}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {row.getVisibleCells().map((cell) => (
                                                                <Td key={cell.id}>
                                                                    {flexRender(
                                                                        cell.column.columnDef.cell,
                                                                        cell.getContext()
                                                                    )}
                                                                </Td>
                                                            ))}
                                                        </Tr>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </TBody>
                                    )}
                                </StrictModeDroppable>
                            </DragDropContext>
                        </Table>
                    </div>
                </div>
            </Card>

            {/* ── Quick-Create Modal ─────────────────────────────────────────── */}
            <Dialog
                isOpen={modalOpen}
                onClose={closeModal}
                onRequestClose={closeModal}
                width={520}
            >
                <div className="p-2">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <HiOutlineClipboardCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    ایجاد آزمون جدید
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    اطلاعات پایه را وارد کنید، سپس آزمون را ویرایش کنید
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <HiOutlineClipboardCheck className="w-4 h-4" />
                                    عنوان آزمون
                                    <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <Input
                                id="exam-title-input"
                                placeholder="مثال: آزمون استخدامی حسابداری"
                                value={form.title}
                                onChange={(e) => {
                                    setForm(f => ({ ...f, title: e.target.value }))
                                    if (formErrors.title) setFormErrors(fe => ({ ...fe, title: '' }))
                                }}
                                disabled={creating}
                                className={formErrors.title ? 'border-red-400' : ''}
                            />
                            {formErrors.title && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <HiOutlineClock className="w-4 h-4" />
                                    مدت زمان (دقیقه)
                                    <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <Input
                                id="exam-duration-input"
                                type="number"
                                placeholder="مثال: 60"
                                value={form.duration}
                                onChange={(e) => {
                                    setForm(f => ({ ...f, duration: e.target.value }))
                                    if (formErrors.duration) setFormErrors(fe => ({ ...fe, duration: '' }))
                                }}
                                disabled={creating}
                                className={formErrors.duration ? 'border-red-400' : ''}
                            />
                            {formErrors.duration && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.duration}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <HiOutlineMenuAlt2 className="w-4 h-4" />
                                    توضیحات
                                    <span className="text-xs font-normal text-gray-400">(اختیاری)</span>
                                </span>
                            </label>
                            <Input
                                id="exam-description-input"
                                textArea
                                rows={3}
                                placeholder="توضیحات مختصری درباره آزمون..."
                                value={form.description}
                                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                disabled={creating}
                            />
                        </div>
                    </div>

                    {/* Info note */}
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            💡 پس از ایجاد، یک بخش و یک سوال تستی پیش‌فرض برای شما ساخته می‌شود. می‌توانید در صفحه ویرایش آن‌ها را تغییر دهید.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-6">
                        <Button
                            variant="plain"
                            onClick={closeModal}
                            disabled={creating}
                        >
                            انصراف
                        </Button>
                        <Button
                            id="exam-create-submit-btn"
                            variant="solid"
                            loading={creating}
                            icon={!creating ? <HiOutlinePlus /> : undefined}
                            onClick={handleCreateExam}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-none"
                        >
                            {creating ? 'در حال ایجاد...' : 'ایجاد آزمون'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default Exams
