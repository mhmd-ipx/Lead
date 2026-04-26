import { useState, useEffect } from 'react'
import { Card, Button, Tabs, Segment, Tag, Input, Upload } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineDownload,
    HiOutlineShare,
    HiOutlineChartBar,
    HiOutlineDocumentText,
    HiOutlinePencilAlt,
    HiOutlineFolder,
    HiOutlineInformationCircle,
    HiOutlineSave,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineCloudUpload
} from 'react-icons/hi'
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

const ApplicantExamResults = () => {
    const { examSetId } = useParams<{ examSetId: string }>()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('answer-sheets')
    const [layout, setLayout] = useState<Layout>('grid')
    const [analysis, setAnalysis] = useState(
        'این متقاضی در حوزه مدیریت پروژه عملکرد خوبی داشته است. نقاط قوت او شامل برنامه‌ریزی و کنترل پروژه می‌باشد.\n\nتوصیه می‌شود در زمینه مدیریت ریسک و مذاکره دوره‌های تکمیلی را بگذراند.\n\nامتیاز کلی: 85/100'
    )
    const [isEditingAnalysis, setIsEditingAnalysis] = useState(false)
    const [isEditingChart, setIsEditingChart] = useState(false)

    // Chart data state
    const [chartData, setChartData] = useState<ExamResultData>({
        categories: ['برنامه‌ریزی', 'کنترل پروژه', 'مدیریت ریسک', 'رهبری تیم', 'مذاکره', 'تصمیم‌گیری'],
        series: [85, 90, 65, 80, 70, 88]
    })
    const [tempChartData, setTempChartData] = useState(chartData)

    // Mock exam set info
    const examSetInfo: ExamSetInfo = {
        id: examSetId || '',
        title: 'مجموعه آزمون مدیریت پروژه',
        description: 'این مجموعه شامل آزمون‌های جامع در حوزه مدیریت پروژه است.',
        applicantName: 'علی محمدی',
        companyName: 'شرکت نمونه',
        assignedDate: '2024-11-20T10:00:00Z',
        examDate: '2024-11-25T10:00:00Z',
        completedDate: '2024-11-25T14:30:00Z',
        duration: 120,
        totalExams: 5,
        completedExams: 5,
        averageScore: 85,
        status: 'completed',
    }

    // Mock files data
    const [files, setFiles] = useState<FileItem[]>([
        { id: '1', name: 'گزارش کامل آزمون.pdf', size: 2457600, fileType: 'pdf', uploadDate: '1403/09/21' },
        { id: '2', name: 'نتایج تفصیلی.xlsx', size: 876544, fileType: 'xlsx', uploadDate: '1403/09/21' },
    ])

    // Mock word files for answer sheets
    const [wordFiles, setWordFiles] = useState<WordFile[]>([
        { id: 'w1', examId: '1', examTitle: 'آزمون مبانی مدیریت', fileName: 'پاسخنامه_مبانی_مدیریت.docx', size: 524288, uploadDate: '1403/09/21' },
        { id: 'w2', examId: '2', examTitle: 'آزمون برنامه‌ریزی پروژه', fileName: 'پاسخنامه_برنامه_ریزی.docx', size: 456789, uploadDate: '1403/09/21' },
    ])

    const handleSaveAnalysis = () => {
        // Save analysis
        setIsEditingAnalysis(false)
        alert('تحلیل ذخیره شد')
    }

    const handleSaveChart = () => {
        setChartData(tempChartData)
        setIsEditingChart(false)
        alert('نمودار ذخیره شد')
    }

    const handleCategoryChange = (index: number, value: string) => {
        const newCategories = [...tempChartData.categories]
        newCategories[index] = value
        setTempChartData({ ...tempChartData, categories: newCategories })
    }

    const handleSeriesChange = (index: number, value: number) => {
        const newSeries = [...tempChartData.series]
        newSeries[index] = value
        setTempChartData({ ...tempChartData, series: newSeries })
    }

    const handleFileUpload = (uploadedFiles: File[]) => {
        if (uploadedFiles && uploadedFiles[0]) {
            const newFile: FileItem = {
                id: Date.now().toString(),
                name: uploadedFiles[0].name,
                size: uploadedFiles[0].size,
                fileType: uploadedFiles[0].name.split('.').pop() || 'file',
                uploadDate: new Date().toLocaleDateString('fa-IR'),
            }
            setFiles([...files, newFile])
            alert('فایل آپلود شد')
        }
    }

    const handleDeleteFile = (fileId: string) => {
        if (confirm('آیا از حذف این فایل اطمینان دارید؟')) {
            setFiles(files.filter(f => f.id !== fileId))
            alert('فایل حذف شد')
        }
    }

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
        })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
                                icon={<HiOutlineTrash />}
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-600"
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
                                    icon={<HiOutlineTrash />}
                                    onClick={() => handleDeleteFile(file.id)}
                                    className="text-red-600"
                                >
                                    حذف
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
            <div className="flex items-center gap4">
                <Button
                    variant="plain"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/admin/applicant-exams')}
                >
                    بازگشت
                </Button>
                <div id="admin-exam-results-header">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        نتایج {examSetInfo.title}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {examSetInfo.applicantName} - {examSetInfo.companyName}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Card id="admin-exam-results-tabs-container">
                <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                    <TabList id="admin-exam-results-tabs" className="px-6 pt-4">
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
                        <TabNav value="analysis">
                            <div className="flex items-center gap-2">
                                <HiOutlinePencilAlt />
                                <span>تحلیل نتایج</span>
                            </div>
                        </TabNav>
                        <TabNav value="results">
                            <div className="flex items-center gap-2">
                                <HiOutlineChartBar />
                                <span>نتایج</span>
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
                            <Card id="admin-exam-results-chart">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        امتیاز عملکرد متقاضی
                                    </h4>
                                    {!isEditingChart ? (
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            icon={<HiOutlinePencilAlt />}
                                            onClick={() => {
                                                setTempChartData(chartData)
                                                setIsEditingChart(true)
                                            }}
                                        >
                                            ویرایش
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="plain" onClick={() => setIsEditingChart(false)}>
                                                انصراف
                                            </Button>
                                            <Button size="sm" variant="solid" icon={<HiOutlineSave />} onClick={handleSaveChart}>
                                                ذخیره
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {isEditingChart ? (
                                    <div className="space-y-4 mb-6">
                                        <h5 className="font-semibold text-gray-900 dark:text-white">ویرایش داده‌های نمودار</h5>
                                        {tempChartData.categories.map((category, index) => (
                                            <div key={index} className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold mb-2">عنوان {index + 1}</label>
                                                    <Input
                                                        value={category}
                                                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold mb-2">درصد {index + 1}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={tempChartData.series[index]}
                                                        onChange={(e) => handleSeriesChange(index, parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                                <div className="mt-6">
                                    <Chart
                                        type="radar"
                                        customOptions={{
                                            xaxis: {
                                                categories: chartData.categories,
                                            },
                                            yaxis: {
                                                show: false,
                                            },
                                        }}
                                        series={[
                                            {
                                                name: 'امتیاز عملکرد',
                                                data: chartData.series,
                                            },
                                        ]}
                                        height={250}
                                    />
                                    <div className="flex flex-col gap-4 mt-6">
                                        {chartData.categories.map((category, index) => (
                                            <div key={category + index} className="flex items-center gap-4">
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
                                                            chartData.series[index] > 75 && 'bg-success',
                                                            chartData.series[index] <= 30 && 'bg-error',
                                                            chartData.series[index] > 30 && chartData.series[index] < 75 && 'bg-warning',
                                                        )}
                                                    >
                                                        {chartData.series[index]}%
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
                            <Card id="admin-exam-results-analysis">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        تحلیل نتایج آزمون
                                    </h4>
                                    {!isEditingAnalysis && (
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            icon={<HiOutlinePencilAlt />}
                                            onClick={() => setIsEditingAnalysis(true)}
                                        >
                                            ویرایش
                                        </Button>
                                    )}
                                </div>
                                <div>
                                    <textarea
                                        className="w-full min-h-[400px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
                                        value={analysis}
                                        onChange={(e) => setAnalysis(e.target.value)}
                                        placeholder="تحلیل نتایج را وارد کنید..."
                                        disabled={!isEditingAnalysis}
                                    />
                                    {isEditingAnalysis && (
                                        <div className="mt-4 flex justify-end gap-3">
                                            <Button variant="default" onClick={() => setIsEditingAnalysis(false)}>انصراف</Button>
                                            <Button variant="solid" icon={<HiOutlineSave />} onClick={handleSaveAnalysis}>ذخیره تحلیل</Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabContent>

                        {/* Answer Sheets Tab - NEW */}
                        <TabContent value="answer-sheets">
                            <div>
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
                            <div id="admin-exam-results-files">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        فایل‌های نتایج آزمون
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <Upload onChange={handleFileUpload}>
                                            <Button variant="solid" icon={<HiOutlineCloudUpload />}>
                                                آپلود فایل
                                            </Button>
                                        </Upload>
                                        <Segment value={layout} onChange={(val) => setLayout(val as Layout)}>
                                            <Segment.Item value="grid" className="text-xl px-3">
                                                <TbLayoutGrid />
                                            </Segment.Item>
                                            <Segment.Item value="list" className="text-xl px-3">
                                                <TbList />
                                            </Segment.Item>
                                        </Segment>
                                    </div>
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

                        {/* Info Tab */}
                        <TabContent value="info">
                            <div id="admin-exam-results-info" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        اطلاعات متقاضی
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">متقاضی</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{examSetInfo.applicantName}</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">سازمان</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{examSetInfo.companyName}</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        آمار آزمون
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">تعداد آزمون‌ها</span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {examSetInfo.completedExams}/{examSetInfo.totalExams}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">میانگین نمره</span>
                                            <span className="font-bold text-2xl text-green-600 dark:text-green-400">
                                                {examSetInfo.averageScore}%
                                            </span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="lg:col-span-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        وضعیت آزمون
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                تغییر وضعیت
                                            </label>
                                            <select
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                defaultValue={examSetInfo.status}
                                                onChange={(e) => {
                                                    alert(`وضعیت به "${e.target.options[e.target.selectedIndex].text}" تغییر یافت`)
                                                }}
                                            >
                                                <option value="pending">در انتظار</option>
                                                <option value="in_progress">در حال انجام</option>
                                                <option value="completed">تکمیل شده</option>
                                            </select>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                💡 با تغییر وضعیت، متقاضی از تغییرات مطلع خواهد شد.
                                            </p>
                                        </div>
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

export default ApplicantExamResults
