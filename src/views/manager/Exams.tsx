import { useMemo, useEffect, useState } from 'react'
import { Card, Button, Skeleton, Notification, toast } from '@/components/ui'
import Table from '@/components/ui/Table'
import Container from '@/components/shared/Container'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { useExaminerSessionStore } from '@/views/auth/SignIn/components/ExaminerSignInForm'
import { HiOutlinePlay, HiOutlineLockClosed } from 'react-icons/hi'
import type { ColumnDef } from '@tanstack/react-table'
import { apiGetCollectionProgress, apiStartExam } from '@/services/ExamineeService'

const { Tr, Th, Td, THead, TBody } = Table

const Exams = () => {
    const navigate = useNavigate()
    const { examData } = useExaminerSessionStore()
    const [loading, setLoading] = useState(true)
    const [progressData, setProgressData] = useState<any>(null)

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true)
                const userId = examData?.user?.id
                const collectionId = examData?.collection?.id

                if (!userId || !collectionId) return

                const response = await apiGetCollectionProgress(collectionId, userId)

                if (response.success && response.data) {
                    setProgressData(response.data)
                }
            } catch (error) {
                console.error('Error fetching collection progress:', error)
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در دریافت اطلاعات پیشرفت آزمون‌ها.
                    </Notification>
                )
            } finally {
                setLoading(false)
            }
        }

        fetchProgress()
    }, [examData?.user?.id, examData?.collection?.id])

    const exams = useMemo(() => {
        return progressData?.exams || []
    }, [progressData])

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'ردیف',
                id: 'rowNumber',
                cell: (info) => (
                    <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center">
                            {info.row.index + 1}
                        </div>
                    </div>
                ),
                size: 80,
            },
            {
                header: 'عنوان آزمون',
                accessorKey: 'exam_title',
                cell: (info) => (
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {info.getValue() as string}
                    </div>
                ),
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
                header: 'وضعیت',
                accessorKey: 'status',
                cell: (info) => {
                    const status = info.getValue() as string

                    const isPassed = status === 'passed'
                    const isFailed = status === 'failed'
                    const isInProgress = status === 'in_progress' || status === 'active'
                    const isCompleted = status === 'completed' || status === 'archived'
                    const isNotStarted = status === 'not_started' || status === 'draft'

                    let color = 'bg-gray-300'
                    let label = 'نامشخص'

                    if (isPassed) { color = 'bg-emerald-500'; label = 'قبول شده' }
                    else if (isFailed) { color = 'bg-red-500'; label = 'مردود' }
                    else if (isInProgress) { color = 'bg-amber-500'; label = 'در حال انجام' }
                    else if (isCompleted) { color = 'bg-blue-500'; label = 'تکمیل شده' }
                    else if (isNotStarted) { color = 'bg-gray-300'; label = 'شروع نشده' }

                    return (
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${color}`} />
                            <span className="text-sm font-medium">{label}</span>
                        </div>
                    )
                },
                size: 150,
            },
            {
                id: 'actions',
                header: 'عملیات',
                cell: (info) => {
                    const exam = info.row.original
                    const status = exam.status
                    const isFinished = ['passed', 'failed', 'completed', 'archived'].includes(status)
                    const isInProgress = status === 'in_progress' || status === 'active'

                    // Sequential locking logic:
                    // An exam is locked if it's not the first one AND the previous exam is not finished.
                    const prevExam = info.row.index > 0 ? info.table.getRowModel().rows[info.row.index - 1].original : null
                    const isLocked = prevExam && !['passed', 'failed', 'completed', 'archived'].includes(prevExam.status)

                    const [isStarting, setIsStarting] = useState(false)

                    const handleAction = async () => {
                        if (isFinished || isLocked) return

                        setIsStarting(true)
                        let resultId = null

                        try {
                            const userId = examData?.user?.id
                            const collectionId = examData?.collection?.id

                            if (!userId || !collectionId) {
                                toast.push(<Notification title="خطا" type="danger">اطلاعات لازم برای شروع آزمون یافت نشد.</Notification>)
                                return
                            }

                            const response = await apiStartExam(exam.exam_id, collectionId, userId)
                            resultId = response.data?.id
                        } catch (error: any) {
                            console.error('Error starting/continuing exam:', error)
                            // Now error is an ApiError object thanks to our ApiClient update
                            resultId = error.data?.id
                        } finally {
                            setIsStarting(false)
                        }

                        if (resultId) {
                            navigate(`/manager/exams/start/${exam.exam_id}`, { state: { resultId } })
                        } else {
                            toast.push(<Notification title="خطا" type="danger">اطلاعات ردیف آزمون یافت نشد.</Notification>)
                        }
                    }

                    return (
                        <Button
                            size="sm"
                            variant="solid"
                            icon={isLocked ? <HiOutlineLockClosed /> : <HiOutlinePlay />}
                            disabled={isFinished || isLocked}
                            loading={isStarting}
                            className={`${(isFinished || isLocked)
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
                                } border-none shadow-md transform transition-transform duration-200 active:scale-95`}
                            onClick={handleAction}
                        >
                            {isLocked ? 'قفل شده' : isFinished ? 'پایان یافته' : isInProgress ? 'ادامه آزمون' : 'شروع آزمون'}
                        </Button>
                    )
                },
                size: 150,
            },
        ],
        [navigate, examData]
    )

    const table = useReactTable({
        data: exams,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Container>
            <div className="space-y-6 mt-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            آزمون‌های من
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {loading ? <Skeleton width={200} /> : (progressData?.collection_title || 'لیست آزمون‌های اختصاص یافته به شما')}
                        </p>
                    </div>
                </div>

                {/* Collection Meta Card */}
                <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border-indigo-100 dark:border-indigo-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">مهلت انجام</span>
                            <div className="text-gray-900 dark:text-white font-medium mt-1">
                                {loading ? <Skeleton width={100} /> : progressData ? `تا ${new Date(progressData.due_date).toLocaleDateString('fa-IR')}` : '-'}
                            </div>
                        </div>
                        <div className="p-4">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">تعداد کل آزمون‌ها</span>
                            <div className="text-gray-900 dark:text-white font-medium mt-1">
                                {loading ? <Skeleton width={100} /> : progressData ? `${progressData.total_exams} مرحله` : '-'}
                            </div>
                        </div>
                        <div className="p-4">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">پیشرفت آزمون</span>
                            <div className="text-gray-900 dark:text-white font-medium mt-1">
                                {loading ? <Skeleton width={100} /> : progressData ? `${progressData.overall_progress}% تکمیل شده` : '-'}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Table Card */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            لیست مراحل آزمون
                        </h2>
                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <THead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <Tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <Th key={header.id}>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </Th>
                                            ))}
                                        </Tr>
                                    ))}
                                </THead>
                                <TBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <Tr key={index}>
                                                {columns.map((_, cellIndex) => (
                                                    <Td key={cellIndex}>
                                                        <Skeleton />
                                                    </Td>
                                                ))}
                                            </Tr>
                                        ))
                                    ) : table.getRowModel().rows.length > 0 ? (
                                        table.getRowModel().rows.map((row) => (
                                            <Tr key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <Td key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </Td>
                                                ))}
                                            </Tr>
                                        ))
                                    ) : (
                                        <Tr>
                                            <Td colSpan={columns.length} className="text-center py-10 text-gray-500">
                                                هیچ آزمونی برای شما یافت نشد.
                                            </Td>
                                        </Tr>
                                    )}
                                </TBody>
                            </Table>
                        </div>
                    </div>
                </Card>
            </div>
        </Container>
    )
}

export default Exams
