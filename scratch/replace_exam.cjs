const fs = require('fs');

const filePath = 'x:/Projects developments/LEAD Project/src/views/manager/MyExamStart.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF (\n) to prevent CRLF matching issues
content = content.replace(/\r\n/g, '\n');

// Target 1: State variables
const target1 = `    const [loading, setLoading] = useState(true)
    const [examDetails, setExamDetails] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [submitting, setSubmitting] = useState(false)`;

const replacement1 = `    const [loading, setLoading] = useState(true)
    const [examDetails, setExamDetails] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [submittedWithErrors, setSubmittedWithErrors] = useState(false)
    const [scrollToQuestionId, setScrollToQuestionId] = useState<number | null>(null)`;

// Target 2: useEffect for scrolling
const target2 = `        initExam()
    }, [examId])`;

const replacement2 = `        initExam()
    }, [examId])

    useEffect(() => {
        if (scrollToQuestionId) {
            const timer = setTimeout(() => {
                const element = document.getElementById(\`question-card-\${scrollToQuestionId}\`)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    setScrollToQuestionId(null)
                }
            }, 150)
            return () => clearTimeout(timer)
        }
    }, [scrollToQuestionId, currentStep])`;

// Target 3: handleSubmit validation
const target3 = `    const handleSubmit = async () => {
        // Validation: Ensure all questions in all sections are answered
        const sections = examDetails.sections || []
        const allQuestions = sections.flatMap((s: any) => s.questions || [])
        const unansweredCount = allQuestions.filter((q: any) => {
            const ans = answers[q.id]
            if (!ans) return true
            if (q.type === 'check_box') {
                try { return JSON.parse(ans).length === 0 } catch { return true }
            }
            return false
        }).length

        if (unansweredCount > 0) {
            toast.push(
                <Notification title="هشدار" type="warning">
                    لطفاً به تمام سوالات ({unansweredCount} سوال باقیمانده) پاسخ دهید.
                </Notification>
            )
            return
        }`;

const replacement3 = `    const handleSubmit = async () => {
        // Validation: Ensure all questions in all sections are answered
        const sections = examDetails.sections || []
        
        let firstUnansweredQId: number | null = null
        let firstUnansweredSectionIndex = -1
        let unansweredCount = 0

        sections.forEach((sec: any, secIdx: number) => {
            sec.questions?.forEach((q: any) => {
                const ans = answers[q.id]
                let isUnanswered = false
                if (!ans) {
                    isUnanswered = true
                } else if (q.type === 'check_box') {
                    try {
                        if (JSON.parse(ans).length === 0) isUnanswered = true
                    } catch {
                        isUnanswered = true
                    }
                }

                if (isUnanswered) {
                    unansweredCount++
                    if (firstUnansweredQId === null) {
                        firstUnansweredQId = q.id
                        firstUnansweredSectionIndex = secIdx
                    }
                }
            })
        })

        if (unansweredCount > 0) {
            setSubmittedWithErrors(true)
            
            toast.push(
                <Notification title="هشدار" type="warning">
                    لطفاً به تمام سوالات ({unansweredCount} سوال باقیمانده) پاسخ دهید.
                </Notification>
            )

            if (firstUnansweredSectionIndex !== -1) {
                if (firstUnansweredSectionIndex !== currentStep) {
                    setCurrentStep(firstUnansweredSectionIndex)
                }
                setScrollToQuestionId(firstUnansweredQId)
            }
            return
        }`;

// Target 4: Card map start
const target4 = `                        <div className="space-y-6">
                            {(currentSection.questions || []).map((q: any, index: number) => (
                                <Card
                                    key={q.id}
                                    className={\`transition-all duration-300 \${answers[q.id]
                                        ? 'border-emerald-200 dark:border-emerald-800 ring-4 ring-emerald-50 dark:ring-emerald-900/10'
                                        : 'border-gray-100 dark:border-gray-700'
                                        }\`}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className={\`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm \${answers[q.id]
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                }\`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <h4
                                                    className="text-lg font-bold text-gray-900 dark:text-white leading-loose prose dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: q.question }}
                                                />
                                                {(q.file_id || q.file?.address) && (
                                                    <div className="mt-4">
                                                        <QuestionFileImage
                                                            fileId={q.file_id}
                                                            fallbackUrl={q.file?.address}
                                                            className="max-h-64 w-auto rounded-xl border object-contain shadow-sm"
                                                        />
                                                    </div>
                                                )}

                                            </div>
                                        </div>`;

const replacement4 = `                        <div className="space-y-6">
                            {(currentSection.questions || []).map((q: any, index: number) => (() => {
                                const isAnswered = (() => {
                                    const ans = answers[q.id]
                                    if (!ans) return false
                                    if (q.type === 'check_box') {
                                        try { return JSON.parse(ans).length > 0 } catch { return false }
                                    }
                                    return true
                                })()
                                const isUnansweredError = submittedWithErrors && !isAnswered

                                return (
                                    <Card
                                        key={q.id}
                                        id={\`question-card-\${q.id}\`}
                                        className={\`transition-all duration-300 \${isAnswered
                                            ? 'border-emerald-200 dark:border-emerald-800 ring-4 ring-emerald-50 dark:ring-emerald-900/10'
                                            : isUnansweredError
                                                ? 'border-rose-300 dark:border-rose-800 ring-4 ring-rose-50 dark:ring-rose-950/20 bg-rose-50/5'
                                                : 'border-gray-100 dark:border-gray-700'
                                            }\`}
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className={\`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm transition-all duration-300 \${isAnswered
                                                    ? 'bg-emerald-500 text-white'
                                                    : isUnansweredError
                                                        ? 'bg-rose-500 text-white animate-pulse'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                    }\`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                        <h4
                                                            className="text-lg font-bold text-gray-900 dark:text-white leading-loose prose dark:prose-invert max-w-none flex-1"
                                                            dangerouslySetInnerHTML={{ __html: q.question }}
                                                        />
                                                        {isUnansweredError && (
                                                            <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 px-3 py-1.5 rounded-lg shrink-0 w-fit animate-bounce whitespace-nowrap">
                                                                ⚠️ لطفاً به این سوال پاسخ دهید
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(q.file_id || q.file?.address) && (
                                                        <div className="mt-4">
                                                            <QuestionFileImage
                                                                fileId={q.file_id}
                                                                fallbackUrl={q.file?.address}
                                                                className="max-h-64 w-auto rounded-xl border object-contain shadow-sm"
                                                            />
                                                        </div>
                                                    )}

                                                </div>
                                            </div>`;

// Target 5: Card map end
const target5 = `                                    </div>
                                </Card>
                            ))}
                        </div>`;

const replacement5 = `                                    </div>
                                </Card>
                            })())}
                        </div>`;

// Apply replacements
if (!content.includes(target1)) {
    console.error("Error: Target 1 not found!");
    process.exit(1);
}
content = content.replace(target1, replacement1);

if (!content.includes(target2)) {
    console.error("Error: Target 2 not found!");
    process.exit(1);
}
content = content.replace(target2, replacement2);

if (!content.includes(target3)) {
    console.error("Error: Target 3 not found!");
    process.exit(1);
}
content = content.replace(target3, replacement3);

if (!content.includes(target4)) {
    console.error("Error: Target 4 not found!");
    process.exit(1);
}
content = content.replace(target4, replacement4);

if (!content.includes(target5)) {
    console.error("Error: Target 5 not found!");
    process.exit(1);
}
content = content.replace(target5, replacement5);

// Convert back to CRLF to respect original line endings
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Success! All replacements made successfully!");
