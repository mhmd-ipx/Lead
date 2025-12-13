import { useEffect, useState } from 'react'
import { Card, Button, Tag, Table } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlinePlus,
    HiOutlineEye,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineClipboardCheck,
    HiOutlineAcademicCap,
    HiOutlineClock,
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import classNames from '@/utils/classNames'

const { Tr, Th, Td, THead, TBody } = Table

interface Assessment {
    id: string
    applicantId: string
    title: string
    description: string
    status: 'pending' | 'completed'
    createdDate: string
    submittedDate?: string
    examSetId?: string
    examSetTitle?: string
}

type FilterCategory = 'all' | 'completed' | 'pending' | 'withExamSet'

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

const ApplicantAssessment = () => {
    const { managerId } = useParams<{ managerId: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [applicantName, setApplicantName] = useState('')
    const [assessments, setAssessments] = useState<Assessment[]>([])
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')

    useEffect(() => {
        if (managerId) {
            loadData()
        }
    }, [managerId])

    const loadData = async () => {
        try {
            // Mock data
            setApplicantName('علی محمدی')

            const mockAssessments: Assessment[] = [
                {
                    id: 'assess-001',
                    applicantId: managerId || '',
                    title: 'نیازسنجی مهارت‌های مدیریتی',
                    description: 'ارزیابی مهارت‌های مدیریت پروژه و رهبری تیم',
                    status: 'completed',
                    createdDate: '2024-11-15T10:00:00Z',
                    submittedDate: '2024-11-20T10:00:00Z',
                    examSetId: 'examset-001',
                    examSetTitle: 'مجموعه آزمون مدیریت پروژه',
                },
                {
                    id: 'assess-002',
                    applicantId: managerId || '',
                    title: 'نیازسنجی مهارت‌های فنی',
                    description: 'بررسی دانش فنی و تخصصی',
                    status: 'pending',
                    createdDate: '2024-12-01T10:00:00Z',
                },
                {
                    id: 'assess-003',
                    applicantId: managerId || '',
                    title: 'نیازسنجی مهارت‌های ارتباطی',
                    description: 'بررسی توانایی‌های ارتباطی و تیم‌سازی',
                    status: 'completed',
                    createdDate: '2024-10-10T10:00:00Z',
                    submittedDate: '2024-10-15T10:00:00Z',
                },
            ]

            setAssessments(mockAssessments)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAssessment = () => {
        if (selectedAssessment) {
            setAssessments(assessments.filter(a => a.id !== selectedAssessment.id))
            setDeleteDialog(false)
            setSelectedAssessment(null)
        }
    }

    const getStatusTag = (status: Assessment['status']) => {
        switch (status) {
            case 'completed':
                return (
                    <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0">
                        تکمیل شده
                    </Tag>
                )
            case 'pending':
                return (
                    <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">
                        در انتظار
                    </Tag>
                )
            default:
                return <Tag className="border-0">نامشخص</Tag>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR')
    }

    // Filter assessments based on selected category
    const filteredAssessments = assessments.filter(assessment => {
        switch (selectedCategory) {
            case 'completed':
                return assessment.status === 'completed'
            case 'pending':
                return assessment.status === 'pending'
            case 'withExamSet':
                return !!assessment.examSetId
            case 'all':
            default:
                return true
        }
    })

    // Calculate statistics
    const totalAssessments = assessments.length
    const completedAssessments = assessments.filter(a => a.status === 'completed').length
    const pendingAssessments = assessments.filter(a => a.status === 'pending').length
    const withExamSet = assessments.filter(a => a.examSetId).length

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
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/owner/managers')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            نیازسنجی‌های {applicantName}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            مدیریت و مشاهده تمام نیازسنجی‌ها و نتایج مرتبط
                        </p>
                    </div>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => navigate(`/owner/managers/${managerId}/assessment/new`)}
                >
                    ایجاد نیازسنجی جدید
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
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
                    title="تکمیل شده"
                    value={completedAssessments}
                    iconClass="bg-emerald-200 text-emerald-700"
                    icon={<HiOutlineClipboardCheck />}
                    label="completed"
                    active={selectedCategory === 'completed'}
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
                <StatisticCard
                    title="دارای مجموعه آزمون"
                    value={withExamSet}
                    iconClass="bg-purple-200 text-purple-700"
                    icon={<HiOutlineAcademicCap />}
                    label="withExamSet"
                    active={selectedCategory === 'withExamSet'}
                    onClick={setSelectedCategory}
                />
            </div>

            {/* Assessments Table */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        لیست نیازسنجی‌ها
                        {selectedCategory !== 'all' && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredAssessments.length} مورد)
                            </span>
                        )}
                    </h2>
                    <Table>
                        <THead>
                            <Tr>
                                <Th>عنوان نیازسنجی</Th>
                                <Th>تاریخ ایجاد</Th>
                                <Th>وضعیت نتیجه</Th>
                                <Th>مجموعه آزمون</Th>
                                <Th>عملیات</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {filteredAssessments.map((assessment) => (
                                <Tr key={assessment.id}>
                                    <Td>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {assessment.title}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {assessment.description}
                                            </p>
                                        </div>
                                    </Td>
                                    <Td>{formatDate(assessment.createdDate)}</Td>
                                    <Td>{getStatusTag(assessment.status)}</Td>
                                    <Td>
                                        {assessment.examSetId ? (
                                            <Tag className="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-100 border-0">
                                                {assessment.examSetTitle}
                                            </Tag>
                                        ) : assessment.status === 'completed' ? (
                                            <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100 border-0">
                                                در انتظار تخصیص
                                            </Tag>
                                        ) : (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                                        )}
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            {/* For completed assessments: only view */}
                                            {assessment.status === 'completed' ? (
                                                <Button
                                                    variant="plain"
                                                    size="sm"
                                                    icon={<HiOutlineEye />}
                                                    onClick={() => navigate(`/owner/managers/${managerId}/assessment/${assessment.id}/view`)}
                                                >
                                                    مشاهده
                                                </Button>
                                            ) : (
                                                /* For pending assessments: edit, delete, view */
                                                <>
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlinePencil />}
                                                        onClick={() => navigate(`/owner/managers/${managerId}/assessment/${assessment.id}/edit`)}
                                                    >
                                                        ویرایش
                                                    </Button>
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineEye />}
                                                        onClick={() => navigate(`/owner/managers/${managerId}/assessment/${assessment.id}/view`)}
                                                    />
                                                    <Button
                                                        variant="plain"
                                                        size="sm"
                                                        icon={<HiOutlineTrash />}
                                                        onClick={() => {
                                                            setSelectedAssessment(assessment)
                                                            setDeleteDialog(true)
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                            {filteredAssessments.length === 0 && (
                                <Tr>
                                    <Td colSpan={5}>
                                        <div className="text-center py-12">
                                            <HiOutlineClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                {selectedCategory === 'all'
                                                    ? 'هنوز هیچ نیازسنجی برای این متقاضی ثبت نشده است'
                                                    : 'نیازسنجی با این فیلتر یافت نشد'}
                                            </p>
                                            {selectedCategory === 'all' && (
                                                <Button
                                                    variant="solid"
                                                    icon={<HiOutlinePlus />}
                                                    onClick={() => navigate(`/owner/managers/${managerId}/assessment/new`)}
                                                >
                                                    ایجاد اولین نیازسنجی
                                                </Button>
                                            )}
                                        </div>
                                    </Td>
                                </Tr>
                            )}
                        </TBody>
                    </Table>
                </div>
            </Card>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialog}
                type="danger"
                title="حذف نیازسنجی"
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                onClose={() => {
                    setDeleteDialog(false)
                    setSelectedAssessment(null)
                }}
                onRequestClose={() => {
                    setDeleteDialog(false)
                    setSelectedAssessment(null)
                }}
                onCancel={() => {
                    setDeleteDialog(false)
                    setSelectedAssessment(null)
                }}
                onConfirm={handleDeleteAssessment}
            >
                <p>آیا از حذف نیازسنجی "{selectedAssessment?.title}" اطمینان دارید؟</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    با حذف این نیازسنجی، نتیجه و مجموعه آزمون‌های مرتبط نیز حذف خواهند شد.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default ApplicantAssessment
