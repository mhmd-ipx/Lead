import { useEffect, useState } from 'react'
import {
    Card,
    Button,
    Tag,
    Tooltip,
    Input,
    Dialog,
    Skeleton,
    Notification,
    toast,
} from '@/components/ui'
import {
    HiOutlineEye,
    HiOutlineAcademicCap,
    HiOutlineSearch,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineInformationCircle,
    HiOutlineIdentification,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineViewList,
    HiOutlinePhone,
    HiOutlineLockClosed,
    HiOutlineClipboard,
    HiOutlineShare,
    HiOutlineOfficeBuilding
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import Table from '@/components/ui/Table'
import classNames from '@/utils/classNames'
import Cookies from 'js-cookie'
import { getApplicantExamSets, getExamCollectionById } from '@/services/AdminService'
import { ApplicantExamSet } from '@/mock/data/adminData'

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
                'p-4 rounded-2xl cursor-pointer text-right transition duration-150 outline-none w-full min-w-[240px] md:min-w-0 shrink-0 md:shrink-1',
                active && 'bg-white dark:bg-gray-900 shadow-md',
            )}
            onClick={() => onClick(label)}
        >
            <div className="flex justify-between items-center">
                <div>
                    <div className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {title}
                    </div>
                    {typeof value === 'number' ? (
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    ) : (
                        <Skeleton width={50} />
                    )}
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

// ─── CollectionDetails interface ────────────────────────────────────────────
interface CollectionDetails {
    id: number
    code: string
    title: string
    description: string
    created_by: number
    status: string
    start_datetime: string
    end_datetime: string
    duration_minutes: number
    created_at: string
    updated_at: string
    total_exams: number
    exams: {
        id: number
        title: string
        description: string
        duration: number
        passing_score: number
        status: string
        created_by: number
        created_at: string
        updated_at: string
        pivot?: {
            exam_collection_id: number
            exam_id: number
            order: number
            is_required: number
        }
    }[]
    creator: {
        id: number
        phone: string
        avatar: string | null
        role: string
        status: string
        last_login: string
        name: string
        email: string | null
        created_at: string
    }
    assignments: {
        user?: {
            id: number
            name: string
            phone: string
        }
        [key: string]: any
    }[]
}

