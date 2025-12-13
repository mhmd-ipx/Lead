import { Card } from '@/components/ui'
import {
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineLocationMarker,
    HiOutlineClock,
    HiOutlineGlobe,
} from 'react-icons/hi'

const ContactSupport = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    تماس مستقیم با پشتیبانی
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    از طریق راه‌های زیر می‌توانید با ما در ارتباط باشید
                </p>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Phone */}
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <HiOutlinePhone className="text-2xl text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                تلفن تماس
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                از شنبه تا پنجشنبه
                            </p>
                            <a
                                href="tel:+982188776655"
                                className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                dir="ltr"
                            >
                                021-88776655
                            </a>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1" dir="ltr">
                                021-88776656
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Email */}
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <HiOutlineMail className="text-2xl text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                ایمیل
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                پاسخگویی تا 24 ساعت
                            </p>
                            <a
                                href="mailto:support@lead-project.ir"
                                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline break-all"
                            >
                                support@lead-project.ir
                            </a>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                info@lead-project.ir
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Address */}
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <HiOutlineLocationMarker className="text-2xl text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                آدرس دفتر
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک 1234، طبقه 5
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                کد پستی: 1234567890
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Working Hours */}
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <HiOutlineClock className="text-2xl text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                ساعات کاری
                            </h3>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">شنبه تا چهارشنبه:</span> 9:00 - 18:00
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">پنجشنبه:</span> 9:00 - 13:00
                                </p>
                                <p className="text-red-600 dark:text-red-400">
                                    <span className="font-medium">جمعه:</span> تعطیل
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Website */}
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <HiOutlineGlobe className="text-2xl text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                وبسایت و شبکه‌های اجتماعی
                            </h3>
                            <div className="space-y-2">
                                <a
                                    href="https://lead-project.ir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    www.lead-project.ir
                                </a>
                                <div className="flex gap-3 mt-3">
                                    <a
                                        href="#"
                                        className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <span className="text-lg">📱</span>
                                    </a>
                                    <a
                                        href="#"
                                        className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <span className="text-lg">🐦</span>
                                    </a>
                                    <a
                                        href="#"
                                        className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <span className="text-lg">💼</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Emergency */}
                <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🚨</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                پشتیبانی اضطراری (24/7)
                            </h3>
                            <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                                فقط برای موارد فوری
                            </p>
                            <a
                                href="tel:+989121234567"
                                className="text-lg font-bold text-red-600 dark:text-red-400 hover:underline"
                                dir="ltr"
                            >
                                0912-123-4567
                            </a>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Map or Additional Info */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    نقشه دفتر
                </h2>
                <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">نقشه اینجا قرار می‌گیرد</p>
                </div>
            </Card>
        </div>
    )
}

export default ContactSupport
