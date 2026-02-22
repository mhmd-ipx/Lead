import { useEffect, useState } from 'react'
import { useExaminerSessionStore } from '@/views/auth/SignIn/components/ExaminerSignInForm'

const pad = (n: number) => String(n).padStart(2, '0')

function calcRemaining(endDatetime: string) {
    const end = new Date(endDatetime).getTime()
    const now = Date.now()
    const diff = Math.max(0, Math.floor((end - now) / 1000))
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    const seconds = diff % 60
    return { days, hours, minutes, seconds, total: diff }
}

const ExamInfoBar = () => {
    const examData = useExaminerSessionStore((s) => s.examData)
    const [remaining, setRemaining] = useState(() =>
        examData?.collection.end_datetime
            ? calcRemaining(examData.collection.end_datetime)
            : null,
    )

    useEffect(() => {
        if (!examData?.collection.end_datetime) return
        const id = setInterval(() => {
            setRemaining(calcRemaining(examData.collection.end_datetime))
        }, 1000)
        return () => clearInterval(id)
    }, [examData?.collection.end_datetime])

    if (!examData) return null

    const { total_exams, end_datetime } = examData.collection
    const expired = remaining ? remaining.total === 0 : false

    return (
        <div
            dir="rtl"
            className="flex items-center gap-4 text-sm font-medium"
        >
            {/* Total exams badge */}
            <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-700">
                <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
                <span>{total_exams} آزمون</span>
            </div>

            {/* Countdown timer */}
            {remaining !== null && (
                <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${expired
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700'
                        : remaining.total < 3600
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700'
                            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                        }`}
                >
                    <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    {expired ? (
                        <span>مهلت پایان یافت</span>
                    ) : (
                        <span className="tabular-nums tracking-wide">
                            {remaining.days > 0 && `${remaining.days} روز و `}
                            {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export default ExamInfoBar
