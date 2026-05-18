import { useMemo } from 'react'
import useSWR from 'swr'
import { useNavigate } from 'react-router-dom'
import {
    Skeleton,
    Tag,
    Button,
} from '@/components/ui'
import {
    HiOutlineUsers,
    HiOutlineClipboardList,
    HiOutlineAcademicCap,
    HiOutlineCash,
    HiOutlineBell,
    HiOutlineEye,
    HiOutlineExclamationCircle,
    HiOutlineUserCircle,
    HiOutlineCog,
    HiOutlineUserAdd
} from 'react-icons/hi'
import { useSessionUser } from '@/store/authStore'
import { getMyManagers, getAssessments, getExams, getInvoices } from '@/services/OwnerService'
import classNames from '@/utils/classNames'

// --- Reusable Stat Card
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums truncate max-w-[200px]" title={value.toString()}>
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

const Dashboard = () => {
    const navigate = useNavigate()
    const user = useSessionUser((s) => s.user)

    const { data: managersData, isLoading: managersLoading } = useSWR(
        '/owner/managers',
        getMyManagers,
        { revalidateOnFocus: false }
    )

    const { data: assessmentsData, isLoading: assessmentsLoading } = useSWR(
        '/owner/assessments',
        getAssessments,
        { revalidateOnFocus: false }
    )

    const { data: examsData, isLoading: examsLoading } = useSWR(
        '/owner/exams',
        getExams,
        { revalidateOnFocus: false }
    )

    const { data: billsData, isLoading: billsLoading } = useSWR(
        '/owner/bills',
        getInvoices,
        { revalidateOnFocus: false }
    )

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'صبح بخیر'
        if (h < 17) return 'عصر بخیر'
        return 'شب بخیر'
    }

    const unreadCount = 0

    // Compute stats from the fetched data
    const totalManagers = useMemo(() => {
        if (!managersData) return 0;
        return managersData.reduce((acc, company) => acc + (company.managers?.length || 0), 0)
    }, [managersData])

    const activeManagers = useMemo(() => {
        if (!managersData) return 0;
        return managersData.reduce((acc, company) => 
            acc + (company.managers?.filter(m => m.status === 'active').length || 0)
        , 0)
    }, [managersData])

    const completedAssessments = useMemo(() => {
        if (!assessmentsData) return 0;
        return assessmentsData.filter(a => a.status === 'submitted').length
    }, [assessmentsData])

    const completedExams = useMemo(() => {
        if (!examsData) return 0;
        return examsData.filter(e => e.status === 'completed').length
    }, [examsData])

    const pendingExams = useMemo(() => {
        if (!examsData) return 0;
        return examsData.filter(e => e.status === 'active' || e.status === 'draft').length
    }, [examsData])

    const totalPending = useMemo(() => {
        if (!billsData) return 0;
        return billsData.filter(b => b.status === 'requested').reduce((acc, b) => acc + b.amount, 0)
    }, [billsData])

    return (
        <div className="space-y-6">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div
                id="owner-dashboard-welcome"
                className="bg-gradient-to-l from-indigo-600 to-purple-700 rounded-xl p-5 shadow-sm"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl flex-shrink-0">
                            <HiOutlineUserCircle />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                {greeting()}، {user.userName || 'کاربر گرامی'} 👋
                            </h1>
                            <p className="text-sm text-indigo-100 mt-0.5">
                                {user.phone && (
                                    <span className="font-mono ml-2">{user.phone}</span>
                                )}
                                خوش آمدید به پنل کارفرما
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        {unreadCount > 0 && (
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
                            onClick={() => navigate('/owner/profile')}
                        >
                            پروفایل کاربری
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    loading={managersLoading}
                    title="متقاضیان ثبت شده"
                    value={totalManagers}
                    subLabel="فعال"
                    subValue={activeManagers}
                    icon={<HiOutlineUsers />}
                    iconBg="bg-violet-100 dark:bg-violet-500/20"
                    iconColor="text-violet-600 dark:text-violet-400"
                    onView={() => navigate('/owner/managers')}
                    id="owner-dashboard-stats-managers"
                />
                
                <StatCard
                    loading={assessmentsLoading}
                    title="نیازسنجی‌های تکمیل شده"
                    value={completedAssessments}
                    icon={<HiOutlineClipboardList />}
                    iconBg="bg-orange-100 dark:bg-orange-500/20"
                    iconColor="text-orange-600 dark:text-orange-400"
                    onView={() => navigate('/owner/assessment')}
                    id="owner-dashboard-stats-assessments"
                />
                
                <StatCard
                    loading={examsLoading}
                    title="آزمون‌های انجام شده"
                    value={completedExams}
                    subLabel="در انتظار بررسی"
                    subValue={pendingExams}
                    alertBadge
                    icon={<HiOutlineAcademicCap />}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-600 dark:text-teal-400"
                    onView={() => navigate('/owner/results')}
                    id="owner-dashboard-stats-exams"
                />

                <StatCard
                    loading={billsLoading}
                    title="صورتحساب‌های معوق (تومان)"
                    value={totalPending ? new Intl.NumberFormat('fa-IR').format(totalPending) : '۰'}
                    alertBadge={!!(totalPending && totalPending > 0)}
                    subLabel="تایید نشده"
                    subValue={totalPending ? 1 : 0} 
                    icon={<HiOutlineCash />}
                    iconBg="bg-red-100 dark:bg-red-500/20"
                    iconColor="text-red-600 dark:text-red-400"
                    onView={() => navigate('/owner/bills')}
                    id="owner-dashboard-stats-pending-bills"
                />
            </div>
        </div>
    )
}

export default Dashboard
