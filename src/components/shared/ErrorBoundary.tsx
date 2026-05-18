import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
        
        // Check if the error is a dynamic import failure (chunk load error)
        const isChunkLoadError = 
            error?.name === 'ChunkLoadError' || 
            (error?.message && error.message.includes('Failed to fetch dynamically imported module')) ||
            (error?.message && error.message.includes('Importing a module script failed'))
            
        if (isChunkLoadError) {
            // Force a reload to get the new chunks
            window.location.reload()
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center p-8 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            به‌روزرسانی برنامه
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            نسخه جدیدی از سامانه در دسترس است. لطفاً برای اعمال تغییرات صفحه را رفرش کنید.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            بارگذاری مجدد
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
