import { useMemo, useState } from 'react'
import useSWR from 'swr'
import ReactApexChart from 'react-apexcharts'
import { useNavigate } from 'react-router-dom'
import {
    Card,
    Skeleton,
    Avatar,
    Tag,
    Timeline,
    Tooltip,
    Button,
    Segment,
} from '@/components/ui'
import {
    HiOutlineTicket,
    HiOutlineOfficeBuilding,
    HiOutlineUsers,
    HiOutlineClipboardList,
    HiOutlineAcademicCap,
    HiOutlineCash,
    HiOutlineBell,
    HiOutlineInformationCircle,
    HiOutlineCreditCard,
    HiOutlineSupport,
    HiOutlineCheck,
    HiOutlineArrowLeft,
    HiOutlineEye,
    HiOutlineExclamationCircle,
    HiOutlineUserCircle,
    HiOutlineCog,
} from 'react-icons/hi'
import { useSessionUser } from '@/store/authStore'
import {
    getAdminDashboardStats,
    type AdminDashboardStats,
} from '@/services/AdminService'
import {
    apiGetNotifications,
    apiMarkNotificationAsRead,
} from '@/services/NotificationService'
import type { Notification, NotificationType } from '@/@types/notification'
import classNames from '@/utils/classNames'

// ─── Stat Card ─────────────────────────────────────────────────────────────
interface StatCardProps {
    title: string
    value: number | string
    subLabel?: string
    subValue?: number
    icon: React.ReactNode
    iconBg: string
    iconColor: string
    alertBadge?: boolean
    onView?: () => void
    loading?: boolean
    id?: string
}

