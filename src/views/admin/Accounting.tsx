import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui'

const Accounting = () => {
    const navigate = useNavigate()

    useEffect(() => {
        // Redirect to financial documents page
        navigate('/admin/accounting/documents', { replace: true })
    }, [navigate])

    return (
        <div className="flex items-center justify-center h-full">
            <Spinner size={40} />
        </div>
    )
}

export default Accounting
