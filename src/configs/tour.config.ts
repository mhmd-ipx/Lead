import { Config } from 'driver.js'

export const dashboardTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#dashboard-financial-card',
            popover: {
                title: 'امور مالی',
                description: 'در این بخش می‌توانید خلاصه‌ای از وضعیت تراکنش‌ها، مبالغ پرداخت شده و در انتظار پرداخت را مشاهده کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#dashboard-applicants-card',
            popover: {
                title: 'متقاضیان',
                description: 'آمار کلی متقاضیان، وضعیت نیازسنجی‌ها و آزمون‌های آن‌ها در این قسمت قابل مشاهده است.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#dashboard-quick-actions',
            popover: {
                title: 'دسترسی سریع',
                description: 'از این بخش می‌توانید به سرعت متقاضی جدید اضافه کنید یا آزمون اختصاص دهید.',
                side: "bottom",
                align: 'start'
            }
        }
    ]
}

export const managersTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#managers-header',
            popover: {
                title: 'مدیریت متقاضیان',
                description: 'در این صفحه می‌توانید لیست تمامی متقاضیان را مشاهده و مدیریت کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#managers-stats-cards',
            popover: {
                title: 'آمار کلی',
                description: 'خلاصه‌ای از وضعیت متقاضیان شامل تعداد کل، فعال، نیازسنجی شده و کسانی که آزمون داده‌اند.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#managers-search-filter',
            popover: {
                title: 'جستجو و فیلتر سازمان',
                description: 'می‌توانید متقاضیان را بر اساس نام یا مشخصات جستجو کنید و یا لیست را بر اساس یک سازمان خاص محدود کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#managers-add-button',
            popover: {
                title: 'ثبت متقاضی جدید',
                description: 'برای اضافه کردن یک متقاضی جدید به سیستم از این دکمه استفاده کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#managers-table',
            popover: {
                title: 'لیست متقاضیان',
                description: 'در این جدول اطلاعات کامل هر متقاضی، وضعیت نیازسنجی و وضعیت آزمون‌های او نمایش داده می‌شود.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '.managers-action-assessment',
            popover: {
                title: 'انجام نیازسنجی',
                description: 'با کلیک بر روی این آیکون می‌توانید فرآیند نیازسنجی را برای متقاضی شروع کنید.',
                side: "left",
                align: 'start'
            }
        }
    ]
}

export const companiesTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#companies-header',
            popover: {
                title: 'سازمان‌های من',
                description: 'در این بخش می‌توانید لیست تمام سازمان‌ها و شرکت‌های ثبت شده خود را مدیریت کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#companies-search-filter',
            popover: {
                title: 'جستجو و افزودن',
                description: 'امکان جستجو بین سازمان‌ها و افزودن سازمان جدید از این بخش امکان‌پذیر است.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#companies-table',
            popover: {
                title: 'لیست سازمان‌ها',
                description: 'مشاهده اطلاعات تماس، وضعیت حقوقی و عملیات ویرایش هر سازمان در این جدول قرار دارد.',
                side: "top",
                align: 'start'
            }
        }
    ]
}

export const examsResultsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#exams-results-header',
            popover: {
                title: 'آزمون‌ها و نتایج',
                description: 'در این صفحه می‌توانید وضعیت تمامی آزمون‌های اختصاص داده شده به متقاضیان را رصد کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#exams-results-stats-cards',
            popover: {
                title: 'آمار وضعیت آزمون‌ها',
                description: 'فیلتر سریع نتایج بر اساس وضعیت (تکمیل شده، در حال انجام و در انتظار).',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#exams-results-table',
            popover: {
                title: 'لیست نتایج',
                description: 'جزئیات دقیق هر آزمون و نتایج متقاضیان در این جدول قابل مشاهده است.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '.exams-results-action-info',
            popover: {
                title: 'جزئیات آزمون',
                description: 'مشاهده اطلاعات دقیق‌تر درباره مجموعه آزمون و اشتراک‌گذاری کد ورود.',
                side: "left",
                align: 'start'
            }
        }
    ]
}

export const financialDocumentsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#financial-documents-header',
            popover: {
                title: 'اسناد مالی',
                description: 'در این بخش می‌توانید تمامی اسناد مالی مربوط به متقاضیان و سازمان‌های خود را مشاهده و مدیریت کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#financial-documents-stats-cards',
            popover: {
                title: 'خلاصه وضعیت مالی',
                description: 'مشاهده مجموع مبالغ پرداخت شده، در انتظار و لغو شده به همراه تعداد اسناد هر وضعیت.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#financial-documents-table',
            popover: {
                title: 'لیست اسناد',
                description: 'جزئیات هر سند شامل مبلغ، تاریخ و وضعیت پرداخت در این جدول نمایش داده می‌شود.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '#financial-documents-bulk-actions-anchor',
            popover: {
                title: 'پرداخت تجمیعی',
                description: 'شما می‌توانید با انتخاب چندین سند «در انتظار»، آن‌ها را به یک صورتحساب تبدیل و به صورت یکجا پرداخت کنید.',
                side: "top",
                align: 'start'
            }
        }
    ]
}

export const billsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#bills-header',
            popover: {
                title: 'صورتحساب‌ها',
                description: 'در این بخش می‌توانید لیست تمامی صورتحساب‌های صادر شده و وضعیت پرداخت آن‌ها را مشاهده کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#bills-stats-cards',
            popover: {
                title: 'خلاصه وضعیت صورتحساب‌ها',
                description: 'مشاهده آمار کلی صورتحساب‌های پرداخت شده و در انتظار پرداخت.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#bills-table',
            popover: {
                title: 'لیست صورتحساب‌ها',
                description: 'جزئیات هر صورتحساب شامل شماره، تاریخ صدور، مبلغ و وضعیت فاکتور رسمی در این جدول قرار دارد.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '.bills-action-pay',
            popover: {
                title: 'پرداخت صورتحساب',
                description: 'صورتحساب‌های در انتظار پرداخت را می‌توانید مستقیماً از این بخش پرداخت کنید.',
                side: "left",
                align: 'start'
            }
        },
        {
            element: '.bills-action-invoice',
            popover: {
                title: 'درخواست فاکتور رسمی',
                description: 'برای صورتحساب‌های پرداخت شده، می‌توانید درخواست صدور فاکتور رسمی ثبت کنید.',
                side: "left",
                align: 'start'
            }
        }
    ]
}

export const userProfileTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#user-profile-header',
            popover: {
                title: 'تنظیمات حساب کاربری',
                description: 'در این صفحه می‌توانید اطلاعات شخصی و شغلی خود را مشاهده و ویرایش کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#user-profile-avatar-section',
            popover: {
                title: 'تصویر و عنوان شغلی',
                description: 'نمای کلی پروفایل شما شامل تصویر آواتار و سمت شغلی فعلی.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#user-profile-form-section',
            popover: {
                title: 'اطلاعات کاربری',
                description: 'فیلد در این قسمت می‌توانید نام، سازمان و آدرس خود را تغییر دهید. ایمیل و شماره تماس به دلایل امنیتی غیرقابل تغییر هستند.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '#user-profile-stats-section',
            popover: {
                title: 'اطلاعات تکمیلی',
                description: 'تاریخ عضویت و آخرین زمان ورود شما به سیستم در این بخش نمایش داده می‌شود.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '#user-profile-edit-button',
            popover: {
                title: 'ویرایش اطلاعات',
                description: 'برای تغییر اطلاعات پروفایل، ابتدا روی این دکمه کلیک کنید.',
                side: "bottom",
                align: 'start'
            }
        }
    ]
}

export const supportTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#support-header',
            popover: {
                title: 'تیکت‌های پشتیبانی',
                description: 'در این بخش می‌توانید تمامی درخواست‌های پشتیبانی خود را پیگیری کرده و وضعیت پاسخ‌دهی آن‌ها را مشاهده کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#support-add-button',
            popover: {
                title: 'ایجاد تیکت جدید',
                description: 'در صورت داشتن هرگونه سوال، مشکل یا نیاز به راهنمایی، از این طریق یک تیکت جدید ثبت کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#support-stats-cards',
            popover: {
                title: 'خلاصه وضعیت تیکت‌ها',
                description: 'مشاهده تعداد تیکت‌ها بر اساس وضعیت (باز، در حال بررسی، در انتظار پاسخ و بسته شده).',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#support-search-filter',
            popover: {
                title: 'جستجو در تیکت‌ها',
                description: 'امکان جستجو بر اساس موضوع یا شماره تیکت برای دسترسی سریع‌تر.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#support-table',
            popover: {
                title: 'لیست تیکت‌ها',
                description: 'جزئیات تیکت‌ها شامل اولویت، دسته‌بندی و زمان آخرین بروزرسانی در این جدول نمایش داده می‌شود.',
                side: "top",
                align: 'start'
            }
        }
    ]
}

export const createTicketTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#create-ticket-header',
            popover: {
                title: 'ایجاد تیکت جدید',
                description: 'در این صفحه می‌توانید درخواست پشتیبانی خود را با جزییات کامل ثبت کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#create-ticket-form',
            popover: {
                title: 'فرم ثبت اطلاعات',
                description: 'موضوع، دسته‌بندی و اولویت تیکت را مشخص کنید تا سریع‌تر توسط کارشناسان بررسی شود.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '#create-ticket-priority-select',
            popover: {
                title: 'اولویت تیکت',
                description: 'اگر مشکل شما فوری است، اولویت را روی «فوری» قرار دهید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#create-ticket-message-field',
            popover: {
                title: 'شرح مسئله',
                description: 'مسئله خود را به صورت کامل و با جزییات در این بخش بنویسید.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '#create-ticket-submit-button',
            popover: {
                title: 'ثبت نهایی',
                description: 'پس از تکمیل اطلاعات، با کلیک بر روی این دکمه تیکت شما در سیستم ثبت خواهد شد.',
                side: "top",
                align: 'start'
            }
        }
    ]
}

export const applicantAssessmentTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#assessment-header',
            popover: {
                title: 'فرم نیازسنجی',
                description: 'در این بخش می‌توانید فرم نیازسنجی اختصاصی متقاضی را مشاهده و تکمیل کنید.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '#assessment-steps-container',
            popover: {
                title: 'مراحل نیازسنجی',
                description: 'سوالات در چندین مرحله دسته‌بندی شده‌اند تا روند تکمیل فرم ساده‌تر باشد.',
                side: "top",
                align: 'start'
            }
        },
        {
            element: '#assessment-actions-bar',
            popover: {
                title: 'عملیات نهایی',
                description: 'پس از پاسخ به تمام سوالات اجباری، می‌توانید فرم را به صورت پیش‌نویس ذخیره کرده یا ثبت نهایی کنید.',
                side: "top",
                align: 'start'
            }
        }
    ]
}

export const examResultsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#exam-results-header',
            popover: {
                title: 'جزئیات مجموعه آزمون',
                description: 'در این بخش می‌توانید جزئیات کامل، تحلیل‌ها و مستندات مربوط به یک مجموعه آزمون را مشاهده کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#exam-results-tabs',
            popover: {
                title: 'بخش‌های مختلف',
                description: 'از این قسمت می‌توانید بین تب‌های نتایج، تحلیل، پاسخنامه‌ها، فایل‌ها و اطلاعات جابجا شوید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#exam-results-radar-card',
            popover: {
                title: 'نمودار تحلیلی',
                description: 'این نمودار راداری، عملکرد متقاضی را در دسته‌های مختلف به صورت بصری نمایش می‌دهد.',
                side: 'left',
                align: 'start'
            },
        },
        {
            element: '#exam-results-table',
            popover: {
                title: 'لیست آزمون‌ها',
                description: 'در این جدول، نتایج هر یک از آزمون‌های موجود در این مجموعه به تفکیک نمایش داده شده است.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminDashboardTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-dashboard-welcome',
            popover: {
                title: 'خوش آمدید',
                description: 'به پنل مدیریت سیستم خوش آمدید. در این قسمت می‌توانید خلاصه‌ای از وضعیت کل سیستم را مشاهده کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-dashboard-stats-tickets',
            popover: {
                title: 'تیکت‌های پشتیبانی',
                description: 'مشاهده و مدیریت درخواست‌های پشتیبانی از تمام کاربران سیستم.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-dashboard-stats-companies',
            popover: {
                title: 'سازمان‌ها',
                description: 'آمار کل سازمان‌ها و شرکت‌های ثبت شده در سیستم.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-dashboard-chart-donut',
            popover: {
                title: 'وضعیت تیکت‌ها',
                description: 'نمودار تفکیکی تیکت‌های فعال و بسته شده.',
                side: 'right',
                align: 'start'
            },
        },
        {
            element: '#admin-dashboard-chart-bar',
            popover: {
                title: 'نمای کلی سیستم',
                description: 'مقایسه آماری اجزای اصلی سیستم شامل کاربران، آزمون‌ها و سازمان‌ها.',
                side: 'top',
                align: 'start'
            },
        },
        {
            element: '#admin-dashboard-notifications',
            popover: {
                title: 'اعلانات سیستمی',
                description: 'آخرین رویدادها و اعلانات مهم سیستم در این بخش نمایش داده می‌شوند.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminCompaniesTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-companies-header',
            popover: {
                title: 'مدیریت سازمان‌ها',
                description: 'در این صفحه می‌توانید تمام سازمان‌ها و شرکت‌های عضو در پلتفرم را مدیریت کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-companies-search',
            popover: {
                title: 'جستجوی سازمان',
                description: 'امکان جستجو بر اساس نام، ایمیل یا شناسه سازمان.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-companies-add-button',
            popover: {
                title: 'افزودن سازمان جدید',
                description: 'برای ثبت یک سازمان یا شرکت جدید در سیستم از این دکمه استفاده کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-companies-table',
            popover: {
                title: 'لیست سازمان‌ها',
                description: 'مشاهده جزییات، ویرایش، مدیریت متقاضیان و حذف سازمان‌ها در این جدول امکان‌پذیر است.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminCompletedAssessmentsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-assessments-completed-header',
            popover: {
                title: 'نیازسنجی‌های تکمیل شده',
                description: 'در این بخش می‌توانید تمام نیازسنجی‌هایی که توسط متقاضیان تکمیل شده است را مشاهده کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-assessments-completed-stats-all',
            popover: {
                title: 'فیلتر وضعیت',
                description: 'با استفاده از این کارت‌ها می‌توانید سریعاً بین تمام نیازسنجی‌ها، موارد اختصاص داده شده و موارد در انتظار جابجا شوید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-assessments-completed-search',
            popover: {
                title: 'جستجوی پیشرفته',
                description: 'امکان جستجو بر اساس نام متقاضی، نام سازمان یا نوع نیازسنجی.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-assessments-completed-table',
            popover: {
                title: 'لیست نیازسنجی‌ها',
                description: 'در این جدول جزییات هر نیازسنجی و وضعیت اختصاص آزمون‌های مربوط به آن نمایش داده می‌شود.',
                side: 'top',
                align: 'start'
            },
        },
        {
            element: '#admin-assessments-completed-action-assign',
            popover: {
                title: 'اختصاص آزمون',
                description: 'پس از بررسی نیازسنجی، از طریق این دکمه می‌توانید مجموعه‌ای از آزمون‌ها را به متقاضی اختصاص دهید.',
                side: 'left',
                align: 'start'
            },
        },
    ],
}

export const adminAssessmentViewTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-assessment-view-header',
            popover: {
                title: 'جزئیات نیازسنجی',
                description: 'در این صفحه می‌توانید تمام پاسخ‌ها و جزییات یک نیازسنجی خاص را بررسی کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-assessment-view-stats',
            popover: {
                title: 'اطلاعات متقاضی',
                description: 'مشخصات فردی متقاضی و سازمانی که این نیازسنجی را تکمیل کرده است.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-assessment-view-info',
            popover: {
                title: 'شناسنامه نیازسنجی',
                description: 'عنوان قالب استفاده شده و تاریخ‌های ثبت و ارسال نیازسنجی در این بخش قابل مشاهده است.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-assessment-view-answers',
            popover: {
                title: 'بررسی پاسخ‌ها',
                description: 'تمام مراحل و سوالات به همراه پاسخ‌های ثبت شده توسط متقاضی در این قسمت لیست شده‌اند.',
                side: 'top',
                align: 'start'
            },
        },
        {
            element: '#admin-assessment-view-action-assign',
            popover: {
                title: 'اقدام نهایی',
                description: 'پس از مطالعه و تایید پاسخ‌ها، می‌توانید با کلیک روی این دکمه آزمون‌های متناسب را به این فرد اختصاص دهید.',
                side: 'left',
                align: 'start'
            },
        },
    ],
}

export const adminCompanyManagersTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-company-managers-header',
            popover: {
                title: 'متقاضیان سازمان',
                description: 'در این صفحه می‌توانید تمام متقاضیان و کاربران زیرمجموعه یک سازمان خاص را مدیریت کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-company-managers-stats',
            popover: {
                title: 'آمار متقاضیان',
                description: 'مشاهده سریع وضعیت فعالیت، نیازسنجی‌ها و آزمون‌های تمام متقاضیان این سازمان.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-company-managers-add-button',
            popover: {
                title: 'افزودن متقاضی جدید',
                description: 'برای ثبت یک متقاضی یا مدیر جدید در این سازمان از این دکمه استفاده کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-company-managers-filters',
            popover: {
                title: 'فیلترهای هوشمند',
                description: 'امکان فیلتر کردن لیست بر اساس وضعیت فعالیت یا وضعیت پیشرفت در مراحل مختلف (نیازسنجی و آزمون).',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-company-managers-search',
            popover: {
                title: 'جستجوی سریع',
                description: 'امکان جستجو بر اساس نام، پست سازمانی یا بخش مربوطه.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-company-managers-table',
            popover: {
                title: 'مدیریت متقاضیان',
                description: 'در این جدول می‌توانید جزییات هر متقاضی را مشاهده، ویرایش یا حذف کنید.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminFinancialDocsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-financial-docs-header',
            popover: {
                title: 'اسناد مالی',
                description: 'در این بخش می‌توانید تمامی اسناد مالی و فاکتورهای صادر شده در سیستم را مدیریت کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-financial-docs-stats',
            popover: {
                title: 'آمار اسناد',
                description: 'مشاهده سریع تعداد اسناد بر اساس وضعیت (پرداخت شده، در انتظار یا لغو شده).',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-financial-docs-filters',
            popover: {
                title: 'فیلتر و جستجو',
                description: 'امکان محدود کردن لیست بر اساس سازمان یا جستجوی مستقیم عنوان سند.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-financial-docs-add-btn',
            popover: {
                title: 'ثبت سند جدید',
                description: 'برای ایجاد یک سند مالی یا فاکتور جدید از این دکمه استفاده کنید.',
                side: 'left',
                align: 'start'
            },
        },
        {
            element: '#admin-financial-docs-table',
            popover: {
                title: 'لیست اسناد',
                description: 'جزییات اسناد مالی شامل مبلغ، واحد پول و وضعیت پرداخت در این جدول نمایش داده می‌شود.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminFinancialDocViewTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-financial-doc-view-header',
            popover: {
                title: 'جزئیات سند مالی',
                description: 'مشاهده اطلاعات تکمیلی و وضعیت دقیق یک سند مالی خاص.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-financial-doc-view-details',
            popover: {
                title: 'مشخصات سند',
                description: 'اطلاعاتی نظیر مبلغ، سازمان مرتبط، تاریخ ایجاد و توضیحات در این بخش قرار دارد.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-financial-doc-view-bills',
            popover: {
                title: 'صورتحساب‌های مرتبط',
                description: 'اگر این سند در صورتحسابی گنجانده شده باشد، لیست آن‌ها در اینجا نمایش داده می‌شود.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminBillsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-bills-header',
            popover: {
                title: 'صورتحساب‌ها',
                description: 'مدیریت و مشاهده صورتحساب‌های تجمیع شده برای سازمان‌ها.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-bills-stats',
            popover: {
                title: 'وضعیت صورتحساب‌ها',
                description: 'مشاهده آمار کلی صورتحساب‌های پرداخت شده و در انتظار پرداخت.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-bills-filters',
            popover: {
                title: 'فیلتر شرکت‌ها',
                description: 'امکان مشاهده صورتحساب‌های مربوط به یک شرکت خاص.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-bills-table',
            popover: {
                title: 'فهرست صورتحساب‌ها',
                description: 'جزییات صورتحساب شامل شماره، مبلغ کل و وضعیت فاکتور رسمی در این جدول قابل مشاهده است.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminBillViewTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-bill-view-header',
            popover: {
                title: 'جزئیات صورتحساب',
                description: 'مشاهده و مدیریت فاکتورهای موجود در این صورتحساب.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-bill-view-details',
            popover: {
                title: 'اطلاعات کلی',
                description: 'خلاصه‌ای از مبلغ کل، تاریخ صدور و وضعیت فاکتور رسمی.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-bill-view-items-header',
            popover: {
                title: 'مدیریت اقلام',
                description: 'افزودن یا حذف اسناد مالی از این صورتحساب.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-bill-view-items-table',
            popover: {
                title: 'لیست اسناد',
                description: 'فهرست تمامی اسناد مالی که در این صورتحساب تجمیع شده‌اند.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminAssessmentFormsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-assessment-forms-header',
            popover: {
                title: 'مدیریت فرم نیازسنجی',
                description: 'در این بخش می‌توانید ساختار فرم نیازسنجی استاندارد سیستم را شخصی‌سازی کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '[id^="admin-assessment-step-"]',
            popover: {
                title: 'مراحل نیازسنجی',
                description: 'فرم نیازسنجی از چندین مرحله تشکیل شده است. هر مرحله می‌تواند شامل چندین سوال باشد.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '[id^="admin-assessment-question-"]',
            popover: {
                title: 'سوالات فرم',
                description: 'در هر مرحله می‌توانید سوالات مختلف با انواع متفاوت (متنی، تستی، امتیازی و ...) تعریف کنید.',
                side: 'top',
                align: 'start'
            },
        },
        {
            element: '[id^="admin-assessment-add-question-"]',
            popover: {
                title: 'افزودن سوال',
                description: 'برای اضافه کردن سوال جدید به یک مرحله خاص از این دکمه استفاده کنید.',
                side: 'top',
                align: 'start'
            },
        },
        {
            element: '#admin-assessment-add-step',
            popover: {
                title: 'افزودن مرحله جدید',
                description: 'با استفاده از این بخش می‌توانید یک مرحله جدید به انتهای فرم نیازسنجی اضافه کنید.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminExamsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-exams-header',
            popover: {
                title: 'مدیریت آزمون‌ها',
                description: 'در این بخش می‌توانید لیست تمامی آزمون‌های تعریف شده در سیستم را مشاهده و مدیریت کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-exams-add-btn',
            popover: {
                title: 'افزودن آزمون جدید',
                description: 'برای تعریف یک آزمون جدید و تعیین سوالات آن از این دکمه استفاده کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-exams-info',
            popover: {
                title: 'تغییر اولویت',
                description: 'شما می‌توانید با کشیدن و رها کردن (Drag & Drop) ردیف‌های جدول، اولویت نمایش آزمون‌ها را تغییر دهید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-exams-table-container',
            popover: {
                title: 'لیست آزمون‌ها',
                description: 'جزئیات هر آزمون شامل تعداد سوالات و مدت زمان آن در این جدول نمایش داده می‌شود.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminCreateExamTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-create-exam-header',
            popover: {
                title: 'ساخت آزمون جدید',
                description: 'در این صفحه می‌توانید یک آزمون حرفه‌ای با بخش‌بندی‌های مختلف ایجاد کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-create-exam-basic-info',
            popover: {
                title: 'اطلاعات پایه',
                description: 'عنوان، مدت زمان و توضیحات کلی آزمون را در این بخش وارد کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-create-exam-sections',
            popover: {
                title: 'بخش‌بندی آزمون',
                description: 'هر آزمون می‌تواند شامل چندین بخش (مثلا سوالات تخصصی، عمومی و ...) باشد. در هر بخش می‌توانید محتوای آموزشی (متن/تصویر) و سوالات مربوطه را قرار دهید.',
                side: 'top',
                align: 'start'
            },
        },
        {
            element: '#admin-create-exam-add-section',
            popover: {
                title: 'افزودن بخش جدید',
                description: 'برای اضافه کردن یک فصل یا بخش جدید به آزمون از این قسمت استفاده کنید.',
                side: 'top',
                align: 'center'
            },
        },
        {
            element: '#admin-create-exam-actions',
            popover: {
                title: 'ذخیره نهایی',
                description: 'پس از اتمام طراحی آزمون، با استفاده از این دکمه آن را ذخیره کنید.',
                side: 'top',
                align: 'end'
            },
        },
    ],
}

export const adminExamDetailsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-exam-details-header',
            popover: {
                title: 'جزئیات و ویرایش آزمون',
                description: 'در این صفحه می‌توانید تمامی موارد آزمون از جمله اطلاعات پایه و سوالات را ویرایش کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-exam-details-basic-info',
            popover: {
                title: 'بروزرسانی اطلاعات پایه',
                description: 'تغییرات مربوط به عنوان و زمان آزمون را در اینجا اعمال و ذخیره کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-exam-details-sections',
            popover: {
                title: 'مدیریت محتوا و سوالات',
                description: 'در این بخش می‌توانید سوالات موجود را ویرایش کنید، سوال جدید اضافه کنید یا ساختار بخش‌ها را تغییر دهید.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminSupportTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-support-header',
            popover: {
                title: 'تیکت‌های پشتیبانی',
                description: 'در این بخش می‌توانید تیکت‌های پشتیبانی ارسال شده توسط کاربران را مشاهده و مدیریت کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-support-stats',
            popover: {
                title: 'آمار تیکت‌ها',
                description: 'خلاصه‌ای از وضعیت تیکت‌ها (باز، در حال بررسی، در انتظار کاربر و بسته شده) در این بخش قابل مشاهده است.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-support-create-btn',
            popover: {
                title: 'ایجاد تیکت',
                description: 'برای ثبت تیکت جدید از طرف سیستم برای کاربران از این دکمه استفاده کنید.',
                side: 'left',
                align: 'start'
            },
        },
        {
            element: '#admin-support-search',
            popover: {
                title: 'جستجوی تیکت',
                description: 'جستجوی سریع تیکت بر اساس شماره، موضوع یا نام کاربر.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-support-table',
            popover: {
                title: 'لیست تیکت‌ها',
                description: 'فهرست تیکت‌ها با جزئیاتی نظیر اولویت، وضعیت و تاریخ آخرین بروزرسانی در این جدول نمایش داده می‌شود.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminSupportTicketViewTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-support-ticket-header',
            popover: {
                title: 'جزئیات تیکت',
                description: 'مشاهده موضوع و شماره تیکت انتخابی برای بررسی دقیق‌تر.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-support-ticket-controls',
            popover: {
                title: 'مدیریت وضعیت و اولویت',
                description: 'امکان تغییر وضعیت تیکت (مثلاً به در حال بررسی یا بسته شده) و اولویت آن توسط ادمین.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-support-ticket-info',
            popover: {
                title: 'اطلاعات تکمیلی',
                description: 'مشاهده نام کاربر، دسته‌بندی تیکت و زمان‌های ثبت و بروزرسانی.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-support-ticket-messages',
            popover: {
                title: 'تاریخچه پیام‌ها',
                description: 'مشاهده تمام گفتگوهای رد و بدل شده بین کاربر و پشتیبانی به صورت زمانی.',
                side: 'top',
                align: 'start'
            },
        },
        {
            element: '#admin-support-ticket-reply',
            popover: {
                title: 'پاسخ به تیکت',
                description: 'در این بخش می‌توانید پاسخ خود را برای کاربر ارسال کرده و روند حل مشکل را پیگیری کنید.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminCreateSupportTicketTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-support-create-header',
            popover: {
                title: 'ایجاد تیکت جدید',
                description: 'ثبت تیکت جدید برای یک موضوع یا کاربر خاص از این صفحه امکان‌پذیر است.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-support-create-form',
            popover: {
                title: 'فرم ثبت اطلاعات',
                description: 'وارد کردن موضوع، دسته‌بندی، اولویت و شرح مسئله برای تیکت جدید در این فرم انجام می‌شود.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminApplicantExamsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-applicant-exams-header',
            popover: {
                title: 'آزمون‌های متقاضیان',
                description: 'در این صفحه می‌توانید لیست تمام مجموعه‌های آزمون اختصاص یافته به متقاضیان را مشاهده کنید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-applicant-exams-stats',
            popover: {
                title: 'آمار کلی آزمون‌ها',
                description: 'مشاهده سریع تعداد کل آزمون‌ها و وضعیت فعلی آن‌ها (تکمیل شده، در جریان یا در انتظار).',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-applicant-exams-search',
            popover: {
                title: 'جستجوی پیشرفته',
                description: 'امکان جستجو بر اساس نام متقاضی، نام سازمان یا عنوان آزمون.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-applicant-exams-table',
            popover: {
                title: 'فهرست آزمون‌ها',
                description: 'جزییات هر مجموعه آزمون شامل زمان برگزاری و میزان پیشرفت در این جدول قابل مشاهده است.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const adminApplicantExamResultsTourConfig: Config = {
    showProgress: true,
    steps: [
        {
            element: '#admin-exam-results-header',
            popover: {
                title: 'نتایج آزمون متقاضی',
                description: 'در این بخش نتایج دقیق و تحلیل‌های مربوط به آزمون‌های یک متقاضی خاص نمایش داده می‌شود.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-exam-results-tabs',
            popover: {
                title: 'بخش‌های مختلف نتایج',
                description: 'با استفاده از این تب‌ها می‌توانید به نمودارهای نمرات، تحلیل تشریحی، پاسخنامه‌ها و فایل‌های پیوست دسترسی داشته باشید.',
                side: 'bottom',
                align: 'start'
            },
        },
        {
            element: '#admin-exam-results-chart',
            popover: {
                title: 'نمودار عملکرد',
                description: 'نمای گرافیکی از نمرات متقاضی در حوزه‌های مختلف برای ارزیابی سریع نقاط قوت و ضعف.',
                side: 'left',
                align: 'start'
            },
        },
        {
            element: '#admin-exam-results-analysis',
            popover: {
                title: 'تحلیل تخصصی',
                description: 'متن تحلیلی و پیشنهادات نهایی بر اساس نتایج آزمون در تب تحلیل قابل مشاهده و ویرایش است.',
                side: 'top',
                align: 'start'
            },
        },
        {
            element: '#admin-exam-results-files',
            popover: {
                title: 'مدیریت فایل‌ها',
                description: 'در تب فایل‌ها می‌توانید گزارش‌های PDF یا اکسل نهایی را آپلود، دانلود یا مدیریت کنید.',
                side: 'top',
                align: 'start'
            },
        },
    ],
}

export const getTourConfigByPath = (path: string): Config | null => {
    if (path === '/owner/dashboard') return dashboardTourConfig
    if (path === '/owner/managers') return managersTourConfig
    if (path === '/owner/companies') return companiesTourConfig
    if (path === '/owner/exams-results') return examsResultsTourConfig
    if (path === '/owner/accounting/documents') return financialDocumentsTourConfig
    if (path === '/owner/accounting/bills') return billsTourConfig
    if (path === '/owner/user-profile') return userProfileTourConfig
    if (path === '/owner/support/tickets' || path === '/owner/support') return supportTourConfig
    if (path === '/owner/support/create') return createTicketTourConfig

    if (path === '/admin/dashboard') return adminDashboardTourConfig
    if (path === '/admin/companies') return adminCompaniesTourConfig
    if (path === '/admin/assessments/completed') return adminCompletedAssessmentsTourConfig
    if (path === '/admin/applicant-exams') return adminApplicantExamsTourConfig
    if (path === '/admin/accounting/documents') return adminFinancialDocsTourConfig
    if (path === '/admin/accounting/bills') return adminBillsTourConfig
    if (path === '/admin/support/tickets' || path === '/admin/support') return adminSupportTourConfig
    if (path === '/admin/support/create') return adminCreateSupportTicketTourConfig
    if (path === '/admin/assessment/forms') return adminAssessmentFormsTourConfig
    if (path === '/admin/exams') return adminExamsTourConfig
    if (path === '/admin/exams/create') return adminCreateExamTourConfig

    // Pattern match for assessment routes
    if (path.match(/\/owner\/managers\/[^/]+\/assessment/)) return applicantAssessmentTourConfig
    if (path.match(/\/owner\/managers\/[^/]+\/exams\/[^/]+\/results/)) return examResultsTourConfig
    if (path.match(/\/admin\/assessments\/[^/]+/)) return adminAssessmentViewTourConfig
    if (path.match(/\/admin\/companies\/[^/]+\/managers/)) return adminCompanyManagersTourConfig
    if (path.match(/\/admin\/applicant-exams\/[^/]+\/results/)) return adminApplicantExamResultsTourConfig
    if (path.match(/\/admin\/accounting\/documents\/[^/]+/)) return adminFinancialDocViewTourConfig
    if (path.match(/\/admin\/accounting\/bills\/[^/]+/)) return adminBillViewTourConfig
    if (path.match(/\/admin\/support\/ticket\/[^/]+/)) return adminSupportTicketViewTourConfig
    if (path.match(/\/admin\/exams\/[^/]+/)) return adminExamDetailsTourConfig

    return null
}