const AllExamsResults = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [examSets, setExamSets] = useState<ApplicantExamSet[]>([])

    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(
        (Cookies.get('ownerExamResults_category') as FilterCategory) || 'all',
    )
    const [searchQuery, setSearchQuery] = useState(
        Cookies.get('ownerExamResults_search') || '',
    )

    const [infoDialogOpen, setInfoDialogOpen] = useState(false)
    const [collectionLoading, setCollectionLoading] = useState(false)
    const [collectionDetails, setCollectionDetails] = useState<CollectionDetails | null>(null)
    const [copied, setCopied] = useState(false)
    const [collectionStatuses, setCollectionStatuses] = useState<Record<string, string>>({})

    useEffect(() => {
        loadExamSets()
    }, [])

    const handleCategoryChange = (category: FilterCategory) => {
        setSelectedCategory(category)
        Cookies.set('ownerExamResults_category', category)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        Cookies.set('ownerExamResults_search', value)
    }

    const loadExamSets = async () => {
        setLoading(true)
        try {
            const data = await getApplicantExamSets()
            setExamSets(data)

            // Fetch collection statuses
            const statuses: Record<string, string> = {}
            const uniqueCollectionIds = [...new Set(data.map((d: any) => d.collectionId).filter(Boolean))]
            await Promise.all(
                uniqueCollectionIds.map(async (colId: any) => {
                    try {
                        const col = await getExamCollectionById(colId)
                        const status = col?.data?.status || col?.status || 'active'
                        // Map status to all exam sets with this collectionId
                        data.forEach((d: any) => {
                            if (d.collectionId?.toString() === colId?.toString()) {
                                statuses[d.id] = status
                            }
                        })
                    } catch (err) {
                        console.error('Error fetching collection status:', err)
                    }
                })
            )
            setCollectionStatuses(statuses)
        } catch (error) {
            console.error('Error loading exam sets:', error)
        } finally {
            setLoading(false)
        }
    }

    // ── Info dialog ────────────────────────────────────────────────────────
    const handleInfoClick = async (examSet: ApplicantExamSet) => {
        setInfoDialogOpen(true)
        setCollectionLoading(true)
        setCollectionDetails(null)
        try {
            const collectionId = (examSet as any).collectionId || examSet.id
            const response = await getExamCollectionById(collectionId)
            if (response?.data) {
                setCollectionDetails(response.data)
            } else if (response?.id) {
                setCollectionDetails(response)
            } else {
                console.warn('Unexpected response structure', response)
            }
        } catch (error) {
            console.error('Error fetching collection details:', error)
            toast.push(
                <Notification title="خطا در دریافت اطلاعات آزمون" type="danger" />,
                { placement: 'top-center' },
            )
        } finally {
            setCollectionLoading(false)
        }
    }

    // ── Copy / Share ────────────────────────────────────────────────────────
    const buildShareText = (details: CollectionDetails) => {
        const userName = details.assignments?.[0]?.user?.name || 'کاربر'
        const phone = details.assignments?.[0]?.user?.phone || '-'
        const code = details.code || '-'
        const start = formatDate(details.start_datetime)
        const end = formatDate(details.end_datetime)
        return (
            `📌 اطلاعیه آزمون - ${details.title}\n\n` +
            `👤 کاربر: ${userName}\n` +
            `📅 زمان برگزاری: از ${start} تا ${end}\n` +
            `⏱ مدت آزمون: ${details.duration_minutes} دقیقه\n\n` +
            `🔑 اطلاعات ورود به آزمون:\n` +
            `📱 شماره تماس: ${phone}\n` +
            `📌 کد ورود: ${code}`
        )
    }

    const handleCopy = () => {
        if (!collectionDetails) return
        navigator.clipboard.writeText(buildShareText(collectionDetails)).then(() => {
            setCopied(true)
            toast.push(<Notification title="متن کپی شد" type="success" />, { placement: 'top-center' })
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const handleShare = async () => {
        if (!collectionDetails) return
        const text = buildShareText(collectionDetails)
        if (navigator.share) {
            await navigator.share({ text }).catch(() => { })
        } else {
            handleCopy()
        }
    }

    // ── Filters ────────────────────────────────────────────────────────────
    const filteredByCategory = examSets.filter((examSet) => {
        switch (selectedCategory) {
            case 'completed': return examSet.status === 'completed'
            case 'in_progress': return examSet.status === 'in_progress'
            case 'pending': return examSet.status === 'pending'
            default: return true
        }
    })

    const filteredExamSets = filteredByCategory.filter((examSet) =>
        (examSet.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (examSet.applicantName?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
    )

    const totalExamSets = examSets.length
    const completedExamSets = examSets.filter((e) => e.status === 'completed').length
    const inProgressExamSets = examSets.filter((e) => e.status === 'in_progress').length
    const pendingExamSets = examSets.filter((e) => e.status === 'pending').length

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        try {
            return new Date(dateString).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch (e) {
            return '-'
        }
    }

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'completed':
            case 'active':
                return (
                    <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                        {status === 'active' ? 'فعال' : 'تکمیل شده'}
                    </Tag>
                )
            case 'in_progress':
                return (
                    <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                        در حال انجام
                    </Tag>
                )
            case 'pending':
            case 'draft':
                return (
                    <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">
                        {status === 'draft' ? 'پیش‌نویس' : 'در انتظار'}
                    </Tag>
                )
            case 'inactive':
                return (
                    <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100 border-0">
                        غیرفعال
                    </Tag>
                )
            default:
                return (
                    <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100 border-0">
                        {status}
                    </Tag>
                )
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div id="exams-results-header" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        آزمون‌ها و نتایج
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مشاهده تمام آزمون‌های متقاضیان و نتایج آنها
                    </p>
                </div>
                <Input
                    className="w-full sm:w-64"
                    placeholder="جستجو..."
                    prefix={<HiOutlineSearch />}
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Stats Cards */}
            <div id="exams-results-stats-cards" className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-2 md:pb-0 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
                <StatisticCard
                    title="همه آزمون‌ها"
                    value={loading ? undefined as any : totalExamSets}
                    iconClass="bg-purple-200 text-purple-700"
                    icon={<HiOutlineAcademicCap />}
                    label="all"
                    active={selectedCategory === 'all'}
                    onClick={handleCategoryChange}
                />
                <StatisticCard
                    title="تکمیل شده"
                    value={loading ? undefined as any : completedExamSets}
                    iconClass="bg-emerald-200 text-emerald-700"
                    icon={<HiOutlineCheckCircle />}
                    label="completed"
                    active={selectedCategory === 'completed'}
                    onClick={handleCategoryChange}
                />
                <StatisticCard
                    title="در حال انجام"
                    value={loading ? undefined as any : inProgressExamSets}
                    iconClass="bg-blue-200 text-blue-700"
                    icon={<HiOutlineClock />}
                    label="in_progress"
                    active={selectedCategory === 'in_progress'}
                    onClick={handleCategoryChange}
                />
                <StatisticCard
                    title="در انتظار"
                    value={loading ? undefined as any : pendingExamSets}
                    iconClass="bg-amber-200 text-amber-700"
                    icon={<HiOutlineClock />}
                    label="pending"
                    active={selectedCategory === 'pending'}
                    onClick={handleCategoryChange}
                />
            </div>

            {/* Table */}
            <Card id="exams-results-table" className="p-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-0">
                        لیست مجموعه آزمون‌ها
                        {!loading && selectedCategory !== 'all' && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredExamSets.length} مورد)
                            </span>
                        )}
                    </h2>
                </div>
                <div className="overflow-x-auto hidden lg:block">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>متقاضی</Th>
                                    <Th>سازمان</Th>
                                    <Th>تاریخ آزمون</Th>
                                    <Th>نتایج</Th>
                                    <Th>وضعیت</Th>
                                    <Th>عملیات</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {loading ? (
                                    <Tr>
                                        <Td colSpan={6} className="text-center py-10">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            </div>
                                        </Td>
                                    </Tr>
                                ) : filteredExamSets.length > 0 ? (
                                    filteredExamSets.map((examSet) => (
                                        <Tr key={examSet.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                                        {examSet.applicantName?.charAt(0)}
                                                    </div>
                                                    <div className="font-bold text-gray-900 dark:text-gray-100">
                                                        {examSet.applicantName}
                                                    </div>
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <HiOutlineOfficeBuilding className="w-4 h-4" />
                                                    <span>{examSet.companyName}</span>
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <HiOutlineCalendar className="w-4 h-4" />
                                                    <span dir="ltr">{examSet.examDate ? new Date(examSet.examDate).toLocaleDateString('fa-IR') : '-'}</span>
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-gray-900 dark:text-gray-100">{examSet.completedExams}</span>
                                                    <span className="text-gray-500 text-xs">/ {examSet.totalExams} آزمون</span>
                                                </div>
                                            </Td>
                                            <Td>{getStatusTag(examSet.status)}</Td>
                                            <Td>
                                                <div className="flex items-center gap-2">
                                                    <Tooltip title="جزییات آزمون">
                                                        <Button
                                                            variant="plain"
                                                            size="sm"
                                                            icon={<HiOutlineInformationCircle />}
                                                            onClick={() => handleInfoClick(examSet)}
                                                            className="exams-results-action-info"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title={collectionStatuses[examSet.id] === 'archived' ? 'مشاهده نتایج' : 'نتایج هنوز منتشر نشده'}>
                                                        <Button
                                                            variant="plain"
                                                            size="sm"
                                                            icon={<HiOutlineEye />}
                                                            onClick={() => navigate(`/owner/managers/${examSet.applicantId}/exams/${examSet.id}/results`)}
                                                            disabled={collectionStatuses[examSet.id] !== 'archived'}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={6}>
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

                {/* Mobile List View */}
                <div className="lg:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? (
                        [...Array(3)].map((_, index) => (
                            <div key={index} className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton variant="circle" width={32} height={32} />
                                    <Skeleton width={120} height={16} />
                                </div>
                                <Skeleton width="100%" height={24} />
                            </div>
                        ))
                    ) : filteredExamSets.length > 0 ? (
                        filteredExamSets.map((examSet) => (
                            <div key={examSet.id} className="p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                            {examSet.applicantName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white text-sm">
                                                {examSet.applicantName}
                                            </div>
                                            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                                                <HiOutlineOfficeBuilding className="w-3 h-3" />
                                                <span>{examSet.companyName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Tooltip title="جزییات آزمون">
                                            <Button
                                                variant="plain"
                                                size="sm"
                                                shape="circle"
                                                icon={<HiOutlineInformationCircle />}
                                                onClick={() => handleInfoClick(examSet)}
                                                className="text-gray-500 hover:text-indigo-600 bg-gray-50 dark:bg-gray-800/50"
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400">تاریخ آزمون</span>
                                        <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1" dir="ltr">
                                            <HiOutlineCalendar className="w-3.5 h-3.5" />
                                            {examSet.examDate ? new Date(examSet.examDate).toLocaleDateString('fa-IR') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400">نتایج</span>
                                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                                            {examSet.completedExams} <span className="font-normal text-gray-500">/ {examSet.totalExams} آزمون</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 col-span-2">
                                        <span className="text-[10px] text-gray-400">وضعیت</span>
                                        <div className="w-fit scale-[0.85] origin-right">{getStatusTag(examSet.status)}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                    <Button
                                        className="w-full"
                                        variant="default"
                                        size="sm"
                                        icon={<HiOutlineEye />}
                                        onClick={() => navigate(`/owner/managers/${examSet.applicantId}/exams/${examSet.id}/results`)}
                                        disabled={collectionStatuses[examSet.id] !== 'archived'}
                                    >
                                        {collectionStatuses[examSet.id] === 'archived' ? 'مشاهده نتایج' : 'نتایج هنوز منتشر نشده'}
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            {searchQuery || selectedCategory !== 'all'
                                ? 'مجموعه آزمونی با این فیلتر یافت نشد'
                                : 'هنوز مجموعه آزمونی ثبت نشده است'}
                        </div>
                    )}
                </div>
            </Card>

            {/* Info Dialog */}
            <Dialog
                isOpen={infoDialogOpen}
                onClose={() => setInfoDialogOpen(false)}
                onRequestClose={() => setInfoDialogOpen(false)}
                width={700}
            >
                <div className="flex flex-col h-[650px] max-h-[90vh]">
                    <h5 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white border-b pb-4 flex-shrink-0">
                        <HiOutlineInformationCircle className="w-6 h-6 text-indigo-600" />
                        اطلاعات مجموعه آزمون
                    </h5>

                    {collectionLoading ? (
                        <div className="py-12 space-y-4">
                            <Skeleton height={20} className="mb-4" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton height={100} />
                                <Skeleton height={100} />
                            </div>
                            <Skeleton height={200} />
                        </div>
                    ) : collectionDetails ? (
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            {/* Basic Info */}
                            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                            <HiOutlineIdentification className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">عنوان مجموعه</div>
                                            <div className="font-semibold text-gray-900 dark:text-white text-base">
                                                {collectionDetails.title}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{collectionDetails.description}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                                            <HiOutlineClock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">مدت زمان کل</div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {collectionDetails.duration_minutes} دقیقه
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-pink-600">
                                            <HiOutlineUser className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">ایجاد کننده</div>
                                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {collectionDetails.creator?.name}{' '}
                                                <span className="text-xs font-normal text-gray-500">({collectionDetails.creator?.role})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-sm">
                                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <span className="text-gray-600 dark:text-gray-400">وضعیت</span>
                                        <span>{getStatusTag(collectionDetails.status)}</span>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <HiOutlineCalendar className="w-4 h-4" />
                                            شروع
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white" dir="ltr">
                                            {formatDate(collectionDetails.start_datetime)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <HiOutlineCalendar className="w-4 h-4" />
                                            پایان
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white" dir="ltr">
                                            {formatDate(collectionDetails.end_datetime)}
                                        </span>
                                    </div>

                                    {/* ── اطلاعات ورود به آزمون ── */}
                                    <div className="mt-1">
                                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                                            <HiOutlineLockClosed className="w-3.5 h-3.5" />
                                            اطلاعات ورود به آزمون
                                        </div>

                                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <HiOutlinePhone className="w-4 h-4" />
                                                شماره تماس کاربر
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white font-mono" dir="ltr">
                                                {collectionDetails.assignments?.[0]?.user?.phone || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">کد ورود</span>
                                            <Tag>{collectionDetails.code || '-'}</Tag>
                                        </div>

                                        {/* Copy / Share buttons */}
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                icon={<HiOutlineClipboard />}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border-0 justify-center"
                                                onClick={handleCopy}
                                            >
                                                {copied ? 'کپی شد ✓' : 'کپی متن'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                icon={<HiOutlineShare />}
                                                className="flex-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-0 justify-center"
                                                onClick={handleShare}
                                            >
                                                اشتراک گذاری
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Exams List - Scrollable */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <h6 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 flex-shrink-0">
                                    <HiOutlineViewList className="w-5 h-5 text-indigo-500" />
                                    لیست آزمون‌ها ({collectionDetails.total_exams})
                                </h6>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1 relative">
                                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                        <Table>
                                            <THead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10 shadow-sm">
                                                <Tr>
                                                    <Th>عنوان آزمون</Th>
                                                    <Th>مدت</Th>
                                                    <Th>نمره قبولی</Th>
                                                    <Th>اولویت</Th>
                                                </Tr>
                                            </THead>
                                            <TBody>
                                                {collectionDetails.exams?.map((exam) => (
                                                    <Tr key={exam.id}>
                                                        <Td>
                                                            <div className="font-medium text-gray-900 dark:text-white">{exam.title}</div>
                                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{exam.description}</div>
                                                        </Td>
                                                        <Td>
                                                            <Tag className="bg-blue-50 text-blue-600 border-blue-100">{exam.duration} دقیقه</Tag>
                                                        </Td>
                                                        <Td>{exam.passing_score}</Td>
                                                        <Td>{exam.pivot?.order || '-'}</Td>
                                                    </Tr>
                                                ))}
                                                {(!collectionDetails.exams || collectionDetails.exams.length === 0) && (
                                                    <Tr>
                                                        <Td colSpan={4} className="text-center text-gray-500 py-4">آزمونی یافت نشد</Td>
                                                    </Tr>
                                                )}
                                            </TBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            اطلاعاتی یافت نشد.
                        </div>
                    )}

                    <div className="flex justify-end pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                        <Button variant="solid" onClick={() => setInfoDialogOpen(false)}>
                            بستن
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default AllExamsResults
