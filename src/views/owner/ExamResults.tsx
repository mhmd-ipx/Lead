import { useState, useEffect } from 'react'
import { Card, Button, Tabs, Tag, Segment } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineChartBar,
    HiOutlinePencilAlt,
    HiOutlineFolder,
    HiOutlineUser,
    HiOutlineOfficeBuilding,
    HiOutlineIdentification,
    HiOutlineDownload,
} from 'react-icons/hi'
import { TbLayoutGrid, TbList } from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import Chart from '@/components/shared/Chart'
import classNames from '@/utils/classNames'
import Table from '@/components/ui/Table'
import FileDoc from '@/assets/svg/files/FileDoc'
import FileXls from '@/assets/svg/files/FileXls'
import FilePdf from '@/assets/svg/files/FilePdf'
import FileImage from '@/assets/svg/files/FileImage'
import {
    getApplicantExamSetById,
    getCollectionAnalysis,
    CollectionAnalysis,
} from '@/services/AdminService'
import { Loading } from '@/components/shared'
import RichTextEditor from '@/components/shared/RichTextEditor'

const { TabNav, TabList, TabContent } = Tabs
const { TBody, THead, Th, Tr, Td } = Table

const SCORE_LABELS: Record<string, string> = {
    score_planning: 'برنامه‌ریزی',
    score_project_control: 'کنترل پروژه',
    score_risk_management: 'مدیریت ریسک',
    score_team_leadership: 'رهبری تیم',
    score_negotiation: 'مذاکره',
    score_decision_making: 'تصمیم‌گیری',
}
const SCORE_KEYS = Object.keys(SCORE_LABELS)

type Layout = 'grid' | 'list'

interface AnalysisFile {
    id: number
    name: string
    size: number
    type: string
    address: string
    created_at: string
}

