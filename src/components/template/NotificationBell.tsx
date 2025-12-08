import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import Badge from '@/components/ui/Badge'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { PiBellDuotone } from 'react-icons/pi'
import { Link } from 'react-router-dom'

// Mock notifications data
const mockNotifications = [
    {
        id: 1,
        title: 'آزمون جدید',
        message: 'آزمون نیازسنجی جدید اضافه شده است',
        time: '5 دقیقه پیش',
        unread: true,
    },
    {
        id: 2,
        title: 'پرداخت موفق',
        message: 'پرداخت شما با موفقیت انجام شد',
        time: '1 ساعت پیش',
        unread: true,
    },
    {
        id: 3,
        title: 'یادآوری',
        message: 'مهلت ارسال گزارش تا پایان امروز',
        time: '2 ساعت پیش',
        unread: false,
    },
]

const _NotificationBell = () => {
    const [notifications, setNotifications] = useState(mockNotifications)
    const unreadCount = notifications.filter(n => n.unread).length

    const handleMarkAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, unread: false } : n)
        )
    }

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="relative cursor-pointer flex items-center">
                    <Button
                        variant="plain"
                        shape="circle"
                        size="sm"
                        icon={<PiBellDuotone />}
                        className="text-xl"
                    />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1"
                            content={unreadCount}
                            maxCount={99}
                        />
                    )}
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center justify-between">
                    <span className="font-semibold">اعلان‌ها</span>
                    {unreadCount > 0 && (
                        <Button
                            size="xs"
                            variant="plain"
                            onClick={handleMarkAllAsRead}
                        >
                            خوانده شده
                        </Button>
                    )}
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />

            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="py-4 px-3 text-center text-gray-500">
                        اعلانی وجود ندارد
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <Dropdown.Item
                            key={notification.id}
                            className="px-0 py-2"
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            <div className="flex items-start px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm truncate">
                                            {notification.title}
                                        </span>
                                        {notification.unread && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                        {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {notification.time}
                                    </span>
                                </div>
                            </div>
                        </Dropdown.Item>
                    ))
                )}
            </div>

            <Dropdown.Item variant="divider" />
            <Dropdown.Item className="px-0">
                <Link
                    to="/notifications"
                    className="flex h-full w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    مشاهده همه اعلان‌ها
                </Link>
            </Dropdown.Item>
        </Dropdown>
    )
}

const NotificationBell = withHeaderItem(_NotificationBell)

export default NotificationBell