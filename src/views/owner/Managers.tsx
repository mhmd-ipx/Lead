import useSWR from 'swr'
import { Card, Button, Avatar, Tag, Tooltip, Input, Select, Skeleton, Dialog } from '@/components/ui'
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
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi'
import { getMyManagers } from '@/services/OwnerService'
import { CompanyWithManagers, Manager } from '@/mock/data/ownerData'
import { useNavigate, useLocation } from 'react-router-dom'
import classNames from '@/utils/classNames'
import { useEffect, useState } from 'react'

type FilterCategory = 'all' | 'active' | 'assessmentDone' | 'examDone'

type StatisticCardProps = {
  title: string
  value: number
  icon: React.ReactNode
  iconClass: string
  label: FilterCategory
  active: boolean
  onClick: (label: FilterCategory) => void
  loading?: boolean
}

const StatisticCard = (props: StatisticCardProps) => {
  const { title, value, label, icon, iconClass, active, onClick, loading } = props

  return (
    <button
      className={classNames(
        'p-4 rounded-2xl cursor-pointer text-right transition duration-150 outline-none w-full',
        active && 'bg-white dark:bg-gray-900 shadow-md',
      )}
      onClick={() => onClick(label)}
      disabled={loading}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
            {title}
          </div>
          {loading ? (
            <Skeleton width={60} height={36} />
          ) : (
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
          )}
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

// Skeleton for table rows
const TableRowSkeleton = () => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width={32} height={32} />
        <div className="space-y-2">
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={14} />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton width={100} height={16} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="space-y-2">
        <Skeleton width={150} height={14} />
        <Skeleton width={100} height={14} />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton width={60} height={24} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton width={80} height={24} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton width={80} height={24} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton variant="circle" width={32} height={32} />
      </div>
    </td>
  </tr>
)

const Managers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [selectedManager, setSelectedManager] = useState<any | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
  const navigate = useNavigate()
  const location = useLocation()

  // Use SWR for data fetching with caching
  const { data: companiesWithManagers, error, isLoading, mutate } = useSWR(
    '/managers/my-managers',
    getMyManagers,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  )

  // Revalidate data when returning from add/edit page
  useEffect(() => {
    if (location.state?.reload) {
      mutate()
      // Clear the state
      window.history.replaceState({}, document.title)
    }
  }, [location.state, mutate])

  const handleViewDetails = (manager: any) => {
    setSelectedManager(manager)
    setInfoDialogOpen(true)
  }

  const handleDeleteManager = async () => {
    if (!selectedManager) return

    try {
      // await deleteManager(selectedManager.id)
      // Revalidate data after delete
      await mutate()
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

  const getAssessmentStatusTag = (status: Manager['assessment_status']) => {
    switch (status) {
      case 'completed':
        return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">تکمیل شده</Tag>
      case 'incomplete':
        return <Tag className="text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20 border-0">در حال انجام</Tag>
      case 'not_started':
        return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">انجام نشده</Tag>
      default:
        return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">نامشخص</Tag>
    }
  }

  const getExamStatusTag = (status: Manager['exam_status']) => {
    switch (status) {
      case 'completed':
        return <Tag className="text-green-600 bg-green-100 dark:text-green-100 dark:bg-green-500/20 border-0">تکمیل شده</Tag>
      case 'in_progress':
        return <Tag className="text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20 border-0">در حال انجام</Tag>
      case 'not_started':
        return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">شروع نشده</Tag>
      default:
        return <Tag className="text-gray-600 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20 border-0">نامشخص</Tag>
    }
  }

  // Flatten all managers from all companies
  const allManagers = companiesWithManagers?.flatMap(company =>
    company.managers.map(manager => ({
      ...manager,
      companyName: company.name,
      companyStatus: company.status
    }))
  ) || []

  // Filter managers based on selected category
  const filteredByCategory = allManagers.filter(manager => {
    switch (selectedCategory) {
      case 'active':
        return manager.status === 'active'
      case 'assessmentDone':
        return manager.assessment_status === 'completed'
      case 'examDone':
        return manager.exam_status === 'completed'
      case 'all':
      default:
        return true
    }
  })

  // Filter by company
  const filteredByCompany = selectedCompanyId
    ? filteredByCategory.filter(manager => manager.company_id === selectedCompanyId)
    : filteredByCategory

  // Then filter by search query
  const filteredManagers = filteredByCompany.filter(manager =>
    manager.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get active companies only
  const activeCompanies = companiesWithManagers?.filter(c => c.status === 'active') || []

  // Calculate statistics
  const totalManagers = allManagers.length
  const activeManagers = allManagers.filter(m => m.status === 'active').length
  const assessmentDone = allManagers.filter(m => m.assessment_status === 'completed').length
  const examDone = allManagers.filter(m => m.exam_status === 'completed').length

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">خطا در بارگذاری داده‌ها</p>
          <Button onClick={() => mutate()}>تلاش مجدد</Button>
        </div>
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
          <Select
            className="min-w-[200px]"
            placeholder="همه سازمان‌ها"
            value={
              selectedCompanyId
                ? activeCompanies.find(c => c.id === selectedCompanyId)
                  ? { value: selectedCompanyId, label: activeCompanies.find(c => c.id === selectedCompanyId)!.name }
                  : null
                : null
            }
            onChange={(option: any) => setSelectedCompanyId(option?.value || '')}
            options={activeCompanies.map(company => ({
              value: company.id,
              label: company.name
            }))}
            isClearable
            isDisabled={isLoading}
          />
          <Input
            className="w-64"
            placeholder="جستجو..."
            prefix={<HiOutlineSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
          <Button
            variant="solid"
            icon={<HiOutlinePlus />}
            onClick={() => navigate('/owner/managers/add')}
            disabled={isLoading}
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
          loading={isLoading}
        />
        <StatisticCard
          title="فعال"
          value={activeManagers}
          iconClass="bg-emerald-200 text-emerald-700"
          icon={<HiOutlineCheckCircle />}
          label="active"
          active={selectedCategory === 'active'}
          onClick={setSelectedCategory}
          loading={isLoading}
        />
        <StatisticCard
          title="نیازسنجی شده"
          value={assessmentDone}
          iconClass="bg-blue-200 text-blue-700"
          icon={<HiOutlineClipboardCheck />}
          label="assessmentDone"
          active={selectedCategory === 'assessmentDone'}
          onClick={setSelectedCategory}
          loading={isLoading}
        />
        <StatisticCard
          title="آزمون داده‌اند"
          value={examDone}
          iconClass="bg-indigo-200 text-indigo-700"
          icon={<HiOutlineAcademicCap />}
          label="examDone"
          active={selectedCategory === 'examDone'}
          onClick={setSelectedCategory}
          loading={isLoading}
        />
      </div>

      {/* Managers Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            لیست متقاضیان
            {!isLoading && selectedCategory !== 'all' && (
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
                    سازمان
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
                {isLoading ? (
                  // Show skeleton rows based on companies count
                  <>
                    {[...Array(5)].map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))}
                  </>
                ) : (
                  <>
                    {filteredManagers.map((manager) => (
                      <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm" src={manager.user.avatar || ''} />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {manager.user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {manager.companyName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {manager.user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusTag(manager.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getAssessmentStatusTag(manager.assessment_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getExamStatusTag(manager.exam_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Tooltip title="مشاهده جزئیات">
                              <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlineEye />}
                                onClick={() => handleViewDetails(manager)}
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
                    {!isLoading && filteredManagers.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                              {searchQuery || selectedCategory !== 'all' || selectedCompanyId
                                ? 'متقاضی با این فیلتر یافت نشد'
                                : 'هنوز متقاضی‌ای ثبت نشده است'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
        <p>آیا مطمئن هستید که می‌خواهید متقاضی "{selectedManager?.user.name}" را حذف کنید؟</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          این عملیات قابل برگشت نیست و تمام نیازسنجی‌ها و نتایج آزمون‌های مرتبط نیز حذف خواهند شد.
        </p>
      </ConfirmDialog>

      {/* Info Dialog */}
      <Dialog
        isOpen={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        onRequestClose={() => setInfoDialogOpen(false)}
        closable
        width={600}
      >
        {selectedManager && (
          <div className="space-y-6">
            <h5 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white border-b pb-4">
              <HiOutlineIdentification className="w-5 h-5 text-indigo-600" />
              جزئیات متقاضی
            </h5>
            <div className="flex items-center gap-4">
              <Avatar size={64} src={selectedManager.user.avatar || ''} className="border-2 border-indigo-100 dark:border-indigo-900" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedManager.user.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                  <HiOutlineIdentification className="w-4 h-4" />
                  <span>{selectedManager.position}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <HiOutlineOfficeBuilding className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">سازمان</div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">{selectedManager.companyName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <HiOutlineUserGroup className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">بخش / دپارتمان</div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">{selectedManager.department || '-'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <HiOutlineCalendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">تاریخ ثبت‌نام</div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold" dir="ltr">
                      {selectedManager.created_at ? new Date(selectedManager.created_at).toLocaleDateString('fa-IR') : '-'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                    <HiOutlinePhone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">شماره تماس</div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold" dir="ltr">{selectedManager.user.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
                    <HiOutlineMail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">ایمیل</div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold truncate max-w-[180px]">{selectedManager.user.email || '-'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
                    <HiOutlineCheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">وضعیت حساب:</span>
                      {getStatusTag(selectedManager.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">نیازسنجی:</span>
                      {getAssessmentStatusTag(selectedManager.assessment_status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              <Button variant="solid" onClick={() => setInfoDialogOpen(false)}>بستن</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default Managers
