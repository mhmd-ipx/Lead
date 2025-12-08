import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth'
import { OWNER, MANAGER, ADMIN } from '@/constants/roles.constant'

const DashboardRedirect = () => {
    const { user } = useAuth()

    if (user?.authority?.includes(OWNER)) {
        return <Navigate to="/owner/dashboard" replace />
    } else if (user?.authority?.includes(MANAGER)) {
        return <Navigate to="/manager/dashboard" replace />
    } else if (user?.authority?.includes(ADMIN)) {
        return <Navigate to="/admin/dashboard" replace />
    } else {
        return <Navigate to="/login" replace />
    }
}

export default DashboardRedirect