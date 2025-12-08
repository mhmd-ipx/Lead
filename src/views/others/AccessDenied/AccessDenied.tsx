import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import SpaceSignBoard from '@/assets/svg/SpaceSignBoard'
import { useNavigate } from 'react-router-dom'

const AccessDenied = () => {
    const navigate = useNavigate()

    const handleGoBack = () => {
        navigate('/dashboard')
    }

    const handleContactSupport = () => {
        navigate('/support')
    }

    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center px-4">
                <SpaceSignBoard height={280} width={280} />
                <div className="mt-10 text-center max-w-md">
                    <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                        دسترسی غیرمجاز
                    </h3>
                    <p className="text-base text-gray-600 mb-6 leading-relaxed">
                        شما اجازه دسترسی به این صفحه را ندارید. این ممکن است به دلیل سطح دسترسی فعلی شما یا تغییر در نقش کاربریتان باشد.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                            راه‌های حل:
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1 text-right">
                            <li>• با مدیر سیستم تماس بگیرید</li>
                            <li>• نقش کاربری خود را بررسی کنید</li>
                            <li>• از داشبورد اصلی استفاده کنید</li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            variant="solid"
                            onClick={handleGoBack}
                            className="min-w-[120px]"
                        >
                            بازگشت به داشبورد
                        </Button>
                        <Button
                            variant="plain"
                            onClick={handleContactSupport}
                            className="min-w-[120px]"
                        >
                            تماس با پشتیبانی
                        </Button>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default AccessDenied
