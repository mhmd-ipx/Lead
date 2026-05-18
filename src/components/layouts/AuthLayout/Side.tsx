import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="relative w-full h-[100vh] bg-[#f4f7f6] dark:bg-slate-900 overflow-hidden flex items-center justify-center p-6">
            {/* Left Side: 72% Width Illustration Container */}
            <div className="absolute top-6 bottom-6 left-6 w-[80%] hidden lg:block rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100/50 dark:border-slate-800">
                <img
                    src="/img/others/login-image.webp"
                    className="w-full h-full object-cover"
                    alt="LEAD Project Auth Background"
                />
            </div>

            {/* Right Side: Floating Login Form Card (Overlaps the boundary) */}
            <div className="w-full max-w-[420px] lg:max-w-[440px] h-full lg:h-[calc(100vh-6rem)] min-h-[500px] lg:max-h-[660px] bg-white/20 dark:bg-slate-950/75 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-300/20 dark:shadow-none border-2 border-white/80 dark:border-slate-700/60 z-10 flex flex-col justify-center px-6 lg:px-10 py-8 lg:absolute lg:right-[6%] xl:right-[8%] 2xl:right-[7%] transition-all duration-300">
                <div className="w-full">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                            ...rest,
                        })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Side
