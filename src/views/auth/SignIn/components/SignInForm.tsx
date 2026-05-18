import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import OTPInput from '@/components/shared/OtpInput'
import OtpCodeModal from './OtpCodeModal'
import { useAuth } from '@/auth'
import { apiSendOtp, apiVerifyOtp, apiLogin } from '@/services/AuthService'
import { useToken, useSessionUser } from '@/store/authStore'
import appConfig from '@/configs/app.config'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string, type?: 'success' | 'danger') => void
}

type PhoneFormSchema = {
    phone: string
}

type OTPFormSchema = {
    otp: string
}

type RegisterFormSchema = {
    name: string
    password?: string
}

type PhonePasswordFormSchema = {
    phone: string
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
        .length(4, { message: 'کد OTP باید 4 رقم باشد' }),
})

const registerValidationSchema: ZodType<RegisterFormSchema> = z.object({
    name: z
        .string({ required_error: 'لطفاً نام خود را وارد کنید' })
        .min(2, { message: 'نام باید حداقل 2 کاراکتر باشد' }),
    password: z.string().optional().or(z.literal('')),
})


const phonePasswordValidationSchema: ZodType<PhonePasswordFormSchema> = z.object({
    phone: z
        .string({ required_error: 'لطفاً شماره موبایل خود را وارد کنید' })
        .min(10, { message: 'لطفاً شماره موبایل معتبر وارد کنید' })
        .regex(/^09\d{9}$/, { message: 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد' }),
    password: z
        .string({ required_error: 'لطفاً رمز عبور خود را وارد کنید' })
        .min(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' }),
})

const SignInForm = (props: SignInFormProps) => {
    const navigate = useNavigate()
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [step, setStep] = useState<'phone' | 'otp' | 'register' | 'phonePassword'>('phone')
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [isRegistered, setIsRegistered] = useState<boolean>(true)
    const [timer, setTimer] = useState<number>(120) // 2 minutes in seconds
    const [canResend, setCanResend] = useState<boolean>(false)

    // OTP Code Modal States
    const [showOtpModal, setShowOtpModal] = useState<boolean>(false)
    const [otpCode, setOtpCode] = useState<string>('')
    const [otpExpiresAt, setOtpExpiresAt] = useState<string>('')

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
            phone: '',
        },
        resolver: zodResolver(phoneValidationSchema),
    })

    const otpForm = useForm<OTPFormSchema>({
        defaultValues: {
            otp: '',
        },
        resolver: zodResolver(otpValidationSchema),
    })

    const registerForm = useForm<RegisterFormSchema>({
        defaultValues: {
            name: '',
            password: '',
        },
        resolver: zodResolver(registerValidationSchema),
    })

    const phonePasswordForm = useForm<PhonePasswordFormSchema>({
        defaultValues: {
            phone: '',
            password: '',
        },
        resolver: zodResolver(phonePasswordValidationSchema),
    })

    const { signIn } = useAuth()

    const onSendOTP = async (values: PhoneFormSchema) => {
        const { phone } = values
        setPhoneNumber(phone)

        if (!disableSubmit) {
            setSubmitting(true)

            try {
                const response = await apiSendOtp({ phone })

                if (response.success) {
                    // ذخیره وضعیت ثبت‌نام کاربر
                    setIsRegistered(response.data.is_registered)

                    // نمایش کد OTP در مودال (فقط در حالت توسعه)
                    setOtpCode(response.data.code)
                    setOtpExpiresAt(response.data.expires_at)
                    setShowOtpModal(true)

                    // انتقال به مرحله وارد کردن OTP
                    setStep('otp')
                    setTimer(120) // Reset timer to 2 minutes
                    setCanResend(false)
                    setMessage?.(response.message || 'کد OTP به شماره موبایل شما ارسال شد', 'success')
                }
            } catch (error: any) {
                // هندل کردن خطاها
                const errorMessage = error?.message || 'خطا در ارسال کد تایید. لطفاً دوباره تلاش کنید.'
                setMessage?.(errorMessage)
            } finally {
                setSubmitting(false)
            }
        }
    }

    const onVerifyOTP = async (values: OTPFormSchema) => {
        const { otp } = values

        if (!disableSubmit) {
            setSubmitting(true)

            try {
                // اگر کاربر ثبت‌نام کرده، مستقیم verify می‌کنیم
                if (isRegistered) {
                    const response = await apiVerifyOtp({
                        phone: phoneNumber,
                        code: otp,
                    })

                    console.log('🔐 Verify Response in Form:', response)

                    if (response.success) {
                        // بررسی نقش کاربر - مدیر نمی‌تواند از این فرم وارد شود
                        const userRole = response.data.user.role
                        if (userRole === 'manager') {
                            setMessage?.('شما باید از ورود آزمون‌دهنده وارد شوید')
                            return
                        }

                        // لاگین موفق - مستقیماً از response استفاده می‌کنیم
                        const { setToken } = useToken()
                        const { setUser, setSessionSignedIn } = useSessionUser.getState()

                        // ذخیره token
                        setToken(response.data.token)

                        // Map و ذخیره user
                        const mappedUser = {
                            userId: response.data.user.id?.toString() || null,
                            userName: response.data.user.name || null,
                            phone: response.data.user.phone || null,
                            avatar: response.data.user.avatar || null,
                            authority: response.data.user.role ? [response.data.user.role] : [],
                        }

                        setUser(mappedUser)
                        setSessionSignedIn(true)

                        console.log('✅ Login successful, redirecting...')

                        // Redirect به dashboard
                        navigate(appConfig.authenticatedEntryPath)
                    }
                } else {
                    // کاربر ثبت‌نام نکرده - انتقال به فرم ثبت‌نام
                    setStep('register')
                    setMessage?.('لطفاً برای تکمیل ثبت‌نام، نام خود را وارد کنید', 'success')
                }
            } catch (error: any) {
                console.error('❌ Verify Error:', error)
                const errorMessage = error?.message || 'کد تایید نامعتبر یا منقضی شده است'
                setMessage?.(errorMessage)
            } finally {
                setSubmitting(false)
            }
        }
    }


    const handleBack = () => {
        setStep('phone')
        setMessage?.('')
    }

    const handleSwitchToPhonePassword = () => {
        setStep('phonePassword')
        setMessage?.('')
    }

    const onRegisterSubmit = async (values: RegisterFormSchema) => {
        const { name, password } = values

        if (!disableSubmit) {
            setSubmitting(true)

            try {
                // ارسال درخواست verify با اطلاعات ثبت‌نام
                const response = await apiVerifyOtp({
                    phone: phoneNumber,
                    code: otpForm.getValues('otp'),
                    data: {
                        name,
                        password,
                    },
                })

                console.log('🔐 Register Response:', response)

                if (response.success) {
                    // ثبت‌نام و لاگین موفق - مستقیماً از response استفاده می‌کنیم
                    const { setToken } = useToken()
                    const { setUser, setSessionSignedIn } = useSessionUser.getState()

                    // ذخیره token
                    setToken(response.data.token)

                    // Map و ذخیره user
                    const mappedUser = {
                        userId: response.data.user.id?.toString() || null,
                        userName: response.data.user.name || null,
                        phone: response.data.user.phone || null,
                        avatar: response.data.user.avatar || null,
                        authority: response.data.user.role ? [response.data.user.role] : [],
                    }

                    setUser(mappedUser)
                    setSessionSignedIn(true)

                    console.log('✅ Register successful, redirecting...')

                    // Redirect به dashboard
                    navigate(appConfig.authenticatedEntryPath)
                }
            } catch (error: any) {
                console.error('❌ Register Error:', error)
                const errorMessage = error?.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.'
                setMessage?.(errorMessage)
            } finally {
                setSubmitting(false)
            }
        }
    }



    const onPhonePasswordSignIn = async (values: PhonePasswordFormSchema) => {
        const { phone, password } = values

        if (!disableSubmit) {
            setSubmitting(true)

            try {
                const response = await apiLogin({ phone, password })

                console.log('🔐 Login Response:', response)

                if (response.success) {
                    // بررسی نقش کاربر - مدیر نمی‌تواند از این فرم وارد شود
                    const userRole = response.data.user.role
                    if (userRole === 'manager') {
                        setMessage?.('شما باید از ورود آزمون‌دهنده وارد شوید')
                        return
                    }

                    // لاگین موفق
                    const { setToken } = useToken()
                    const { setUser, setSessionSignedIn } = useSessionUser.getState()

                    // ذخیره token
                    setToken(response.data.token)

                    // Map و ذخیره user
                    const mappedUser = {
                        userId: response.data.user.id?.toString() || null,
                        userName: response.data.user.name || null,
                        phone: response.data.user.phone || null,
                        avatar: response.data.user.avatar || null,
                        authority: response.data.user.role ? [response.data.user.role] : [],
                    }

                    setUser(mappedUser)
                    setSessionSignedIn(true)

                    console.log('✅ Login successful, redirecting...')

                    // Redirect به dashboard
                    navigate(appConfig.authenticatedEntryPath)
                }
            } catch (error: any) {
                console.error('❌ Login Error:', error)
                const errorMessage = error?.message || 'خطا در ورود. لطفاً دوباره تلاش کنید.'
                setMessage?.(errorMessage)
            } finally {
                setSubmitting(false)
            }
        }
    }

    const handleResendOTP = async () => {
        if (!disableSubmit && canResend) {
            setSubmitting(true)

            try {
                const response = await apiSendOtp({ phone: phoneNumber })

                if (response.success) {
                    // نمایش کد OTP جدید در مودال
                    setOtpCode(response.data.code)
                    setOtpExpiresAt(response.data.expires_at)
                    setShowOtpModal(true)

                    setTimer(120) // Reset timer to 2 minutes
                    setCanResend(false)
                    setMessage?.(response.message || 'کد OTP مجدداً به شماره موبایل شما ارسال شد', 'success')
                }
            } catch (error: any) {
                const errorMessage = error?.message || 'خطا در ارسال مجدد کد تایید'
                setMessage?.(errorMessage)
            } finally {
                setSubmitting(false)
            }
        }
    }

    return (
        <div className={className}>
            {step === 'phone' ? (
                <>
                    <Form onSubmit={phoneForm.handleSubmit(onSendOTP)}>
                        <FormItem
                            label="شماره موبایل"
                            labelClass="text-slate-850 dark:text-slate-200 font-extrabold text-sm mb-1.5 block"
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
                                        className="border-2 border-slate-400 dark:border-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
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
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg transform transition-transform duration-200 active:scale-95 font-extrabold"
                        >
                            {isSubmitting ? 'در حال ارسال...' : 'ارسال کد تایید'}
                        </Button>
                    </Form>
                    <div className="mt-2">
                        <Button
                            block
                            variant="default"
                            type="button"
                            onClick={handleSwitchToPhonePassword}
                            className="bg-transparent border-2 border-slate-400 dark:border-slate-500 text-slate-800 dark:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 font-extrabold shadow-sm rounded-xl py-2 mt-2 transition-all duration-200 active:scale-95"
                        >
                            ورود با رمز ثابت
                        </Button>
                    </div>
                </>
            ) : step === 'otp' ? (
                <div>
                    <div className="text-center mb-4">
                        <p className="text-sm text-slate-850 dark:text-slate-200 font-extrabold">
                            کد 4 رقمی به شماره {phoneNumber} ارسال شد
                        </p>
                        <div className="mt-2">
                            {timer > 0 ? (
                                <p className="text-sm font-black text-primary">
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
                                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                                >
                                    ارسال مجدد کد
                                </Button>
                            )}
                        </div>
                    </div>
                    <Form onSubmit={otpForm.handleSubmit(onVerifyOTP)}>
                        <FormItem
                            label="کد OTP"
                            labelClass="text-slate-850 dark:text-slate-200 font-extrabold text-sm mb-1.5 block"
                            invalid={Boolean(otpForm.formState.errors.otp)}
                            errorMessage={otpForm.formState.errors.otp?.message}
                        >
                            <Controller
                                name="otp"
                                control={otpForm.control}
                                render={({ field }) => (
                                    <OTPInput
                                        length={4}
                                        placeholder="0"
                                        fullWidth
                                        inputClass="border-2 border-slate-400 dark:border-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
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
                                className="font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900"
                            >
                                بازگشت
                            </Button>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg transform transition-transform duration-200 active:scale-95 font-extrabold"
                            >
                                {isSubmitting ? 'ورود...' : 'ورود'}
                            </Button>
                        </div>
                    </Form>
                </div>
            ) : step === 'register' ? (
                <div>
                    <div className="text-center mb-4">
                        <p className="text-sm text-slate-850 dark:text-slate-200 font-extrabold">
                            شما هنوز ثبت‌نام نکرده‌اید. لطفاً نام خود را وارد کنید
                        </p>
                    </div>
                    <Form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                        {/* Hidden input to disable browser autocomplete for Name field */}
                        <input type="text" className="hidden" aria-hidden="true" autoComplete="off" />

                        <FormItem
                            label="نام"
                            labelClass="text-slate-850 dark:text-slate-200 font-extrabold text-sm mb-1.5 block"
                            invalid={Boolean(registerForm.formState.errors.name)}
                            errorMessage={registerForm.formState.errors.name?.message}
                        >
                            <Controller
                                name="name"
                                control={registerForm.control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="نام خود را وارد کنید"
                                        autoComplete="off"
                                        className="border-2 border-slate-400 dark:border-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="رمز عبور"
                            labelClass="text-slate-850 dark:text-slate-200 font-extrabold text-sm mb-1.5 block"
                            invalid={Boolean(registerForm.formState.errors.password)}
                            errorMessage={registerForm.formState.errors.password?.message}
                        >
                            <Controller
                                name="password"
                                control={registerForm.control}
                                render={({ field }) => (
                                    <Input
                                        type="password"
                                        placeholder="••••••"
                                        autoComplete="new-password"
                                        className="border-2 border-slate-400 dark:border-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
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
                                className="font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900"
                            >
                                بازگشت
                            </Button>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg transform transition-transform duration-200 active:scale-95 font-extrabold"
                            >
                                {isSubmitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام و ورود'}
                            </Button>
                        </div>
                    </Form>
                </div>
            ) : (
                <div>
                    <div className="text-center mb-4">
                        <p className="text-sm text-slate-850 dark:text-slate-200 font-extrabold">
                            ورود با شماره موبایل و رمز عبور ثابت
                        </p>
                    </div>
                    <Form onSubmit={phonePasswordForm.handleSubmit(onPhonePasswordSignIn)}>
                        <FormItem
                            label="شماره موبایل"
                            labelClass="text-slate-850 dark:text-slate-200 font-extrabold text-sm mb-1.5 block"
                            invalid={Boolean(phonePasswordForm.formState.errors.phone)}
                            errorMessage={phonePasswordForm.formState.errors.phone?.message}
                        >
                            <Controller
                                name="phone"
                                control={phonePasswordForm.control}
                                render={({ field }) => (
                                    <Input
                                        type="tel"
                                        placeholder="09123456789"
                                        autoComplete="tel"
                                        className="border-2 border-slate-400 dark:border-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="رمز عبور"
                            labelClass="text-slate-850 dark:text-slate-200 font-extrabold text-sm mb-1.5 block"
                            invalid={Boolean(phonePasswordForm.formState.errors.password)}
                            errorMessage={phonePasswordForm.formState.errors.password?.message}
                        >
                            <Controller
                                name="password"
                                control={phonePasswordForm.control}
                                render={({ field }) => (
                                    <Input
                                        type="password"
                                        placeholder="••••••"
                                        autoComplete="current-password"
                                        className="border-2 border-slate-400 dark:border-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
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
                                className="font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900"
                            >
                                بازگشت
                            </Button>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg transform transition-transform duration-200 active:scale-95 font-extrabold"
                            >
                                {isSubmitting ? 'ورود...' : 'ورود'}
                            </Button>
                        </div>
                    </Form>
                </div>
            )}

            {/* Modal برای نمایش کد OTP (فقط در حالت توسعه) */}
            <OtpCodeModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                code={otpCode}
                expiresAt={otpExpiresAt}
            />
        </div>
    )
}

export default SignInForm
