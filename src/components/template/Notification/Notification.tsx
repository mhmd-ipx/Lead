import { useEffect, useState, useRef, useCallback } from 'react'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import NotificationAvatar from './NotificationAvatar'
import NotificationToggle from './NotificationToggle'
import { HiOutlineMailOpen, HiOutlineBell } from 'react-icons/hi'
import isLastChild from '@/utils/isLastChild'
import useResponsive from '@/utils/hooks/useResponsive'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiGetUnreadNotifications, apiMarkNotificationAsRead } from '@/services/NotificationService'
import type { DropdownRef } from '@/components/ui/Dropdown'

type NotificationList = {
    id: string
    target: string
    description: string
    date: string
    image: string
    type: number
    location: string
    locationLabel: string
    status: string
    readed: boolean
}

const notificationHeight = 'h-[280px]'

const _Notification = ({ className }: { className?: string }) => {
    const [notificationList, setNotificationList] = useState<NotificationList[]>([])
    const [unreadNotification, setUnreadNotification] = useState(false)
    const [noResult, setNoResult] = useState(false)
    const [loading, setLoading] = useState(false)

    const { larger } = useResponsive()
    const navigate = useNavigate()
    const location = useLocation()
    const notificationDropdownRef = useRef<DropdownRef>(null)

    const mapTypeToId = (type: string) => {
        switch (type) {
            case 'system': return 3
            case 'payment': return 4
            case 'support': return 5
            case 'assessment': return 6
            default: return 0
        }
    }

    const fetchUnreadNotifications = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiGetUnreadNotifications()
            const list = resp.data.map(n => ({
                id: n.id.toString(),
                target: n.title,
                description: n.message,
                date: new Date(n.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                image: '',
                type: mapTypeToId(n.type),
                location: n.action_url || '',
                locationLabel: 'مشاهده',
                status: '',
                readed: n.is_read
            }))

            setNotificationList(list)

            if (list.length > 0) {
                setNoResult(false)
                setUnreadNotification(true)
            } else {
                setNoResult(true)
                setUnreadNotification(false)
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error)
            setNoResult(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUnreadNotifications()
    }, [fetchUnreadNotifications, location.pathname])

    const onNotificationOpen = async () => {
        if (notificationList.length === 0) {
            await fetchUnreadNotifications()
        }
    }

    const onMarkAllAsRead = async () => {
        const list = notificationList.map((item) => ({ ...item, readed: true }))
        setNotificationList(list)
        setUnreadNotification(false)

        // Call API for all unread items
        const unreadIds = notificationList.filter(n => !n.readed).map(n => n.id)
        if (unreadIds.length > 0) {
            try {
                await Promise.all(unreadIds.map(id => apiMarkNotificationAsRead(Number(id))))
            } catch (error) {
                console.error('Error marking all as read', error)
            }
        }
    }

    const onMarkAsRead = async (id: string, loc?: string) => {
        const list = notificationList.map((item) => {
            if (item.id === id) {
                item.readed = true
            }
            return item
        })
        setNotificationList(list)
        const hasUnread = list.some((item) => !item.readed)

        if (!hasUnread) {
            setUnreadNotification(false)
        }

        // API Call
        try {
            await apiMarkNotificationAsRead(Number(id))
        } catch (error) {
            console.error('Error marking as read', error)
        }

        if (loc) {
            navigate(loc)
            if (notificationDropdownRef.current) {
                notificationDropdownRef.current.handleDropdownClose()
            }
        }
    }

    const handleViewAllActivity = () => {
        const path = location.pathname.startsWith('/admin')
            ? '/admin/notifications'
            : '/owner/notifications'
        navigate(path)
        if (notificationDropdownRef.current) {
            notificationDropdownRef.current.handleDropdownClose()
        }
    }

    const unreadCount = notificationList.filter(n => !n.readed).length

    return (
        <Dropdown
            ref={notificationDropdownRef}
            renderTitle={
                <NotificationToggle
                    dot={unreadNotification}
                    count={unreadCount}
                    className={className}
                />
            }
            menuClass="min-w-[280px] md:min-w-[340px]"
            placement={larger.md ? 'bottom-end' : 'bottom'}
            onOpen={onNotificationOpen}
        >
            <Dropdown.Item variant="header">
                <div className="dark:border-gray-700 px-2 flex items-center justify-between mb-1">
                    <h6>اعلانات</h6>
                    <Tooltip title="همه را به عنوان خوانده شده علامت بزن">
                        <Button
                            variant="plain"
                            shape="circle"
                            size="sm"
                            icon={<HiOutlineMailOpen className="text-xl" />}
                            onClick={onMarkAllAsRead}
                        />
                    </Tooltip>
                </div>
            </Dropdown.Item>
            <ScrollBar
                className={classNames('overflow-y-auto', notificationHeight)}
            >
                {notificationList.length > 0 &&
                    notificationList.map((item, index) => (
                        <div key={item.id}>
                            <div
                                className={`relative rounded-xl flex px-4 py-3 cursor-pointer hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-700`}
                                onClick={() => onMarkAsRead(item.id, item.location)}
                            >
                                <div>
                                    <NotificationAvatar {...item} />
                                </div>
                                <div className="mx-3">
                                    <div>
                                        {item.target && (
                                            <span className="font-semibold heading-text">
                                                {item.target}{' '}
                                            </span>
                                        )}
                                        <span>{item.description}</span>
                                    </div>
                                    <span className="text-xs">{item.date}</span>
                                </div>
                                <Badge
                                    className="absolute top-4 ltr:right-4 rtl:left-4 mt-1.5"
                                    innerClass={`${item.readed
                                        ? 'bg-gray-300 dark:bg-gray-600'
                                        : 'bg-primary'
                                        } `}
                                />
                            </div>
                            {!isLastChild(notificationList, index) ? (
                                <div className="border-b border-gray-200 dark:border-gray-700 my-2" />
                            ) : (
                                ''
                            )}
                        </div>
                    ))}
                {loading && (
                    <div
                        className={classNames(
                            'flex items-center justify-center',
                            notificationHeight,
                        )}
                    >
                        <Spinner size={40} />
                    </div>
                )}
                {noResult && !loading && (
                    <div
                        className={classNames(
                            'flex items-center justify-center',
                            notificationHeight,
                        )}
                    >
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4 text-gray-400">
                                <HiOutlineBell className="text-3xl" />
                            </div>
                            <h6 className="font-semibold">هیچ اعلانی نیست!</h6>
                        </div>
                    </div>
                )}
            </ScrollBar>
            <Dropdown.Item variant="header">
                <div className="pt-4">
                    <Button
                        block
                        variant="solid"
                        onClick={handleViewAllActivity}
                    >
                        مشاهده همه اعلانات
                    </Button>
                </div>
            </Dropdown.Item>
        </Dropdown>
    )
}

const Notification = withHeaderItem(_Notification)

export default Notification
