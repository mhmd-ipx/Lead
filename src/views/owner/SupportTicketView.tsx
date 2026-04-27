import { useState, useRef, useEffect } from 'react'
import { Card, Button, Input, Tag, Skeleton, Notification, toast, Upload } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineReply,
    HiOutlinePaperClip,
    HiUser,
    HiOutlineSupport,
    HiOutlineTrash,
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import classNames from '@/utils/classNames'
import useSWR from 'swr'
import { apiGetTicketDetail, apiReplyTicket } from '@/services/SupportService'
import { apiUploadFile, apiGetFileInfo } from '@/services/FileService'
import { TicketPriority, TicketStatus } from '@/@types/support'
import { FcImageFile, FcFile, FcVideoFile, FcMusic } from 'react-icons/fc'
import { motion, AnimatePresence } from 'framer-motion'

const AttachmentItem = ({ attachment, isSelf }: { attachment: any, isSelf: boolean }) => {
    const [fileInfo, setFileInfo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (typeof attachment === 'string' || typeof attachment === 'number') {
            fetchFileInfo(attachment)
        } else {
            setFileInfo(attachment)
        }
    }, [attachment])

    const fetchFileInfo = async (id: string | number) => {
        setIsLoading(true)
        try {
            const res = await apiGetFileInfo(id)
            if (res && res.id) {
                setFileInfo(res)
            }
        } catch (error) {
            console.error('Error fetching file info:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getFileIcon = (type: string) => {
        if (!type) return <FcFile />
        if (type.includes('image')) return <FcImageFile />
        if (type.includes('video')) return <FcVideoFile />
        if (type.includes('audio')) return <FcMusic />
        return <FcFile />
    }

    if (isLoading) return <Skeleton width={100} height={24} />
    if (!fileInfo) return null

    return (
        <a
            href={fileInfo.address}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(
                "flex items-center gap-2 text-xs px-2 py-1.5 rounded cursor-pointer transition-colors max-w-full overflow-hidden",
                isSelf
                    ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-200"
                    : "bg-white/20 hover:bg-white/30 text-white"
            )}
            title={fileInfo.name}
        >
            <span className="text-lg shrink-0">{getFileIcon(fileInfo.type)}</span>
            <span className="truncate">{fileInfo.name || 'فایل ضمیمه'}</span>
        </a>
    )
}

