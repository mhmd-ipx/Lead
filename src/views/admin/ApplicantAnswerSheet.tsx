import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Tag, Notification, toast } from '@/components/ui'
import { Loading } from '@/components/shared'
import { HiOutlineArrowLeft, HiOutlineDocumentText, HiOutlineDownload, HiOutlineCheck, HiOutlineUser, HiOutlineOfficeBuilding, HiOutlineClock, HiOutlinePrinter } from 'react-icons/hi'
import { getApplicantExamSetById, getExamAssignmentResults } from '@/services/AdminService'
import QuestionFileImage from '@/components/exam-builder/components/QuestionFileImage'
import Container from '@/components/shared/Container'
import dayjs from 'dayjs'
import classNames from 'classnames'
import ExportSettingsModal from './components/ExportSettingsModal'
import { generateExcelBlob, generateDocxBlob, ExportSettings } from '@/utils/exportUtils'
import { saveAs } from 'file-saver'

interface UserAnswer {
    id: number
    exam_id: number
    user_id: number
    score: number
    total_score: number
    percentage: string
    status: string
    started_at: string
    completed_at: string
    answers: {
        exam_id: number
        exam_title: string
        sections: {
            section_id: number
            section_title: string
            questions: any[]
        }[]
    }
    exam: {
        id: number
        title: string
        description: string
        duration: number
    }
}

