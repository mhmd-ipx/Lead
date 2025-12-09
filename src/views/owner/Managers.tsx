import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Dialog, Input, Switcher, Tooltip, Tag } from '@/components/ui'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMail, HiOutlineSearch, HiOutlineDocumentText, HiOutlineEye } from 'react-icons/hi'
import { getManagers, deleteManager, toggleManagerAccess, sendManagerInvite, getAssessments, getExamResultsByManager, getAssessmentTemplates, createAssessment } from '@/services/OwnerService'
import { Manager, Assessment, ExamResult } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'

const Managers = () => {
  const [managers, setManagers] = useState<Manager[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadManagers()
  }, [])

  const loadManagers = async () => {
    try {
      const [managersData, assessmentsData, examResultsData] = await Promise.all([
        getManagers(),
        getAssessments(),
        getExamResultsByManager('') // This will get all exam results, we'll filter by manager later
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

  const handleToggleAccess = async (manager: Manager) => {
    try {
      const updatedManager = await toggleManagerAccess(manager.id, !manager.canViewResults)
      setManagers(managers.map(m => m.id === manager.id ? updatedManager : m))
    } catch (error) {
      console.error('Error toggling access:', error)
    }
  }

  const handleSendInvite = async (manager: Manager) => {
    try {
      await sendManagerInvite(manager.id)
      alert(`دعوتنامه برای ${manager.name} ارسال شد`)
    } catch (error) {
      console.error('Error sending invite:', error)
    }
  }

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.position.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const getAssessmentCount = (managerId: string) => {
    return assessments.filter(a => a.managerId === managerId).length
  }

  const getExamCount = (managerId: string) => {
    return examResults.filter(r => r.managerId === managerId).length
  }

  const renderTableRow = (manager: Manager) => (
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
        <Tag className="text-blue-600 bg-blue-100 dark:text-blue-100 dark:bg-blue-500/20 border-0">
          {getAssessmentCount(manager.id)}
        </Tag>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Tag className="text-purple-600 bg-purple-100 dark:text-purple-100 dark:bg-purple-500/20 border-0">
          {getExamCount(manager.id)}
        </Tag>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Switcher
          checked={manager.canViewResults}
          onChange={() => handleToggleAccess(manager)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Tooltip title="ویرایش">
            <Button
              variant="plain"
              size="sm"
              icon={<HiOutlinePencil />}
              onClick={() => navigate(`/owner/managers/${manager.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="ارسال دعوتنامه">
            <Button
              variant="plain"
              size="sm"
              icon={<HiOutlineMail />}
              onClick={() => handleSendInvite(manager)}
            />
          </Tooltip>
          <Tooltip title="مشاهده جزئیات">
            <Button
              variant="plain"
              size="sm"
              icon={<HiOutlineEye />}
              onClick={() => navigate(`/owner/managers/${manager.id}`)}
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Button
              variant="plain"
              size="sm"
              color="red"
              icon={<HiOutlineTrash />}
              onClick={() => {
                setSelectedManager(manager)
                setDeleteDialogOpen(true)
              }}
            />
          </Tooltip>
        </div>
      </td>
    </tr>
  )

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
          مدیریت مدیران
        </h1>
        <Button
          variant="solid"
          icon={<HiOutlinePlus />}
          onClick={() => navigate('/owner/managers/add')}
        >
          افزودن مدیر جدید
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="جستجو بر اساس نام، ایمیل یا سمت..."
              prefix={<HiOutlineSearch />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Managers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  مدیر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  اطلاعات تماس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  تعداد نیازسنجی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  تعداد آزمون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  دسترسی نتایج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredManagers.map(renderTableRow)}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {managers.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              کل مدیران
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {managers.filter(m => m.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              مدیران فعال
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {managers.filter(m => m.assessmentStatus === 'completed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              نیازسنجی تکمیل شده
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {managers.filter(m => m.examStatus === 'completed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              آزمون تکمیل شده
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onRequestClose={() => setDeleteDialogOpen(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            حذف مدیر
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            آیا مطمئن هستید که می‌خواهید مدیر "{selectedManager?.name}" را حذف کنید؟
            این عملیات قابل برگرداندن نیست.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="plain"
              onClick={() => setDeleteDialogOpen(false)}
            >
              انصراف
            </Button>
            <Button
              variant="solid"
              color="red"
              onClick={handleDeleteManager}
            >
              حذف
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default Managers