const SupportTicketView = () => {
    const { ticketId } = useParams<{ ticketId: string }>()
    const navigate = useNavigate()
    const [replyMessage, setReplyMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [attachedFiles, setAttachedFiles] = useState<Array<{ 
        id: string | number, 
        name: string, 
        status: 'uploading' | 'success' | 'error',
        progress: number 
    }>>([])
    const attachedFilesRef = useRef(attachedFiles)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        attachedFilesRef.current = attachedFiles
    }, [attachedFiles])

    const { data: response, isLoading, mutate } = useSWR(
        ticketId ? `/api/support-tickets/${ticketId}` : null,
        () => apiGetTicketDetail(ticketId!),
        {
            revalidateOnFocus: false,
        }
    )

    const ticket = response?.data

    useEffect(() => {
        if (ticket?.messages) {
            scrollToBottom()
        }
    }, [ticket?.messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const getPriorityTag = (priority: TicketPriority) => {
        switch (priority) {
            case 'high':
                return <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100 border-0">فوری</Tag>
            case 'medium':
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">متوسط</Tag>
            case 'low':
                return <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">کم</Tag>
            default:
                return <Tag>{priority}</Tag>
        }
    }

    const getStatusTag = (status: TicketStatus) => {
        switch (status) {
            case 'open':
                return <Tag className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100 border-0">باز</Tag>
            case 'in_progress':
                return <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">در حال بررسی</Tag>
            case 'waiting_for_user':
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">در انتظار پاسخ شما</Tag>
            case 'closed':
                return <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-0">بسته شده</Tag>
            default:
                return <Tag>{status}</Tag>
        }
    }

    const handleSendReply = async () => {
        if (!replyMessage.trim() || !ticketId) return
        
        const successFiles = attachedFiles.filter(f => f.status === 'success').map(f => f.id.toString())

        setIsSending(true)
        try {
            const result = await apiReplyTicket(ticketId, {
                message: replyMessage,
                attachments: successFiles.length > 0 ? successFiles : null
            })

            if (result.success) {
                toast.push(
                    <Notification title={'موفقیت'} type="success">
                        پاسخ شما با موفقیت ارسال شد
                    </Notification>
                )
                setReplyMessage('')
                setAttachedFiles([])
                mutate() 
            }
        } catch (error) {
            console.error('Error sending reply:', error)
            toast.push(
                <Notification title={'خطا'} type="danger">
                    خطا در ارسال پاسخ. لطفا مجددا تلاش کنید.
                </Notification>
            )
        } finally {
            setIsSending(false)
        }
    }

    const handleFileUpload = async (files: File[]) => {
        if (files.length === 0) return

        const currentFiles = attachedFilesRef.current
        const newFilesToUpload = files.filter(file => 
            !currentFiles.some(cf => cf.name === file.name && (cf as any).size === file.size)
        )

        if (newFilesToUpload.length === 0) return

        const newEntries = newFilesToUpload.map(file => ({
            id: `temp-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            size: file.size,
            status: 'uploading' as const,
            progress: 0
        }))

        setAttachedFiles(prev => [...prev, ...newEntries])

        newFilesToUpload.forEach(async (file, index) => {
            const tempId = newEntries[index].id
            try {
                const res = await apiUploadFile(file, (progress) => {
                    setAttachedFiles(prev => prev.map(f => 
                        f.id === tempId ? { ...f, progress } : f
                    ))
                })

                if (res && res.id) {
                    setAttachedFiles(prev => prev.map(f => 
                        f.id === tempId ? { 
                            ...f, 
                            id: res.id.toString(), 
                            status: 'success', 
                            progress: 100 
                        } : f
                    ))
                }
            } catch (error) {
                setAttachedFiles(prev => prev.map(f => 
                    f.id === tempId ? { ...f, status: 'error' } : f
                ))
            }
        })
    }

    const removeAttachment = (id: string | number) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton width={200} height={32} />
                    <div className="flex gap-2">
                        <Skeleton width={60} height={24} />
                        <Skeleton width={60} height={24} />
                    </div>
                </div>
                <Card className="p-4">
                    <Skeleton height={20} width="80%" />
                </Card>
                <Card className="p-6">
                    <div className="space-y-4">
                        <Skeleton height={80} className="mr-12" />
                        <Skeleton height={80} className="ml-12" />
                        <Skeleton height={80} className="mr-12" />
                    </div>
                </Card>
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-bold text-gray-700">تیکت یافت نشد</h3>
                <Button className="mt-4" onClick={() => navigate('/owner/support/tickets')}>
                    بازگشت به لیست
                </Button>
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
                        onClick={() => navigate('/owner/support/tickets')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {ticket.subject}
                        </h1>
                        <span className="font-mono text-sm text-gray-500">#{ticket.ticket_number}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {getPriorityTag(ticket.priority as TicketPriority)}
                    {getStatusTag(ticket.status as TicketStatus)}
                </div>
            </div>

            {/* Ticket Info */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>دسته: <Tag className="bg-blue-50 text-blue-600 border-0">{ticket.category}</Tag></span>
                    <span>ایجاد: {formatDate(ticket.created_at)}</span>
                    <span>آخرین بروزرسانی: {formatDate(ticket.updated_at)}</span>
                </div>
            </Card>

            {/* Messages */}
            <Card className="p-6 bg-gray-50 dark:bg-gray-900 border-none shadow-none">
                <div className="space-y-8">
                    {ticket.messages?.map((msg) => {
                        const isUser = msg.type === 'user'
                        return (
                            <div
                                key={msg.id}
                                className={classNames(
                                    'flex w-full gap-3',
                                    isUser ? 'justify-start flex-row' : 'justify-start flex-row-reverse'
                                )}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0 mt-auto">
                                    <div className={classNames(
                                        "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                                        isUser ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                                    )}>
                                        {isUser ? <HiUser /> : <HiOutlineSupport />}
                                    </div>
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={classNames(
                                        'max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative group transition-all',
                                        isUser
                                            ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tr-none border border-gray-100 dark:border-gray-700'
                                            : 'bg-indigo-600 text-white rounded-tl-none'
                                    )}
                                >
                                    {/* Sender Name & Time */}
                                    <div className={classNames(
                                        "flex items-center gap-2 mb-1 text-xs",
                                        isUser ? "text-gray-400 dark:text-gray-500" : "text-indigo-100"
                                    )}>
                                        <span className="font-bold">
                                            {isUser ? 'شما' : (msg.user?.name || 'پشتیبانی')}
                                        </span>
                                        <span className="opacity-75 dir-ltr text-[10px]">
                                            {new Date(msg.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {/* Message Text */}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.message}
                                    </p>

                                    {/* Attachments */}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-dashed border-opacity-20 border-gray-400">
                                            {msg.attachments.map((attachment: any, i: number) => (
                                                <AttachmentItem 
                                                    key={i} 
                                                    attachment={attachment} 
                                                    isSelf={isUser} 
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Date Tooltip (on hover) or Footer */}
                                    <div className={classNames(
                                        "absolute -bottom-5 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                                        isUser ? "right-0" : "left-0"
                                    )}>
                                        {formatDate(msg.created_at)}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </Card>

            {/* Reply Box */}
            {ticket.status !== 'closed' && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ارسال پاسخ</h2>
                    <div className="space-y-4">
                        <Input
                            textArea
                            placeholder="پاسخ خود را بنویسید..."
                            rows={4}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />

                        {/* Full-Width Creative Upload Section */}
                        <div className="relative group">
                            <Upload 
                                draggable 
                                showList={false}
                                onChange={(files) => handleFileUpload(Array.from(files))}
                                multiple
                                className="border-none p-0"
                            >
                                <motion.div 
                                    whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.03)" }}
                                    className="relative overflow-hidden py-6 px-4 text-center rounded-2xl transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 hover:border-indigo-500/20 group"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-indigo-50 dark:border-indigo-900/30">
                                            <HiOutlinePaperClip className="text-xl text-indigo-500" />
                                        </div>
                                        <div className="text-right">
                                            <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                                                ضمیمه کردن مستندات
                                            </h3>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                                کلیک کنید یا فایل را اینجا بکشید
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Upload>

                            {/* Creative Attached Files List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <AnimatePresence mode="popLayout">
                                    {attachedFiles.map((file) => (
                                        <motion.div 
                                            key={file.id}
                                            layout
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            className={classNames(
                                                "relative p-4 rounded-2xl border shadow-sm transition-all overflow-hidden",
                                                file.status === 'error' 
                                                    ? "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20" 
                                                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md"
                                            )}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="relative shrink-0">
                                                    <div className="text-3xl">
                                                        {file.status === 'error' ? <FcFile className="grayscale" /> : <FcFile />}
                                                    </div>
                                                    {file.status === 'uploading' && (
                                                        <div className="absolute -top-1 -right-1">
                                                            <span className="flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1 pt-1">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                                                            {file.name}
                                                        </p>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeAttachment(file.id)}
                                                            className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                        >
                                                            <HiOutlineTrash className="text-lg" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-[10px] mb-2">
                                                        <span className={classNames(
                                                            "font-medium",
                                                            file.status === 'uploading' ? "text-indigo-500" :
                                                            file.status === 'success' ? "text-emerald-500" : "text-red-500"
                                                        )}>
                                                            {file.status === 'uploading' ? `در حال پردازش... ${file.progress}%` : 
                                                             file.status === 'success' ? 'آماده برای ارسال' : 'خطا در بارگذاری'}
                                                        </span>
                                                    </div>

                                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ 
                                                                width: `${file.progress}%`,
                                                                backgroundColor: file.status === 'error' ? '#ef4444' : (file.status === 'success' ? '#10b981' : '#6366f1')
                                                            }}
                                                            className="h-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="solid"
                                icon={<HiOutlineReply />}
                                onClick={handleSendReply}
                                disabled={!replyMessage.trim() || isSending}
                                loading={isSending}
                            >
                                ارسال پاسخ
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default SupportTicketView
