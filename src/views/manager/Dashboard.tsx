import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import { useExaminerSessionStore } from '@/views/auth/SignIn/components/ExaminerSignInForm'
import {
    HiOutlineWifi,
    HiOutlineShieldExclamation,
    HiOutlineDesktopComputer,
    HiOutlineLockClosed,
    HiOutlineVolumeOff,
    HiOutlineClock,
    HiOutlineAcademicCap,
    HiOutlineChevronLeft
} from 'react-icons/hi'

const guidelines = [
    {
        icon: <HiOutlineWifi className="w-6 h-6" />,
        color: 'indigo',
        title: 'اتصال اینترنت پایدار',
        description: 'پیش از شروع آزمون، از پایداری و کیفیت اتصال اینترنت خود مطمئن شوید. قطع‌شدن ناگهانی ارتباط ممکن است روند آزمون را مختل کند.',
    },
    {
        icon: <HiOutlineShieldExclamation className="w-6 h-6" />,
        color: 'rose',
        title: 'VPN را خاموش کنید',
        description: 'لطفاً قبل از ورود به آزمون، VPN یا هر نرم‌افزار تغییر IP را غیرفعال کنید. استفاده از VPN می‌تواند موجب اختلال در ارتباط با سرور و ثبت نشدن پاسخ‌ها شود.',
    },
    {
        icon: <HiOutlineDesktopComputer className="w-6 h-6" />,
        color: 'blue',
        title: 'مرورگر مناسب و سیستم کامپیوتری',
        description: 'توصیه می‌شود آزمون را روی کامپیوتر یا لپ‌تاپ انجام دهید؛ ورود از طریق موبایل ممکن است تجربه کاربری مناسبی نداشته باشد. همچنین از آخرین نسخه مرورگرهای Chrome، Firefox یا Edge استفاده کنید.',
    },
    {
        icon: <HiOutlineLockClosed className="w-6 h-6" />,
        color: 'amber',
        title: 'آزمون‌ها قابل ویرایش نیستند',
        description: 'پس از ثبت و ذخیره هر آزمون، امکان بازگشت و ویرایش آن وجود ندارد. پیش از تأیید نهایی، پاسخ‌های خود را با دقت بررسی کنید.',
    },
    {
        icon: <HiOutlineVolumeOff className="w-6 h-6" />,
        color: 'emerald',
        title: 'محیط آرام و مناسب',
        description: 'در محلی آرام و بدون حواس‌پرتی بنشینید. تمرکز کافی داشته باشید و در طول آزمون از مزاحمت دیگران جلوگیری کنید تا بتوانید با آرامش پاسخ دهید.',
    },
    {
        icon: <HiOutlineClock className="w-6 h-6" />,
        color: 'violet',
        title: 'مدیریت زمان',
        description: 'هر آزمون دارای زمان مشخصی است. تایمر را در هدر صفحه دنبال کنید. پس از اتمام مهلت، آزمون به‌صورت خودکار پایان می‌یابد.',
    },
]

const colorMap: Record<string, { bg: string; icon: string; border: string; iconBg: string }> = {
    indigo: { 
        bg: 'bg-indigo-50/40 dark:bg-indigo-950/10 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/20', 
        icon: 'text-indigo-600 dark:text-indigo-400', 
        border: 'border-indigo-100/80 dark:border-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800/50',
        iconBg: 'bg-indigo-100/80 dark:bg-indigo-900/40'
    },
    rose: { 
        bg: 'bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/70 dark:hover:bg-rose-950/20', 
        icon: 'text-rose-600 dark:text-rose-400', 
        border: 'border-rose-100/80 dark:border-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800/50',
        iconBg: 'bg-rose-100/80 dark:bg-rose-900/40'
    },
    blue: { 
        bg: 'bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-50/70 dark:hover:bg-blue-950/20', 
        icon: 'text-blue-600 dark:text-blue-400', 
        border: 'border-blue-100/80 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800/50',
        iconBg: 'bg-blue-100/80 dark:bg-blue-900/40'
    },
    amber: { 
        bg: 'bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-50/70 dark:hover:bg-amber-950/20', 
        icon: 'text-amber-600 dark:text-amber-400', 
        border: 'border-amber-100/80 dark:border-amber-900/30 hover:border-amber-200 dark:hover:border-amber-800/50',
        iconBg: 'bg-amber-100/80 dark:bg-amber-900/40'
    },
    emerald: { 
        bg: 'bg-emerald-50/40 dark:bg-emerald-950/10 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/20', 
        icon: 'text-emerald-600 dark:text-emerald-400', 
        border: 'border-emerald-100/80 dark:border-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-800/50',
        iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40'
    },
    violet: { 
        bg: 'bg-violet-50/40 dark:bg-violet-950/10 hover:bg-violet-50/70 dark:hover:bg-violet-950/20', 
        icon: 'text-violet-600 dark:text-violet-400', 
        border: 'border-violet-100/80 dark:border-violet-900/30 hover:border-violet-200 dark:hover:border-violet-800/50',
        iconBg: 'bg-violet-100/80 dark:bg-violet-900/40'
    },
}

const Dashboard = () => {
    const navigate = useNavigate()
    const examData = useExaminerSessionStore((s) => s.examData)

    return (
        <Container>
            <div dir="rtl" className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header greeting */}
                <div className="mb-10 text-center space-y-2">
                    {examData?.user.name && (
                        <span className="inline-block px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold text-sm">
                            خوش آمدید، {examData.user.name} عزیز
                        </span>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                        راهنمای جامع شرکت در آزمون
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        پیش از شروع آزمون، لطفاً موارد زیر را با دقت مطالعه فرمایید تا از بروز هرگونه مشکل احتمالی جلوگیری شود.
                    </p>
                </div>

                {/* Guidelines grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {guidelines.map((item, idx) => {
                        const c = colorMap[item.color]
                        return (
                            <div
                                key={idx}
                                className={`flex gap-4 p-5 rounded-2xl border ${c.bg} ${c.border} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
                            >
                                <div className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${c.iconBg} ${c.icon}`}>
                                    {item.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* CTA section */}
                <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-8 text-center shadow-sm max-w-2xl mx-auto">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <svg className="w-7 h-7 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                        آماده‌اید؟ بریم سراغ آزمون! 🎯
                    </h2>
                    <p className="text-base text-gray-700 dark:text-gray-200 mb-6 leading-relaxed font-semibold">
                        اگر تمام موارد بالا را مطالعه و شرایط لازم را مهیا کرده‌اید، می‌توانید آزمون خود را شروع کنید.
                    </p>
                    <button
                        onClick={() => navigate('/manager/exams')}
                        className="inline-flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg transition-all duration-300 active:scale-95 hover:shadow-violet-200 dark:hover:shadow-violet-950"
                    >
                        <HiOutlineAcademicCap className="w-5.5 h-5.5" />
                        مشاهده و شروع آزمون
                        <HiOutlineChevronLeft className="w-4 h-4 mr-1" />
                    </button>
                </div>

            </div>
        </Container>
    )
}

export default Dashboard
