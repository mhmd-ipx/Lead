import { useState, useRef, useEffect } from 'react'
import { Card, Button, Input, Tag, Skeleton, Notification, toast, Upload, Select } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineReply,
    HiOutlinePaperClip,
    HiUser,
    HiOutlineSupport,
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import classNames from '@/utils/classNames'
import useSWR from 'swr'
import { apiGetTicketDetail, apiReplyTicket, apiUpdateTicket } from '@/services/SupportService'
import { TicketPriority, TicketStatus } from '@/@types/support'
import { FcImageFile } from 'react-icons/fc'

const SupportTicketView = () => {
    const { ticketId } = useParams<{ ticketId: string }>()
    const navigate = useNavigate()
    const [replyMessage, setReplyMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isUpdatingPriority, setIsUpdatingPriority] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

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

        setIsSending(true)
        try {
            const result = await apiReplyTicket(ticketId, {
                message: replyMessage,
                attachments: [] // فعلا خالی
            })

            if (result.success) {
                toast.push(
                    <Notification title={'موفقیت'} type="success">
                        پاسخ شما با موفقیت ارسال شد
                    </Notification>
                )
                setReplyMessage('')
                mutate() // رفرش کردن اطلاعات تیکت برای دریافت پیام جدید
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <div className="flex flex-wrap gap-2 items-center">
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
            <Card className="p-4">
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
            <Card className="p-6 bg-gray-50 dark:bg-gray-900 border-none shadow-none">
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
                                            {msg.attachments.map((file: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className={classNames(
                                                        "flex items-center gap-1 text-xs px-2 py-1.5 rounded cursor-pointer transition-colors max-w-full overflow-hidden",
                                                        isSelf
                                                            ? "bg-white/20 hover:bg-white/30 text-white"
                                                            : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                                                    )}
                                                >
                                                    <HiOutlinePaperClip className="flex-shrink-0" />
                                                    <span className="truncate">{typeof file === 'string' ? file : 'فایل ضمیمه'}</span>
                                                </div>
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

                        {/* Disabled Upload Section */}
                        <div className="opacity-50 pointer-events-none">
                            <Upload draggable>
                                <div className="py-4 text-center border-2 border-dashed border-gray-300 rounded-lg">
                                    <div className="text-3xl mb-2 flex justify-center text-gray-400">
                                        <FcImageFile className="grayscale" />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        بارگذاری فایل فعلاً غیرفعال است
                                    </p>
                                </div>
                            </Upload>
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
