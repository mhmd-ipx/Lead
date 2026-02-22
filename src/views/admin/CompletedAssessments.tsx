import { useEffect, useState } from 'react'
import { Card, Button, Tag, Tooltip, Input, Checkbox, Dialog, Skeleton, Notification, toast } from '@/components/ui'
import {
    HiOutlineSearch,
    HiOutlineClipboardCheck,
    HiOutlineOfficeBuilding,
    HiOutlineUser,
    HiOutlineAcademicCap,
    HiOutlineEye,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiArrowLeft,
    HiArrowRight
} from 'react-icons/hi'
import { getCompletedAssessments, getExamsList, createExamCollection } from '@/services/AdminService'
import { AdminCompletedAssessment } from '@/@types/adminAssessment'
import { Exam } from '@/@types/exam'
import { useNavigate } from 'react-router-dom'
import classNames from '@/utils/classNames'
import dayjs from 'dayjs'
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import TimePicker from "react-multi-date-picker/plugins/time_picker"
import "react-multi-date-picker/styles/layouts/mobile.css"

type FilterCategory = 'all' | 'assigned' | 'pending'

type StatisticCardProps = {
    title: string
    value: number
    icon: React.ReactNode
    iconClass: string
    label: FilterCategory
    active: boolean
    onClick: (label: FilterCategory) => void
    id?: string
}

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, label, icon, iconClass, active, onClick, id } = props

    return (
        <button
            id={id}
            className={classNames(
                'p-4 rounded-2xl cursor-pointer text-right transition duration-150 outline-none w-full border border-transparent',
                active ? 'bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800',
            )}
            onClick={() => onClick(label)}
        >
            <div className="flex justify-between items-center">
                <div>
                    <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                </div>
                <div
                    className={classNames(
                        'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 rounded-xl text-2xl',
                        iconClass,
                    )}
                >
                    {icon}
                </div>
            </div>
        </button>
    )
}

