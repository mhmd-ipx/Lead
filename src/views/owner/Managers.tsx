import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Tag, Tooltip, Input } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineClipboardCheck,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
} from 'react-icons/hi'
import { getManagers, deleteManager, getAssessments, getExamResultsByManager } from '@/services/OwnerService'
import { Manager, Assessment, ExamResult } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'
import classNames from '@/utils/classNames'

type FilterCategory = 'all' | 'active' | 'assessmentDone' | 'examDone'

type StatisticCardProps = {
  title: string
  value: number
  icon: React.ReactNode
  iconClass: string
  label: FilterCategory
  active: boolean
  onClick: (label: FilterCategory) => void
}

const StatisticCard = (props: StatisticCardProps) => {
  const { title, value, label, icon, iconClass, active, onClick } = props

  return (
    <button
      className={classNames(
        'p-4 rounded-2xl cursor-pointer text-right transition duration-150 outline-none w-full',
        active && 'bg-white dark:bg-gray-900 shadow-md',
      )}
      onClick={() => onClick(label)}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
            {title}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
        <div
          className={classNames(
            'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 rounded-full text-2xl',
            iconClass,
          )}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

const Managers = () => {
  const [managers, setManagers] = useState<Manager[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
  const navigate = useNavigate()

  useEffect(() => {
    loadManagers()
  }, [])

  const loadManagers = async () => {
    try {
      const [managersData, assessmentsData, examResultsData] = await Promise.all([
        getManagers(),
        getAssessments(),
        getExamResultsByManager('')
      ])
      setManagers(managersData)
      setAssessments(assessmentsData)
      setExamResults(examResultsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteManager = async () => {
    if (!selectedManager) return

    try {
      await deleteManager(selectedManager.id)
      setManagers(managers.filter(m => m.id !== selectedManager.id))
      setDeleteDialogOpen(false)
      setSelectedManager(null)
    } catch (error) {
      console.error('Error deleting manager:', error)
    }
  }

  const getStatusTag = (status: Manager['status']) => {
    switch (status) {
      case 'active':
        return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">فعال</Tag>
      case 'inactive':
        return <Tag className="text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20 border-0">غیرفعال</Tag>
      default:
        return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">نامشخص</Tag>
    }
  }

  const getAssessmentStatus = (managerId: string) => {
    const managerAssessments = assessments.filter(a => a.managerId === managerId)
    if (managerAssessments.length === 0) {
      return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">انجام نشده</Tag>
    }
    const submitted = managerAssessments.filter(a => a.status === 'submitted').length
    if (submitted > 0) {
      return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">تکمیل شده ({submitted})</Tag>
    }
    return <Tag className="text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20 border-0">در حال انجام</Tag>
  }

  const getExamCount = (managerId: string) => {
    return examResults.filter(r => r.managerId === managerId).length
  }

  // Filter managers based on selected category
  const filteredByCategory = managers.filter(manager => {
    switch (selectedCategory) {
      case 'active':
        return manager.status === 'active'
      case 'assessmentDone':
        return manager.assessmentStatus === 'completed'
      case 'examDone':
        return manager.examStatus === 'completed'
      case 'all':
      default:
        return true
    }
  })

  // Then filter by search query
  const filteredManagers = filteredByCategory.filter(manager =>
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.position.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate statistics
  const totalManagers = managers.length
  const activeManagers = managers.filter(m => m.status === 'active').length
  const assessmentDone = managers.filter(m => m.assessmentStatus === 'completed').length
  const examDone = managers.filter(m => m.examStatus === 'completed').length

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
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            متقاضیان
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            مدیریت متقاضیان و نیازسنجی‌ها
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            className="w-64"
            placeholder="جستجو..."
            prefix={<HiOutlineSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="solid"
            icon={<HiOutlinePlus />}
            onClick={() => navigate('/owner/managers/add')}
          >
            افزودن متقاضی
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700">
        <StatisticCard
          title="همه متقاضیان"
          value={totalManagers}
          iconClass="bg-purple-200 text-purple-700"
          icon={<HiOutlineUserGroup />}
          label="all"
          active={selectedCategory === 'all'}
          onClick={setSelectedCategory}
        />
        <StatisticCard
          title="فعال"
          value={activeManagers}
          iconClass="bg-emerald-200 text-emerald-700"
          icon={<HiOutlineCheckCircle />}
          label="active"
          active={selectedCategory === 'active'}
          onClick={setSelectedCategory}
        />
        <StatisticCard
          title="نیازسنجی شده"
          value={assessmentDone}
          iconClass="bg-blue-200 text-blue-700"
          icon={<HiOutlineClipboardCheck />}
          label="assessmentDone"
          active={selectedCategory === 'assessmentDone'}
          onClick={setSelectedCategory}
        />
        <StatisticCard
          title="آزمون داده‌اند"
          value={examDone}
          iconClass="bg-indigo-200 text-indigo-700"
          icon={<HiOutlineAcademicCap />}
          label="examDone"
          active={selectedCategory === 'examDone'}
          onClick={setSelectedCategory}
        />
      </div>

      {/* Managers Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            لیست متقاضیان
            {selectedCategory !== 'all' && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                ({filteredManagers.length} مورد)
              </span>
            )}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    متقاضی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    اطلاعات تماس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    نیازسنجی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    آزمون‌ها
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredManagers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" src="" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {manager.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {manager.position}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {manager.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {manager.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusTag(manager.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAssessmentStatus(manager.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Tag className="text-indigo-600 bg-indigo-100 dark:text-indigo-100 dark:bg-indigo-500/20 border-0">
                        {getExamCount(manager.id)} آزمون
                      </Tag>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tooltip title="مشاهده جزئیات">
                          <Button
                            variant="plain"
                            size="sm"
                            icon={<HiOutlineEye />}
                            onClick={() => navigate(`/owner/managers/${manager.id}`)}
                          />
                        </Tooltip>
                        <Tooltip title="نیازسنجی">
                          <Button
                            variant="plain"
                            size="sm"
                            icon={<HiOutlineClipboardCheck />}
                            onClick={() => navigate(`/owner/managers/${manager.id}/assessment`)}
                            className="text-blue-600 hover:text-blue-700"
                          />
                        </Tooltip>
                        <Tooltip title="آزمون‌ها">
                          <Button
                            variant="plain"
                            size="sm"
                            icon={<HiOutlineAcademicCap />}
                            onClick={() => navigate(`/owner/managers/${manager.id}/exams`)}
                            className="text-indigo-600 hover:text-indigo-700"
                          />
                        </Tooltip>
                        <Tooltip title="ویرایش">
                          <Button
                            variant="plain"
                            size="sm"
                            icon={<HiOutlinePencil />}
                            onClick={() => navigate(`/owner/managers/${manager.id}/edit`)}
                          />
                        </Tooltip>
                        <Tooltip title="حذف">
                          <Button
                            variant="plain"
                            size="sm"
                            icon={<HiOutlineTrash />}
                            onClick={() => {
                              setSelectedManager(manager)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700"
                          />
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredManagers.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchQuery || selectedCategory !== 'all'
                            ? 'متقاضی با این فیلتر یافت نشد'
                            : 'هنوز متقاضی‌ای ثبت نشده است'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        type="danger"
        title="حذف متقاضی"
        confirmText="بله، حذف کن"
        cancelText="انصراف"
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedManager(null)
        }}
        onRequestClose={() => {
          setDeleteDialogOpen(false)
          setSelectedManager(null)
        }}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setSelectedManager(null)
        }}
        onConfirm={handleDeleteManager}
      >
        <p>آیا مطمئن هستید که می‌خواهید متقاضی "{selectedManager?.name}" را حذف کنید؟</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          این عملیات قابل برگشت نیست و تمام نیازسنجی‌ها و نتایج آزمون‌های مرتبط نیز حذف خواهند شد.
        </p>
      </ConfirmDialog>
    </div>
  )
}

export default Managers
