import { useMemo } from 'react'
import { Card, Button, Avatar, Skeleton, Tag, Timeline, Badge, Tooltip, toast } from '@/components/ui'
import {
    HiOutlineCheckCircle,
    HiOutlineInformationCircle,
    HiOutlineCreditCard,
    HiOutlineSupport,
    HiOutlineClipboardList,
    HiOutlineBell,
    HiCheck,
    HiOutlineX,
    HiOutlineEye,
    HiOutlineCheck, // برای دکمه خوانده شده
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import classNames from '@/utils/classNames'
import { apiGetNotifications, apiMarkNotificationAsRead } from '@/services/NotificationService'
import type { Notification, NotificationType } from '@/@types/notification'

const Notifications = () => {
    const navigate = useNavigate()

    const { data: response, isLoading, mutate } = useSWR(
        '/notifications',
        () => apiGetNotifications(),
        {
            revalidateOnFocus: false,
        }
    )

    const notifications = useMemo(() => response?.data || [], [response])

    const getIcon = (type: NotificationType) => {
        const commonClass = "text-xl"
        switch (type) {
            case 'system':
                return <Avatar size="sm" className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-100" icon={<HiOutlineInformationCircle className={commonClass} />} />
            case 'payment':
                return <Avatar size="sm" className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-100" icon={<HiOutlineCreditCard className={commonClass} />} />
            case 'support':
                return <Avatar size="sm" className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-100" icon={<HiOutlineSupport className={commonClass} />} />
            case 'assessment':
                return <Avatar size="sm" className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-100" icon={<HiOutlineClipboardList className={commonClass} />} />
            default:
                return <Avatar size="sm" className="bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-100" icon={<HiOutlineBell className={commonClass} />} />
        }
    }

    const handleRead = async (notification: Notification, navigateToAction = true) => {
        if (!notification.is_read) {
            try {
                // Optimistic UI update
                mutate(
                    (currentData: any) => ({
                        ...currentData,
                        data: currentData.data.map((n: Notification) =>
                            n.id === notification.id ? { ...n, is_read: true } : n
                        ),
                    }),
                    false
                )

                await apiMarkNotificationAsRead(notification.id)
            } catch (error) {
                console.error('Error marking as read:', error)
                mutate() // Revert on error
            }
        }

        if (navigateToAction && notification.action_url) {
            navigate(notification.action_url)
        }
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

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <HiOutlineBell className="text-3xl" />
                        اعلان‌ها
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        تاریخچه فعالیت‌ها و پیام‌های شما
                    </p>
                </div>
            </div>

            <Card>
                <div className="p-6">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton variant="circle" width={40} height={40} />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton width={200} height={20} />
                                        <Skeleton width="100%" height={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length > 0 ? (
                        <Timeline>
                            {notifications.map((notification) => (
                                <Timeline.Item
                                    key={notification.id}
                                    media={getIcon(notification.type)}
                                    className="pb-0"
                                >
                                    <div
                                        className={classNames(
                                            "relative -mt-1 p-4 rounded-xl transition-all border",
                                            !notification.is_read
                                                ? "bg-blue-50/60 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800"
                                                : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        )}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <h6 className={classNames(
                                                "text-base font-bold flex items-center gap-2",
                                                !notification.is_read ? "text-blue-800 dark:text-blue-100" : "text-gray-900 dark:text-white"
                                            )}>
                                                {notification.title}
                                                {!notification.is_read && (
                                                    <span className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                    </span>
                                                )}
                                            </h6>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {formatDate(notification.created_at)}
                                                </span>

                                                {/* Mark as Read Button */}
                                                {!notification.is_read && (
                                                    <Tooltip title="علامت‌گذاری به عنوان خوانده شده">
                                                        <Button
                                                            size="xs"
                                                            variant="plain"
                                                            className="text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full p-1 h-auto"
                                                            icon={<HiOutlineCheck className="text-lg" />}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRead(notification, false)
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                                            {notification.message}
                                        </p>

                                        {notification.action_url && (
                                            <div className="text-left">
                                                <Button
                                                    size="sm"
                                                    variant="solid"
                                                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRead(notification, true)
                                                    }}
                                                >
                                                    مشاهده جزئیات
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4 text-gray-400">
                                <HiOutlineBell className="text-3xl" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                لیست اعلان‌های شما خالی است.
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default Notifications
