import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Tag } from '@/components/ui'
import { HiOutlineDocumentText, HiOutlineEye, HiOutlinePlus, HiOutlineArrowLeft } from 'react-icons/hi'
import { getAssessments, getManagers, createAssessment } from '@/services/OwnerService'
import { Assessment, Manager } from '@/mock/data/ownerData'
import { useNavigate, useParams } from 'react-router-dom'

const ManagerAssessmentList = () => {
  const { managerId } = useParams<{ managerId: string }>()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [manager, setManager] = useState<Manager | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [managerId])

  const loadData = async () => {
    try {
      const [assessmentsData, managersData] = await Promise.all([
        getAssessments(),
        getManagers()
      ])

      const managerData = managersData.find(m => m.id === managerId) || null
      setManager(managerData)

      const managerAssessments = assessmentsData.filter(a => a.managerId === managerId)
      setAssessments(managerAssessments)
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

  if (!manager) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">مدیر مورد نظر یافت نشد</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="plain"
            icon={<HiOutlineArrowLeft />}
            onClick={() => navigate('/owner/managers')}
          >
            بازگشت
          </Button>
          <div className="flex items-center gap-3">
            <Avatar size="md" src="" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                نیازسنجی {manager.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {manager.position} - {manager.department}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="solid"
          icon={<HiOutlinePlus />}
          onClick={async () => {
            try {
              const newAssessment = await createAssessment(managerId!, 'template-1')
              navigate(`/owner/assessment/form/${newAssessment.id}`)
            } catch (error) {
              console.error('Error creating assessment:', error)
            }
          }}
        >
          نیازسنجی جدید
        </Button>
      </div>

      {/* Assessment History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          تاریخچه نیازسنجی‌ها
        </h3>
        <div className="space-y-4">
          {assessments.length > 0 ? (
            assessments
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                      <HiOutlineDocumentText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        نیازسنجی {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        آخرین بروزرسانی: {new Date(item.updatedAt).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusTag(item.status)}
                    {item.score && (
                      <Tag className="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-100 border-0">
                        امتیاز: {item.score}
                      </Tag>
                    )}
                    <Button
                      variant="plain"
                      size="sm"
                      icon={<HiOutlineEye />}
                      onClick={() => navigate(`/owner/assessment/form/${item.id}?view=existing`)}
                    >
                      مشاهده
                    </Button>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              هیچ نیازسنجی قبلی وجود ندارد
            </div>
          )}
        </div>
      </Card>

      {/* New Assessment Dialog */}
      <Dialog
        isOpen={showNewAssessmentDialog}
        onClose={() => {
          setShowNewAssessmentDialog(false)
          setSelectedTemplateId('')
        }}
        onRequestClose={() => {
          setShowNewAssessmentDialog(false)
          setSelectedTemplateId('')
        }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            انتخاب نوع نیازسنجی برای {manager.name}
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar size="sm" src="" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {manager.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {manager.position}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                انتخاب نوع نیازسنجی
              </label>
              <div className="grid grid-cols-1 gap-3">
                {assessmentTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplateId === template.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {template.steps.length} مرحله
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {template.estimatedTime} دقیقه
                          </span>
                          <Tag className="text-xs">{template.category}</Tag>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedTemplateId === template.id}
                        onChange={() => setSelectedTemplateId(template.id)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="plain"
              onClick={() => {
                setShowNewAssessmentDialog(false)
                setSelectedTemplateId('')
              }}
            >
              انصراف
            </Button>
            <Button
              variant="solid"
              disabled={!selectedTemplateId}
              onClick={async () => {
                if (selectedTemplateId) {
                  try {
                    const newAssessment = await createAssessment(managerId!, selectedTemplateId)
                    navigate(`/owner/assessment/form/${newAssessment.id}`)
                    setShowNewAssessmentDialog(false)
                    setSelectedTemplateId('')
                  } catch (error) {
                    console.error('Error creating assessment:', error)
                  }
                }
              }}
            >
              شروع نیازسنجی
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default ManagerAssessmentList