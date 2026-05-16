import { useState } from 'react'
import { Card, Button, Input, Notification, toast } from '@/components/ui'
import { HiOutlineSave, HiOutlinePencilAlt } from 'react-icons/hi'
import Chart from '@/components/shared/Chart'
import classNames from '@/utils/classNames'
import { updateCollectionAnalysis } from '@/services/AdminService'

interface ScoresTabProps {
    collectionId: string
    userId: number
    adminAnalysis: string
    scores: {
        score_planning: number
        score_project_control: number
        score_risk_management: number
        score_team_leadership: number
        score_negotiation: number
        score_decision_making: number
    }
    onSaved: () => void
}

const SCORE_LABELS: Record<string, string> = {
    score_planning: 'برنامه‌ریزی',
    score_project_control: 'کنترل پروژه',
    score_risk_management: 'مدیریت ریسک',
    score_team_leadership: 'رهبری تیم',
    score_negotiation: 'مذاکره',
    score_decision_making: 'تصمیم‌گیری',
}

const SCORE_KEYS = Object.keys(SCORE_LABELS) as (keyof typeof SCORE_LABELS)[]

const ScoresTab = ({ collectionId, userId, adminAnalysis, scores, onSaved }: ScoresTabProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempScores, setTempScores] = useState(scores)
    const [saving, setSaving] = useState(false)

    const categories = SCORE_KEYS.map(k => SCORE_LABELS[k])
    const series = SCORE_KEYS.map(k => scores[k as keyof typeof scores] ?? 0)
    const tempSeries = SCORE_KEYS.map(k => tempScores[k as keyof typeof tempScores] ?? 0)

    const handleScoreChange = (key: string, value: number) => {
        setTempScores(prev => ({ ...prev, [key]: Math.min(100, Math.max(0, value)) }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateCollectionAnalysis(collectionId, {
                user_id: userId,
                admin_analysis: adminAnalysis,
                ...tempScores,
            })
            toast.push(<Notification type="success">امتیازات با موفقیت ذخیره شد</Notification>)
            setIsEditing(false)
            onSaved()
        } catch (error) {
            toast.push(<Notification type="danger">خطا در ذخیره امتیازات</Notification>)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    امتیاز عملکرد متقاضی
                </h4>
                {!isEditing ? (
                    <Button size="sm" variant="plain" icon={<HiOutlinePencilAlt />}
                        onClick={() => { setTempScores(scores); setIsEditing(true) }}>
                        ویرایش
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button size="sm" variant="plain" onClick={() => setIsEditing(false)}>انصراف</Button>
                        <Button size="sm" variant="solid" icon={<HiOutlineSave />} onClick={handleSave} loading={saving}>
                            ذخیره
                        </Button>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="space-y-4 mb-6">
                    <h5 className="font-semibold text-gray-900 dark:text-white">ویرایش امتیازات</h5>
                    {SCORE_KEYS.map((key, index) => (
                        <div key={key} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">{SCORE_LABELS[key]}</label>
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={tempScores[key as keyof typeof tempScores]}
                                    onChange={(e) => handleScoreChange(key, parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6">
                <Chart
                    type="radar"
                    customOptions={{
                        xaxis: { categories },
                        yaxis: { show: false },
                    }}
                    series={[{
                        name: 'امتیاز عملکرد',
                        data: isEditing ? tempSeries : series,
                    }]}
                    height={250}
                />
                <div className="flex flex-col gap-4 mt-6">
                    {categories.map((category, index) => {
                        const val = isEditing ? tempSeries[index] : series[index]
                        return (
                            <div key={category + index} className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full h-8 w-8 border-2 border-gray-200 dark:border-gray-600 font-bold text-gray-900 dark:text-white flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-white">{category}</div>
                                </div>
                                <div className="border-dashed border-[1.5px] border-gray-300 dark:border-gray-500 flex-1" />
                                <span className={classNames(
                                    'rounded-full px-2 py-1 text-white',
                                    val > 75 && 'bg-success',
                                    val <= 30 && 'bg-error',
                                    val > 30 && val <= 75 && 'bg-warning',
                                )}>
                                    {val}%
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}

export default ScoresTab
