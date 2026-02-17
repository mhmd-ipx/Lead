export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: 'https://api.leadmapro.com/api',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/login',
    locale: 'fa',
    accessTokenPersistStrategy: 'cookies',
    enableMock: false,
}

export default appConfig
