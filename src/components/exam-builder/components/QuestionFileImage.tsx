import { useState, useEffect } from 'react'
import { apiGetFileInfo } from '@/services/FileService'
import { Skeleton } from '@/components/ui'

interface QuestionFileImageProps {
    fileId?: number | string
    className?: string
    fallbackUrl?: string
}

const QuestionFileImage = ({ fileId, className, fallbackUrl }: QuestionFileImageProps) => {
    const [imageUrl, setImageUrl] = useState<string | undefined>(fallbackUrl)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (fileId && (typeof fileId === 'number' || (typeof fileId === 'string' && fileId !== 'uploading'))) {
            fetchImageUrl(fileId)
        } else {
            setImageUrl(fallbackUrl)
        }
    }, [fileId, fallbackUrl])

    const fetchImageUrl = async (id: number | string) => {
        setIsLoading(true)
        try {
            const res = await apiGetFileInfo(id)
            if (res && res.address) {
                setImageUrl(res.address)
            }
        } catch (error) {
            console.error('Error fetching question image:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <Skeleton className={className} />
    }

    if (!imageUrl) {
        return null
    }

    return (
        <img 
            src={imageUrl} 
            alt="Question/Option" 
            className={className} 
            onError={() => setImageUrl(undefined)}
        />
    )
}

export default QuestionFileImage
