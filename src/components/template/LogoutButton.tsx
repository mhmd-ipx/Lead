import { useState } from 'react'
import Menu from '@/components/ui/Menu'
import VerticalMenuIcon from './VerticalMenuContent/VerticalMenuIcon'
import useAuth from '@/auth/useAuth'
import { useThemeStore } from '@/store/themeStore'
import Tooltip from '@/components/ui/Tooltip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const { MenuItem } = Menu

const LogoutButton = () => {
    const { signOut } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const sideNavCollapse = useThemeStore(
        (state) => state.layout.sideNavCollapse,
    )
    const direction = useThemeStore((state) => state.direction)

    const handleLogout = () => {
        setIsOpen(true)
    }

    const handleConfirm = () => {
        setIsOpen(false)
        signOut()
    }

    const handleCancel = () => {
        setIsOpen(false)
    }

    return (
        <>
            {sideNavCollapse ? (
                <Tooltip
                    title="خروج"
                    placement={direction === 'rtl' ? 'left' : 'right'}
                >
                    <MenuItem
                        key="logout"
                        eventKey="logout"
                        className="mb-2"
                        onSelect={handleLogout}
                    >
                        <VerticalMenuIcon icon="logout" gutter="" />
                    </MenuItem>
                </Tooltip>
            ) : (
                <MenuItem
                    key="logout"
                    eventKey="logout"
                    className="mb-2"
                    onSelect={handleLogout}
                >
                    <div className="flex items-center gap-2 h-full w-full">
                        <VerticalMenuIcon icon="logout" gutter="" />
                        <span>خروج</span>
                    </div>
                </MenuItem>
            )}
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

export default LogoutButton
