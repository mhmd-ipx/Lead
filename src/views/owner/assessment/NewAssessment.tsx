import { useEffect, useState } from 'react'
import { Card, Button, Select } from '@/components/ui'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { getManagers, createAssessment } from '@/services/OwnerService'
import { Manager } from '@/mock/data/ownerData'
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
      const managersData = await getManagers()
      setManagers(managersData)
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


          <div className="flex justify-end gap-3">
            <Button
              variant="plain"
              onClick={() => navigate('/owner/assessment')}
            >
              انصراف
            </Button>
            <Button
              variant="solid"
              disabled={!selectedManagerId}
              onClick={async () => {
                if (selectedManagerId) {
                  try {
                    const newAssessment = await createAssessment(selectedManagerId, 'template-1')
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