const FileIcon = ({ type, size = 40 }: { type: string; size?: number }) => {
    if (type.includes('pdf')) return <FilePdf height={size} width={size} />
    if (type.includes('sheet') || type.includes('xls')) return <FileXls height={size} width={size} />
    if (type.includes('image')) return <FileImage height={size} width={size} />
    return <FileDoc height={size} width={size} />
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const ExamResults = () => {
    const { managerId, examSetId } = useParams<{ managerId: string; examSetId: string }>()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('results')
    const [layout, setLayout] = useState<Layout>('grid')

    const [loading, setLoading] = useState(true)
    const [applicantName, setApplicantName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [title, setTitle] = useState('')
    const [analysisData, setAnalysisData] = useState<CollectionAnalysis | null>(null)

    useEffect(() => {
        fetchData()
    }, [examSetId])

    const fetchData = async () => {
        if (!examSetId) return
        setLoading(true)
        try {
            const data = await getApplicantExamSetById(examSetId)
            if (data) {
                setApplicantName(data.applicantName)
                setCompanyName(data.companyName)
                setTitle(data.title)

                if (data.collectionId && data.applicantId) {
                    const analysis = await getCollectionAnalysis(data.collectionId, data.applicantId)
                    setAnalysisData(analysis)
                }
            }
        } catch (error) {
            console.error('Error fetching exam results:', error)
        } finally {
            setLoading(false)
        }
    }

    const scores = SCORE_KEYS.map(k => (analysisData as any)?.[k] ?? 0)
    const categories = SCORE_KEYS.map(k => SCORE_LABELS[k])
    const files: AnalysisFile[] = analysisData?.files || []

    const handleDownload = (file: AnalysisFile) => {
        window.open(file.address, '_blank')
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loading loading={true} />
                <p className="mt-4 text-gray-500">در حال دریافت اطلاعات...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="plain" icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate(-1)}
                    className="self-start sm:self-auto"
                >
                    بازگشت
                </Button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl sm:text-2xl shadow-sm border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {applicantName?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            نتایج {title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                                <HiOutlineUser className="text-lg text-indigo-500" />
                                {applicantName}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <HiOutlineOfficeBuilding className="text-lg text-indigo-500" />
                                {companyName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Card>
                <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                    <TabList className="px-6 pt-4 overflow-x-auto flex-nowrap hide-scrollbar">
                        <TabNav value="results" className="whitespace-nowrap">
                            <div className="flex items-center gap-2"><HiOutlineChartBar /><span>نتایج</span></div>
                        </TabNav>
                        <TabNav value="analysis" className="whitespace-nowrap">
                            <div className="flex items-center gap-2"><HiOutlinePencilAlt /><span>تحلیل</span></div>
                        </TabNav>
                        <TabNav value="files" className="whitespace-nowrap">
                            <div className="flex items-center gap-2"><HiOutlineFolder /><span>فایل‌ها</span></div>
                        </TabNav>
                    </TabList>

                    <div className="p-6">
                        {/* Results/Chart Tab - Read Only */}
                        <TabContent value="results">
                            <Card>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                    امتیاز عملکرد متقاضی
                                </h4>
                                <div className="mt-6">
                                    <Chart
                                        type="radar"
                                        customOptions={{
                                            xaxis: { categories },
                                            yaxis: { show: false },
                                        }}
                                        series={[{ name: 'امتیاز عملکرد', data: scores }]}
                                        height={250}
                                    />
                                    <div className="flex flex-col gap-4 mt-6">
                                        {categories.map((category, index) => (
                                            <div key={category + index} className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-full h-8 w-8 border-2 border-gray-200 dark:border-gray-600 font-bold text-gray-900 dark:text-white flex items-center justify-center">
                                                        {index + 1}
                                                    </div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{category}</div>
                                                </div>
                                                <div className="border-dashed border-[1.5px] border-gray-300 dark:border-gray-500 flex-1" />
                                                <span className={classNames(
                                                    'rounded-full px-2 py-1 text-white',
                                                    scores[index] > 75 && 'bg-success',
                                                    scores[index] <= 30 && 'bg-error',
                                                    scores[index] > 30 && scores[index] <= 75 && 'bg-warning',
                                                )}>
                                                    {scores[index]}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </TabContent>

                        {/* Analysis Tab - Read Only */}
                        <TabContent value="analysis">
                            <Card>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    تحلیل نتایج آزمون
                                </h4>
                                <RichTextEditor
                                    value={analysisData?.admin_analysis || ''}
                                    onChange={() => {}}
                                    readOnly={true}
                                    minHeight={400}
                                    placeholder="تحلیلی ثبت نشده است"
                                />
                            </Card>
                        </TabContent>

                        {/* Files Tab - Read Only (no upload/delete) */}
                        <TabContent value="files">
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        فایل‌های نتایج آزمون
                                    </h4>
                                    <Segment value={layout} onChange={(val) => setLayout(val as Layout)}>
                                        <Segment.Item value="grid" className="text-xl px-3"><TbLayoutGrid /></Segment.Item>
                                        <Segment.Item value="list" className="text-xl px-3"><TbList /></Segment.Item>
                                    </Segment>
                                </div>

                                {files.length > 0 ? (
                                    layout === 'grid' ? (
                                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-4 gap-4 lg:gap-6">
                                            {files.map((file) => (
                                                <div key={file.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="mb-3"><FileIcon type={file.type} size={60} /></div>
                                                        <h6 className="font-semibold text-gray-900 dark:text-white mb-1 truncate w-full">{file.name}</h6>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{formatFileSize(file.size)}</p>
                                                        <Button size="sm" variant="default" icon={<HiOutlineDownload />} onClick={() => handleDownload(file)} className="w-full">
                                                            دانلود
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto mt-4">
                                            <Table>
                                                <THead><Tr><Th>فایل</Th><Th>سایز</Th><Th>تاریخ</Th><Th></Th></Tr></THead>
                                                <TBody>
                                                    {files.map((file) => (
                                                        <Tr key={file.id}>
                                                            <Td>
                                                                <div className="flex items-center gap-3">
                                                                    <FileIcon type={file.type} size={32} />
                                                                    <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{file.name}</span>
                                                                </div>
                                                            </Td>
                                                            <Td className="whitespace-nowrap">{formatFileSize(file.size)}</Td>
                                                            <Td className="whitespace-nowrap">{new Date(file.created_at).toLocaleDateString('fa-IR')}</Td>
                                                            <Td>
                                                                <Button size="sm" variant="default" icon={<HiOutlineDownload />} onClick={() => handleDownload(file)}>
                                                                    دانلود
                                                                </Button>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </TBody>
                                            </Table>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <p className="text-gray-500 dark:text-gray-400">فایلی موجود نیست</p>
                                    </div>
                                )}
                            </div>
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default ExamResults
