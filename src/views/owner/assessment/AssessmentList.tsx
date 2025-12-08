import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Tag } from '@/components/ui'
import { HiOutlineEye, HiOutlinePlus } from 'react-icons/hi'
import { getAssessments, getManagers } from '@/services/OwnerService'
import { Assessment, Manager } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'

const AssessmentList = () => {
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([])
  const [allManagers, setAllManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [assessmentsData, managersData] = await Promise.all([
        getAssessments(),
        getManagers()
      ])
      setAllAssessments(assessmentsData)
      setAllManagers(managersData)
    } catch (error) {
      console.error('Error loading assessment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status: Assessment['status']) => {
    switch (status) {
      case 'submitted':
        return <Tag className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100 border-0">تکمیل شده</Tag>
      case 'draft':
        return <Tag className="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-100 border-0">پیش‌نویس</Tag>
      default:
        return <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100 border-0">نامشخص</Tag>
    }
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
          نیازسنجی مدیران
        </h1>
        <Button
          variant="solid"
          icon={<HiOutlinePlus />}
          onClick={() => navigate('/owner/assessment/new')}
        >
          نیازسنجی جدید
        </Button>
      </div>

      {/* Assessments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  مدیر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  امتیاز
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  تاریخ بروزرسانی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {allAssessments.map((item) => {
                const manager = allManagers.find(m => m.id === item.managerId)
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" src="" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {manager?.name || 'نامشخص'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {manager?.position || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusTag(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.score || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.updatedAt).toLocaleDateString('fa-IR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineEye />}
                        onClick={() => navigate(`/owner/assessment/form/${item.id}?view=existing`)}
                      >
                        مشاهده
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AssessmentList