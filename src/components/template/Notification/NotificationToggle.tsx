import classNames from '@/utils/classNames'
import Badge from '@/components/ui/Badge'
import { HiOutlineBell } from 'react-icons/hi'

const NotificationToggle = ({
    className,
    dot,
    count,
}: {
    className?: string
    dot: boolean
    count?: number
}) => {
    return (
        <div className={classNames('text-2xl', className)}>
            {dot && count && count > 0 ? (
                <Badge content={count} maxCount={99}>
                    <HiOutlineBell className="text-2xl cursor-pointer" />
                </Badge>
            ) : (
                <HiOutlineBell className="text-2xl cursor-pointer" />
            )}
        </div>
    )
}

export default NotificationToggle
