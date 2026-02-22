import { useState } from 'react'
import { Card, Button, Tabs, Segment, Tag } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlineDownload, HiOutlineShare, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineClock, HiOutlineAcademicCap, HiOutlineChartBar, HiOutlinePencilAlt, HiOutlineFolder, HiOutlineInformationCircle } from 'react-icons/hi'
import { TbLayoutGrid, TbList } from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import Chart from '@/components/shared/Chart'
import classNames from '@/utils/classNames'
import { COLORS } from '@/constants/chart.constant'
import Table from '@/components/ui/Table'
import FileDoc from '@/assets/svg/files/FileDoc'
import FileXls from '@/assets/svg/files/FileXls'
import FilePdf from '@/assets/svg/files/FilePdf'
import FileImage from '@/assets/svg/files/FileImage'

const { TabNav, TabList, TabContent } = Tabs
const { TBody, THead, Th, Tr, Td } = Table

interface ExamResultData {
    categories: string[]
    series: number[]
}

interface FileItem {
    id: string
    name: string
    size: number
    fileType: string
    uploadDate: string
}

interface WordFile {
    id: string
    examId: string
    examTitle: string
    fileName: string
    size: number
    uploadDate: string
}

interface Exam {
    id: string
    title: string
    description: string
    duration: number
    questionCount: number
    status: 'completed' | 'in_progress' | 'pending'
    score?: number
}

interface ExamSetInfo {
    id: string
    title: string
    description: string
    assignedDate: string
    examDate: string
    completedDate: string
    duration: number
    totalExams: number
    completedExams: number
    averageScore: number
    status: 'completed' | 'in_progress' | 'pending'
    assessmentId: string
    exams: Exam[]
}

type Layout = 'grid' | 'list'

// File Icon Component
const FileIcon = ({ type, size = 40 }: { type: string; size?: number }) => {
    switch (type) {
        case 'pdf':
            return <FilePdf height={size} width={size} />
        case 'xls':
        case 'xlsx':
            return <FileXls height={size} width={size} />
        case 'doc':
        case 'docx':
            return <FileDoc height={size} width={size} />
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'image':
            return <FileImage height={size} width={size} />
        default:
            return <FileDoc height={size} width={size} />
    }
}