const StatCard = ({
    title,
    value,
    subLabel,
    subValue,
    icon,
    iconBg,
    iconColor,
    alertBadge,
    onView,
    loading,
    id,
}: StatCardProps) => {
    if (loading) {
        return (
            <div
                id={id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4"
            >
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton width={100} height={14} />
                        <Skeleton width={60} height={32} />
                    </div>
                    <Skeleton variant="circle" width={48} height={48} />
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton width={90} height={22} />
                    <Skeleton width={70} height={28} />
                </div>
            </div>
        )
    }

    return (
        <div
            id={id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {value}
                    </h3>
                </div>
                <div
                    className={classNames(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0',
                        iconBg,
                        iconColor,
                    )}
                >
                    {icon}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                {subLabel !== undefined && subValue !== undefined ? (
                    <Tag
                        className={classNames(
                            'text-xs border-0',
                            alertBadge && subValue > 0
                                ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                : subValue === 0
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
                        )}
                    >
                        {alertBadge && subValue > 0 && (
                            <HiOutlineExclamationCircle className="inline ml-1" />
                        )}
                        {subLabel}: {subValue}
                    </Tag>
                ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                )}

                {onView && (
                    <Button
                        size="sm"
                        variant="default"
                        icon={<HiOutlineEye />}
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border-0"
                        onClick={onView}
                    >
                        مشاهده
                    </Button>
                )}
            </div>
        </div>
    )
}

// ─── Notification icon ──────────────────────────────────────────────────────
const getNotifIcon = (type: NotificationType) => {
    const cls = 'text-xl'
    switch (type) {
        case 'system':
            return (
                <Avatar
                    size="sm"
                    className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-100"
                    icon={<HiOutlineInformationCircle className={cls} />}
                />
            )
        case 'payment':
            return (
                <Avatar
                    size="sm"
                    className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-100"
                    icon={<HiOutlineCreditCard className={cls} />}
                />
            )
        case 'support':
            return (
                <Avatar
                    size="sm"
                    className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-100"
                    icon={<HiOutlineSupport className={cls} />}
                />
            )
        case 'assessment':
            return (
                <Avatar
                    size="sm"
                    className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-100"
                    icon={<HiOutlineClipboardList className={cls} />}
                />
            )
        default:
            return (
                <Avatar
                    size="sm"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    icon={<HiOutlineBell className={cls} />}
                />
            )
    }
}

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fa-IR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

// ─── Dashboard ──────────────────────────────────────────────────────────────
type NotifFilter = 'all' | 'unread' | 'read'

const Dashboard = () => {
    const navigate = useNavigate()
    const user = useSessionUser((s) => s.user)
    const [notifFilter, setNotifFilter] = useState<NotifFilter>('all')

    // Stats
    const { data: stats, isLoading: statsLoading } =
        useSWR<AdminDashboardStats>(
            '/admin/dashboard/stats',
            getAdminDashboardStats,
            { revalidateOnFocus: false },
        )

    // All notifications
    const {
        data: notifResponse,
        isLoading: notifLoading,
        mutate: notifMutate,
    } = useSWR('/admin/notifications', () => apiGetNotifications(), {
        revalidateOnFocus: false,
    })

    const allNotifications = useMemo(
        () => notifResponse?.data || [],
        [notifResponse],
    )

    const filteredNotifications = useMemo(() => {
        let list = allNotifications
        if (notifFilter === 'unread') list = list.filter((n) => !n.is_read)
        if (notifFilter === 'read') list = list.filter((n) => n.is_read)
        return list.slice(0, 3)
    }, [allNotifications, notifFilter])

    const unreadCount = useMemo(
        () => allNotifications.filter((n) => !n.is_read).length,
        [allNotifications],
    )

    const handleRead = async (n: Notification, nav = true) => {
        if (!n.is_read) {
            notifMutate(
                (cur: any) => ({
                    ...cur,
                    data: cur.data.map((x: Notification) =>
                        x.id === n.id ? { ...x, is_read: true } : x,
                    ),
                }),
                false,
            )
            await apiMarkNotificationAsRead(n.id).catch(() => notifMutate())
        }
        if (nav && n.action_url) navigate(n.action_url)
    }

    // ── Ticket Donut ─────────────────────────────────────────────────────────
    const ticketDonut = {
        series: stats
            ? [stats.tickets.active, Math.max(0, stats.tickets.total - stats.tickets.active)]
            : [0, 1],
        options: {
            chart: {
                type: 'donut' as const,
                fontFamily: 'inherit',
                background: 'transparent',
                toolbar: { show: false },
            },
            labels: ['فعال', 'بسته'],
            colors: ['#f59e0b', '#e0e7ff'],
            dataLabels: { enabled: false },
            legend: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '74%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'کل',
                                color: '#6b7280',
                                fontSize: '13px',
                                fontWeight: '600',
                                formatter: () => String(stats?.tickets.total ?? 0),
                            },
                        },
                    },
                },
            },
            stroke: { width: 0 },
            tooltip: { theme: 'dark' },
        },
    }

    // ── Overview Bar ─────────────────────────────────────────────────────────
    const overviewBar = {
        series: [
            {
                name: 'تعداد',
                data: [
                    stats?.companies.total ?? 0,
                    stats?.users.total ?? 0,
                    stats?.exams.total ?? 0,
                    stats?.tickets.total ?? 0,
                    stats?.bills.unpaid ?? 0,
                ],
            },
        ],
        options: {
            chart: {
                type: 'bar' as const,
                toolbar: { show: false },
                fontFamily: 'inherit',
                background: 'transparent',
            },
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    distributed: true,
                    columnWidth: '52%',
                },
            },
            colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'],
            dataLabels: {
                enabled: true,
                style: { fontSize: '12px', fontWeight: '700', colors: ['#fff'] },
            },
            grid: {
                show: true,
                borderColor: '#f3f4f6',
                strokeDashArray: 4,
            },
            xaxis: {
                categories: ['شرکت‌ها', 'کاربران', 'آزمون‌ها', 'تیکت‌ها', 'صورت‌حساب'],
                labels: { style: { colors: '#9ca3af', fontSize: '11px' } },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: { show: false },
            legend: { show: false },
            tooltip: { theme: 'dark' },
        },
    }

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'صبح بخیر'
        if (h < 17) return 'عصر بخیر'
        return 'شب بخیر'
    }

    return (
        <div className="space-y-6">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div
                id="admin-dashboard-welcome"
                className="bg-gradient-to-l from-blue-600 to-indigo-700 rounded-xl p-5 shadow-sm"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl flex-shrink-0">
                            <HiOutlineUserCircle />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                {greeting()}، {user.userName || 'ادمین'} 👋
                            </h1>
                            <p className="text-sm text-blue-100 mt-0.5">
                                {user.phone && (
                                    <span className="font-mono ml-2">{user.phone}</span>
                                )}
                                خوش آمدید به داشبورد مدیریت
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        {!statsLoading && unreadCount > 0 && (
                            <Tag className="bg-white/20 text-white border-0">
                                <HiOutlineBell className="inline ml-1" />
                                {unreadCount} اعلان
                            </Tag>
                        )}
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiOutlineCog />}
                            className="bg-white/20 hover:!bg-white/40 text-white border-0 transition-colors"
                            onClick={() => navigate('/admin/settings')}
                        >
                            تنظیمات حساب
                        </Button>
                    </div>

                </div>
            </div>

            {/* ── Stat Cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    loading={statsLoading}
                    title="تیکت‌های پشتیبانی"
                    value={stats?.tickets.total ?? 0}
                    subLabel="فعال"
                    subValue={stats?.tickets.active ?? 0}
                    alertBadge
                    icon={<HiOutlineTicket />}
                    iconBg="bg-amber-100 dark:bg-amber-500/20"
                    iconColor="text-amber-600 dark:text-amber-400"
                    onView={() => navigate('/admin/support')}
                    id="admin-dashboard-stats-tickets"
                />
                <StatCard
                    loading={statsLoading}
                    title="شرکت‌های ثبت شده"
                    value={stats?.companies.total ?? 0}
                    icon={<HiOutlineOfficeBuilding />}
                    iconBg="bg-indigo-100 dark:bg-indigo-500/20"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                    onView={() => navigate('/admin/companies')}
                    id="admin-dashboard-stats-companies"
                />
                <StatCard
                    loading={statsLoading}
                    title="کاربران سیستم"
                    value={stats?.users.total ?? 0}
                    icon={<HiOutlineUsers />}
                    iconBg="bg-violet-100 dark:bg-violet-500/20"
                    iconColor="text-violet-600 dark:text-violet-400"
                    id="admin-dashboard-stats-users"
                />
                <StatCard
                    loading={statsLoading}
                    title="نیازسنجی‌ها"
                    value={stats?.assessments.unfilled ?? 0}
                    subLabel="تکمیل نشده"
                    subValue={stats?.assessments.unfilled ?? 0}
                    alertBadge
                    icon={<HiOutlineClipboardList />}
                    iconBg="bg-orange-100 dark:bg-orange-500/20"
                    iconColor="text-orange-600 dark:text-orange-400"
                    onView={() => navigate('/admin/assessments')}
                    id="admin-dashboard-stats-assessments"
                />
                <StatCard
                    loading={statsLoading}
                    title="آزمون‌ها"
                    value={stats?.exams.total ?? 0}
                    icon={<HiOutlineAcademicCap />}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-600 dark:text-teal-400"
                    onView={() => navigate('/admin/exams')}
                    id="admin-dashboard-stats-exams"
                />
                <StatCard
                    loading={statsLoading}
                    title="صورتحساب‌های پرداخت نشده"
                    value={stats?.bills.unpaid ?? 0}
                    subLabel="نیاز به بررسی"
                    subValue={stats?.bills.unpaid ?? 0}
                    alertBadge
                    icon={<HiOutlineCash />}
                    iconBg="bg-red-100 dark:bg-red-500/20"
                    iconColor="text-red-600 dark:text-red-400"
                    onView={() => navigate('/admin/accounting/bills')}
                    id="admin-dashboard-stats-bills"
                />
            </div>

            {/* ── Charts Row ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut */}
                <Card id="admin-dashboard-chart-donut">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    وضعیت تیکت‌ها
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">فعال در مقابل بسته</p>
                            </div>
                            <Button
                                size="sm"
                                variant="default"
                                icon={<HiOutlineEye />}
                                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border-0"
                                onClick={() => navigate('/admin/support')}
                            >
                                مشاهده
                            </Button>
                        </div>

                        {statsLoading ? (
                            <div className="flex flex-col items-center gap-3 py-6">
                                <Skeleton variant="circle" width={140} height={140} />
                                <Skeleton width={120} height={14} />
                            </div>
                        ) : (
                            <>
                                <ReactApexChart
                                    type="donut"
                                    series={ticketDonut.series}
                                    options={ticketDonut.options}
                                    height={195}
                                />
                                <div className="flex justify-center gap-6 mt-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                                        فعال ({stats?.tickets.active ?? 0})
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="w-3 h-3 rounded-full bg-indigo-100 inline-block border border-indigo-200" />
                                        بسته ({Math.max(0, (stats?.tickets.total ?? 0) - (stats?.tickets.active ?? 0))})
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                {/* Bar */}
                <Card id="admin-dashboard-chart-bar" className="lg:col-span-2">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    نمای کلی سیستم
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">مقایسه اجزای اصلی</p>
                            </div>
                        </div>

                        {statsLoading ? (
                            <div className="flex items-end gap-4 pt-4 px-4 h-48">
                                {[80, 120, 60, 100, 70].map((h, i) => (
                                    <Skeleton key={i} width={40} height={h} />
                                ))}
                            </div>
                        ) : (
                            <ReactApexChart
                                type="bar"
                                series={overviewBar.series}
                                options={overviewBar.options}
                                height={215}
                            />
                        )}
                    </div>
                </Card>
            </div>

            {/* ── Notifications ────────────────────────────────────────────── */}
            <Card id="admin-dashboard-notifications">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <HiOutlineBell />
                                آخرین اعلانات
                            </h2>
                            {!notifLoading && unreadCount > 0 && (
                                <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-0 text-xs">
                                    {unreadCount} جدید
                                </Tag>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Segment
                                value={notifFilter}
                                onChange={(val) =>
                                    setNotifFilter(
                                        (Array.isArray(val) ? val[0] : val) as NotifFilter,
                                    )
                                }
                                size="sm"
                            >
                                <Segment.Item value="all">همه</Segment.Item>
                                <Segment.Item value="unread">خوانده نشده</Segment.Item>
                                <Segment.Item value="read">خوانده شده</Segment.Item>
                            </Segment>
                            <Button
                                size="sm"
                                variant="default"
                                icon={<HiOutlineEye />}
                                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border-0"
                                onClick={() => navigate('/admin/notifications')}
                            >
                                مشاهده
                            </Button>
                        </div>
                    </div>

                    {notifLoading ? (
                        <div className="space-y-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <Skeleton variant="circle" width={36} height={36} />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton width={200} height={16} />
                                        <Skeleton width="85%" height={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <Timeline>
                            {filteredNotifications.map((n) => (
                                <Timeline.Item key={n.id} media={getNotifIcon(n.type)}>
                                    <div
                                        className={classNames(
                                            '-mt-1 p-3 rounded-xl border transition-colors',
                                            !n.is_read
                                                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/40'
                                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h6
                                                className={classNames(
                                                    'text-sm font-semibold flex items-center gap-2',
                                                    !n.is_read
                                                        ? 'text-blue-700 dark:text-blue-300'
                                                        : 'text-gray-800 dark:text-white',
                                                )}
                                            >
                                                {n.title}
                                                {!n.is_read && (
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                                    </span>
                                                )}
                                            </h6>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(n.created_at)}
                                                </span>
                                                {!n.is_read && (
                                                    <Tooltip title="علامت‌گذاری به عنوان خوانده شده">
                                                        <Button
                                                            size="xs"
                                                            variant="plain"
                                                            icon={<HiOutlineCheck />}
                                                            className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 h-6 w-6 p-0 rounded-full"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRead(n, false)
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                                            {n.message}
                                        </p>
                                        {n.action_url && (
                                            <Button
                                                size="xs"
                                                variant="plain"
                                                className="mt-2 text-primary gap-1 p-0 h-auto"
                                                onClick={() => handleRead(n, true)}
                                            >
                                                مشاهده جزئیات
                                                <HiOutlineArrowLeft className="text-xs" />
                                            </Button>
                                        )}
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    ) : (
                        <div className="text-center py-10">
                            <HiOutlineBell className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {notifFilter === 'unread'
                                    ? 'اعلان خوانده نشده‌ای ندارید'
                                    : notifFilter === 'read'
                                        ? 'اعلان خوانده شده‌ای ندارید'
                                        : 'اعلانی وجود ندارد'}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default Dashboard
