import { useEffect, useState } from 'react'
import { Card, Button, Tag, Tooltip, Progress, Dialog, Input, Skeleton, Notification, toast, Select, Checkbox } from '@/components/ui'
import {
    HiOutlineEye,
    HiOutlineAcademicCap,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineInformationCircle,
    HiOutlineMail,
    HiOutlineSearch,
    HiOutlineUser,
    HiOutlineOfficeBuilding,
    HiOutlineCalendar,
    HiOutlineIdentification,
    HiOutlineTable,
    HiOutlineViewList,
    HiOutlinePencil,
    HiArrowLeft,
    HiArrowRight
} from 'react-icons/hi'
import { getApplicantExamSets, getExamCollectionById, updateExamCollection, getExamsList } from '@/services/AdminService'
import { ApplicantExamSet } from '@/mock/data/adminData'
import Table from '@/components/ui/Table'
import classNames from '@/utils/classNames'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import TimePicker from "react-multi-date-picker/plugins/time_picker"
import "react-multi-date-picker/styles/layouts/mobile.css"

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

// Interface for Detailed Collection Data
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
    assignments: any[]
}

const ApplicantExamSets = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [examSets, setExamSets] = useState<ApplicantExamSet[]>([])

    // Initialize state from cookies or default
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(
        (Cookies.get('applicantExamSets_category') as FilterCategory) || 'all'
    )
    const [searchQuery, setSearchQuery] = useState(
        Cookies.get('applicantExamSets_search') || ''
    )

    const [infoDialogOpen, setInfoDialogOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedExamSet, setSelectedExamSet] = useState<ApplicantExamSet | null>(null)

    // New state for detailed info
    const [collectionLoading, setCollectionLoading] = useState(false)
    const [collectionDetails, setCollectionDetails] = useState<CollectionDetails | null>(null)

    // Edit State
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editLoading, setEditLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [availableExams, setAvailableExams] = useState<any[]>([])
    const [editFormData, setEditFormData] = useState({
        id: '',
        title: '',
        description: '',
        status: 'active',
        start_datetime: null as Date | null,
        end_datetime: null as Date | null,
        duration_minutes: 0,
        exam_ids: [] as number[]
    })

    useEffect(() => {
        loadExamSets()
    }, [])

    // Update cookies when state changes
    const handleCategoryChange = (category: FilterCategory) => {
        setSelectedCategory(category)
        Cookies.set('applicantExamSets_category', category)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        Cookies.set('applicantExamSets_search', value)
    }

    const loadExamSets = async () => {
        setLoading(true)
        try {
            const data = await getApplicantExamSets()
            setExamSets(data)
        } catch (error) {
            console.error('Error loading exam sets:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAvailableExams = async () => {
        try {
            const exams = await getExamsList()
            setAvailableExams(exams)
        } catch (error) {
            console.error('Error fetching exams list:', error)
            toast.push(<Notification title="خطا در دریافت لیست آزمون‌ها" type="danger" />, { placement: 'top-center' })
        }
    }

    const handleEditClick = async (examSet: ApplicantExamSet) => {
        setEditLoading(true)
        setEditDialogOpen(true)
        setStep(1)

        // Fetch exams if empty
        if (availableExams.length === 0) {
            await fetchAvailableExams()
        }

        try {
            const collectionId = (examSet as any).collectionId || examSet.id
            const response = await getExamCollectionById(collectionId)
            const details = response.data || response // Adapt to response structure

            if (details) {
                setEditFormData({
                    id: details.id,
                    title: details.title,
                    description: details.description || '',
                    status: details.status,
                    // Store as Date object for DatePicker compatibility
                    start_datetime: details.start_datetime ? new Date(details.start_datetime) : null,
                    end_datetime: details.end_datetime ? new Date(details.end_datetime) : null,
                    duration_minutes: details.duration_minutes,
                    exam_ids: details.exams ? details.exams.map((e: any) => e.id) : []
                })
            }
        } catch (error) {
            console.error('Error fetching details for edit:', error)
            toast.push(<Notification title="خطا در دریافت اطلاعات برای ویرایش" type="danger" />, { placement: 'top-center' })
            setEditDialogOpen(false)
        } finally {
            setEditLoading(false)
        }
    }

    const handleEditSubmit = async () => {
        if (!editFormData.title || !editFormData.start_datetime || !editFormData.end_datetime) {
            toast.push(<Notification title="لطفا فیلدهای اجباری را تکمیل کنید" type="warning" />, { placement: 'top-center' })
            return
        }

        setEditLoading(true)
        try {
            const payload = {
                title: editFormData.title,
                description: editFormData.description,
                status: editFormData.status,
                // Use dayjs to format correctly as requested: YYYY-MM-DD HH:mm:ss
                start_datetime: dayjs(editFormData.start_datetime).format('YYYY-MM-DD HH:mm:ss'),
                end_datetime: dayjs(editFormData.end_datetime).format('YYYY-MM-DD HH:mm:ss'),
                duration_minutes: Number(editFormData.duration_minutes),
                exam_ids: editFormData.exam_ids
            }

            // Log payload for debugging if needed, but proceeding with update
            await updateExamCollection(editFormData.id, payload)

            toast.push(<Notification title="مجموعه آزمون با موفقیت ویرایش شد" type="success" />, { placement: 'top-center' })
            setEditDialogOpen(false)
            loadExamSets() // Refresh list
        } catch (error) {
            console.error('Error updating exam collection:', error)
            toast.push(<Notification title="خطا در ویرایش مجموعه آزمون" type="danger" />, { placement: 'top-center' })
        } finally {
            setEditLoading(false)
        }
    }

    const handleInfoClick = async (examSet: ApplicantExamSet) => {
        setSelectedExamSet(examSet)
        setInfoDialogOpen(true)
        setCollectionLoading(true)
        setCollectionDetails(null)

        try {
            // Check if we have collectionId (added in previous step service update)
            // If not available (old data), try parsing ID or fallback
            // In the service update, I added collectionId to the ApplicantExamSet type mapping
            // But I didn't update the ApplicantExamSet interface definition if it's imported from mock.
            // Using logic: examSet might have collectionId from my service update.

            const collectionId = (examSet as any).collectionId || examSet.id

            // If it's not a real API ID structure (e.g. mock string), this might fail or return nothing.
            // Assuming we are consistently using the new service logic for fetching lists which returns valid data.

            const response = await getExamCollectionById(collectionId)
            if (response && response.data) {
                setCollectionDetails(response.data)
            } else if (response && response.id) {
                // Sometimes data might be directly in response depending on API wrapper
                setCollectionDetails(response)
            } else {
                // Fallback or error
                console.warn("Unexpected response structure", response)
            }

        } catch (error) {
            console.error('Error fetching collection details:', error)
            toast.push(
                <Notification title="خطا در دریافت اطلاعات آزمون" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setCollectionLoading(false)
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
        (examSet.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (examSet.applicantName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (examSet.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )

    const totalExamSets = examSets.length
    const completedExamSets = examSets.filter(e => e.status === 'completed').length
    const inProgressExamSets = examSets.filter(e => e.status === 'in_progress').length
    const pendingExamSets = examSets.filter(e => e.status === 'pending').length

    const formatDate = (dateString: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDateSimple = (dateString: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('fa-IR')
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
                    onChange={handleSearchChange}
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
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
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        لیست مجموعه آزمون‌ها
                        {!loading && selectedCategory !== 'all' && (
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
                                                        {examSet.applicantName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-gray-100">{examSet.applicantName}</div>
                                                        <div className="text-xs text-gray-500">{examSet.applicantId}</div>
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
                                                    <span dir="ltr">{new Date(examSet.examDate).toLocaleDateString('fa-IR')}</span>
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
                                                    {(examSet.status === 'pending' || examSet.status === 'draft') && (
                                                        <Tooltip title="ویرایش آزمون">
                                                            <Button
                                                                variant="plain"
                                                                size="sm"
                                                                icon={<HiOutlinePencil />}
                                                                onClick={() => handleEditClick(examSet)}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            />
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="اطلاعات آزمون">
                                                        <Button
                                                            variant="plain"
                                                            size="sm"
                                                            icon={<HiOutlineInformationCircle />}
                                                            onClick={() => handleInfoClick(examSet)}
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
                                                ```
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
                width={700}
            >
                <div className="flex flex-col h-[580px] max-h-[90vh]">
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
                            {/* Basic Info - Static */}
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
                                                {collectionDetails.creator?.name} <span className="text-xs font-normal text-gray-500">({collectionDetails.creator?.role})</span>
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
                                        <span className="font-semibold text-gray-900 dark:text-white" dir="ltr">{formatDate(collectionDetails.start_datetime)}</span>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <HiOutlineCalendar className="w-4 h-4" />
                                            پایان
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white" dir="ltr">{formatDate(collectionDetails.end_datetime)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">کد مجموعه</span>
                                        <Tag className="">{collectionDetails.code || '-'}</Tag>
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
            </Dialog >

            {/* Edit Dialog */}
            < Dialog
                isOpen={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onRequestClose={() => setEditDialogOpen(false)}
                width={800}
                className="pb-0"
            >
                <div className="p-6 h-[650px] max-h-[90vh] flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlinePencil className="w-6 h-6 text-indigo-600" />
                        <span>ویرایش مجموعه آزمون</span>
                        <span className="text-sm font-normal text-gray-500 mx-2">|</span>
                        <span className="text-sm font-normal text-gray-500">مرحله {step} از 2</span>
                    </h3>

                    <div className="flex-1 overflow-y-auto mb-6 px-1 custom-scrollbar">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    آزمون‌های مورد نظر برای این مجموعه را انتخاب کنید:
                                </p>
                                {availableExams.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {availableExams.map((exam) => (
                                            <div
                                                key={exam.id}
                                                className={classNames(
                                                    "flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer",
                                                    editFormData.exam_ids.includes(Number(exam.id))
                                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                )}
                                                onClick={() => {
                                                    const id = Number(exam.id)
                                                    if (editFormData.exam_ids.includes(id)) {
                                                        setEditFormData(prev => ({ ...prev, exam_ids: prev.exam_ids.filter(eid => eid !== id) }))
                                                    } else {
                                                        setEditFormData(prev => ({ ...prev, exam_ids: [...prev.exam_ids, id] }))
                                                    }
                                                }}
                                            >
                                                <Checkbox
                                                    checked={editFormData.exam_ids.includes(Number(exam.id))}
                                                    onChange={() => { }} // handled by parent div click
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
                                        <p className="text-gray-500">در حال بارگیری آزمون‌ها...</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">عنوان مجموعه</label>
                                    <Input
                                        value={editFormData.title}
                                        onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                                        placeholder="عنوان آزمون"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">توضیحات</label>
                                    <Input
                                        value={editFormData.description}
                                        onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                        placeholder="توضیحات مختصر"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">وضعیت</label>
                                    <Select
                                        options={[
                                            { label: 'فعال', value: 'active' },
                                            { label: 'غیرفعال', value: 'inactive' },
                                            { label: 'آرشیو شده', value: 'archived' }
                                        ]}
                                        value={{ label: editFormData.status === 'active' ? 'فعال' : editFormData.status === 'inactive' ? 'غیرفعال' : 'آرشیو شده', value: editFormData.status }}
                                        onChange={(opt: any) => setEditFormData({ ...editFormData, status: opt.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">مدت زمان (دقیقه)</label>
                                    <Input
                                        type="number"
                                        value={editFormData.duration_minutes}
                                        onChange={e => setEditFormData({ ...editFormData, duration_minutes: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">زمان شروع</label>
                                    <DatePicker
                                        value={editFormData.start_datetime}
                                        onChange={(date: any) => {
                                            if (!date) {
                                                setEditFormData({ ...editFormData, start_datetime: null })
                                                return
                                            }
                                            const jsDate = date?.toDate ? date.toDate() : new Date(date)
                                            setEditFormData({ ...editFormData, start_datetime: jsDate })
                                        }}
                                        calendar={persian}
                                        locale={persian_fa}
                                        format="YYYY/MM/DD HH:mm"
                                        plugins={[
                                            <TimePicker position="bottom" />
                                        ]}
                                        containerClassName="w-full"
                                        inputClass="w-full h-11 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-left dir-ltr"
                                        placeholder="انتخاب تاریخ و ساعت"
                                        calendarPosition="bottom-right"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">زمان پایان</label>
                                    <DatePicker
                                        value={editFormData.end_datetime}
                                        onChange={(date: any) => {
                                            if (!date) {
                                                setEditFormData({ ...editFormData, end_datetime: null })
                                                return
                                            }
                                            const jsDate = date?.toDate ? date.toDate() : new Date(date)
                                            setEditFormData({ ...editFormData, end_datetime: jsDate })
                                        }}
                                        calendar={persian}
                                        locale={persian_fa}
                                        format="YYYY/MM/DD HH:mm"
                                        plugins={[
                                            <TimePicker position="bottom" />
                                        ]}
                                        containerClassName="w-full"
                                        inputClass="w-full h-11 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-left dir-ltr"
                                        placeholder="انتخاب تاریخ و ساعت"
                                        calendarPosition="bottom-right"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                        <Button variant="plain" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
                            انصراف
                        </Button>
                        <div className="flex gap-2">
                            {step === 2 && (
                                <Button
                                    variant="default"
                                    onClick={() => setStep(1)}
                                    disabled={editLoading}
                                    icon={<HiArrowRight className="ml-2" />}
                                >
                                    مرحله قبل
                                </Button>
                            )}
                            {step === 1 ? (
                                <Button
                                    variant="solid"
                                    onClick={() => {
                                        if (editFormData.exam_ids.length === 0) {
                                            toast.push(<Notification title="لطفاً حداقل یک آزمون انتخاب کنید" type="warning" />, { placement: 'top-center' })
                                            return
                                        }
                                        setStep(2)
                                    }}
                                    disabled={editFormData.exam_ids.length === 0}
                                    icon={<HiArrowLeft className="mr-2" />}
                                >
                                    مرحله بعد
                                </Button>
                            ) : (
                                <Button
                                    variant="solid"
                                    onClick={handleEditSubmit}
                                    loading={editLoading}
                                    icon={<HiOutlineCheckCircle className="mr-2" />}
                                >
                                    ثبت تغییرات
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Dialog >

            {/* View Exams Dialog - Keeping existing one if needed for different view or replacing? */}
            {/* Since I replaced the info dialog with detail view, I'll keep the viewDialogOpen logic but it's redundant now if Info shows exams too. 
                However, the original code had two buttons: Info and View Results (actually View Exams was View Results navigate.. wait, line 344 in orig was navigate).
                The orig code had TWO buttons: Info (circle) and Eye (View Results navigate).
                
                Wait, looking at my code in `loadExamSets`:
                In original:
                 333: onClick={() => { setSelectedExamSet(examSet); setInfoDialogOpen(true) }} (Info)
                 344: onClick={() => navigate(...)} (Eye)
                
                And there was a `viewDialogOpen` state in original code (line 84) but referenced in line 426 as `View Exams Dialog`.
                Wait, was the Eye button opening a dialog or navigating?
                Line 344 says: `onClick={() => navigate(...)`.
                So `viewDialogOpen` was seemingly unused or I missed where it was opened.
                
                Actually, looking closer at original file:
                `viewDialogOpen` was defined but `setInfoDialogOpen` was used in the first button.
                The second button used `navigate`.
                So `viewDialogOpen` was maybe dead code or I missed a trigger.
                Ah, I see `layout === 'list'` logic in `ApplicantExamResults` but this is `ApplicantExamSets`.
                
                In `ApplicantExamSets.tsx` original:
                There is NO code that sets `viewDialogOpen` to true.
                So I can safely ignore `viewDialogOpen` or remove it. 
                But to be safe, I will leave it or just remove the dead code to clean up.
                I will remove `viewDialogOpen` as it is not used in the UI based on my reading.
            */}
        </div >
    )
}

export default ApplicantExamSets
