import { useState } from 'react'
import { Card, Button, Input, Tag } from '@/components/ui'
import {
    HiOutlineArrowLeft,
    HiOutlineReply,
    HiOutlinePaperClip,
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import classNames from '@/utils/classNames'

interface TicketMessage {
    id: string
    sender: 'user' | 'support'
    message: string
    timestamp: string
    attachments?: string[]
}

const SupportTicketView = () => {
    const { ticketId } = useParams<{ ticketId: string }>()
    const navigate = useNavigate()
    const [replyMessage, setReplyMessage] = useState('')

    // Mock data
    const ticket = {
        id: ticketId || 'TKT-001',
        subject: 'مشکل در ورود به سیستم',
        category: 'فنی' as const,
        priority: 'high' as const,
        status: 'open' as 'open' | 'pending' | 'closed',
        createdAt: '1403/09/22 - 14:30',
        updatedAt: '1403/09/22 - 15:00',
        messages: [
            {
                id: '1',
                sender: 'user' as const,
                message: 'سلام، من نمی‌توانم وارد سیستم شوم. پیام خطا می‌دهد.',
                timestamp: '1403/09/22 - 14:30',
                attachments: [],
            },
            {
                id: '2',
                sender: 'support' as const,
                message: 'سلام. لطفاً مرورگر خود را کش کنید و دوباره امتحان کنید.',
                timestamp: '1403/09/22 - 15:00',
                attachments: [],
            },
        ],
    }

    const getPriorityTag = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high':
                return <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100 border-0">فوری</Tag>
            case 'medium':
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">متوسط</Tag>
            case 'low':
                return <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">کم</Tag>
        }
    }

    const getStatusTag = (status: 'open' | 'pending' | 'closed') => {
        switch (status) {
            case 'open':
                return <Tag className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100 border-0">باز</Tag>
            case 'pending':
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">در انتظار</Tag>
            case 'closed':
                return <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-0">بسته شده</Tag>
        }
    }

    const handleSendReply = () => {
        if (!replyMessage.trim()) return
        // API call here
        setReplyMessage('')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/owner/support')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {ticket.subject}
                        </h1>
                        <span className="font-mono text-sm text-gray-500">{ticket.id}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {getPriorityTag(ticket.priority)}
                    {getStatusTag(ticket.status)}
                </div>
            </div>

            {/* Ticket Info */}
            <Card className="p-4">
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>دسته: <Tag className="mr-1">{ticket.category}</Tag></span>
                    <span>ایجاد: {ticket.createdAt}</span>
                    <span>بروزرسانی: {ticket.updatedAt}</span>
                </div>
            </Card>

            {/* Messages */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">پیام‌ها</h2>
                <div className="space-y-4">
                    {ticket.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={classNames(
                                'p-4 rounded-lg',
                                msg.sender === 'user'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 mr-12'
                                    : 'bg-gray-50 dark:bg-gray-800 ml-12'
                            )}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">
                                    {msg.sender === 'user' ? 'شما' : 'پشتیبانی'}
                                </span>
                                <span className="text-xs text-gray-500">{msg.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{msg.message}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-3 flex gap-2">
                                    {msg.attachments.map((file, i) => (
                                        <div key={i} className="flex items-center gap-1 text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                            <HiOutlinePaperClip />
                                            <span>{file}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Reply Box */}
            {ticket.status !== 'closed' && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ارسال پاسخ</h2>
                    <div className="space-y-3">
                        <Input
                            textArea
                            placeholder="پاسخ خود را بنویسید..."
                            rows={4}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="solid"
                                icon={<HiOutlineReply />}
                                onClick={handleSendReply}
                                disabled={!replyMessage.trim()}
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
