import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import ExaminerSignInForm from './components/ExaminerSignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useThemeStore } from '@/store/themeStore'
import classNames from '@/utils/classNames'

type Tab = 'employer' | 'examiner'

type SignInProps = {
    disableSubmit?: boolean
}

export const SignInBase = ({ disableSubmit }: SignInProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('employer')
    const [employerMessage, setEmployerMessage] = useTimeOutMessage()
    const [employerMessageType, setEmployerMessageType] = useState<'success' | 'danger'>('danger')
    const [examinerMessage, setExaminerMessage] = useTimeOutMessage()
    const [examinerMessageType, setExaminerMessageType] = useState<'success' | 'danger'>('danger')

    const mode = useThemeStore((state) => state.mode)

    const handleEmployerMessage = (msg: string, type: 'success' | 'danger' = 'danger') => {
        setEmployerMessageType(type)
        setEmployerMessage(msg)
    }

    const handleExaminerMessage = (msg: string, type: 'success' | 'danger' = 'danger') => {
        setExaminerMessageType(type)
        setExaminerMessage(msg)
    }

    return (
        <div dir="rtl" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Logo */}
            <div className="mb-8 text-center scale-up-center">
                <img
                    src="/img/logo/logo-light-full.png"
                    className="mx-auto"
                    style={{ width: '220px' }}
                    alt="Logo"
                />
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
                <h1 className="mb-2 text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400 leading-relaxed">
                    پروژه ارزیابی و توسعه مدیران
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                    نوع ورود خود را انتخاب کنید
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="relative flex rounded-xl p-1 mb-6 bg-gray-100 dark:bg-gray-800">
                {/* Sliding indicator */}
                <div
                    className={classNames(
                        'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-md transition-all duration-300 ease-in-out',
                        activeTab === 'employer'
                            ? 'right-1 bg-gradient-to-r from-blue-600 to-indigo-600'
                            : 'left-1 bg-gradient-to-r from-violet-600 to-purple-600',
                    )}
                />

                <button
                    type="button"
                    onClick={() => setActiveTab('employer')}
                    className={classNames(
                        'relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 select-none',
                        activeTab === 'employer'
                            ? 'text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                    )}
                >
                    <span className="flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        ورود کارفرما
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('examiner')}
                    className={classNames(
                        'relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 select-none',
                        activeTab === 'examiner'
                            ? 'text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                    )}
                >
                    <span className="flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        ورود آزمون‌دهنده
                    </span>
                </button>
            </div>

            {/* Tab content with animation */}
            <div className="relative overflow-hidden">
                {/* Employer Tab */}
                <div
                    className={classNames(
                        'transition-all duration-300',
                        activeTab === 'employer'
                            ? 'opacity-100 translate-x-0 pointer-events-auto'
                            : 'opacity-0 translate-x-8 pointer-events-none absolute inset-0',
                    )}
                >
                    {employerMessage && (
                        <Alert
                            showIcon
                            className={classNames(
                                'mb-4 rounded-xl shadow-sm border text-sm',
                                employerMessageType === 'success'
                                    ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                    : 'border-red-100 bg-red-50 text-red-600',
                            )}
                            type={employerMessageType}
                        >
                            <span className="break-all font-medium">{employerMessage}</span>
                        </Alert>
                    )}
                    <SignInForm
                        disableSubmit={disableSubmit}
                        setMessage={handleEmployerMessage}
                        className="mt-1"
                    />
                </div>

                {/* Examiner Tab */}
                <div
                    className={classNames(
                        'transition-all duration-300',
                        activeTab === 'examiner'
                            ? 'opacity-100 translate-x-0 pointer-events-auto'
                            : 'opacity-0 -translate-x-8 pointer-events-none absolute inset-0',
                    )}
                >
                    {examinerMessage && (
                        <Alert
                            showIcon
                            className={classNames(
                                'mb-4 rounded-xl shadow-sm border text-sm',
                                examinerMessageType === 'success'
                                    ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                    : 'border-red-100 bg-red-50 text-red-600',
                            )}
                            type={examinerMessageType}
                        >
                            <span className="break-all font-medium">{examinerMessage}</span>
                        </Alert>
                    )}
                    <ExaminerSignInForm
                        disableSubmit={disableSubmit}
                        setMessage={handleExaminerMessage}
                        className="mt-1"
                    />
                </div>
            </div>
        </div>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
