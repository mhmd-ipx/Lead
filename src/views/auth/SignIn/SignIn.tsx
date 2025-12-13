import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useThemeStore } from '@/store/themeStore'

type SignInProps = {
    disableSubmit?: boolean
}

export const SignInBase = ({
    disableSubmit,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()

    const mode = useThemeStore(state => state.mode)

    return (
        <div dir="rtl">
            <div className="mb-8 text-center">
                <Logo type="streamline" mode={mode} imgClass="mx-auto" logoWidth={60} />
            </div>
            <div className="mb-10 text-center">
                <h2 className="mb-2">به پنل آزمون و ارزیابی مدیران لد خوش آمدید</h2>
                <p className="font-semibold heading-text">
                    لطفاً شماره موبایل خود را وارد کنید
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignInForm
                disableSubmit={disableSubmit}
                setMessage={setMessage}
            />
        </div>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