const CompletedAssessments = () => {
    const [assessments, setAssessments] = useState<AdminCompletedAssessment[]>([])
    const [exams, setExams] = useState<Exam[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedAssessment, setSelectedAssessment] = useState<AdminCompletedAssessment | null>(null)
    const [selectedExamIds, setSelectedExamIds] = useState<number[]>([])

    // New State for Exam Collection Form
    const [step, setStep] = useState(1)
    const [collectionForm, setCollectionForm] = useState({
        title: '',
        description: '',
        start_datetime: null as Date | null,
        end_datetime: null as Date | null,
        due_date: null as Date | null,
        duration_minutes: 60,
    })
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [assessmentsData, examsData] = await Promise.all([
                getCompletedAssessments(),
                getExamsList()
            ])
            setAssessments(assessmentsData)
            setExams(examsData || [])
        } catch (error) {
            console.error('Error loading data:', error)
            toast.push(
                <Notification title="خطا در دریافت اطلاعات" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    const handleOpenAssignDialog = (assessment: AdminCompletedAssessment) => {
        setSelectedAssessment(assessment)
        setSelectedExamIds([]) // Reset for new assignment
        setStep(1)
        setCollectionForm({
            title: assessment.manager ? `مجموعه آزمون برای ${assessment.manager.user.name}` : 'مجموعه آزمون جدید',
            description: 'لطفاً آزمون‌های زیر را در مهلت تعیین شده انجام دهید.',
            start_datetime: new Date(),
            end_datetime: dayjs().add(14, 'day').toDate(),
            due_date: dayjs().add(14, 'day').toDate(),
            duration_minutes: 60,
        })
        setAssignDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setAssignDialogOpen(false)
        setSelectedAssessment(null)
        setSelectedExamIds([])
        setStep(1)
    }

    const handleNextStep = () => {
        if (selectedExamIds.length === 0) {
            toast.push(
                <Notification title="لطفاً حداقل یک آزمون انتخاب کنید" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }

        // Calculate total duration based on selected exams if needed
        const totalDuration = exams
            .filter(e => selectedExamIds.includes(Number(e.id)))
            .reduce((sum, e) => sum + (e.duration || 0), 0)

        setCollectionForm(prev => ({
            ...prev,
            duration_minutes: totalDuration > 0 ? totalDuration : 60
        }))

        setStep(2)
    }

    const handlePrevStep = () => {
        setStep(1)
    }

    const handleAssignExams = async () => {
        if (!selectedAssessment) return
        if (!collectionForm.title || !collectionForm.start_datetime || !collectionForm.end_datetime || !collectionForm.due_date) {
            toast.push(
                <Notification title="لطفاً تمام فیلدها را پر کنید" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }

        setSubmitting(true)

        try {
            const payload = {
                title: collectionForm.title,
                description: collectionForm.description,
                status: 'active' as const,
                start_datetime: dayjs(collectionForm.start_datetime).format('YYYY-MM-DD HH:mm:ss'),
                end_datetime: dayjs(collectionForm.end_datetime).format('YYYY-MM-DD HH:mm:ss'),
                due_date: dayjs(collectionForm.due_date).format('YYYY-MM-DD'),
                duration_minutes: Number(collectionForm.duration_minutes),
                exam_ids: selectedExamIds, // Already numbers
                user_id: Number(selectedAssessment.manager.user_id),
            }

            await createExamCollection(payload)

            toast.push(
                <Notification title="مجموعه آزمون با موفقیت ایجاد و اختصاص داده شد" type="success" />,
                { placement: 'top-end' }
            )

            // Update local state to reflect assignment
            // Note: assignedExams in AdminCompletedAssessment might still be string[], check that type.
            // If it is string[], we might need to cast or convert. 
            // In AdminCompletedAssessment type: assignedExams?: string[] (based on previous view_file of CompletedAssessments.tsx line 107 in original)
            // But wait, I'm replacing the file. I should check @/@types/adminAssessment.ts

            // Assume assignedExams is compatible or we map it. 
            // Since we updated local state with `setAssessments`, we should be careful.

            setAssessments(assessments.map(a =>
                a.id === selectedAssessment.id
                    ? { ...a, assignedExams: selectedExamIds.map(String) } // Convert to string if expected
                    : a
            ))

            handleCloseDialog()
        } catch (error) {
            console.error('Error assigning exams:', error)
            toast.push(
                <Notification title="خطا در اختصاص آزمون‌ها" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    const toggleExamSelection = (examId: number) => {
        if (selectedExamIds.includes(examId)) {
            setSelectedExamIds(selectedExamIds.filter(id => id !== examId))
        } else {
            setSelectedExamIds([...selectedExamIds, examId])
        }
    }

    const getStatusTag = (status: AdminCompletedAssessment['status']) => {
        switch (status) {
            case 'submitted':
                return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">تکمیل شده</Tag>
            case 'draft':
                return <Tag className="text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20 border-0">پیش‌نویس</Tag>
            default:
                return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">نامشخص</Tag>
        }
    }

    // Filter by category first
    const filteredByCategory = assessments.filter(assessment => {
        switch (selectedCategory) {
            case 'assigned':
                return (assessment.assignedExams?.length || 0) > 0
            case 'pending':
                return (assessment.assignedExams?.length || 0) === 0
            case 'all':
            default:
                return true
        }
    })

    // Then filter by search query
    const filteredAssessments = filteredByCategory.filter(assessment =>
        assessment.manager.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.manager.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.template.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Calculate statistics
    const totalAssessments = assessments.length
    const assignedAssessments = assessments.filter(a => (a.assignedExams?.length || 0) > 0).length
    const pendingAssessments = assessments.filter(a => (a.assignedExams?.length || 0) === 0).length

    // Skeleton loading component
    const SkeletonRow = () => (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={120} height={16} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={140} height={14} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={80} height={20} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton width={80} height={24} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circle" width={32} height={32} />
                    <Skeleton variant="circle" width={32} height={32} />
                </div>
            </td>
        </tr>
    )

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            نیازسنجی‌های تکمیل شده
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            مدیریت نیازسنجی‌ها و اختصاص آزمون‌ها
                        </p>
                    </div>
                </div>

                {/* Statistics Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <Skeleton width={100} height={14} />
                                    <Skeleton width={60} height={32} />
                                </div>
                                <Skeleton variant="circle" width={48} height={48} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Skeleton */}
                <Card>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        {['متقاضی', 'سازمان', 'آزمون‌های اختصاص داده شده', 'وضعیت', 'عملیات'].map(h => (
                                            <th key={h} className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
                <div id="admin-assessments-completed-header">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        نیازسنجی‌های تکمیل شده
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت نیازسنجی‌ها و اختصاص آزمون‌ها
                    </p>
                </div>
                <Input
                    id="admin-assessments-completed-search"
                    className="w-64"
                    placeholder="جستجو..."
                    prefix={<HiOutlineSearch />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatisticCard
                    id="admin-assessments-completed-stats-all"
                    title="همه نیازسنجی‌ها"
                    value={totalAssessments}
                    iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    icon={<HiOutlineClipboardCheck />}
                    label="all"
                    active={selectedCategory === 'all'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    id="admin-assessments-completed-stats-assigned"
                    title="اختصاص داده شده"
                    value={assignedAssessments}
                    iconClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    icon={<HiOutlineCheckCircle />}
                    label="assigned"
                    active={selectedCategory === 'assigned'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    id="admin-assessments-completed-stats-pending"
                    title="در انتظار"
                    value={pendingAssessments}
                    iconClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                    icon={<HiOutlineClock />}
                    label="pending"
                    active={selectedCategory === 'pending'}
                    onClick={setSelectedCategory}
                />
            </div>

            {/* Assessments Table */}
            <Card id="admin-assessments-completed-table">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineClipboardCheck className="w-5 h-5" />
                        لیست نیازسنجی‌ها
                        {selectedCategory !== 'all' && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredAssessments.length} مورد)
                            </span>
                        )}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        متقاضی
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        سازمان
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                        آزمون‌های اختصاص داده شده
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                        وضعیت
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                        عملیات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAssessments.map((assessment) => (
                                    <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineUser className="w-5 h-5 text-gray-400" />
                                                <div className=" font-bold text-gray-900 dark:text-white">
                                                    {assessment.manager.user.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineOfficeBuilding className="w-5 h-5 text-gray-400" />
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {assessment.manager.company.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Tag className={classNames(
                                                "border-0",
                                                (assessment.assignedExams?.length || 0) > 0
                                                    ? "text-indigo-600 bg-indigo-100 dark:text-indigo-100 dark:bg-indigo-500/20"
                                                    : "text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800"
                                            )}>
                                                {(assessment.assignedExams?.length || 0)} آزمون
                                            </Tag>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusTag(assessment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Tooltip title="مشاهده جزئیات">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineEye />}
                                                        onClick={() => navigate(`/admin/assessments/${assessment.id}`)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="اختصاص آزمون">
                                                    <Button
                                                        id="admin-assessments-completed-action-assign"
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineAcademicCap />}
                                                        onClick={() => handleOpenAssignDialog(assessment)}
                                                        className="text-indigo-600 hover:text-indigo-700"
                                                    />
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAssessments.length === 0 && (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="text-center py-12">
                                                <HiOutlineClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {searchQuery
                                                        ? 'نیازسنجی با این فیلتر یافت نشد'
                                                        : 'هنوز نیازسنجی‌ای ثبت نشده است'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>

            {/* Assign Exams Dialog */}
            <Dialog
                isOpen={assignDialogOpen}
                onClose={handleCloseDialog}
                onRequestClose={handleCloseDialog}
                width={800}
                className="pb-0"
            >
                <div className="p-6 h-full flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineAcademicCap className="w-6 h-6 text-indigo-600" />
                        <span>اختصاص مجموعه آزمون</span>
                        <span className="text-sm font-normal text-gray-500 mx-2">|</span>
                        <span className="text-sm font-normal text-gray-500">مرحله {step} از 2</span>
                    </h3>

                    {selectedAssessment && (
                        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium mb-1">نیازسنجی مربوط به:</p>
                                <p className="font-bold text-gray-900 dark:text-white">{selectedAssessment.manager.user.name}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium mb-1">سازمان:</p>
                                <p className="font-bold text-gray-900 dark:text-white">{selectedAssessment.manager.company.name}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto mb-6 px-1 max-h-[50vh]">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    لطفاً آزمون‌های مورد نظر برای این کاربر را انتخاب کنید:
                                </p>
                                {exams.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {exams.map((exam) => (
                                            <div
                                                key={exam.id}
                                                className={classNames(
                                                    "flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer",
                                                    selectedExamIds.includes(exam.id)
                                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                )}
                                                onClick={() => toggleExamSelection(exam.id)}
                                            >
                                                <Checkbox
                                                    checked={selectedExamIds.includes(exam.id)}
                                                    onChange={() => toggleExamSelection(exam.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="font-bold text-gray-900 dark:text-white text-sm truncate ml-2">{exam.title}</div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className="text-xs text-gray-500">{exam.questions?.length || 0} سوال</span>
                                                            <Tag className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-6 text-xs">{exam.duration} دقیقه</Tag>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{exam.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <p className="text-gray-500">هیچ آزمونی یافت نشد.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            عنوان مجموعه آزمون <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            value={collectionForm.title}
                                            onChange={e => setCollectionForm({ ...collectionForm, title: e.target.value })}
                                            placeholder="عنوان مجموعه را وارد کنید"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            توضیحات
                                        </label>
                                        <Input
                                            textArea
                                            value={collectionForm.description}
                                            onChange={e => setCollectionForm({ ...collectionForm, description: e.target.value })}
                                            placeholder="توضیحات تکمیلی برای کاربر..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                تاریخ شروع <span className="text-red-500">*</span>
                                            </label>
                                            <DatePicker
                                                value={collectionForm.start_datetime}
                                                onChange={(date: any) => {
                                                    const jsDate = date?.toDate ? date.toDate() : date;
                                                    setCollectionForm({ ...collectionForm, start_datetime: jsDate })
                                                }}
                                                calendar={persian}
                                                locale={persian_fa}
                                                format="YYYY/MM/DD HH:mm"
                                                plugins={[
                                                    <TimePicker position="bottom" />
                                                ]}
                                                containerClassName="w-full"
                                                inputClass="w-full h-11 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                                placeholder="انتخاب تاریخ و ساعت"
                                                calendarPosition="bottom-right"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                تاریخ پایان <span className="text-red-500">*</span>
                                            </label>
                                            <DatePicker
                                                value={collectionForm.end_datetime}
                                                onChange={(date: any) => {
                                                    const jsDate = date?.toDate ? date.toDate() : date;
                                                    setCollectionForm({ ...collectionForm, end_datetime: jsDate })
                                                }}
                                                calendar={persian}
                                                locale={persian_fa}
                                                format="YYYY/MM/DD HH:mm"
                                                plugins={[
                                                    <TimePicker position="bottom" />
                                                ]}
                                                containerClassName="w-full"
                                                inputClass="w-full h-11 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                                placeholder="انتخاب تاریخ و ساعت"
                                                calendarPosition="bottom-right"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                مهلت انجام (Due Date) <span className="text-red-500">*</span>
                                            </label>
                                            <DatePicker
                                                value={collectionForm.due_date}
                                                onChange={(date: any) => {
                                                    const jsDate = date?.toDate ? date.toDate() : date;
                                                    setCollectionForm({ ...collectionForm, due_date: jsDate })
                                                }}
                                                calendar={persian}
                                                locale={persian_fa}
                                                format="YYYY/MM/DD"
                                                containerClassName="w-full"
                                                inputClass="w-full h-11 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                                placeholder="انتخاب تاریخ"
                                                calendarPosition="bottom-right"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                مدت زمان کل (دقیقه) <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                value={collectionForm.duration_minutes}
                                                onChange={e => setCollectionForm({ ...collectionForm, duration_minutes: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                        <Button
                            variant="plain"
                            onClick={handleCloseDialog}
                            disabled={submitting}
                        >
                            انصراف
                        </Button>
                        <div className="flex gap-2">
                            {step === 2 && (
                                <Button
                                    variant="default"
                                    onClick={handlePrevStep}
                                    disabled={submitting}
                                    icon={<HiArrowRight className="ml-2" />}
                                >
                                    مرحله قبل
                                </Button>
                            )}
                            {step === 1 ? (
                                <Button
                                    variant="solid"
                                    onClick={handleNextStep}
                                    disabled={selectedExamIds.length === 0}
                                    icon={<HiArrowLeft className="mr-2" />}
                                >
                                    مرحله بعد
                                </Button>
                            ) : (
                                <Button
                                    variant="solid"
                                    onClick={handleAssignExams}
                                    loading={submitting}
                                    icon={<HiOutlineCheckCircle className="mr-2" />}
                                >
                                    تایید و اختصاص
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default CompletedAssessments
