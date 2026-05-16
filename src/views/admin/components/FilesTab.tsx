import { useState } from 'react'
import { Button, Segment, Upload, Notification, toast } from '@/components/ui'
import Table from '@/components/ui/Table'
import { HiOutlineDownload, HiOutlineTrash, HiOutlineCloudUpload } from 'react-icons/hi'
import { TbLayoutGrid, TbList } from 'react-icons/tb'
import FileDoc from '@/assets/svg/files/FileDoc'
import FileXls from '@/assets/svg/files/FileXls'
import FilePdf from '@/assets/svg/files/FilePdf'
import FileImage from '@/assets/svg/files/FileImage'
import { apiUploadFile } from '@/services/FileService'
import { updateCollectionAnalysis } from '@/services/AdminService'

const { TBody, THead, Th, Tr, Td } = Table

interface AnalysisFile {
    id: number
    name: string
    size: number
    type: string
    address: string
    created_at: string
}

interface FilesTabProps {
    collectionId: string
    userId: number
    adminAnalysis: string
    allScores: {
        score_planning: number
        score_project_control: number
        score_risk_management: number
        score_team_leadership: number
        score_negotiation: number
        score_decision_making: number
    }
    files: AnalysisFile[]
    onSaved: () => void
}

type Layout = 'grid' | 'list'

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

const FilesTab = ({ collectionId, userId, adminAnalysis, allScores, files, onSaved }: FilesTabProps) => {
    const [layout, setLayout] = useState<Layout>('grid')
    const [uploading, setUploading] = useState(false)

    const handleFileUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles?.[0]) return
        setUploading(true)
        try {
            const res = await apiUploadFile(uploadedFiles[0])
            const newFileId = (res as any)?.data?.id || (res as any)?.id
            if (newFileId) {
                const existingFileIds = files.map(f => f.id)
                await updateCollectionAnalysis(collectionId, {
                    user_id: userId,
                    admin_analysis: adminAnalysis,
                    ...allScores,
                    file_ids: [...existingFileIds, newFileId],
                })
                toast.push(<Notification type="success">فایل با موفقیت آپلود شد</Notification>)
                onSaved()
            }
        } catch (error) {
            toast.push(<Notification type="danger">خطا در آپلود فایل</Notification>)
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteFile = async (fileId: number) => {
        if (!confirm('آیا از حذف این فایل اطمینان دارید؟')) return
        try {
            const remainingIds = files.filter(f => f.id !== fileId).map(f => f.id)
            await updateCollectionAnalysis(collectionId, {
                user_id: userId,
                admin_analysis: adminAnalysis,
                ...allScores,
                file_ids: remainingIds,
            })
            toast.push(<Notification type="success">فایل حذف شد</Notification>)
            onSaved()
        } catch (error) {
            toast.push(<Notification type="danger">خطا در حذف فایل</Notification>)
        }
    }

    const handleDownload = (file: AnalysisFile) => {
        window.open(file.address, '_blank')
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    فایل‌های نتایج آزمون
                </h4>
                <div className="flex items-center gap-3">
                    <Upload onChange={handleFileUpload}>
                        <Button variant="solid" icon={<HiOutlineCloudUpload />} loading={uploading}>
                            آپلود فایل
                        </Button>
                    </Upload>
                    <Segment value={layout} onChange={(val) => setLayout(val as Layout)}>
                        <Segment.Item value="grid" className="text-xl px-3"><TbLayoutGrid /></Segment.Item>
                        <Segment.Item value="list" className="text-xl px-3"><TbList /></Segment.Item>
                    </Segment>
                </div>
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
                                    <div className="flex gap-2 w-full">
                                        <Button size="sm" variant="default" icon={<HiOutlineDownload />} onClick={() => handleDownload(file)} className="flex-1">دانلود</Button>
                                        <Button size="sm" variant="plain" icon={<HiOutlineTrash />} onClick={() => handleDeleteFile(file.id)} className="text-red-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Table className="mt-4">
                        <THead><Tr><Th>فایل</Th><Th>سایز</Th><Th>تاریخ</Th><Th></Th></Tr></THead>
                        <TBody>
                            {files.map((file) => (
                                <Tr key={file.id}>
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <FileIcon type={file.type} size={32} />
                                            <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                                        </div>
                                    </Td>
                                    <Td>{formatFileSize(file.size)}</Td>
                                    <Td>{new Date(file.created_at).toLocaleDateString('fa-IR')}</Td>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="default" icon={<HiOutlineDownload />} onClick={() => handleDownload(file)}>دانلود</Button>
                                            <Button size="sm" variant="plain" icon={<HiOutlineTrash />} onClick={() => handleDeleteFile(file.id)} className="text-red-600">حذف</Button>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">فایلی موجود نیست</p>
                </div>
            )}
        </div>
    )
}

export default FilesTab
