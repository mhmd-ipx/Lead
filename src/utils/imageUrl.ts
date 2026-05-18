/**
 * Resolves relative image/avatar URLs from the backend into absolute URLs.
 */
export const getImageUrl = (url?: string | null): string => {
    if (!url) return ''
    
    // If it's already an absolute URL or a base64 data URI, return it as-is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url
    }
    
    // Clean any leading slash
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url
    
    // If it starts with storage/, append the backend domain
    if (cleanUrl.startsWith('storage/')) {
        return `https://api.leadmapro.com/${cleanUrl}`
    }
    
    // Otherwise, append the backend storage base URL
    return `https://api.leadmapro.com/storage/${cleanUrl}`
}
