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
    const [isFetchingUrl, setIsFetchingUrl] = useState(false)
    const [isImageLoading, setIsImageLoading] = useState(true)

    useEffect(() => {
        if (fileId && (typeof fileId === 'number' || (typeof fileId === 'string' && fileId !== 'uploading'))) {
            fetchImageUrl(fileId)
        } else {
            setImageUrl(fallbackUrl)
            setIsImageLoading(true)
        }
    }, [fileId, fallbackUrl])

    const fetchImageUrl = async (id: number | string) => {
        setIsFetchingUrl(true)
        try {
            const res = await apiGetFileInfo(id)
            if (res && res.address) {
                setImageUrl(res.address)
                setIsImageLoading(true)
            }
        } catch (error) {
            console.error('Error fetching question image:', error)
        } finally {
            setIsFetchingUrl(false)
        }
    }

    if (isFetchingUrl) {
        return <Skeleton className={className} />
    }

    if (!imageUrl) {
        return null
    }

    return (
        <>
            {isImageLoading && <Skeleton className={className} />}
            <img 
                src={imageUrl} 
                alt="Question/Option" 
                className={className} 
                style={isImageLoading ? { display: 'none' } : {}}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                    setIsImageLoading(false)
                    setImageUrl(undefined)
                }}
            />
        </>
    )
}

export default QuestionFileImage
