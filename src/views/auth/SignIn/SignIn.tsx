import { useState } from 'react'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useThemeStore } from '@/store/themeStore'
import classNames from '@/utils/classNames'

type SignInProps = {
    disableSubmit?: boolean
}

export const SignInBase = ({
    disableSubmit,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()
    const [messageType, setMessageType] = useState<'success' | 'danger'>('danger')

    const mode = useThemeStore(state => state.mode)

    const handleSetMessage = (msg: string, type: 'success' | 'danger' = 'danger') => {
        setMessageType(type)
        setMessage(msg)
    }

    return (
        <div dir="rtl" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 text-center scale-up-center">
                <img
                    src="/img/logo/logo-light-full.png"
                    className="mx-auto"
                    style={{ width: '240px' }}
                    alt="Logo"
                />
            </div>
            <div className="mb-10 text-center">
                <h1 className="mb-4 text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400 leading-relaxed">
                    پروژه ارزیابی و توسعه مدیران
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                    خوش آمدید! لطفاً شماره موبایل خود را وارد کنید
                </p>
            </div>
            {message && (
                <Alert
                    showIcon
                    className={classNames(
                        "mb-6 rounded-xl shadow-sm border",
                        messageType === 'success'
                            ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                            : "border-red-100 bg-red-50 text-red-600"
                    )}
                    type={messageType}
                >
                    <span className="break-all font-medium">{message}</span>
                </Alert>
            )}
            <SignInForm
                disableSubmit={disableSubmit}
                setMessage={handleSetMessage}
                className="mt-2"
            />
        </div>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
