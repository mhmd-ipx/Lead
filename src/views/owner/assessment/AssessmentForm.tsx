import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Input, Radio, Select, Progress, Tag, Steps } from '@/components/ui'
import { HiOutlineCheckCircle, HiOutlineSave, HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi'
import { getAssessments, updateAssessment, submitAssessment, getManagers } from '@/services/OwnerService'
import { Assessment, AssessmentQuestion, Manager } from '@/mock/data/ownerData'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const { Item } = Steps

const AssessmentForm = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [manager, setManager] = useState<Manager | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Record<string, string | number | string[]>>>({})
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isViewMode = searchParams.get('view') === 'existing'

  useEffect(() => {
    loadData()
  }, [assessmentId])

  const loadData = async () => {
    if (!assessmentId) return

    try {
      const [assessmentsData, managersData] = await Promise.all([
        getAssessments(),
        getManagers()
      ])

      const assessmentData = assessmentsData.find(a => a.id === assessmentId) || null
      if (!assessmentData) {
        console.error('Assessment not found')
        return
      }

      setAssessment(assessmentData)
      setAnswers(assessmentData.answers)
      setCurrentStep(assessmentData.currentStep)

      const managerData = managersData.find((m: Manager) => m.id === assessmentData.managerId) || null
      setManager(managerData)

      if (isViewMode) {
        setEditMode(false)
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (stepId: string, questionId: string, value: string | number | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [questionId]: value
      }
    }))
  }

  const handleSave = async () => {
    if (!assessment) return

    setSaving(true)
    try {
      const updatedAssessment = await updateAssessment(assessment.id, {
        answers,
        status: 'draft',
        currentStep
      })
      setAssessment(updatedAssessment)
    } catch (error) {
      console.error('Error saving assessment:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!assessment) return

    setSaving(true)
    try {
      const submittedAssessment = await submitAssessment(assessment.id)
      setAssessment(submittedAssessment)
      setEditMode(false)
    } catch (error) {
      console.error('Error submitting assessment:', error)
    } finally {
      setSaving(false)
    }
  }

  const renderQuestion = (stepId: string, question: AssessmentQuestion) => {
    const currentAnswer = answers[stepId]?.[question.id]

    if (editMode && assessment?.status !== 'submitted') {
      switch (question.type) {
        case 'text':
          return (
            <Input
              value={currentAnswer as string || ''}
              onChange={(e) => handleAnswerChange(stepId, question.id, e.target.value)}
              placeholder="پاسخ خود را وارد کنید"
            />
          )

        case 'select':
          return (
            <Select
              value={currentAnswer ? { value: currentAnswer, label: currentAnswer as string } : null}
              onChange={(option) => handleAnswerChange(stepId, question.id, String(option?.value || ''))}
              options={question.options?.map(option => ({ value: option, label: option })) || []}
              placeholder="گزینه مورد نظر را انتخاب کنید"
            />
          )

        case 'radio':
          return (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center">
                  <Radio
                    name={`${stepId}-${question.id}`}
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(value) => handleAnswerChange(stepId, question.id, value)}
                  />
                  <span className="mr-2">{option}</span>
                </label>
              ))}
            </div>
          )

        case 'checkbox': {
          const checkboxValues = (currentAnswer as string[]) || []
          return (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${stepId}-${question.id}-${option}`}
                    checked={checkboxValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkboxValues, option]
                        : checkboxValues.filter(v => v !== option)
                      handleAnswerChange(stepId, question.id, newValues)
                    }}
                    className="ml-2"
                  />
                  <label htmlFor={`${stepId}-${question.id}-${option}`}>{option}</label>
                </div>
              ))}
            </div>
          )
        }

        case 'rating':
          return (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={currentAnswer === rating ? 'solid' : 'default'}
                  size="sm"
                  onClick={() => handleAnswerChange(stepId, question.id, rating)}
                >
                  {rating}
                </Button>
              ))}
            </div>
          )

        default:
          return null
      }
    } else {
      // Display mode
      switch (question.type) {
        case 'checkbox': {
          const displayValues = (currentAnswer as string[]) || []
          return (
            <div className="flex flex-wrap gap-2">
              {displayValues.length > 0 ? (
                displayValues.map((value) => (
                  <Tag key={value} className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                    {value}
                  </Tag>
                ))
              ) : (
                <span className="text-gray-500">پاسخی ثبت نشده</span>
              )}
            </div>
          )
        }

        default:
          return (
            <p className="text-gray-900 dark:text-white">
              {currentAnswer || <span className="text-gray-500">پاسخی ثبت نشده</span>}
            </p>
          )
      }
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

  const getCompletionPercentage = () => {
    if (!assessment?.steps.length) return 0
    const totalQuestions = assessment.steps.reduce((sum, step) => sum + step.questions.length, 0)
    const answeredQuestions = Object.keys(answers).reduce((sum, stepId) => {
      const stepAnswers = answers[stepId] || {}
      return sum + Object.keys(stepAnswers).filter(questionId => {
        const answer = stepAnswers[questionId]
        return answer && (typeof answer === 'string' ? answer.length > 0 : Array.isArray(answer) ? answer.length > 0 : true)
      }).length
    }, 0)
    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!assessment || !manager) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">نیازسنجی مورد نظر یافت نشد</p>
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
            onClick={() => navigate(-1)}
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

        <div className="flex items-center gap-3">
          {getStatusTag(assessment.status)}
          {assessment.status !== 'submitted' && (
            <div className="flex gap-2">
              {!editMode ? (
                <Button
                  variant="solid"
                  icon={<HiOutlinePencil />}
                  onClick={() => setEditMode(true)}
                >
                  ویرایش
                </Button>
              ) : (
                <>
                  <Button
                    variant="plain"
                    onClick={() => {
                      setEditMode(false)
                      loadData() // Reload to reset answers
                    }}
                  >
                    انصراف
                  </Button>
                  <Button
                    variant="default"
                    icon={<HiOutlineSave />}
                    loading={saving}
                    onClick={handleSave}
                  >
                    ذخیره پیش‌نویس
                  </Button>
                  <Button
                    variant="solid"
                    icon={<HiOutlineCheckCircle />}
                    loading={saving}
                    onClick={handleSubmit}
                  >
                    ارسال نهایی
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assessment Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            پیشرفت نیازسنجی
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getCompletionPercentage()}% تکمیل شده
          </span>
        </div>
        <Progress percent={getCompletionPercentage()} />
      </Card>

      {/* Step Navigation */}
      <Card className="p-6">
        <Steps current={currentStep}>
          {assessment.steps.map((step) => (
            <Item key={step.id} title={step.title} />
          ))}
        </Steps>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {isViewMode ? (
          // Show all steps in view mode
          assessment.steps.map((step) => (
            <div key={step.id} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">
                {step.title}
              </h3>
              {step.questions.map((question, index) => (
                <Card key={question.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>

                      <div className="ml-4">
                        {renderQuestion(step.id, question)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))
        ) : (
          // Show current step in edit mode
          assessment.steps[currentStep]?.questions.map((question, index) => (
            <Card key={question.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h4>

                  <div className="ml-4">
                    {renderQuestion(assessment.steps[currentStep].id, question)}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Step Navigation Buttons - Only show in edit mode */}
      {!isViewMode && (
        <Card className="p-6">
          <div className="flex justify-between">
            <Button
              variant="plain"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              مرحله قبلی
            </Button>
            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={handleSave}
                loading={saving}
              >
                ذخیره پیش‌نویس
              </Button>
              {currentStep < assessment.steps.length - 1 ? (
                <Button
                  variant="solid"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  مرحله بعدی
                </Button>
              ) : (
                <Button
                  variant="solid"
                  onClick={handleSubmit}
                  loading={saving}
                >
                  ارسال نهایی
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AssessmentForm