import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import { useExaminerSessionStore } from '@/views/auth/SignIn/components/ExaminerSignInForm'

const guidelines = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
        ),
        color: 'blue',
        title: 'اتصال اینترنت پایدار',
        description: 'پیش از شروع آزمون، از پایداری و کیفیت اتصال اینترنت خود مطمئن شوید. قطع‌شدن ناگهانی ارتباط ممکن است روند آزمون را مختل کند.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 6.343a9 9 0 000 12.728M9.172 9.172a5 5 0 000 7.071M12 12h.01" />
            </svg>
        ),
        color: 'red',
        title: 'VPN را خاموش کنید',
        description: 'لطفاً قبل از ورود به آزمون، VPN یا هر نرم‌افزار تغییر IP را غیرفعال کنید. استفاده از VPN می‌تواند موجب اختلال در ارتباط با سرور و ثبت نشدن پاسخ‌ها شود.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        color: 'violet',
        title: 'مرورگر مناسب و سیستم کامپیوتری',
        description: 'توصیه می‌شود آزمون را روی کامپیوتر یا لپ‌تاپ انجام دهید؛ ورود از طریق موبایل ممکن است تجربه کاربری مناسبی نداشته باشد. همچنین از آخرین نسخه مرورگرهای Chrome، Firefox یا Edge استفاده کنید.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        color: 'amber',
        title: 'آزمون‌ها قابل ویرایش نیستند',
        description: 'پس از ثبت و ذخیره هر آزمون، امکان بازگشت و ویرایش آن وجود ندارد. پیش از تأیید نهایی، پاسخ‌های خود را با دقت بررسی کنید.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        color: 'emerald',
        title: 'محیط آرام و مناسب',
        description: 'در محلی آرام و بدون حواس‌پرتی بنشینید. تمرکز کافی داشته باشید و در طول آزمون از مزاحمت دیگران جلوگیری کنید تا بتوانید با آرامش پاسخ دهید.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: 'indigo',
        title: 'مدیریت زمان',
        description: 'هر آزمون دارای زمان مشخصی است. تایمر را در هدر صفحه دنبال کنید. پس از اتمام مهلت، آزمون به‌صورت خودکار پایان می‌یابد.',
    },
]

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-500 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-500 dark:text-red-400', border: 'border-red-100 dark:border-red-800' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-500 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-800' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-500 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-500 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
}

const Dashboard = () => {
    const navigate = useNavigate()
    const examData = useExaminerSessionStore((s) => s.examData)

    return (
        <Container>
            <div dir="rtl" className="max-w-3xl mx-auto py-8 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header greeting */}
                <div className="mb-8 text-center">
                    {examData?.user.name && (
                        <p className="text-base font-semibold text-violet-600 dark:text-violet-400 mb-1">
                            خوش آمدید، {examData.user.name} عزیز
                        </p>
                    )}
                    <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-3">
                        راهنمای شرکت در آزمون
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                        پیش از شروع آزمون، لطفاً موارد زیر را با دقت مطالعه فرمایید تا از بروز هرگونه مشکل جلوگیری شود.
                    </p>
                </div>

                {/* Guidelines grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {guidelines.map((item, idx) => {
                        const c = colorMap[item.color]
                        return (
                            <div
                                key={idx}
                                className={`flex gap-4 p-4 rounded-2xl border ${c.bg} ${c.border} transition-all duration-200 hover:shadow-md`}
                            >
                                <div className={`shrink-0 mt-0.5 ${c.icon}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-100 text-base mb-1.5">
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* CTA section */}
                <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-6 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        آماده‌اید؟ بریم سراغ آزمون! 🎯
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                        اگر تمام موارد بالا را مطالعه کردید و شرایط لازم را دارید،
                        می‌توانید آزمون خود را شروع کنید.
                    </p>
                    <button
                        onClick={() => navigate('/manager/exams')}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg transition-all duration-200 active:scale-95 hover:shadow-violet-200 dark:hover:shadow-violet-900"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        مشاهده آزمون من
                        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

            </div>
        </Container>
    )
}

export default Dashboard
