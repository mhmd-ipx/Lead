import { mock } from '../MockAdapter'
import { signInUserData } from '../data/authData'

mock.onPost(`/login`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        phone: string
        otp: string
    }

    const { phone, otp } = data

    // Mock OTP validation - in real app, verify against sent OTP
    const user = signInUserData.find(
        (user) => user.phone === phone,
    )

    if (user && otp === '123456') { // Mock OTP
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve([
                    201,
                    {
                        user: {
                            userId: user.id,
                            userName: user.userName,
                            authority: user.authority,
                            avatar: user.avatar,
                            phone: user.phone,
                        },
                        token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
                    },
                ])
            }, 800)
        })
    }

    return [401, { message: 'Invalid phone or OTP!' }]
})

mock.onPost(`/sign-up`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        phone: string
        password: string
        userName: string
    }

    const { phone, userName } = data

    const phoneUsed = signInUserData.some((user) => user.phone === phone)
    const newUser = {
        avatar: '',
        userName,
        phone,
        authority: ['admin', 'user'],
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            if (phoneUsed) {
                resolve([400, { message: 'User already exist!' }])
            }

            resolve([
                201,
                {
                    user: newUser,
                    token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
                },
            ])
        }, 800)
    })
})

mock.onPost(`/reset-password`).reply(() => {
    return [200, true]
})

mock.onPost(`/forgot-password`).reply(() => {
    return [200, true]
})

mock.onPost(`/sign-out`).reply(() => {
    return [200, true]
})
