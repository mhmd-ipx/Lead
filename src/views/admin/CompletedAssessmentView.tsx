import { useEffect, useState } from 'react'
import { Card, Button, Tag, Skeleton, Checkbox, Dialog, Notification, toast, Input } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineClipboardCheck,
    HiOutlineOfficeBuilding,
    HiOutlineUser,
    HiOutlineAcademicCap,
    HiOutlineStar,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiArrowLeft,
    HiArrowRight
} from 'react-icons/hi'
import { getAssessmentById, getExamsList, createExamCollection } from '@/services/AdminService'
import { CompletedAssessment, AssessmentStep, AssessmentQuestion } from '@/mock/data/adminData'
import { Exam } from '@/@types/exam'
import { useNavigate, useParams } from 'react-router-dom'
import classNames from '@/utils/classNames'
import dayjs from 'dayjs'
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import TimePicker from "react-multi-date-picker/plugins/time_picker"
import "react-multi-date-picker/styles/layouts/mobile.css"

type StatisticCardProps = {
    title: string
    value: string | number
    icon: React.ReactNode
    iconClass: string
    id?: string
}

const StatisticCard = (props: StatisticCardProps) => {
    const { title, value, icon, iconClass, id } = props

    return (
        <div id={id} className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-md">
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
    const [exams, setExams] = useState<Exam[]>([])
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedExamIds, setSelectedExamIds] = useState<number[]>([])
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
    const { id } = useParams<{ id: string }>()

    useEffect(() => {
        if (id) {
            loadData(id)
        }
    }, [id])

    const loadData = async (assessmentId: string) => {
        try {
            setLoading(true)
            const [assessmentData, examsData] = await Promise.all([
                getAssessmentById(assessmentId),
                getExamsList()
            ])
            setAssessment(assessmentData as CompletedAssessment)
            setExams(examsData || [])
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenAssignDialog = () => {
        if (!assessment) return
        setSelectedExamIds([])
        setStep(1)
        setCollectionForm({
            title: assessment.managerName ? `مجموعه آزمون برای ${assessment.managerName}` : 'مجموعه آزمون جدید',
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
        if (!assessment) return
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
                exam_ids: selectedExamIds,
                user_id: Number(assessment.managerId),
            }

            await createExamCollection(payload)

            toast.push(
                <Notification title="مجموعه آزمون با موفقیت ایجاد و اختصاص داده شد" type="success" />,
                { placement: 'top-end' }
            )

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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton width={100} height={40} />
                    <div className="flex-1">
                        <Skeleton width={200} height={32} />
                        <Skeleton width={150} height={20} className="mt-2" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton height={100} />
                    <Skeleton height={100} />
                </div>
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Skeleton variant="circle" width={48} height={48} />
                        <div className="flex-1">
                            <Skeleton width={300} height={24} />
                            <Skeleton width={200} height={18} className="mt-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton height={60} />
                        <Skeleton height={60} />
                        <Skeleton height={60} />
                    </div>
                </Card>
                <Skeleton height={400} />
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
                    <div id="admin-assessment-view-header">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            جزئیات نیازسنجی
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            متقاضی: {assessment.managerName} | سازمان: {assessment.companyName}
                        </p>
                    </div>
                </div>
                <Button
                    id="admin-assessment-view-action-assign"
                    variant="solid"
                    icon={<HiOutlineAcademicCap />}
                    size="sm"
                    onClick={handleOpenAssignDialog}
                >
                    اختصاص آزمون
                </Button>
            </div>

            {/* Statistics Cards */}
            <div id="admin-assessment-view-stats" className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Assessment Info */}
            <Card id="admin-assessment-view-info" className="p-6">
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
            <div id="admin-assessment-view-answers" className="space-y-4">
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

                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium mb-1">نیازسنجی مربوط به:</p>
                            <p className="font-bold text-gray-900 dark:text-white">{assessment.managerName}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium mb-1">سازمان:</p>
                            <p className="font-bold text-gray-900 dark:text-white">{assessment.companyName}</p>
                        </div>
                    </div>

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
                                                    selectedExamIds.includes(Number(exam.id))
                                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                )}
                                                onClick={() => toggleExamSelection(Number(exam.id))}
                                            >
                                                <Checkbox
                                                    checked={selectedExamIds.includes(Number(exam.id))}
                                                    onChange={() => toggleExamSelection(Number(exam.id))}
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

export default CompletedAssessmentView
