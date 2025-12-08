import { useEffect, useState } from 'react'
import { Card, Button, Select } from '@/components/ui'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { getManagers, getAssessmentTemplates, createAssessment } from '@/services/OwnerService'
import { Manager, AssessmentTemplate } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'

const NewAssessment = () => {
  const [managers, setManagers] = useState<Manager[]>([])
  const [assessmentTemplates, setAssessmentTemplates] = useState<AssessmentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedManagerId, setSelectedManagerId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [managersData, templatesData] = await Promise.all([
        getManagers(),
        getAssessmentTemplates()
      ])
      setManagers(managersData)
      setAssessmentTemplates(templatesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
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
        <div className="flex items-center gap-4">
          <Button
            variant="plain"
            icon={<HiOutlineArrowLeft />}
            onClick={() => navigate('/owner/assessment')}
          >
            بازگشت
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ایجاد نیازسنجی جدید
          </h1>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              انتخاب مدیر
            </label>
            <Select
              value={selectedManagerId ? { value: selectedManagerId, label: managers.find(m => m.id === selectedManagerId)?.name || '' } : null}
              onChange={(option) => setSelectedManagerId(option?.value || '')}
              options={managers.map(manager => ({ value: manager.id, label: manager.name }))}
              placeholder="مدیر مورد نظر را انتخاب کنید"
            />
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

          <div className="flex justify-end gap-3">
            <Button
              variant="plain"
              onClick={() => navigate('/owner/assessment')}
            >
              انصراف
            </Button>
            <Button
              variant="solid"
              disabled={!selectedManagerId || !selectedTemplateId}
              onClick={async () => {
                if (selectedManagerId && selectedTemplateId) {
                  try {
                    const newAssessment = await createAssessment(selectedManagerId, selectedTemplateId)
                    navigate(`/owner/assessment/form/${newAssessment.id}`)
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
      </Card>
    </div>
  )
}

export default NewAssessment