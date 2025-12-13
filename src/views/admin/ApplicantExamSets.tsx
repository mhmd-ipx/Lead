import { useEffect, useState } from 'react'
import { Card, Button, Tag, Tooltip, Progress, Dialog, Input } from '@/components/ui'
import {
    HiOutlineEye,
    HiOutlineChartBar,
    HiOutlineAcademicCap,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineInformationCircle,
    HiOutlineMail,
    HiOutlineSearch,
    HiOutlineUser,
    HiOutlineOfficeBuilding,
} from 'react-icons/hi'
import { getApplicantExamSets } from '@/services/AdminService'
import { ApplicantExamSet } from '@/mock/data/adminData'
import Table from '@/components/ui/Table'
import classNames from '@/utils/classNames'
import { useNavigate } from 'react-router-dom'

const { Tr, Th, Td, THead, TBody } = Table

type FilterCategory = 'all' | 'completed' | 'in_progress' | 'pending'

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

const ApplicantExamSets = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [examSets, setExamSets] = useState<ApplicantExamSet[]>([])
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [infoDialogOpen, setInfoDialogOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedExamSet, setSelectedExamSet] = useState<ApplicantExamSet | null>(null)

    useEffect(() => {
        loadExamSets()
    }, [])

    const loadExamSets = async () => {
        try {
            const data = await getApplicantExamSets()
            setExamSets(data)
        } catch (error) {
            console.error('Error loading exam sets:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredByCategory = examSets.filter(examSet => {
        switch (selectedCategory) {
            case 'completed':
                return examSet.status === 'completed'
            case 'in_progress':
                return examSet.status === 'in_progress'
            case 'pending':
                return examSet.status === 'pending'
            case 'all':
            default:
                return true
        }
    })

    const filteredExamSets = filteredByCategory.filter(examSet =>
        examSet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        examSet.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        examSet.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalExamSets = examSets.length
    const completedExamSets = examSets.filter(e => e.status === 'completed').length
    const inProgressExamSets = examSets.filter(e => e.status === 'in_progress').length
    const pendingExamSets = examSets.filter(e => e.status === 'pending').length

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    const getStatusTag = (status: ApplicantExamSet['status']) => {
        switch (status) {
            case 'completed':
                return (
                    <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                        تکمیل شده
                    </Tag>
                )
            case 'in_progress':
                return (
                    <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                        در حال انجام
                    </Tag>
                )
            case 'pending':
                return (
                    <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">
                        در انتظار
                    </Tag>
                )
        }
    }

    const handleSendInvitation = () => {
        alert('پیام دعوت برای متقاضی ارسال شد')
        setInfoDialogOpen(false)
    }

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
                        آزمون‌های متقاضیان
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مدیریت و نظارت بر آزمون‌های تمام متقاضیان
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
                <StatisticCard
                    title="همه آزمون‌ها"
                    value={totalExamSets}
                    iconClass="bg-purple-200 text-purple-700"
                    icon={<HiOutlineAcademicCap />}
                    label="all"
                    active={selectedCategory === 'all'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="تکمیل شده"
                    value={completedExamSets}
                    iconClass="bg-emerald-200 text-emerald-700"
                    icon={<HiOutlineCheckCircle />}
                    label="completed"
                    active={selectedCategory === 'completed'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="در حال انجام"
                    value={inProgressExamSets}
                    iconClass="bg-blue-200 text-blue-700"
                    icon={<HiOutlineClock />}
                    label="in_progress"
                    active={selectedCategory === 'in_progress'}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="در انتظار"
                    value={pendingExamSets}
                    iconClass="bg-amber-200 text-amber-700"
                    icon={<HiOutlineClock />}
                    label="pending"
                    active={selectedCategory === 'pending'}
                    onClick={setSelectedCategory}
                />
            </div>

            {/* Table */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        لیست مجموعه آزمون‌ها
                        {selectedCategory !== 'all' && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredExamSets.length} مورد)
                            </span>
                        )}
                    </h2>
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>متقاضی</Th>
                                    <Th>سازمان</Th>
                                    <Th>تاریخ اختصاص</Th>
                                    <Th>تاریخ آزمون</Th>
                                    <Th>پیشرفت</Th>
                                    <Th>تعداد آزمون</Th>
                                    <Th>مدت زمان</Th>
                                    <Th>وضعیت</Th>
                                    <Th>عملیات</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {filteredExamSets.map((examSet) => (
                                    <Tr key={examSet.id}>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <HiOutlineUser className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {examSet.applicantName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {examSet.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {examSet.companyName}
                                                </span>
                                            </div>
                                        </Td>
                                        <Td>{formatDate(examSet.assignedDate)}</Td>
                                        <Td>
                                            {examSet.examDate ? formatDate(examSet.examDate) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </Td>
                                        <Td>
                                            <div className="w-32">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold">{examSet.progress}%</span>
                                                </div>
                                                <Progress percent={examSet.progress} />
                                            </div>
                                        </Td>
                                        <Td>
                                            <span className="font-medium">
                                                {examSet.completedExams}/{examSet.totalExams}
                                            </span>
                                        </Td>
                                        <Td>{examSet.duration} دقیقه</Td>
                                        <Td>{getStatusTag(examSet.status)}</Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <Tooltip title="اطلاعات آزمون">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineInformationCircle />}
                                                        onClick={() => {
                                                            setSelectedExamSet(examSet)
                                                            setInfoDialogOpen(true)
                                                        }}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="مشاهده نتایج">
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineEye />}
                                                        onClick={() => navigate(`/admin/applicant-exams/${examSet.id}/results`)}
                                                    />
                                                </Tooltip>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                                {filteredExamSets.length === 0 && (
                                    <Tr>
                                        <Td colSpan={9}>
                                            <div className="text-center py-12">
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {searchQuery || selectedCategory !== 'all'
                                                        ? 'مجموعه آزمونی با این فیلتر یافت نشد'
                                                        : 'هنوز مجموعه آزمونی ثبت نشده است'}
                                                </p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </TBody>
                        </Table>
                    </div>
                </div>
            </Card>

            {/* Info Dialog */}
            <Dialog
                isOpen={infoDialogOpen}
                onClose={() => setInfoDialogOpen(false)}
                onRequestClose={() => setInfoDialogOpen(false)}
            >
                <h5 className="mb-4">اطلاعات ورود به آزمون</h5>
                {selectedExamSet && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">متقاضی</p>
                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                {selectedExamSet.applicantName} - {selectedExamSet.companyName}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">نام کاربری</p>
                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
                                {selectedExamSet.username}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">رمز عبور</p>
                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
                                {selectedExamSet.password}
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                            <Button variant="plain" onClick={() => setInfoDialogOpen(false)}>
                                بستن
                            </Button>
                            <Button
                                variant="solid"
                                icon={<HiOutlineMail />}
                                onClick={handleSendInvitation}
                            >
                                ارسال دعوتنامه
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* View Exams Dialog */}
            <Dialog
                isOpen={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                onRequestClose={() => setViewDialogOpen(false)}
                width={900}
            >
                <h5 className="mb-4">آزمون‌های {selectedExamSet?.title}</h5>
                {selectedExamSet?.exams && (
                    <div className="max-h-[500px] overflow-y-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>عنوان آزمون</Th>
                                    <Th>توضیحات</Th>
                                    <Th>تعداد سوال</Th>
                                    <Th>مدت زمان</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {selectedExamSet.exams.map((exam, index) => (
                                    <Tr key={exam.id}>
                                        <Td>
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {index + 1}
                                                </span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {exam.title}
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {exam.description}
                                            </div>
                                        </Td>
                                        <Td>
                                            <Tag className="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-100 border-0">
                                                {exam.questionCount} سوال
                                            </Tag>
                                        </Td>
                                        <Td>
                                            <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                                                {exam.duration} دقیقه
                                            </Tag>
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                )}
                <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="solid" onClick={() => setViewDialogOpen(false)}>
                        بستن
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default ApplicantExamSets
