import { useEffect, useState } from 'react'
import { Card, Button, Tag } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineClipboardCheck,
    HiOutlineOfficeBuilding,
    HiOutlineUser,
    HiOutlineAcademicCap,
    HiOutlineStar,
} from 'react-icons/hi'
import { getAssessmentById } from '@/services/AdminService'
import { CompletedAssessment } from '@/mock/data/adminData'
import { useNavigate, useParams } from 'react-router-dom'
import classNames from '@/utils/classNames'

type StatisticCardProps = {
    title: string
    value: string | number
    icon: React.ReactNode
    iconClass: string
}

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, icon, iconClass } = props

    return (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-md">
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
        </div>
    )
}

const CompletedAssessmentView = () => {
    const [assessment, setAssessment] = useState<CompletedAssessment | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    useEffect(() => {
        if (id) {
            loadAssessment(id)
        }
    }, [id])

    const loadAssessment = async (assessmentId: string) => {
        try {
            const data = await getAssessmentById(assessmentId)
            setAssessment(data)
        } catch (error) {
            console.error('Error loading assessment:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!assessment) {
        return (
            <div className="text-center py-12">
                <HiOutlineClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">نیازسنجی یافت نشد</p>
                <Button
                    variant="solid"
                    className="mt-4"
                    onClick={() => navigate('/admin/assessments/completed')}
                >
                    بازگشت به لیست نیازسنجی‌ها
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/admin/assessments/completed')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            جزئیات نیازسنجی
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {assessment.managerName} - {assessment.companyName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatisticCard
                    title="متقاضی"
                    value={assessment.managerName}
                    iconClass="bg-purple-200 text-purple-700"
                    icon={<HiOutlineUser />}
                />
                <StatisticCard
                    title="سازمان"
                    value={assessment.companyName}
                    iconClass="bg-blue-200 text-blue-700"
                    icon={<HiOutlineOfficeBuilding />}
                />
                <StatisticCard
                    title="امتیاز"
                    value={assessment.score || '-'}
                    iconClass="bg-amber-200 text-amber-700"
                    icon={<HiOutlineStar />}
                />
                <StatisticCard
                    title="آزمون‌های اختصاص داده شده"
                    value={`${assessment.assignedExams.length} آزمون`}
                    iconClass="bg-indigo-200 text-indigo-700"
                    icon={<HiOutlineAcademicCap />}
                />
            </div>

            {/* Assessment Info */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                        <HiOutlineClipboardCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {assessment.templateName}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            درخواست‌دهنده: {assessment.ownerName}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            تاریخ ایجاد
                        </label>
                        <p className="text-gray-900 dark:text-white">
                            {new Date(assessment.createdAt).toLocaleDateString('fa-IR')}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            تاریخ تکمیل
                        </label>
                        <p className="text-gray-900 dark:text-white">
                            {assessment.submittedAt ? new Date(assessment.submittedAt).toLocaleDateString('fa-IR') : '-'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            وضعیت
                        </label>
                        <div>
                            {assessment.status === 'submitted' ? (
                                <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">
                                    تکمیل شده
                                </Tag>
                            ) : (
                                <Tag className="text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20 border-0">
                                    پیش‌نویس
                                </Tag>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Answers */}
            <div className="space-y-4">
                {assessment.steps.map((step, stepIndex) => (
                    <Card key={step.id} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            مرحله {stepIndex + 1}: {step.title}
                        </h3>
                        {step.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                {step.description}
                            </p>
                        )}

                        <div className="space-y-6">
                            {step.questions.map((question, questionIndex) => {
                                const answer = assessment.answers[step.id]?.[question.id]

                                return (
                                    <div key={question.id} className="border-r-4 border-primary-500 pr-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {questionIndex + 1}. {question.question}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                            {answer !== undefined && answer !== null ? (
                                                Array.isArray(answer) ? (
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {answer.map((item, i) => (
                                                            <li key={i} className="text-gray-900 dark:text-white">
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : typeof answer === 'number' ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <HiOutlineStar
                                                                    key={i}
                                                                    className={classNames(
                                                                        'w-5 h-5',
                                                                        i < answer ? 'text-amber-500 fill-current' : 'text-gray-300'
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-gray-900 dark:text-white font-semibold">
                                                            {answer} از 5
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900 dark:text-white">{answer}</p>
                                                )
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">پاسخ داده نشده</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default CompletedAssessmentView
