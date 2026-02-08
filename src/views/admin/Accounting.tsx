import { Card } from '@/components/ui'
import { HiOutlineCash } from 'react-icons/hi'

const Accounting = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h3 className="mb-2 flex items-center gap-2">
                    <HiOutlineCash className="text-2xl text-primary" />
                    <span>مدیریت حسابداری</span>
                </h3>
                <p>مشاهده و مدیریت تراکنش‌ها و اسناد مالی</p>
            </div>

            <Card>
                <div className="p-4 text-center text-gray-500">
                    این بخش در حال توسعه است...
                </div>
            </Card>
        </div>
    )
}

export default Accounting
