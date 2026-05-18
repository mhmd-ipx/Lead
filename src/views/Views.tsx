import { Suspense } from 'react'
import Loading from '@/components/shared/Loading'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import AllRoutes from '@/components/route/AllRoutes'
import type { LayoutType } from '@/@types/theme'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

const Views = (props: ViewsProps) => {
    return (
        <ErrorBoundary>
            <Suspense fallback={<Loading loading={true} className="w-full" />}>
                <AllRoutes {...props} />
            </Suspense>
        </ErrorBoundary>
    )
}

export default Views
