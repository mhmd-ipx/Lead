import { useState, useRef, useEffect } from 'react'
import { Card, Button, Input, Tag, Skeleton, Notification, toast, Upload, Select } from '@/components/ui'
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
import { apiGetTicketDetail, apiReplyTicket, apiUpdateTicket } from '@/services/SupportService'
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
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
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
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isUpdatingPriority, setIsUpdatingPriority] = useState(false)
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

    const statusOptions = [
        { label: 'باز', value: 'open' },
        { label: 'در حال بررسی', value: 'in_progress' },
        { label: 'در انتظار پاسخ کاربر', value: 'waiting_for_user' },
        { label: 'بسته شده', value: 'closed' },
    ]

    const priorityOptions = [
        { label: 'فوری', value: 'high' },
        { label: 'متوسط', value: 'medium' },
        { label: 'کم', value: 'low' },
    ]

    const handleUpdateStatus = async (newStatus: string) => {
        if (!ticketId || !newStatus) return
        setIsUpdatingStatus(true)
        try {
            const result = await apiUpdateTicket(ticketId, { status: newStatus as TicketStatus })
            if (result.success) {
                toast.push(
                    <Notification title={'موفقیت'} type="success">
                        وضعیت تیکت با موفقیت تغییر کرد
                    </Notification>
                )
                mutate()
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.push(
                <Notification title={'خطا'} type="danger">
                    خطا در تغییر وضعیت تیکت
                </Notification>
            )
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleUpdatePriority = async (newPriority: string) => {
        if (!ticketId || !newPriority) return
        setIsUpdatingPriority(true)
        try {
            const result = await apiUpdateTicket(ticketId, { priority: newPriority as TicketPriority })
            if (result.success) {
                toast.push(
                    <Notification title={'موفقیت'} type="success">
                        اولویت تیکت با موفقیت تغییر کرد
                    </Notification>
                )
                mutate()
            }
        } catch (error) {
            console.error('Error updating priority:', error)
            toast.push(
                <Notification title={'خطا'} type="danger">
                    خطا در تغییر اولویت تیکت
                </Notification>
            )
        } finally {
            setIsUpdatingPriority(false)
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

        // Use the ref to get the most current state for filtering
        const currentFiles = attachedFilesRef.current
        const newFilesToUpload = files.filter(file => 
            !currentFiles.some(cf => cf.name === file.name && (cf as any).size === file.size)
        )

        if (newFilesToUpload.length === 0) return

        // Create temporary entries with unique IDs
        const newEntries = newFilesToUpload.map(file => ({
            id: `temp-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            size: file.size,
            status: 'uploading' as const,
            progress: 0
        }))

        setAttachedFiles(prev => [...prev, ...newEntries])

        // Process each upload independently
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
                        <Skeleton width={120} height={32} />
                        <Skeleton width={120} height={32} />
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
                <Button className="mt-4" onClick={() => navigate('/admin/support/tickets')}>
                    بازگشت به لیست
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div id="admin-support-ticket-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/admin/support/tickets')}
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
                <div id="admin-support-ticket-controls" className="flex flex-wrap gap-2 items-center">
                    <div className="w-40">
                        <Select
                            size="sm"
                            options={priorityOptions}
                            value={priorityOptions.find(opt => opt.value === ticket.priority)}
                            onChange={(opt) => handleUpdatePriority(opt?.value as string)}
                            isLoading={isUpdatingPriority}
                            isDisabled={isUpdatingPriority || isUpdatingStatus}
                            placeholder="اولویت"
                        />
                    </div>
                    <div className="w-48">
                        <Select
                            size="sm"
                            options={statusOptions}
                            value={statusOptions.find(opt => opt.value === ticket.status)}
                            onChange={(opt) => handleUpdateStatus(opt?.value as string)}
                            isLoading={isUpdatingStatus}
                            isDisabled={isUpdatingStatus || isUpdatingPriority}
                            placeholder="وضعیت"
                        />
                    </div>
                </div>
            </div>

            {/* Ticket Info */}
            <Card id="admin-support-ticket-info" className="p-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 items-center">
                    <span>کاربر: <span className="font-semibold text-gray-900 dark:text-gray-200">{ticket.user?.name || 'ناشناس'}</span></span>
                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
                    <span>دسته: <Tag className="bg-blue-50 text-blue-600 border-0">{ticket.category}</Tag></span>
                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
                    <span>ایجاد: {formatDate(ticket.created_at)}</span>
                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
                    <span>آخرین بروزرسانی: {formatDate(ticket.updated_at)}</span>
                </div>
            </Card>

            {/* Messages */}
            <Card id="admin-support-ticket-messages" className="p-6 bg-gray-50 dark:bg-gray-900 border-none shadow-none">
                <div className="space-y-8">
                    {ticket.messages?.map((msg) => {
                        const isSelf = msg.type === 'admin' // ادمین (من)
                        return (
                            <div
                                key={msg.id}
                                className={classNames(
                                    'flex w-full gap-3',
                                    isSelf ? 'justify-start flex-row' : 'justify-start flex-row-reverse'
                                )}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0 mt-auto">
                                    <div className={classNames(
                                        "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                                        isSelf ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                                    )}>
                                        {isSelf ? <HiOutlineSupport /> : <HiUser />}
                                    </div>
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={classNames(
                                        'max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative group transition-all',
                                        isSelf
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                    )}
                                >
                                    {/* Sender Name & Time */}
                                    <div className={classNames(
                                        "flex items-center gap-2 mb-1 text-xs",
                                        isSelf ? "text-indigo-100" : "text-gray-400 dark:text-gray-500"
                                    )}>
                                        <span className="font-bold">
                                            {isSelf ? 'شما (پشتیبانی)' : (msg.user?.name || 'کاربر')}
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
                                                    isSelf={isSelf} 
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Date Tooltip (on hover) or Footer */}
                                    <div className={classNames(
                                        "absolute -bottom-5 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                                        isSelf ? "right-0" : "left-0"
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
                <Card id="admin-support-ticket-reply" className="p-6">
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

                                                    {/* Custom Progress Bar */}
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
