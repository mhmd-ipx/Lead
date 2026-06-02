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
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    پشتیبانی
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    برای رفع مشکلات و پاسخ به سوالات خود با ما در تماس باشید.
                </p>
            </div>

            <Card className="p-0 overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Map Section */}
                    <div className="h-[350px] lg:h-auto order-2 lg:order-1 bg-gray-50 dark:bg-gray-800/50">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53757.65476741567!2d51.64423604566773!3d32.636726652323254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fbc37006277ddd7%3A0x39c7e2d0f76955b0!2z2LTYsdqp2Kog2KLYqtix24zZhiDYqtis2KfYsdiqINix2KfYs9iq2KfZhg!5e0!3m2!1sen!2s!4v1780379439881!5m2!1sen!2s" className="w-full h-full border-0 opacity-90 hover:opacity-100 transition-opacity duration-300" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>

                    {/* Contact Info */}
                    <div className="p-6 md:p-10 order-1 lg:order-2 space-y-8 bg-white dark:bg-gray-900/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">

                            {/* Phone */}
                            <div className="flex gap-4">
                                <div className="text-gray-400 dark:text-gray-500 mt-0.5">
                                    <HiOutlinePhone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">تلفن تماس</h4>
                                    <div className="space-y-1.5">
                                        <a href="tel:+983136617986" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" dir="ltr">031-36617986</a>
                                        <a href="tel:+989130322201" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" dir="ltr">09130322201</a>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex gap-4">
                                <div className="text-gray-400 dark:text-gray-500 mt-0.5">
                                    <HiOutlineMail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">ایمیل</h4>
                                    <a href="mailto:leadmapro@gmail.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        leadmapro@gmail.com
                                    </a>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="flex gap-4">
                                <div className="text-gray-400 dark:text-gray-500 mt-0.5">
                                    <HiOutlineClock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">ساعات کاری</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">شنبه تا چهارشنبه</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">۸:۰۰ - ۱۷:۰۰</p>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="flex gap-4">
                                <div className="text-gray-400 dark:text-gray-500 mt-0.5">
                                    <HiOutlineGlobe className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">وب‌سایت</h4>
                                    <a href="https://atrindanesh.com/lead/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" dir="ltr">
                                        atrindanesh.com/lead
                                    </a>
                                </div>
                            </div>

                            {/* Emergency */}
                            <div className="flex gap-4">
                                <div className="text-red-400 dark:text-red-500 mt-0.5">
                                    <span className="text-lg leading-none block">🚨</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">اضطراری (۲۴/۷)</h4>
                                    <a href="tel:+989130322201" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" dir="ltr">
                                        09130322201
                                    </a>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex gap-4 sm:col-span-2">
                                <div className="text-gray-400 dark:text-gray-500 mt-0.5">
                                    <HiOutlineLocationMarker className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">آدرس</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                                        اصفهان - خیابان شیخ مفید - کوچه حاج نائب (۲۰) - ساختمان پندار مفید - طبقه دوم - واحد ۷
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">کد پستی: ۸۱۶۴۹۶۵۹۱۸</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ContactSupport
