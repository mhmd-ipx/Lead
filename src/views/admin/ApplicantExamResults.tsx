import { useState, useEffect } from 'react'
import { Card, Button, Tabs, Tag, Notification, toast } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineDownload,
    HiOutlineChartBar,
    HiOutlineDocumentText,
    HiOutlinePencilAlt,
    HiOutlineFolder,
    HiOutlineInformationCircle,
    HiOutlineUser,
    HiOutlineOfficeBuilding,
    HiOutlineIdentification,
    HiOutlineClipboardList,
    HiOutlineDocumentSearch,
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import classNames from '@/utils/classNames'
import Table from '@/components/ui/Table'
import {
    getApplicantExamSetById,
    getExamAssignmentResults,
    getCollectionAnalysis,
    createCollectionAnalysis,
    getExamCollectionById,
    CollectionAnalysis,
} from '@/services/AdminService'
import { Loading } from '@/components/shared'
import dayjs from 'dayjs'
import ExportSettingsModal from './components/ExportSettingsModal'
import { exportToZip, ExportSettings } from '@/utils/exportUtils'

// Tab components
import AnalysisTab from './components/AnalysisTab'
import ScoresTab from './components/ScoresTab'
import FilesTab from './components/FilesTab'
import StatusTab from './components/StatusTab'

const { TabNav, TabList, TabContent } = Tabs
const { TBody, THead, Th, Tr, Td } = Table

interface ExamSetInfo {
    id: string
    title: string
    description: string
    applicantName: string
    companyName: string
    assignedDate: string
    examDate: string
    completedDate: string
    duration: number
    totalExams: number
    completedExams: number
    averageScore: number
    status: 'completed' | 'in_progress' | 'pending'
    applicantId: string
    collectionId: string
}

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
    answers?: {
        exam_id: number
        exam_title: string
        sections: {
            section_id: number
            section_title: string
            questions: any[]
        }[]
    } | null
    exam: {
        id: number
        title: string
        description: string
        duration: number
    }
}

