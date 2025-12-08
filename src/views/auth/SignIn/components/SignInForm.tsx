import { useState } from 'react'
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

const phoneValidationSchema: ZodType<PhoneFormSchema> = z.object({
    phone: z
        .string({ required_error: 'Please enter your phone number' })
        .min(10, { message: 'Please enter a valid phone number' })
        .regex(/^09\d{9}$/, { message: 'Phone number must start with 09 and be 11 digits' }),
})

const otpValidationSchema: ZodType<OTPFormSchema> = z.object({
    otp: z
        .string({ required_error: 'Please enter OTP' })
        .length(6, { message: 'OTP must be 6 digits' }),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [phoneNumber, setPhoneNumber] = useState<string>('')

    const { disableSubmit = false, className, setMessage } = props

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

    const { signIn } = useAuth()

    const onSendOTP = async (values: PhoneFormSchema) => {
        const { phone } = values
        setPhoneNumber(phone)

        if (!disableSubmit) {
            setSubmitting(true)

            // Mock sending OTP - in real app, call API
            setTimeout(() => {
                setStep('otp')
                setSubmitting(false)
                setMessage?.('OTP sent to your phone')
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

    return (
        <div className={className}>
            {step === 'phone' ? (
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
                        {isSubmitting ? 'در حال ارسال...' : 'ارسال کد OTP'}
                    </Button>
                </Form>
            ) : (
                <div>
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                            کد 6 رقمی به شماره {phoneNumber} ارسال شد
                        </p>
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
            )}
        </div>
    )
}

export default SignInForm
