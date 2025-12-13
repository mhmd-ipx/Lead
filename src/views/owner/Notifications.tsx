import { useState } from 'react'
import { Card, Button, Timeline, Avatar, Badge, Tag } from '@/components/ui'
import {
    HiOutlineBell,
    HiOutlineDocumentText,
    HiOutlineUserAdd,
    HiOutlineClipboardCheck,
    HiOutlineAcademicCap,
    HiOutlineCurrencyDollar,
    HiOutlineCheckCircle,
    HiOutlineExclamation,
    HiOutlineArrowRight,
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import classNames from '@/utils/classNames'

interface Notification {
    id: string
    title: string
    message: string
    type: 'assessment' | 'exam' | 'payment' | 'applicant' | 'system'
    link?: string
    date: string
    isRead: boolean
}

type FilterType = 'all' | 'unread' | 'read'

const Notifications = () => {
    const navigate = useNavigate()
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'نیازسنجی جدید تکمیل شد',
            message: 'علی محمدی نیازسنجی مهارت‌های مدیریتی را تکمیل کرد',
            type: 'assessment',
            link: '/owner/managers/mgr-001/assessment/assess-001/view',
            date: '1403/09/22 - 14:30',
            isRead: false,
        },
        {
            id: '2',
            title: 'آزمون تکمیل شد',
            message: 'مریم احمدی مجموعه آزمون مدیریت منابع انسانی را با موفقیت به پایان رساند',
            type: 'exam',
            link: '/owner/managers/mgr-002/exams/examset-004/results',
            date: '1403/09/21 - 16:45',
            isRead: false,
        },
        {
            id: '3',
            title: 'پرداخت جدید ثبت شد',
            message: 'پرداخت شماره #1234 به مبلغ 5,000,000 تومان ثبت گردید',
            type: 'payment',
            link: '/owner/accounting/bills/1234',
            date: '1403/09/21 - 10:20',
            isRead: true,
        },
        {
            id: '4',
            title: 'متقاضی جدید اضافه شد',
            message: 'حسن رضایی به عنوان متقاضی جدید به سیستم اضافه شد',
            type: 'applicant',
            link: '/owner/managers/mgr-003',
            date: '1403/09/20 - 09:15',
            isRead: true,
        },
        {
            id: '5',
            title: 'به‌روزرسانی سیستم',
            message: 'نسخه جدید سیستم با بهبودهای امنیتی منتشر شد',
            type: 'system',
            date: '1403/09/19 - 08:00',
            isRead: true,
        },
        {
            id: '6',
            title: 'آزمون در انتظار بررسی',
            message: 'حسن رضایی آزمون فروش و بازاریابی را تکمیل کرد و در انتظار بررسی نتایج است',
            type: 'exam',
            link: '/owner/managers/mgr-003/exams/examset-005/results',
            date: '1403/09/18 - 15:30',
            isRead: false,
        },
    ])

    const getNotificationIcon = (type: Notification['type']) => {
        const iconClass = 'text-xl'
        switch (type) {
            case 'assessment':
                return <HiOutlineClipboardCheck className={iconClass} />
            case 'exam':
                return <HiOutlineAcademicCap className={iconClass} />
            case 'payment':
                return <HiOutlineCurrencyDollar className={iconClass} />
            case 'applicant':
                return <HiOutlineUserAdd className={iconClass} />
            case 'system':
                return <HiOutlineBell className={iconClass} />
            default:
                return <HiOutlineBell className={iconClass} />
        }
    }

    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'assessment':
                return 'bg-blue-500'
            case 'exam':
                return 'bg-purple-500'
            case 'payment':
                return 'bg-green-500'
            case 'applicant':
                return 'bg-amber-500'
            case 'system':
                return 'bg-gray-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getNotificationTypeName = (type: Notification['type']) => {
        switch (type) {
            case 'assessment':
                return 'نیازسنجی'
            case 'exam':
                return 'آزمون'
            case 'payment':
                return 'پرداخت'
            case 'applicant':
                return 'متقاضی'
            case 'system':
                return 'سیستم'
            default:
                return 'عمومی'
        }
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, isRead: true }))
        )
    }

    const filteredNotifications = notifications.filter(notif => {
        switch (selectedFilter) {
            case 'unread':
                return !notif.isRead
            case 'read':
                return notif.isRead
            default:
                return true
        }
    })

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <HiOutlineBell className="text-3xl" />
                        اعلان‌ها
                        {unreadCount > 0 && (
                            <Badge className="bg-red-500">
                                {unreadCount} خوانده نشده
                            </Badge>
                        )}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مشاهده و مدیریت اعلان‌های سیستم
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="default"
                        size="sm"
                        icon={<HiOutlineCheckCircle />}
                        onClick={markAllAsRead}
                    >
                        علامت‌گذاری همه به عنوان خوانده شده
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        فیلتر:
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={selectedFilter === 'all' ? 'solid' : 'plain'}
                            onClick={() => setSelectedFilter('all')}
                        >
                            همه ({notifications.length})
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedFilter === 'unread' ? 'solid' : 'plain'}
                            onClick={() => setSelectedFilter('unread')}
                        >
                            خوانده نشده ({unreadCount})
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedFilter === 'read' ? 'solid' : 'plain'}
                            onClick={() => setSelectedFilter('read')}
                        >
                            خوانده شده ({notifications.length - unreadCount})
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Notifications Timeline */}
            <Card className="p-6">
                {filteredNotifications.length > 0 ? (
                    <Timeline>
                        {filteredNotifications.map((notification) => (
                            <Timeline.Item
                                key={notification.id}
                                media={
                                    <div className="relative">
                                        <Avatar
                                            size={40}
                                            shape="circle"
                                            className={classNames(
                                                'text-white',
                                                getNotificationColor(notification.type)
                                            )}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </Avatar>
                                        {!notification.isRead && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                        )}
                                    </div>
                                }
                            >
                                <div
                                    className={classNames(
                                        'p-4 rounded-lg border transition-colors',
                                        notification.isRead
                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {notification.title}
                                                </h3>
                                                <Tag className="text-xs" prefix prefixClass={getNotificationColor(notification.type)}>
                                                    {getNotificationTypeName(notification.type)}
                                                </Tag>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {notification.date}
                                                </span>
                                                {notification.link && (
                                                    <Button
                                                        size="xs"
                                                        variant="solid"
                                                        icon={<HiOutlineArrowRight />}
                                                        onClick={() => {
                                                            markAsRead(notification.id)
                                                            navigate(notification.link!)
                                                        }}
                                                    >
                                                        مشاهده جزئیات
                                                    </Button>
                                                )}
                                                {!notification.isRead && (
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        icon={<HiOutlineCheckCircle />}
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        علامت به عنوان خوانده شده
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                ) : (
                    <div className="text-center py-12">
                        <HiOutlineBell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {selectedFilter === 'unread'
                                ? 'اعلان خوانده نشده‌ای وجود ندارد'
                                : selectedFilter === 'read'
                                    ? 'اعلان خوانده شده‌ای وجود ندارد'
                                    : 'هیچ اعلانی وجود ندارد'}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default Notifications
