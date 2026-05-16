import { useState } from 'react'
import { Button, Notification, toast } from '@/components/ui'
import { HiOutlineSave, HiOutlinePencilAlt } from 'react-icons/hi'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { updateCollectionAnalysis } from '@/services/AdminService'

interface AnalysisTabProps {
    collectionId: string
    userId: number
    adminAnalysis: string
    allScores: {
        score_planning: number
        score_project_control: number
        score_risk_management: number
        score_team_leadership: number
        score_negotiation: number
        score_decision_making: number
    }
    onSaved: () => void
}

const AnalysisTab = ({ collectionId, userId, adminAnalysis, allScores, onSaved }: AnalysisTabProps) => {
    const [analysis, setAnalysis] = useState(adminAnalysis || '')
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateCollectionAnalysis(collectionId, {
                user_id: userId,
                admin_analysis: analysis,
                ...allScores,
            })
            toast.push(<Notification type="success">تحلیل با موفقیت ذخیره شد</Notification>)
            setIsEditing(false)
            onSaved()
        } catch (error) {
            toast.push(<Notification type="danger">خطا در ذخیره تحلیل</Notification>)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    تحلیل نتایج آزمون
                </h4>
                {!isEditing ? (
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<HiOutlinePencilAlt />}
                        onClick={() => setIsEditing(true)}
                    >
                        ویرایش
                    </Button>
                ) : null}
            </div>

            <RichTextEditor
                value={analysis}
                onChange={setAnalysis}
                readOnly={!isEditing}
                minHeight={400}
                placeholder="تحلیل نتایج را وارد کنید..."
            />

            {isEditing && (
                <div className="mt-4 flex justify-end gap-3">
                    <Button variant="default" onClick={() => { setIsEditing(false); setAnalysis(adminAnalysis || '') }}>
                        انصراف
                    </Button>
                    <Button variant="solid" icon={<HiOutlineSave />} onClick={handleSave} loading={saving}>
                        ذخیره تحلیل
                    </Button>
                </div>
            )}
        </div>
    )
}

export default AnalysisTab
