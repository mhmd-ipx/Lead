import { useRef } from 'react'
import { driver, Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/assets/styles/vendors/driver-custom.css'
import { Config } from 'driver.js'

const useTour = () => {
    const driverRef = useRef<Driver | null>(null)

    const startTour = (config: Config) => {
        // Destroy existing instance if any
        if (driverRef.current) {
            driverRef.current.destroy()
        }

        // Create new instance with provided config
        driverRef.current = driver({
            ...config,
            nextBtnText: 'بعدی',
            prevBtnText: 'قبلی',
            doneBtnText: 'اتمام',
            progressText: '{{current}} از {{total}}',
            showProgress: true,
        })

        driverRef.current.drive()
    }

    return {
        startTour,
    }
}

export default useTour
