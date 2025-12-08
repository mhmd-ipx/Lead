import { useEffect, useState } from 'react'
import { Card, Button, Progress, Avatar, Badge, Tooltip } from '@/components/ui'
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineAcademicCap, HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineBell, HiOutlinePlus, HiOutlineDocumentDownload, HiOutlineShare } from 'react-icons/hi'
import { getDashboardStats, getNotifications, getExamResults, getAssessments } from '@/services/OwnerService'
import { DashboardStats, Notification, ExamResult, Assessment } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [recentResults, setRecentResults] = useState<ExamResult[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, notificationsData, resultsData, assessmentsData] = await Promise.all([
          getDashboardStats(),
          getNotifications(),
          getExamResults(),
          getAssessments()
        ])

        setStats(statsData)
        setNotifications(notificationsData.slice(0, 5)) // Show only latest 5
        setRecentResults(resultsData.slice(0, 5)) // Show only latest 5
        setAssessments(assessmentsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const assessmentStats = {
    completed: assessments.filter(a => a.status === 'submitted').length,
    incomplete: assessments.filter(a => a.status === 'draft').length,
    notStarted: stats ? stats.totalManagers - assessments.length : 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          داشبورد مدیرعامل
        </h1>
        <Button
          variant="solid"
          icon={<HiOutlinePlus />}
          onClick={() => navigate('/owner/managers/add')}
        >
          افزودن مدیر جدید
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                تعداد مدیران
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalManagers || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <HiOutlineUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                نیازسنجی تکمیل شده
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {assessmentStats.completed}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <HiOutlineDocumentText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                آزمون‌های فعال
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.activeExams || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <HiOutlineAcademicCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                آزمون‌های در انتظار
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.pendingExams || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <HiOutlineClock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            وضعیت نیازسنجی مدیران
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">تکمیل شده</span>
              <span className="text-sm font-medium">{assessmentStats.completed} مدیر</span>
            </div>
            <Progress percent={(assessmentStats.completed / (stats?.totalManagers || 1)) * 100} />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">ناقص</span>
              <span className="text-sm font-medium">{assessmentStats.incomplete} مدیر</span>
            </div>
            <Progress percent={(assessmentStats.incomplete / (stats?.totalManagers || 1)) * 100} customColorClass="bg-orange-500" />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">شروع نشده</span>
              <span className="text-sm font-medium">{assessmentStats.notStarted} مدیر</span>
            </div>
            <Progress percent={(assessmentStats.notStarted / (stats?.totalManagers || 1)) * 100} customColorClass="bg-red-500" />
          </div>
        </Card>

        {/* Finance Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            خلاصه مالی
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">مجموع پرداخت شده</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(stats?.totalPaid || 0)}
                </p>
              </div>
              <HiOutlineCurrencyDollar className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">مجموع بدهی</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(stats?.totalPending || 0)}
                </p>
              </div>
              <HiOutlineClock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/owner/payments')}
                className="flex-1"
              >
                مشاهده پرداخت‌ها
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/owner/payments/invoice')}
                className="flex-1"
              >
                درخواست فاکتور
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Notifications */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              اعلان‌های اخیر
            </h3>
            <Button
              variant="plain"
              size="sm"
              onClick={() => navigate('/owner/notifications')}
            >
              مشاهده همه
            </Button>
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <HiOutlineBell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <Badge className="bg-red-500 text-white">جدید</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Latest Exam Results */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              آخرین نتایج آزمون‌ها
            </h3>
            <Button
              variant="plain"
              size="sm"
              onClick={() => navigate('/owner/results')}
            >
              مشاهده همه
            </Button>
          </div>
          <div className="space-y-3">
            {recentResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar size="sm" src="" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.managerName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {result.examTitle}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {result.percentage}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDate(result.completedAt || '')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          میانبرها
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="default"
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/owner/managers/add')}
          >
            <HiOutlinePlus className="w-6 h-6" />
            افزودن مدیر
          </Button>
          <Button
            variant="default"
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/owner/assessment')}
          >
            <HiOutlineDocumentText className="w-6 h-6" />
            نیازسنجی جدید
          </Button>
          <Button
            variant="default"
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/owner/exams')}
          >
            <HiOutlineAcademicCap className="w-6 h-6" />
            مشاهده آزمون‌ها
          </Button>
          <Button
            variant="default"
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/owner/payments/invoice')}
          >
            <HiOutlineDocumentDownload className="w-6 h-6" />
            درخواست فاکتور
          </Button>
        </div>
      </Card>

      {/* Social Share Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          اشتراک‌گذاری نتایج
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            نتایج آزمون‌های تکمیل شده را در شبکه‌های اجتماعی به اشتراک بگذارید
          </p>
          <div className="flex gap-2">
            <Tooltip title="اشتراک در توییتر">
              <Button variant="default" size="sm" icon={<HiOutlineShare />}>
                توییتر
              </Button>
            </Tooltip>
            <Tooltip title="اشتراک در لینکدین">
              <Button variant="default" size="sm" icon={<HiOutlineShare />}>
                لینکدین
              </Button>
            </Tooltip>
            <Tooltip title="کپی لینک">
              <Button variant="default" size="sm" icon={<HiOutlineShare />}>
                کپی لینک
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
