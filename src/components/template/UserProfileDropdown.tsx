import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { PiUserDuotone, PiSignOutDuotone, PiGearDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = [
    {
        label: 'تنظیمات کاربری',
        path: '/owner/user-profile',
        icon: <PiGearDuotone />,
    },
]

const _UserDropdown = () => {
    const { avatar, userName, email } = useSessionUser((state) => state.user)
    const [isOpen, setIsOpen] = useState(false)

    const { signOut } = useAuth()

    const handleSignOut = () => {
        setIsOpen(true)
    }

    const handleConfirm = () => {
        setIsOpen(false)
        signOut()
    }

    const handleCancel = () => {
        setIsOpen(false)
    }

    const avatarProps = {
        ...(avatar ? { src: avatar } : { icon: <PiUserDuotone /> }),
    }

    return (
        <>
            <Dropdown
                className="flex"
                toggleClassName="flex items-center"
                renderTitle={
                    <div className="cursor-pointer flex items-center">
                        <Avatar size={32} {...avatarProps} />
                    </div>
                }
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-3">
                        <Avatar {...avatarProps} />
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {userName || 'Anonymous'}
                            </div>
                            <div className="text-xs">
                                {email || 'No email available'}
                            </div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="px-0"
                    >
                        <Link className="flex h-full w-full px-2" to={item.path}>
                            <span className="flex gap-2 items-center w-full">
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </span>
                        </Link>
                    </Dropdown.Item>
                ))}
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    onClick={handleSignOut}
                >
                    <span className="text-xl">
                        <PiSignOutDuotone />
                    </span>
                    <span>خروج</span>
                </Dropdown.Item>
            </Dropdown>
            <ConfirmDialog
                isOpen={isOpen}
                type="danger"
                title="خروج از حساب"
                confirmText="خروج"
                cancelText="انصراف"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                onClose={handleCancel}
            >
                <p>آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟</p>
            </ConfirmDialog>
        </>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
