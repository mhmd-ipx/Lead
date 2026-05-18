import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import OTPInput from '@/components/shared/OtpInput'
import OtpCodeModal from './OtpCodeModal'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import { apiVerifyExamAccess, apiSendOtp, apiVerifyOtp } from '@/services/AuthService'
import { useToken, useSessionUser } from '@/store/authStore'
import appConfig from '@/configs/app.config'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VerifyExamAccessResponse } from '@/@types/auth'

// ── Zustand cache store for exam collection data ──────────────────────────────
type ExaminerSessionStore = {
    examData: VerifyExamAccessResponse['data'] | null
    setExamData: (data: VerifyExamAccessResponse['data']) => void
    clearExamData: () => void
}

export const useExaminerSessionStore = create<ExaminerSessionStore>()(
    persist(
        (set) => ({
            examData: null,
            setExamData: (data) => set({ examData: data }),
            clearExamData: () => set({ examData: null }),
        }),
        {
            name: 'examiner-session',
        },
    ),
)

// ── Form schemas ──────────────────────────────────────────────────────────────
type ExamAccessFormSchema = {
    phone: string
    code: string
}

type OTPFormSchema = {
    otp: string
}

const examAccessValidationSchema: ZodType<ExamAccessFormSchema> = z.object({
    phone: z
        .string({ required_error: 'لطفاً شماره موبایل خود را وارد کنید' })
        .min(10, { message: 'لطفاً شماره موبایل معتبر وارد کنید' })
        .regex(/^09\d{9}$/, { message: 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد' }),
    code: z
        .string({ required_error: 'لطفاً کد آزمون را وارد کنید' })
        .min(3, { message: 'کد آزمون باید حداقل 3 کاراکتر باشد' }),
})

const otpValidationSchema: ZodType<OTPFormSchema> = z.object({
    otp: z
        .string({ required_error: 'لطفاً کد OTP را وارد کنید' })
        .length(4, { message: 'کد OTP باید 4 رقم باشد' }),
})

// ── Component ─────────────────────────────────────────────────────────────────
interface ExaminerSignInFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string, type?: 'success' | 'danger') => void
}

