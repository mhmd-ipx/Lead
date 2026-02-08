import Avatar from '@/components/ui/Avatar'
import acronym from '@/utils/acronym'
import useRandomBgColor from '@/utils/hooks/useRandomBgColor'
import {
    HiOutlineCalendar,
    HiOutlineClipboardCheck,
    HiOutlineBan,
    HiOutlineInformationCircle,
    HiOutlineCreditCard,
    HiOutlineSupport,
    HiOutlineClipboardList,
} from 'react-icons/hi'

const imagePath = '/img/avatars/'

const GeneratedAvatar = ({ target }: { target: string }) => {
    const color = useRandomBgColor()
    return (
        <Avatar shape="circle" className={`text-gray-900 ${color(target)}`}>
            {acronym(target)}
        </Avatar>
    )
}

const NotificationAvatar = (props: {
    type: number
    target: string
    image: string
    status: string
}) => {
    const { type, target, image, status } = props
    switch (type) {
        case 0:
            if (image) {
                return <Avatar shape="circle" src={`${imagePath}${image}`} />
            } else {
                return <GeneratedAvatar target={target} />
            }
        case 1:
            return (
                <Avatar
                    shape="circle"
                    className="bg-sky-200 text-gray-900"
                    icon={<HiOutlineCalendar />}
                />
            )
        case 2:
            return (
                <Avatar
                    shape="circle"
                    className={
                        status === 'succeed'
                            ? 'bg-emerald-200 text-gray-900'
                            : 'bg-red-200 text-gray-900'
                    }
                    icon={
                        status === 'succeed' ? (
                            <HiOutlineClipboardCheck />
                        ) : (
                            <HiOutlineBan />
                        )
                    }
                />
            )
        case 3: // system
            return (
                <Avatar
                    shape="circle"
                    className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100"
                    icon={<HiOutlineInformationCircle />}
                />
            )
        case 4: // payment
            return (
                <Avatar
                    shape="circle"
                    className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100"
                    icon={<HiOutlineCreditCard />}
                />
            )
        case 5: // support
            return (
                <Avatar
                    shape="circle"
                    className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100"
                    icon={<HiOutlineSupport />}
                />
            )
        case 6: // assessment
            return (
                <Avatar
                    shape="circle"
                    className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100"
                    icon={<HiOutlineClipboardList />}
                />
            )
        default:
            return <Avatar />
    }
}

export default NotificationAvatar
