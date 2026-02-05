import Cookies from 'js-cookie'

type StateStorage = {
    getItem: (name: string) => string | null | Promise<string | null>
    setItem: (name: string, value: string) => void | Promise<void>
    removeItem: (name: string) => void | Promise<void>
}

const cookiesStorage: StateStorage = {
    getItem: (name: string) => {
        return Cookies.get(name) ?? null
    },
    setItem: (name: string, value: string) => {
        // تنظیمات امنیتی برای cookie
        Cookies.set(name, value, {
            expires: 7, // 7 روز
            secure: window.location.protocol === 'https:', // فقط HTTPS (در production)
            sameSite: 'strict', // محافظت در برابر CSRF
            path: '/', // در تمام مسیرها قابل دسترسی
        })
    },
    removeItem: (name: string) => {
        Cookies.remove(name, { path: '/' })
    },
}

export default cookiesStorage