const ExaminerSignInForm = (props: ExaminerSignInFormProps) => {
    const { disableSubmit = false, className, setMessage } = props
    const navigate = useNavigate()

    const [isSubmitting, setSubmitting] = useState(false)
    const [step, setStep] = useState<'access' | 'otp'>('access')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [timer, setTimer] = useState(120)
    const [canResend, setCanResend] = useState(false)

    // OTP Code modal states (dev mode)
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otpCode, setOtpCode] = useState('')
    const [otpExpiresAt, setOtpExpiresAt] = useState('')

    const { setExamData } = useExaminerSessionStore()

    const accessForm = useForm<ExamAccessFormSchema>({
        defaultValues: { phone: '', code: '' },
        resolver: zodResolver(examAccessValidationSchema),
    })

    const otpForm = useForm<OTPFormSchema>({
        defaultValues: { otp: '' },
        resolver: zodResolver(otpValidationSchema),
    })

    // ── Timer ─────────────────────────────────────────────────────────────────
    const startTimer = () => {
        setTimer(120)
        setCanResend(false)
        let t = 120
        const interval = setInterval(() => {
            t -= 1
            setTimer(t)
            if (t <= 0) {
                clearInterval(interval)
                setCanResend(true)
            }
        }, 1000)
    }

    // ── Step 1: verify exam access then send OTP ──────────────────────────────
    const onVerifyAccess = async (values: ExamAccessFormSchema) => {
        if (disableSubmit) return
        setSubmitting(true)
        setMessage?.('')

        try {
            const response = await apiVerifyExamAccess({
                phone: values.phone,
                code: values.code,
            })

            if (response.success) {
                // Cache exam collection data for later use
                setExamData(response.data)

                // Send OTP to the phone
                const otpResponse = await apiSendOtp({ phone: values.phone })

                if (otpResponse.success) {
                    setPhoneNumber(values.phone)

                    // نمایش کد OTP در مودال (فقط در حالت توسعه)
                    setOtpCode(otpResponse.data.code)
                    setOtpExpiresAt(otpResponse.data.expires_at)
                    setShowOtpModal(true)

                    setStep('otp')
                    startTimer()
                    setMessage?.(
                        `کد تأیید به شماره ${values.phone} ارسال شد`,
                        'success',
                    )
                }
            } else {
                setMessage?.('آزمون فعالی ندارید یا آزمون شما منقضی شده است')
            }
        } catch (error: any) {
            const msg =
                error?.message || 'آزمون فعالی ندارید یا آزمون شما منقضی شده است'
            setMessage?.(msg)
        } finally {
            setSubmitting(false)
        }
    }

    // ── Step 2: verify OTP and sign in ────────────────────────────────────────
    const onVerifyOTP = async (values: OTPFormSchema) => {
        if (disableSubmit) return
        setSubmitting(true)

        try {
            const response = await apiVerifyOtp({
                phone: phoneNumber,
                code: values.otp,
            })

            if (response.success) {
                const { setToken } = useToken()
                const { setUser, setSessionSignedIn } = useSessionUser.getState()

                setToken(response.data.token)

                const mappedUser = {
                    userId: response.data.user.id?.toString() || null,
                    userName: response.data.user.name || null,
                    phone: response.data.user.phone || null,
                    avatar: response.data.user.avatar || null,
                    authority: response.data.user.role
                        ? [response.data.user.role]
                        : [],
                }

                setUser(mappedUser)
                setSessionSignedIn(true)

                navigate(appConfig.authenticatedEntryPath)
            }
        } catch (error: any) {
            const msg = error?.message || 'کد تأیید نامعتبر یا منقضی شده است'
            setMessage?.(msg)
        } finally {
            setSubmitting(false)
        }
    }

    // ── Resend OTP ────────────────────────────────────────────────────────────
    const handleResendOTP = async () => {
        if (!canResend || disableSubmit) return
        setSubmitting(true)
        try {
            const response = await apiSendOtp({ phone: phoneNumber })
            if (response.success) {
                // نمایش کد OTP جدید در مودال (فقط در حالت توسعه)
                setOtpCode(response.data.code)
                setOtpExpiresAt(response.data.expires_at)
                setShowOtpModal(true)

                startTimer()
                setMessage?.('کد تأیید مجدداً ارسال شد', 'success')
            }
        } catch (error: any) {
            setMessage?.(error?.message || 'خطا در ارسال مجدد کد')
        } finally {
            setSubmitting(false)
        }
    }

    const handleBack = () => {
        setStep('access')
        otpForm.reset()
        setMessage?.('')
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={className}>
            {step === 'access' ? (
                <Form onSubmit={accessForm.handleSubmit(onVerifyAccess)}>
                    <FormItem
                        label="شماره موبایل"
                        labelClass="text-slate-850 dark:text-slate-200 font-extrabold text-sm mb-1.5 block"
                        invalid={Boolean(accessForm.formState.errors.phone)}
                        errorMessage={accessForm.formState.errors.phone?.message}
                    >
                        <Controller
                            name="phone"
                            control={accessForm.control}
                            render={({ field }) => (
                                <Input
                                    type="tel"
                                    placeholder="09123456789"
                                    autoComplete="off"
                                    className="border-2 border-slate-400 dark:border-slate-500 focus:border-violet-600 dark:focus:border-violet-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="کد آزمون"
                        labelClass="text-slate-850 dark:text-slate-200 font-extrabold text-sm mb-1.5 block"
                        invalid={Boolean(accessForm.formState.errors.code)}
                        errorMessage={accessForm.formState.errors.code?.message}
                    >
                        <Controller
                            name="code"
                            control={accessForm.control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="مثال: WIFST"
                                    autoComplete="off"
                                    className="border-2 border-slate-400 dark:border-slate-500 focus:border-violet-600 dark:focus:border-violet-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
                                    {...field}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                />
                            )}
                        />
                    </FormItem>

                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-none shadow-lg transform transition-transform duration-200 active:scale-95 font-extrabold"
                    >
                        {isSubmitting ? 'در حال بررسی...' : 'بررسی و ارسال کد تأیید'}
                    </Button>
                </Form>
            ) : (
                <div>
                    <div className="text-center mb-4">
                        <p className="text-sm text-slate-850 dark:text-slate-200 font-extrabold">
                            کد ۴ رقمی به شماره{' '}
                            <span className="font-black text-primary">
                                {phoneNumber}
                            </span>{' '}
                            ارسال شد
                        </p>
                        <div className="mt-2">
                            {timer > 0 ? (
                                <p className="text-sm font-black text-primary">
                                    زمان باقیمانده:{' '}
                                    {Math.floor(timer / 60)}:
                                    {(timer % 60).toString().padStart(2, '0')}
                                </p>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="plain"
                                    type="button"
                                    onClick={handleResendOTP}
                                    loading={isSubmitting}
                                    disabled={!canResend}
                                    className="font-bold text-violet-600 dark:text-violet-400 hover:text-violet-850"
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
                                        inputClass="border-2 border-slate-400 dark:border-slate-500 focus:border-violet-600 dark:focus:border-violet-500 bg-white/95 focus:bg-white dark:bg-slate-900/95 dark:focus:bg-slate-950 font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl transition-all duration-200"
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
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-none shadow-lg transform transition-transform duration-200 active:scale-95 font-extrabold"
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

export default ExaminerSignInForm
