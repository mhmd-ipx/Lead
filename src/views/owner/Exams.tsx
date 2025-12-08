import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Tag, Progress, Tabs } from '@/components/ui'
import { HiOutlineAcademicCap, HiOutlinePlus, HiOutlineEye, HiOutlineDocumentDownload, HiOutlineShare, HiOutlineUsers, HiOutlineClock } from 'react-icons/hi'
import { getExams, getExamResults, getManagers } from '@/services/OwnerService'
import { Exam, ExamResult, Manager } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'

const { TabNav, TabList, TabContent } = Tabs

const Exams = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [examsData, resultsData, managersData] = await Promise.all([
        getExams(),
        getExamResults(),
        getManagers()
      ])
      setExams(examsData)
      setExamResults(resultsData)
      setManagers(managersData)
    } catch (error) {
      console.error('Error loading exams data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExamStatusTag = (exam: Exam) => {
    const now = new Date()
    const startDate = exam.startDate ? new Date(exam.startDate) : null
    const endDate = exam.endDate ? new Date(exam.endDate) : null

    if (exam.status === 'completed') {
      return <Tag className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100 border-0">تکمیل شده</Tag>
    } else if (exam.status === 'active') {
      if (endDate && now > endDate) {
        return <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100 border-0">پایان یافته</Tag>
      } else if (startDate && now >= startDate) {
        return <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">در حال برگزاری</Tag>
      } else {
        return <Tag className="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-100 border-0">برنامه‌ریزی شده</Tag>
      }
    } else {
      return <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100 border-0">پیش‌نویس</Tag>
    }
  }

  const getResultStatusTag = (status: ExamResult['status']) => {
    switch (status) {
      case 'passed':
        return <Tag className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100 border-0">قبول</Tag>
      case 'failed':
        return <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100 border-0">مردود</Tag>
      case 'in_progress':
        return <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">در حال انجام</Tag>
      default:
        return <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100 border-0">نامشخص</Tag>
    }
  }

  const getExamStats = (exam: Exam) => {
    const examResultsForExam = examResults.filter(r => r.examId === exam.id)
    const totalAssigned = exam.assignedManagers.length
    const completed = examResultsForExam.length
    const passed = examResultsForExam.filter(r => r.status === 'passed').length
    const failed = examResultsForExam.filter(r => r.status === 'failed').length
    const inProgress = examResultsForExam.filter(r => r.status === 'in_progress').length

    return {
      totalAssigned,
      completed,
      passed,
      failed,
      inProgress,
      completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
      passRate: completed > 0 ? Math.round((passed / completed) * 100) : 0
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const renderExamCard = (exam: Exam) => {
    const stats = getExamStats(exam)
    const assignedManagerNames = exam.assignedManagers.map(managerId => {
      const manager = managers.find(m => m.id === managerId)
      return manager ? manager.name : 'نامشخص'
    })

    return (
      <Card key={exam.id} className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {exam.title}
              </h3>
              {getExamStatusTag(exam)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {exam.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <HiOutlineUsers className="w-4 h-4" />
                {stats.totalAssigned} مدیر
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineAcademicCap className="w-4 h-4" />
                {exam.totalQuestions} سوال
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineClock className="w-4 h-4" />
                {exam.duration} دقیقه
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="plain"
              size="sm"
              icon={<HiOutlineEye />}
              onClick={() => navigate(`/owner/exams/results/${exam.id}`)}
            >
              نتایج
            </Button>
            <Button
              variant="plain"
              size="sm"
              icon={<HiOutlineDocumentDownload />}
            >
              دانلود
            </Button>
          </div>
        </div>

        {/* Progress and Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">میزان تکمیل</div>
            <Progress percent={stats.completionRate} className="mt-2" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">قبول</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">مردود</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">در حال انجام</div>
          </div>
        </div>

        {/* Assigned Managers */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            مدیران تخصیص داده شده:
          </h4>
          <div className="flex flex-wrap gap-2">
            {assignedManagerNames.map((name, index) => (
              <Tag key={index} className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100 border-0">
                {name}
              </Tag>
            ))}
          </div>
        </div>

        {/* Dates */}
        {(exam.startDate || exam.endDate) && (
          <div className="border-t pt-4 mt-4">
            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
              {exam.startDate && (
                <span>شروع: {formatDate(exam.startDate)}</span>
              )}
              {exam.endDate && (
                <span>پایان: {formatDate(exam.endDate)}</span>
              )}
            </div>
          </div>
        )}
      </Card>
    )
  }

  const renderResultsTable = () => {
    const columns = [
      {
        header: 'مدیر',
        accessorKey: 'managerName',
        cell: (row: ExamResult) => (
          <div className="flex items-center gap-3">
            <Avatar size="sm" src="" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {row.managerName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {row.examTitle}
              </div>
            </div>
          </div>
        )
      },
      {
        header: 'نمره',
        accessorKey: 'score',
        cell: (row: ExamResult) => (
          <div className="text-center">
            <div className="font-bold text-gray-900 dark:text-white">
              {row.score}/{row.totalScore}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.percentage}%
            </div>
          </div>
        )
      },
      {
        header: 'وضعیت',
        accessorKey: 'status',
        cell: (row: ExamResult) => getResultStatusTag(row.status)
      },
      {
        header: 'تاریخ تکمیل',
        accessorKey: 'completedAt',
        cell: (row: ExamResult) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {row.completedAt ? formatDate(row.completedAt) : '-'}
          </span>
        )
      },
      {
        header: 'عملیات',
        accessorKey: 'actions',
        cell: (row: ExamResult) => (
          <div className="flex gap-2">
            <Button
              variant="plain"
              size="sm"
              icon={<HiOutlineEye />}
              onClick={() => navigate(`/owner/results/${row.managerId}`)}
            >
              مشاهده جزئیات
            </Button>
            <Button
              variant="plain"
              size="sm"
              icon={<HiOutlineDocumentDownload />}
            >
              دانلود
            </Button>
          </div>
        )
      }
    ]

    return (
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {examResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {columns.map((col, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap">
                      {col.cell(result)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
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
          آزمون‌ها و نتایج
        </h1>
        <Button
          variant="solid"
          icon={<HiOutlinePlus />}
        >
          ایجاد آزمون جدید
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {exams.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              کل آزمون‌ها
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {exams.filter(e => e.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              آزمون‌های فعال
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {examResults.filter(r => r.status === 'passed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              قبولی‌ها
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {examResults.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              نتایج ثبت شده
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="exams">
        <TabList>
          <TabNav value="exams">آزمون‌ها</TabNav>
          <TabNav value="results">نتایج</TabNav>
        </TabList>

        <div className="mt-6">
          <TabContent value="exams">
            <div className="space-y-6">
              {exams.map(renderExamCard)}
              {exams.length === 0 && (
                <Card className="p-12 text-center">
                  <HiOutlineAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    آزمونی یافت نشد
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    هنوز آزمونی ایجاد نشده است.
                  </p>
                  <Button variant="solid" icon={<HiOutlinePlus />}>
                    ایجاد آزمون جدید
                  </Button>
                </Card>
              )}
            </div>
          </TabContent>

          <TabContent value="results">
            {examResults.length > 0 ? (
              renderResultsTable()
            ) : (
              <Card className="p-12 text-center">
                <HiOutlineDocumentDownload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  نتیجه‌ای یافت نشد
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  هنوز نتیجه آزمونی ثبت نشده است.
                </p>
              </Card>
            )}
          </TabContent>
        </div>
      </Tabs>

      {/* Share Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          اشتراک‌گذاری نتایج
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            نتایج آزمون‌ها را در شبکه‌های اجتماعی به اشتراک بگذارید
          </p>
          <div className="flex gap-2">
            <Button variant="default" size="sm" icon={<HiOutlineShare />}>
              توییتر
            </Button>
            <Button variant="default" size="sm" icon={<HiOutlineShare />}>
              لینکدین
            </Button>
            <Button variant="default" size="sm" icon={<HiOutlineShare />}>
              کپی لینک
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Exams
