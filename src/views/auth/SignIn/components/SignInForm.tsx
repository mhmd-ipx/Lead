import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import OTPInput from '@/components/shared/OtpInput'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
}

type PhoneFormSchema = {
    phone: string
}

type OTPFormSchema = {
    otp: string
}

type EmailPasswordFormSchema = {
    email: string
    password: string
}

const phoneValidationSchema: ZodType<PhoneFormSchema> = z.object({
    phone: z
        .string({ required_error: 'لطفاً شماره موبایل خود را وارد کنید' })
        .min(10, { message: 'لطفاً شماره موبایل معتبر وارد کنید' })
        .regex(/^09\d{9}$/, { message: 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد' }),
})

const otpValidationSchema: ZodType<OTPFormSchema> = z.object({
    otp: z
        .string({ required_error: 'لطفاً کد OTP را وارد کنید' })
        .length(6, { message: 'کد OTP باید 6 رقم باشد' }),
})

const emailPasswordValidationSchema: ZodType<EmailPasswordFormSchema> = z.object({
    email: z
        .string({ required_error: 'لطفاً ایمیل خود را وارد کنید' })
        .email({ message: 'لطفاً ایمیل معتبر وارد کنید' }),
    password: z
        .string({ required_error: 'لطفاً رمز عبور خود را وارد کنید' })
        .min(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' }),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [step, setStep] = useState<'phone' | 'otp' | 'emailPassword'>('phone')
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [timer, setTimer] = useState<number>(120) // 2 minutes in seconds
    const [canResend, setCanResend] = useState<boolean>(false)

    const { disableSubmit = false, className, setMessage } = props

    // Timer countdown effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [step, timer])

    const phoneForm = useForm<PhoneFormSchema>({
        defaultValues: {
            phone: '09120000000',
        },
        resolver: zodResolver(phoneValidationSchema),
    })

    const otpForm = useForm<OTPFormSchema>({
        defaultValues: {
            otp: '',
        },
        resolver: zodResolver(otpValidationSchema),
    })

    const emailPasswordForm = useForm<EmailPasswordFormSchema>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: zodResolver(emailPasswordValidationSchema),
    })

    const { signIn } = useAuth()

    const onSendOTP = async (values: PhoneFormSchema) => {
        const { phone } = values
        setPhoneNumber(phone)

        if (!disableSubmit) {
            setSubmitting(true)

            // Mock sending OTP - in real app, call API
            setTimeout(() => {
                setStep('otp')
                setTimer(120) // Reset timer to 2 minutes
                setCanResend(false)
                setSubmitting(false)
                setMessage?.('کد OTP به شماره موبایل شما ارسال شد')
            }, 1000)
        }
    }

    const onVerifyOTP = async (values: OTPFormSchema) => {
        const { otp } = values

        if (!disableSubmit) {
            setSubmitting(true)

            const result = await signIn({ phone: phoneNumber, otp })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            } else {
                // Success - handled by auth
            }
        }

        setSubmitting(false)
    }

    const handleBack = () => {
        setStep('phone')
        setMessage?.('')
    }

    const handleSwitchToEmailPassword = () => {
        setStep('emailPassword')
        setMessage?.('')
    }

    const onEmailPasswordSignIn = async (values: EmailPasswordFormSchema) => {
        const { email, password } = values

        if (!disableSubmit) {
            setSubmitting(true)

            const result = await signIn({ email, password })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        }

        setSubmitting(false)
    }

    const handleResendOTP = async () => {
        if (!disableSubmit && canResend) {
            setSubmitting(true)

            // Mock resending OTP - in real app, call API
            setTimeout(() => {
                setTimer(120) // Reset timer to 2 minutes
                setCanResend(false)
                setSubmitting(false)
                setMessage?.('کد OTP مجدداً به شماره موبایل شما ارسال شد')
            }, 1000)
        }
    }

    return (
        <div className={className}>
            {step === 'phone' ? (
                <>
                    <Form onSubmit={phoneForm.handleSubmit(onSendOTP)}>
                        <FormItem
                            label="شماره موبایل"
                            invalid={Boolean(phoneForm.formState.errors.phone)}
                            errorMessage={phoneForm.formState.errors.phone?.message}
                        >
                            <Controller
                                name="phone"
                                control={phoneForm.control}
                                render={({ field }) => (
                                    <Input
                                        type="tel"
                                        placeholder="09123456789"
                                        autoComplete="off"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            {isSubmitting ? 'در حال ارسال...' : 'ارسال کد تایید'}
                        </Button>
                    </Form>
                    <div className="mt-4">
                        <Button
                            block
                            variant="plain"
                            type="button"
                            onClick={handleSwitchToEmailPassword}
                        >
                            ورود با نام کاربری و رمز عبور
                        </Button>
                    </div>
                </>
            ) : step === 'otp' ? (
                <div>
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                            کد 6 رقمی به شماره {phoneNumber} ارسال شد
                        </p>
                        <div className="mt-2">
                            {timer > 0 ? (
                                <p className="text-sm font-semibold text-primary">
                                    زمان باقیمانده: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                </p>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="plain"
                                    type="button"
                                    onClick={handleResendOTP}
                                    loading={isSubmitting}
                                    disabled={!canResend}
                                >
                                    ارسال مجدد کد
                                </Button>
                            )}
                        </div>
                    </div>
                    <Form onSubmit={otpForm.handleSubmit(onVerifyOTP)}>
                        <FormItem
                            label="کد OTP"
                            invalid={Boolean(otpForm.formState.errors.otp)}
                            errorMessage={otpForm.formState.errors.otp?.message}
                        >
                            <Controller
                                name="otp"
                                control={otpForm.control}
                                render={({ field }) => (
                                    <OTPInput
                                        length={6}
                                        placeholder="0"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <div className="flex gap-2">
                            <Button
                                block
                                variant="plain"
                                type="button"
                                onClick={handleBack}
                            >
                                بازگشت
                            </Button>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting ? 'ورود...' : 'ورود'}
                            </Button>
                        </div>
                    </Form>
                </div>
            ) : (
                <div>
                    <Form onSubmit={emailPasswordForm.handleSubmit(onEmailPasswordSignIn)}>
                        <FormItem
                            label="ایمیل"
                            invalid={Boolean(emailPasswordForm.formState.errors.email)}
                            errorMessage={emailPasswordForm.formState.errors.email?.message}
                        >
                            <Controller
                                name="email"
                                control={emailPasswordForm.control}
                                render={({ field }) => (
                                    <Input
                                        type="email"
                                        placeholder="example@email.com"
                                        autoComplete="email"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="رمز عبور"
                            invalid={Boolean(emailPasswordForm.formState.errors.password)}
                            errorMessage={emailPasswordForm.formState.errors.password?.message}
                        >
                            <Controller
                                name="password"
                                control={emailPasswordForm.control}
                                render={({ field }) => (
                                    <Input
                                        type="password"
                                        placeholder="••••••"
                                        autoComplete="current-password"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <div className="flex gap-2">
                            <Button
                                block
                                variant="plain"
                                type="button"
                                onClick={handleBack}
                            >
                                بازگشت
                            </Button>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting ? 'ورود...' : 'ورود'}
                            </Button>
                        </div>
                    </Form>
                </div>
            )}
        </div>
    )
}

export default SignInForm
