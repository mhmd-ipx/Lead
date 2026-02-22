import Button from '@/components/ui/Button'
import { PiQuestionDuotone } from 'react-icons/pi'
import useTour from '@/utils/hooks/useTour'
import { getTourConfigByPath } from '@/configs/tour.config'
import { useLocation } from 'react-router-dom'
import withHeaderItem from '@/utils/hoc/withHeaderItem'

const _TourButton = () => {
    const { startTour } = useTour()
    const location = useLocation()
    const config = getTourConfigByPath(location.pathname)

    if (!config) {
        return null
    }

    return (
        <Button
            variant="plain"
            shape="circle"
            size="sm"
            icon={<PiQuestionDuotone />}
            className="text-2xl"
            onClick={() => startTour(config)}
        />
    )
}

const TourButton = withHeaderItem(_TourButton)

export default TourButton