const ApplicantAnswerSheet = () => {
    const { examSetId, resultId } = useParams<{ examSetId: string; resultId: string }>()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [answer, setAnswer] = useState<UserAnswer | null>(null)
    const [applicantInfo, setApplicantInfo] = useState<any>(null)
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [examSetId, resultId])

    const fetchData = async () => {
        if (!examSetId || !resultId) return

        try {
            setLoading(true)
            const examSet = await getApplicantExamSetById(examSetId)
            if (examSet) {
                setApplicantInfo(examSet)

                if (examSet.collectionId && examSet.applicantId) {
                    const resultsResponse = await getExamAssignmentResults(examSet.collectionId, examSet.applicantId)
                    if (resultsResponse && resultsResponse.user_answers) {
                        const currentAnswer = resultsResponse.user_answers.find((a: any) => a.id.toString() === resultId)
                        if (currentAnswer) {
                            setAnswer(currentAnswer)
                        } else {
                            toast.push(<Notification type="danger">پاسخنامه یافت نشد</Notification>)
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching answer sheet:', error)
            toast.push(<Notification type="danger">خطا در دریافت اطلاعات</Notification>)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async (settings: ExportSettings) => {
        if (!answer || !applicantInfo) return

        const exportData = [{
            applicantName: applicantInfo.applicantName,
            companyName: applicantInfo.companyName,
            examTitle: answer.exam.title,
            completedAt: dayjs(answer.completed_at).format('YYYY/MM/DD HH:mm'),
            sections: answer.answers.sections
        }]

        const filename = `${applicantInfo.applicantName}-${answer.exam.title}-${dayjs().format('YYYY-MM-DD')}`

        if (settings.format === 'xlsx') {
            const blob = generateExcelBlob(exportData, settings)
            saveAs(blob, `${filename}.xlsx`)
        } else {
            const blob = await generateDocxBlob(exportData[0], settings)
            saveAs(blob, `${filename}.docx`)
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loading loading={true} />
                    <p className="mt-4 text-gray-500">در حال دریافت پاسخنامه...</p>
                </div>
            </Container>
        )
    }

    if (!answer) {
        return (
            <Container>
                <div className="text-center py-20">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">پاسخنامه یافت نشد</h3>
                    <Button className="mt-4" onClick={() => navigate(-1)}>بازگشت</Button>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="space-y-6 pb-10">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="plain"
                            icon={<HiOutlineArrowLeft />}
                            onClick={() => navigate(-1)}
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مشاهده پاسخنامه</h2>
                            <p className="text-sm text-gray-500">مشاهده دقیق جزئیات پاسخ‌های متقاضی</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="plain"
                            icon={<HiOutlinePrinter />}
                            onClick={() => window.print()}
                        >
                            چاپ پاسخنامه
                        </Button>
                        <Button
                            variant="solid"
                            icon={<HiOutlineDownload />}
                            onClick={() => setIsExportModalOpen(true)}
                        >
                            دریافت خروجی
                        </Button>
                    </div>

                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="col-span-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                {applicantInfo?.applicantName?.charAt(0)}
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">متقاضی</p>
                                    <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                        <HiOutlineUser className="text-indigo-500" />
                                        {applicantInfo?.applicantName}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">شرکت / سازمان</p>
                                    <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-300">
                                        <HiOutlineOfficeBuilding className="text-indigo-500" />
                                        {applicantInfo?.companyName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">تاریخ تکمیل:</span>
                                <span className="font-semibold text-gray-900 dark:text-white dir-ltr">
                                    {dayjs(answer.completed_at).format('YYYY/MM/DD HH:mm')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">مدت آزمون:</span>
                                <span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                                    <HiOutlineClock className="text-indigo-500" />
                                    {answer.exam.duration} دقیقه
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content: Answers */}
                <Card className="p-0 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 border-b p-4">
                        <div className="flex items-center gap-3">
                            <HiOutlineDocumentText className="text-2xl text-indigo-500" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                آزمون: {answer.exam.title}
                            </h3>
                        </div>
                    </div>

                    <div className="p-6 space-y-10">
                        {answer.answers.sections.map((section, sIdx) => (
                            <div key={section.section_id || sIdx}>
                                <div className="flex items-center gap-4 mb-6">
                                    <h4 className="text-base font-bold text-white bg-indigo-600 px-4 py-1.5 rounded-full shadow-md">
                                        {section.section_title}
                                    </h4>
                                    <div className="flex-1 h-[2px] bg-gradient-to-r from-indigo-100 to-transparent dark:from-indigo-900/40"></div>
                                </div>

                                <div className="space-y-8">
                                    {section.questions.map((question: any, qIdx: number) => (
                                        <div key={question.question_id || qIdx} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="flex gap-4 mb-4">
                                                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-black text-gray-500">
                                                    {question.question_number}
                                                </span>
                                                <div className="flex-1">
                                                    <h5 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3 leading-relaxed">
                                                        {question.question_text}
                                                    </h5>

                                                    {/* Question Image */}
                                                    {question.question_file_id && (
                                                        <div className="mb-4 max-w-md rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                                                            <QuestionFileImage
                                                                fileId={question.question_file_id}
                                                                className="w-full h-auto object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Render Answer based on Type */}
                                                    <div className="space-y-4">
                                                        {question.type === 'descriptive' && (
                                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 italic text-gray-600 dark:text-gray-400 text-sm leading-7">
                                                                {question.answer?.text || 'پاسخی داده نشده است'}
                                                            </div>
                                                        )}

                                                        {(question.type === 'multiple_choice' || question.type === 'mixed') && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {question.options.map((opt: any) => (
                                                                    <div
                                                                        key={opt.index}
                                                                        className={classNames(
                                                                            "flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200",
                                                                            question.answer?.selected_index === opt.index
                                                                                ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:ring-indigo-900/10"
                                                                                : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 opacity-70"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={classNames(
                                                                                "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                                                                question.answer?.selected_index === opt.index ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                                                                            )}>
                                                                                {question.answer?.selected_index === opt.index && <HiOutlineCheck className="text-xs text-white" />}
                                                                            </div>
                                                                            <span className={classNames(
                                                                                "text-sm",
                                                                                question.answer?.selected_index === opt.index ? "font-bold text-indigo-700 dark:text-indigo-300" : "text-gray-500"
                                                                            )}>
                                                                                {opt.text}
                                                                            </span>
                                                                        </div>
                                                                        {opt.file_id && (
                                                                            <div className="mt-2 pl-8">
                                                                                <QuestionFileImage
                                                                                    fileId={opt.file_id}
                                                                                    className="max-w-full h-auto rounded-lg shadow-sm max-h-40 object-contain bg-white p-1"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {question.type === 'mixed' && (
                                                            <div className="mt-4">
                                                                <p className="text-xs text-gray-400 mb-2 font-bold flex items-center gap-2">
                                                                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                                                                    توضیحات تکمیلی:
                                                                </p>
                                                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 italic text-gray-600 dark:text-gray-400 text-sm leading-7">
                                                                    {question.answer?.descriptive_text || 'توضیحی ثبت نشده'}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {question.type === 'check_box' && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {question.options.map((opt: any) => {
                                                                    const isSelected = question.answer?.selected_options?.some((s: any) => s.index === opt.index);
                                                                    return (
                                                                        <div
                                                                            key={opt.index}
                                                                            className={classNames(
                                                                                "flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200",
                                                                                isSelected
                                                                                    ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:ring-indigo-900/10"
                                                                                    : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 opacity-70"
                                                                            )}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={classNames(
                                                                                    "w-5 h-5 rounded border flex items-center justify-center shrink-0",
                                                                                    isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                                                                                )}>
                                                                                    {isSelected && <HiOutlineCheck className="text-xs text-white" />}
                                                                                </div>
                                                                                <span className={classNames(
                                                                                    "text-sm",
                                                                                    isSelected ? "font-bold text-indigo-700 dark:text-indigo-300" : "text-gray-500"
                                                                                )}>
                                                                                    {opt.text}
                                                                                </span>
                                                                            </div>
                                                                            {opt.file_id && (
                                                                                <div className="mt-2 pl-8">
                                                                                    <QuestionFileImage
                                                                                        fileId={opt.file_id}
                                                                                        className="max-w-full h-auto rounded-lg shadow-sm max-h-40 object-contain bg-white p-1"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {question.type === 'order' && (
                                                            <div className="space-y-3 pl-8">
                                                                {question.answer?.ordered_options?.map((opt: any, idx: number) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center gap-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl transition-all hover:translate-x-1"
                                                                    >
                                                                        <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                                                                            {opt.user_priority}
                                                                        </span>
                                                                        <div className="flex-1 flex flex-col gap-2">
                                                                            <span className="text-sm text-indigo-900 dark:text-indigo-200 font-bold">
                                                                                {opt.text}
                                                                            </span>
                                                                            {opt.file_id && (
                                                                                <QuestionFileImage
                                                                                    fileId={opt.file_id}
                                                                                    className="max-w-xs h-auto rounded-lg shadow-sm max-h-32 object-contain bg-white p-1"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(!question.answer?.ordered_options || question.answer.ordered_options.length === 0) && (
                                                                    <div className="text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-dashed">بدون اولویت‌بندی</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <ExportSettingsModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onConfirm={handleExport}
                title="تنظیمات خروجی پاسخنامه"
            />
        </Container>
    )
}

export default ApplicantAnswerSheet