const ApplicantExamResults = () => {
    const { examSetId } = useParams<{ examSetId: string }>()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('answer-sheets')

    const [loading, setLoading] = useState(true)
    const [examSetInfo, setExamSetInfo] = useState<ExamSetInfo | null>(null)
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)

    // Analysis data
    const [analysisData, setAnalysisData] = useState<CollectionAnalysis | null>(null)
    const [collectionStatus, setCollectionStatus] = useState('active')

    const fetchData = async () => {
        if (!examSetId) return
        setLoading(true)
        try {
            const data = await getApplicantExamSetById(examSetId)
            if (data) {
                setExamSetInfo({
                    id: data.id,
                    title: data.title,
                    description: data.description || '',
                    applicantName: data.applicantName,
                    companyName: data.companyName,
                    assignedDate: data.assignedDate || '',
                    examDate: data.examDate || '',
                    completedDate: '',
                    duration: data.duration,
                    totalExams: data.totalExams,
                    completedExams: data.completedExams,
                    averageScore: data.progress || 0,
                    status: data.status as any,
                    applicantId: data.applicantId || '',
                    collectionId: data.collectionId?.toString() || '',
                })

                // Fetch results
                if (data.collectionId && data.applicantId) {
                    const resultsResponse = await getExamAssignmentResults(data.collectionId, data.applicantId)
                    if (resultsResponse?.user_answers) {
                        setUserAnswers(resultsResponse.user_answers)
                    }

                    // Fetch analysis
                    await fetchAnalysis(data.collectionId.toString(), data.applicantId)

                    // Fetch collection status
                    try {
                        const collectionData = await getExamCollectionById(data.collectionId)
                        if (collectionData?.status) {
                            setCollectionStatus(collectionData.status)
                        }
                    } catch (err) {
                        console.error('Error fetching collection:', err)
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching exam set info:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAnalysis = async (colId: string, userId: string) => {
        try {
            let analysis = await getCollectionAnalysis(colId, userId)
            if (!analysis) {
                // Create initial analysis with zeros
                await createCollectionAnalysis(colId, {
                    user_id: parseInt(userId),
                    admin_analysis: '',
                    score_planning: 0,
                    score_project_control: 0,
                    score_risk_management: 0,
                    score_team_leadership: 0,
                    score_negotiation: 0,
                    score_decision_making: 0,
                })
                analysis = await getCollectionAnalysis(colId, userId)
            }
            setAnalysisData(analysis)
        } catch (err) {
            console.error('Error fetching/creating analysis:', err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [examSetId])

    const handleRefreshAnalysis = async () => {
        if (examSetInfo?.collectionId && examSetInfo?.applicantId) {
            const analysis = await getCollectionAnalysis(examSetInfo.collectionId, examSetInfo.applicantId)
            setAnalysisData(analysis)
        }
    }

    const handleStatusChanged = async () => {
        if (examSetInfo?.collectionId) {
            try {
                const collectionData = await getExamCollectionById(examSetInfo.collectionId)
                if (collectionData?.status) {
                    setCollectionStatus(collectionData.status)
                }
            } catch (err) {
                console.error('Error refreshing collection status:', err)
            }
        }
    }

    const scores = {
        score_planning: analysisData?.score_planning ?? 0,
        score_project_control: analysisData?.score_project_control ?? 0,
        score_risk_management: analysisData?.score_risk_management ?? 0,
        score_team_leadership: analysisData?.score_team_leadership ?? 0,
        score_negotiation: analysisData?.score_negotiation ?? 0,
        score_decision_making: analysisData?.score_decision_making ?? 0,
    }

    const handleExport = async (settings: ExportSettings) => {
        if (!userAnswers.length || !examSetInfo) return
        const exportData = userAnswers.map(ans => ({
            applicantName: examSetInfo.applicantName,
            companyName: examSetInfo.companyName,
            examTitle: ans.exam.title,
            completedAt: dayjs(ans.completed_at).format('YYYY/MM/DD HH:mm'),
            sections: ans.answers?.sections || [],
        }))
        const filename = `Results-${examSetInfo.applicantName}-${dayjs().format('YYYY-MM-DD')}`
        await exportToZip(exportData, settings, filename)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loading loading={true} />
                <p className="mt-4 text-gray-500">در حال دریافت اطلاعات...</p>
            </div>
        )
    }

    if (!examSetInfo) {
        return (
            <div className="text-center py-20">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">اطلاعاتی یافت نشد</h3>
                <Button className="mt-4" onClick={() => navigate('/admin/applicant-exams')}>بازگشت به لیست</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 order-2 sm:order-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl sm:text-2xl shadow-sm border border-indigo-200 dark:border-indigo-800">
                        {examSetInfo.applicantName.charAt(0)}
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">
                                نتایج {examSetInfo.title}
                            </h1>
                            <Tag className={classNames(
                                "border-0 text-white w-fit text-xs sm:text-sm",
                                examSetInfo.status === 'completed' ? "bg-emerald-500" : "bg-amber-500"
                            )}>
                                {examSetInfo.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
                            </Tag>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                                <HiOutlineUser className="text-base sm:text-lg text-indigo-500" />
                                {examSetInfo.applicantName}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <HiOutlineOfficeBuilding className="text-base sm:text-lg text-indigo-500" />
                                {examSetInfo.companyName}
                            </span>
                            {examSetInfo.id && (
                                <span className="flex items-center gap-1.5">
                                    <HiOutlineIdentification className="text-base sm:text-lg text-indigo-500" />
                                    کد: <span className="font-mono">{examSetInfo.id}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="order-1 sm:order-2 self-end sm:self-auto">
                    <Button variant="plain" size="sm" icon={<HiOutlineArrowLeft />} onClick={() => navigate('/admin/applicant-exams')}>
                        بازگشت
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Card className="px-0 sm:px-4">
                <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                    <div className="overflow-x-auto custom-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
                        <TabList className="pt-4 flex-nowrap whitespace-nowrap min-w-max border-b-0 pb-1">
                        <TabNav value="answer-sheets">
                            <div className="flex items-center gap-2"><HiOutlineDocumentText /><span>پاسخنامه‌ها</span></div>
                        </TabNav>
                        <TabNav value="files">
                            <div className="flex items-center gap-2"><HiOutlineFolder /><span>فایل‌ها</span></div>
                        </TabNav>
                        <TabNav value="results">
                            <div className="flex items-center gap-2"><HiOutlineChartBar /><span>نتایج</span></div>
                        </TabNav>
                        <TabNav value="analysis">
                            <div className="flex items-center gap-2"><HiOutlinePencilAlt /><span>تحلیل</span></div>
                        </TabNav>
                        <TabNav value="status">
                            <div className="flex items-center gap-2"><HiOutlineInformationCircle /><span>وضعیت آزمون</span></div>
                        </TabNav>
                        </TabList>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Answer Sheets Tab */}
                        <TabContent value="answer-sheets">
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">پاسخنامه‌های آزمون‌ها</h4>
                                    <Button variant="solid" color="indigo-600" icon={<HiOutlineDownload />}
                                        className="w-full sm:w-auto"
                                        onClick={() => setIsExportModalOpen(true)} disabled={userAnswers.length === 0}>
                                        خروجی نتایج
                                    </Button>
                                </div>
                                {userAnswers.length > 0 ? (
                                    <>
                                        <div className="hidden sm:block overflow-x-auto">
                                            <Table>
                                                <THead><Tr><Th>عنوان آزمون</Th><Th>تاریخ تکمیل</Th><Th className="text-center">عملیات</Th></Tr></THead>
                                                <TBody>
                                                    {userAnswers.map((answer) => (
                                                        <Tr key={answer.id}>
                                                            <Td>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                                                                        <HiOutlineClipboardList className="text-lg" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900 dark:text-white">{answer.exam.title}</div>
                                                                        <div className="text-xs text-gray-500">مدت آزمون: {answer.exam.duration} دقیقه</div>
                                                                    </div>
                                                                </div>
                                                            </Td>
                                                            <Td>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dayjs(answer.completed_at).format('YYYY/MM/DD')}</span>
                                                                    <span className="text-[10px] text-gray-400">ساعت {dayjs(answer.completed_at).format('HH:mm')}</span>
                                                                </div>
                                                            </Td>
                                                            <Td className="text-center">
                                                                <Button size="sm" variant="solid" color="indigo-600" icon={<HiOutlineDocumentSearch />}
                                                                    onClick={() => navigate(`/admin/applicant-exams/${examSetId}/results/${answer.id}`)}>
                                                                    مشاهده پاسخنامه
                                                                </Button>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </TBody>
                                            </Table>
                                        </div>
                                        {/* Mobile view */}
                                        <div className="sm:hidden flex flex-col space-y-3">
                                            {userAnswers.map((answer) => (
                                                <div key={answer.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                                            <HiOutlineClipboardList className="text-xl" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white text-sm">{answer.exam.title}</div>
                                                            <div className="text-xs text-gray-500 mt-1">مدت: {answer.exam.duration} دقیقه</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded mb-3 text-xs">
                                                        <span className="text-gray-500">تاریخ تکمیل:</span>
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">{dayjs(answer.completed_at).format('YYYY/MM/DD')} ({dayjs(answer.completed_at).format('HH:mm')})</span>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        variant="solid" 
                                                        color="indigo-600" 
                                                        className="w-full"
                                                        icon={<HiOutlineDocumentSearch />}
                                                        onClick={() => navigate(`/admin/applicant-exams/${examSetId}/results/${answer.id}`)}>
                                                        مشاهده پاسخنامه
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <HiOutlineDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">هنوز پاسخنامه‌ای موجود نیست</p>
                                    </div>
                                )}
                            </div>
                        </TabContent>

                        {/* Files Tab */}
                        <TabContent value="files">
                            <FilesTab
                                collectionId={examSetInfo.collectionId}
                                userId={parseInt(examSetInfo.applicantId)}
                                adminAnalysis={analysisData?.admin_analysis || ''}
                                allScores={scores}
                                files={analysisData?.files || []}
                                onSaved={handleRefreshAnalysis}
                            />
                        </TabContent>

                        {/* Results/Chart Tab */}
                        <TabContent value="results">
                            <ScoresTab
                                collectionId={examSetInfo.collectionId}
                                userId={parseInt(examSetInfo.applicantId)}
                                adminAnalysis={analysisData?.admin_analysis || ''}
                                scores={scores}
                                onSaved={handleRefreshAnalysis}
                            />
                        </TabContent>

                        {/* Analysis Tab */}
                        <TabContent value="analysis">
                            <AnalysisTab
                                collectionId={examSetInfo.collectionId}
                                userId={parseInt(examSetInfo.applicantId)}
                                adminAnalysis={analysisData?.admin_analysis || ''}
                                allScores={scores}
                                onSaved={handleRefreshAnalysis}
                            />
                        </TabContent>

                        {/* Status Tab */}
                        <TabContent value="status">
                            <StatusTab
                                collectionId={examSetInfo.collectionId}
                                collectionStatus={collectionStatus}
                                applicantName={examSetInfo.applicantName}
                                companyName={examSetInfo.companyName}
                                totalExams={examSetInfo.totalExams}
                                completedExams={examSetInfo.completedExams}
                                averageScore={examSetInfo.averageScore}
                                onStatusChanged={handleStatusChanged}
                            />
                        </TabContent>
                    </div>
                </Tabs>
            </Card>

            <ExportSettingsModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onConfirm={handleExport}
                isBulk={true}
                title="خروجی یکجای نتایج"
            />
        </div>
    )
}

export default ApplicantExamResults
