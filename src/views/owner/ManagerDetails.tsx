import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Badge, Tabs, Tag } from '@/components/ui'
import { HiOutlineArrowLeft, HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlineEye, HiOutlinePencil } from 'react-icons/hi'
import { getManagerById, getExamResultsByManager, getAssessments } from '@/services/OwnerService'
import { Manager, ExamResult, Assessment } from '@/mock/data/ownerData'
import { useNavigate, useParams } from 'react-router-dom'

const { TabContent, TabList, TabNav } = Tabs

const ManagerDetails = () => {
  const { managerId } = useParams<{ managerId: string }>()
  const [manager, setManager] = useState<Manager | null>(null)
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (managerId) {
      loadManagerData()
    }
  }, [managerId])

  const loadManagerData = async () => {
    if (!managerId) return

    try {
      const [managerData, examResultsData, assessmentsData] = await Promise.all([
        getManagerById(managerId),
        getExamResultsByManager(managerId),
        getAssessments()
      ])

      setManager(managerData)
      setExamResults(examResultsData)
      setAssessments(assessmentsData.filter(a => a.managerId === managerId))
    } catch (error) {
      console.error('Error loading manager data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Manager['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">فعال</Badge>
      case 'inactive':
        return <Badge className="bg-red-500">غیرفعال</Badge>
      default:
        return <Badge>نامشخص</Badge>
    }
  }

  const getExamStatusBadge = (status: ExamResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500">قبول</Badge>
      case 'failed':
        return <Badge className="bg-red-500">مردود</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-500">در حال انجام</Badge>
      default:
        return <Badge>نامشخص</Badge>
    }
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

  if (!manager) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">متقاضی مورد نظر یافت نشد</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="plain"
          icon={<HiOutlineArrowLeft />}
          onClick={() => navigate('/owner/managers')}
        >
          بازگشت به لیست متقاضیان
        </Button>
      </div>

      {/* Manager Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar size="lg" src="" />
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {manager.name}
              </h1>
              {getStatusBadge(manager.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <HiOutlineOfficeBuilding className="w-5 h-5" />
                <span>{manager.position}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <HiOutlineMail className="w-5 h-5" />
                <span>{manager.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <HiOutlinePhone className="w-5 h-5" />
                <span>{manager.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>بخش: {manager.department}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                آخرین ورود: {manager.lastLogin ? formatDate(manager.lastLogin) : 'هرگز'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                تاریخ عضویت: {formatDate(manager.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              icon={<HiOutlineDocumentText />}
              onClick={() => navigate(`/owner/managers/${manager.id}/assessment`)}
            >
              نیازسنجی‌ها
            </Button>
            <Button
              variant="default"
              icon={<HiOutlineAcademicCap />}
              onClick={() => navigate(`/owner/managers/${manager.id}/exams`)}
            >
              آزمون‌ها
            </Button>
            <Button
              variant="solid"
              icon={<HiOutlinePencil />}
              onClick={() => navigate(`/owner/managers/${manager.id}/edit`)}
            >
              ویرایش
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {examResults.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              آزمون‌های شرکت کرده
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {examResults.filter(r => r.status === 'passed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              آزمون‌های قبول شده
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {assessments.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              نیازسنجی انجام شده
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {examResults.length > 0 ? Math.round(examResults.reduce((sum, r) => sum + r.percentage, 0) / examResults.length) : 0}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              میانگین نمرات
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="exams">
        <TabList>
          <TabNav value="exams">آزمون‌ها</TabNav>
          <TabNav value="permissions">دسترسی‌ها</TabNav>
        </TabList>

        <div className="mt-6">
          <TabContent value="exams">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  نتایج آزمون‌ها
                </h3>
                {examResults.length > 0 ? (
                  <div className="space-y-4">
                    {examResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                            <HiOutlineAcademicCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {result.examTitle}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              تاریخ شرکت: {formatDate(result.completedAt || '')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {result.percentage}%
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              نمره: {result.score}/{result.totalScore}
                            </div>
                          </div>
                          {getExamStatusBadge(result.status)}
                          <Button
                            variant="plain"
                            size="sm"
                            icon={<HiOutlineEye />}
                            onClick={() => navigate(`/owner/results/${manager.id}`)}
                          >
                            مشاهده جزئیات
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    هیچ آزمونی یافت نشد
                  </div>
                )}
              </div>
            </Card>
          </TabContent>

          <TabContent value="permissions">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  تنظیمات دسترسی
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        دسترسی مشاهده نتایج آزمون‌ها
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        امکان مشاهده نتایج آزمون‌ها توسط متقاضی
                      </div>
                    </div>
                    <Badge className={manager.canViewResults ? "bg-green-500" : "bg-red-500"}>
                      {manager.canViewResults ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        وضعیت حساب کاربری
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        وضعیت فعال بودن حساب متقاضی
                      </div>
                    </div>
                    {getStatusBadge(manager.status)}
                  </div>
                </div>
              </div>
            </Card>
          </TabContent>
        </div>
      </Tabs>

    </div>
  )
}

export default ManagerDetails
