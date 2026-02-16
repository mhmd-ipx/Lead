import { useEffect, useState } from 'react'
import { Card, Button, Tag, Tooltip, Input, Checkbox, Dialog, Skeleton } from '@/components/ui'
import {
    HiOutlineSearch,
    HiOutlineClipboardCheck,
    HiOutlineOfficeBuilding,
    HiOutlineUser,
    HiOutlineAcademicCap,
    HiOutlineEye,
    HiOutlineClock,
    HiOutlineCheckCircle,
} from 'react-icons/hi'
import { getCompletedAssessments, getExams, assignExamsToAssessment } from '@/services/AdminService'
import { AdminCompletedAssessment } from '@/@types/adminAssessment'
import { Exam } from '@/mock/data/adminData'
import { useNavigate } from 'react-router-dom'
import classNames from '@/utils/classNames'

type FilterCategory = 'all' | 'assigned' | 'pending'

type StatisticCardProps = {
    title: string
    value: number
    icon: React.ReactNode
    iconClass: string
    label: FilterCategory
    active: boolean
    onClick: (label: FilterCategory) => void
}

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, label, icon, iconClass, active, onClick } = props

    return (
        <button
            className={classNames(
                'p-4 rounded-2xl cursor-pointer text-right transition duration-150 outline-none w-full',
                active && 'bg-white dark:bg-gray-900 shadow-md',
            )}
            onClick={() => onClick(label)}
        >
            <div className="flex justify-between items-center">
                <div>
                    <div className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {title}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                </div>
                <div
                    className={classNames(
                        'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 rounded-full text-2xl',
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
    const [selectedExamIds, setSelectedExamIds] = useState<string[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [assessmentsData, examsData] = await Promise.all([
                getCompletedAssessments(),
                getExams()
            ])
            setAssessments(assessmentsData)
            setExams(examsData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenAssignDialog = (assessment: AdminCompletedAssessment) => {
        setSelectedAssessment(assessment)
        setSelectedExamIds(assessment.assignedExams || [])
        setAssignDialogOpen(true)
    }

    const handleAssignExams = async () => {
        if (!selectedAssessment) return

        try {
            await assignExamsToAssessment(selectedAssessment.id.toString(), selectedExamIds)

            // Update local state
            setAssessments(assessments.map(a =>
                a.id === selectedAssessment.id
                    ? { ...a, assignedExams: selectedExamIds }
                    : a
            ))

            setAssignDialogOpen(false)
            setSelectedAssessment(null)
            setSelectedExamIds([])
        } catch (error) {
            console.error('Error assigning exams:', error)
            alert('خطا در اختصاص آزمون‌ها')
        }
    }

    const toggleExamSelection = (examId: string) => {
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
                    <Input
                        className="w-64"
                        placeholder="جستجو..."
                        prefix={<HiOutlineSearch />}
                        disabled
                    />
                </div>

                {/* Statistics Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white dark:bg-gray-900">
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
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineClipboardCheck className="w-5 h-5" />
                            لیست نیازسنجی‌ها
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
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                            آزمون‌های اختصاص داده شده
                                        </th>
                                        <th className="px-6 py-3 text-right font-bold text-xs  text-gray-500 dark:text-gray-400 uppercase">
                                            وضعیت
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-bol text-gray-500 dark:text-gray-400 uppercase">
                                            عملیات
                                        </th>
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        نیازسنجی‌های تکمیل شده
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت نیازسنجی‌ها و اختصاص آزمون‌ها
                    </p>
                </div>
                <Input
                    className="w-64"
                    placeholder="جستجو..."
                    prefix={<HiOutlineSearch />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
                <StatisticCard
                    title="همه نیازسنجی‌ها"
                    value={totalAssessments}
                    iconClass="bg-blue-200 text-blue-700"
                    icon={<HiOutlineClipboardCheck />}
                    label="all"
                    active={selectedCategory === 'all'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="اختصاص داده شده"
                    value={assignedAssessments}
                    iconClass="bg-green-200 text-green-700"
                    icon={<HiOutlineCheckCircle />}
                    label="assigned"
                    active={selectedCategory === 'assigned'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="در انتظار"
                    value={pendingAssessments}
                    iconClass="bg-amber-200 text-amber-700"
                    icon={<HiOutlineClock />}
                    label="pending"
                    active={selectedCategory === 'pending'}
                    onClick={setSelectedCategory}
                />
            </div>

            {/* Assessments Table */}
            <Card>
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
                                            <Tag className="text-indigo-600 bg-indigo-100 dark:text-indigo-100 dark:bg-indigo-500/20 border-0">
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
                onClose={() => {
                    setAssignDialogOpen(false)
                    setSelectedAssessment(null)
                    setSelectedExamIds([])
                }}
                onRequestClose={() => {
                    setAssignDialogOpen(false)
                    setSelectedAssessment(null)
                    setSelectedExamIds([])
                }}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineAcademicCap className="w-5 h-5" />
                        اختصاص مجموعه آزمون
                    </h3>

                    {selectedAssessment && (
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-sm">
                                <p className="text-gray-600 dark:text-gray-400">نیازسنجی:</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{selectedAssessment.manager.user.name} - {selectedAssessment.manager.company.name}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 mb-6">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">انتخاب آزمون‌ها:</p>
                        {exams.map((exam) => (
                            <div key={exam.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <Checkbox
                                    checked={selectedExamIds.includes(exam.id)}
                                    onChange={() => toggleExamSelection(exam.id)}
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">{exam.title}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{exam.description}</div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        <span>{exam.totalQuestions} سوال</span>
                                        <span>{exam.duration} دقیقه</span>
                                        <Tag className={`text-xs ${exam.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'} border-0`}>
                                            {exam.status === 'active' ? 'فعال' : exam.status === 'completed' ? 'تکمیل شده' : 'پیش‌نویس'}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="plain"
                            onClick={() => {
                                setAssignDialogOpen(false)
                                setSelectedAssessment(null)
                                setSelectedExamIds([])
                            }}
                        >
                            انصراف
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleAssignExams}
                        >
                            اختصاص ({selectedExamIds.length} آزمون)
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default CompletedAssessments
