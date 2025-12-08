import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const authRoute: Routes = [
    {
        key: 'login',
        path: `/login`,
        component: lazy(() => import('@/views/auth/SignIn')),
        authority: [],
    },
    {
        key: 'register',
        path: `/register`,
        component: lazy(() => import('@/views/auth/SignUp')),
        authority: [],
    },
    {
        key: 'forgotPassword',
        path: `/forgot-password`,
        component: lazy(() => import('@/views/auth/ForgotPassword')),
        authority: [],
    },
    {
        key: 'otp',
        path: `/otp`,
        component: lazy(() => import('@/views/auth/OtpVerification')),
        authority: [],
    },
    {
        key: 'help',
        path: `/help`,
        component: lazy(() => import('@/views/others/Help')),
        authority: [],
    },
]

export default authRoute