const ExamResults = () => {
    const { managerId, examSetId } = useParams<{ managerId: string; examSetId: string }>()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('results')
    const [layout, setLayout] = useState<Layout>('grid')
    const [analysis, setAnalysis] = useState(
        'این متقاضی در حوزه مدیریت پروژه عملکرد خوبی داشته است. نقاط قوت او شامل برنامه‌ریزی و کنترل پروژه می‌باشد. \n\nتوصیه می‌شود در زمینه مدیریت ریسک و مذاکره دوره‌های تکمیلی را بگذراند.\n\nامتیاز کلی: 85/100'
    )

    // Mock exam set info
    const examSetInfo: ExamSetInfo = {
        id: examSetId || '',
        title: 'مجموعه آزمون مدیریت پروژه',
        description: 'این مجموعه شامل آزمون‌های جامع در حوزه مدیریت پروژه، رهبری تیم و مهارت‌های مدیریتی است.',
        assignedDate: '2024-11-20T10:00:00Z',
        examDate: '2024-11-25T10:00:00Z',
        completedDate: '2024-11-25T14:30:00Z',
        duration: 120,
        totalExams: 5,
        completedExams: 5,
        averageScore: 85,
        status: 'completed',
        assessmentId: 'assessment-001',
        exams: [
            { id: '1', title: 'آزمون مبانی مدیریت', description: 'ارزیابی دانش پایه مدیریت', duration: 30, questionCount: 20, status: 'completed', score: 90 },
            { id: '2', title: 'آزمون برنامه‌ریزی پروژه', description: 'مهارت‌های برنامه‌ریزی و زمان‌بندی', duration: 25, questionCount: 15, status: 'completed', score: 85 },
            { id: '3', title: 'آزمون رهبری تیم', description: 'مهارت‌های رهبری و مدیریت تیم', duration: 35, questionCount: 25, status: 'completed', score: 88 },
            { id: '4', title: 'آزمون مدیریت ریسک', description: 'شناسایی و مدیریت ریسک‌های پروژه', duration: 20, questionCount: 15, status: 'completed', score: 75 },
            { id: '5', title: 'آزمون کنترل پروژه', description: 'نظارت و کنترل اجرای پروژه', duration: 30, questionCount: 20, status: 'completed', score: 87 },
        ],
    }

    // Mock exam result data
    const resultData: ExamResultData = {
        categories: [
            'برنامه‌ریزی',
            'کنترل پروژه',
            'مدیریت ریسک',
            'رهبری تیم',
            'مذاکره',
            'تصمیم‌گیری'
        ],
        series: [85, 90, 65, 80, 70, 88]
    }

    // Mock files data
    const files: FileItem[] = [
        { id: '1', name: 'گزارش کامل آزمون.pdf', size: 2457600, fileType: 'pdf', uploadDate: '1403/09/21' },
        { id: '2', name: 'نتایج تفصیلی.xlsx', size: 876544, fileType: 'xlsx', uploadDate: '1403/09/21' },
    ]

    // Mock word files for answer sheets
    const wordFiles: WordFile[] = [
        { id: 'w1', examId: '1', examTitle: 'آزمون مبانی مدیریت', fileName: 'پاسخنامه_مبانی_مدیریت.docx', size: 524288, uploadDate: '1403/09/21' },
        { id: 'w2', examId: '2', examTitle: 'آزمون برنامه‌ریزی پروژه', fileName: 'پاسخنامه_برنامه_ریزی.docx', size: 456789, uploadDate: '1403/09/21' },
    ]

    const handleDownload = (fileName: string) => {
        alert(`دانلود ${fileName}`)
    }

    const handleShare = (fileName: string) => {
        alert(`اشتراک‌گذاری ${fileName}`)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getStatusTag = (status: 'completed' | 'in_progress' | 'pending') => {
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

    const renderFileGrid = () => (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-4 gap-4 lg:gap-6">
            {files.map((file) => (
                <div
                    key={file.id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-3">
                            <FileIcon type={file.fileType} size={60} />
                        </div>
                        <h6 className="font-semibold text-gray-900 dark:text-white mb-1 truncate w-full">
                            {file.name}
                        </h6>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {formatFileSize(file.size)}
                        </p>
                        <div className="flex gap-2 w-full">
                            <Button
                                size="sm"
                                variant="default"
                                icon={<HiOutlineDownload />}
                                onClick={() => handleDownload(file.name)}
                                className="flex-1"
                            >
                                دانلود
                            </Button>
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlineShare />}
                                onClick={() => handleShare(file.name)}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    const renderFileList = () => (
        <Table className="mt-4">
            <THead>
                <Tr>
                    <Th>فایل</Th>
                    <Th>سایز</Th>
                    <Th>تاریخ آپلود</Th>
                    <Th></Th>
                </Tr>
            </THead>
            <TBody>
                {files.map((file) => (
                    <Tr key={file.id}>
                        <Td>
                            <div className="flex items-center gap-3">
                                <FileIcon type={file.fileType} size={32} />
                                <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                            </div>
                        </Td>
                        <Td>{formatFileSize(file.size)}</Td>
                        <Td>{file.uploadDate}</Td>
                        <Td>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="default"
                                    icon={<HiOutlineDownload />}
                                    onClick={() => handleDownload(file.name)}
                                >
                                    دانلود
                                </Button>
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<HiOutlineShare />}
                                    onClick={() => handleShare(file.name)}
                                >
                                    اشتراک‌گذاری
                                </Button>
                            </div>
                        </Td>
                    </Tr>
                ))}
            </TBody>
        </Table>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="plain"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate(`/owner/managers/${managerId}/exams`)}
                >
                    بازگشت
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        نتایج {examSetInfo.title}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مشاهده نتایج، تحلیل، فایل‌ها و اطلاعات آزمون
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Card>
                <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                    <TabList className="px-6 pt-4">
                        <TabNav value="results">
                            <div className="flex items-center gap-2">
                                <HiOutlineChartBar />
                                <span>نتایج</span>
                            </div>
                        </TabNav>
                        <TabNav value="analysis">
                            <div className="flex items-center gap-2">
                                <HiOutlinePencilAlt />
                                <span>تحلیل نتایج</span>
                            </div>
                        </TabNav>
                        <TabNav value="answer-sheets">
                            <div className="flex items-center gap-2">
                                <HiOutlineDocumentText />
                                <span>پاسخنامه‌ها</span>
                            </div>
                        </TabNav>
                        <TabNav value="files">
                            <div className="flex items-center gap-2">
                                <HiOutlineFolder />
                                <span>فایل‌های نتایج</span>
                            </div>
                        </TabNav>
                        <TabNav value="info">
                            <div className="flex items-center gap-2">
                                <HiOutlineInformationCircle />
                                <span>اطلاعات آزمون</span>
                            </div>
                        </TabNav>
                    </TabList>

                    <div className="p-6">
                        {/* Results Tab */}
                        <TabContent value="results">
                            <Card>
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        امتیاز عملکرد متقاضی
                                    </h4>
                                </div>
                                <div className="mt-6">
                                    <Chart
                                        type="radar"
                                        customOptions={{
                                            xaxis: {
                                                categories: resultData.categories,
                                                labels: {
                                                    formatter: (val: string) => {
                                                        return `${resultData.categories.indexOf(val) + 1}`
                                                    },
                                                },
                                            },
                                            yaxis: {
                                                show: false,
                                            },
                                            tooltip: {
                                                custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
                                                    return `
                            <div class="py-2 px-4 rounded-xl">
                              <div class="flex items-center gap-2">
                                <div class="h-[10px] w-[10px] rounded-full" style="background-color: ${COLORS[0]}"></div>
                                <div class="flex gap-2">${resultData.categories[dataPointIndex]}: <span class="font-bold">${resultData.series[dataPointIndex]}</span></div>
                              </div>
                            </div>
                          `
                                                },
                                            },
                                        }}
                                        series={[
                                            {
                                                name: 'امتیاز عملکرد',
                                                data: resultData.series,
                                            },
                                        ]}
                                        height={250}
                                    />
                                    <div className="flex flex-col gap-4 mt-6">
                                        {resultData.categories.map((category, index) => (
                                            <div
                                                key={category + index}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-full h-8 w-8 border-2 border-gray-200 dark:border-gray-600 font-bold text-gray-900 dark:text-white flex items-center justify-center">
                                                        {index + 1}
                                                    </div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{category}</div>
                                                </div>
                                                <div className="border-dashed border-[1.5px] border-gray-300 dark:border-gray-500 flex-1" />
                                                <div>
                                                    <span
                                                        className={classNames(
                                                            'rounded-full px-2 py-1 text-white',
                                                            resultData.series[index] > 75 && 'bg-success',
                                                            resultData.series[index] <= 30 && 'bg-error',
                                                            resultData.series[index] > 30 &&
                                                            resultData.series[index] < 75 &&
                                                            'bg-warning',
                                                        )}
                                                    >
                                                        {resultData.series[index]}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </TabContent>

                        {/* Analysis Tab */}
                        <TabContent value="analysis">
                            <Card id="exam-results-analysis-card">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    تحلیل نتایج آزمون
                                </h4>
                                <div>
                                    <textarea
                                        className="w-full min-h-[400px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
                                        value={analysis}
                                        onChange={(e) => setAnalysis(e.target.value)}
                                        placeholder="تحلیل نتایج را وارد کنید..."
                                        disabled={true}
                                    />
                                </div>
                            </Card>
                        </TabContent>

                        {/* Answer Sheets Tab */}
                        <TabContent value="answer-sheets">
                            <div id="exam-results-answer-sheets">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        پاسخنامه‌های آزمون‌ها
                                    </h4>
                                    <Segment value={layout} onChange={(val) => setLayout(val as Layout)}>
                                        <Segment.Item value="grid" className="text-xl px-3">
                                            <TbLayoutGrid />
                                        </Segment.Item>
                                        <Segment.Item value="list" className="text-xl px-3">
                                            <TbList />
                                        </Segment.Item>
                                    </Segment>
                                </div>

                                {wordFiles.length > 0 ? (
                                    <>
                                        {layout === 'grid' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {wordFiles.map((file) => (
                                                    <Card key={file.id} className="p-4">
                                                        <div className="flex flex-col items-center text-center">
                                                            <FileIcon type="docx" size={60} />
                                                            <h6 className="font-semibold text-gray-900 dark:text-white mt-3 mb-1">
                                                                {file.examTitle}
                                                            </h6>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                                {file.fileName}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mb-3">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                icon={<HiOutlineDownload />}
                                                                onClick={() => handleDownload(file.fileName)}
                                                                className="w-full"
                                                            >
                                                                دانلود
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}

                                        {layout === 'list' && (
                                            <Table>
                                                <THead>
                                                    <Tr>
                                                        <Th>عنوان آزمون</Th>
                                                        <Th>نام فایل</Th>
                                                        <Th>حجم</Th>
                                                        <Th>تاریخ</Th>
                                                        <Th></Th>
                                                    </Tr>
                                                </THead>
                                                <TBody>
                                                    {wordFiles.map((file) => (
                                                        <Tr key={file.id}>
                                                            <Td>
                                                                <div className="flex items-center gap-3">
                                                                    <FileIcon type="docx" size={32} />
                                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                                        {file.examTitle}
                                                                    </span>
                                                                </div>
                                                            </Td>
                                                            <Td>
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    {file.fileName}
                                                                </span>
                                                            </Td>
                                                            <Td>{formatFileSize(file.size)}</Td>
                                                            <Td>{file.uploadDate}</Td>
                                                            <Td>
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    icon={<HiOutlineDownload />}
                                                                    onClick={() => handleDownload(file.fileName)}
                                                                >
                                                                    دانلود
                                                                </Button>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </TBody>
                                            </Table>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <HiOutlineDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            هنوز پاسخنامه‌ای موجود نیست
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabContent>

                        {/* Files Tab */}
                        <TabContent value="files">
                            <div id="exam-results-files">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        فایل‌های نتایج آزمون
                                    </h4>
                                    <Segment
                                        value={layout}
                                        onChange={(val) => setLayout(val as Layout)}
                                    >
                                        <Segment.Item value="grid" className="text-xl px-3">
                                            <TbLayoutGrid />
                                        </Segment.Item>
                                        <Segment.Item value="list" className="text-xl px-3">
                                            <TbList />
                                        </Segment.Item>
                                    </Segment>
                                </div>

                                {files.length > 0 ? (
                                    <div>
                                        {layout === 'grid' && renderFileGrid()}
                                        {layout === 'list' && renderFileList()}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            فایلی موجود نیست
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabContent>

                        {/* Exam Info Tab */}
                        <TabContent value="info">
                            <div id="exam-results-info-cards" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        اطلاعات متقاضی
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">متقاضی</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">علی محمدی</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">سازمان</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">شرکت نمونه</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        زمان‌بندی
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <HiOutlineCalendar className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">تاریخ اختصاص</div>
                                                <div className="font-medium text-gray-900 dark:text-white">{formatDate(examSetInfo.assignedDate)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <HiOutlineCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">تاریخ آزمون</div>
                                                <div className="font-medium text-gray-900 dark:text-white">{formatDate(examSetInfo.examDate)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <HiOutlineCalendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">تاریخ تکمیل</div>
                                                <div className="font-medium text-gray-900 dark:text-white">{formatDate(examSetInfo.completedDate)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <HiOutlineClock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">مدت زمان کل</div>
                                                <div className="font-medium text-gray-900 dark:text-white">{examSetInfo.duration} دقیقه</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        آمار آزمون
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">تعداد آزمون‌ها</div>
                                            <div className="font-bold text-gray-900 dark:text-white">{examSetInfo.completedExams}/{examSetInfo.totalExams}</div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">میانگین نمره</div>
                                            <div className="font-bold text-2xl text-green-600 dark:text-green-400">{examSetInfo.averageScore}%</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        نیازسنجی مرتبط
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        این مجموعه آزمون بر اساس نیازسنجی انجام شده برای این متقاضی طراحی شده است.
                                    </p>
                                    <Button
                                        variant="solid"
                                        icon={<HiOutlineDocumentText />}
                                        onClick={() => navigate(`/owner/managers/${managerId}/assessment/${examSetInfo.assessmentId}/view`)}
                                        className="w-full"
                                    >
                                        مشاهده نیازسنجی
                                    </Button>
                                </Card>

                                <Card className="lg:col-span-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        لیست آزمون‌های مجموعه
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <THead>
                                                <Tr>
                                                    <Th>#</Th>
                                                    <Th>عنوان آزمون</Th>
                                                    <Th>توضیحات</Th>
                                                    <Th>تعداد سوال</Th>
                                                    <Th>مدت زمان</Th>
                                                    <Th>نمره</Th>
                                                    <Th>وضعیت</Th>
                                                </Tr>
                                            </THead>
                                            <TBody>
                                                {examSetInfo.exams.map((exam, index) => (
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
                                                        <Td>
                                                            {exam.score !== undefined && (
                                                                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                                                    {exam.score}%
                                                                </span>
                                                            )}
                                                        </Td>
                                                        <Td>{getStatusTag(exam.status)}</Td>
                                                    </Tr>
                                                ))}
                                            </TBody>
                                        </Table>
                                    </div>
                                </Card>
                            </div>
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default ExamResults
