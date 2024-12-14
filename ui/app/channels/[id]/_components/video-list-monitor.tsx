import { changeVideoMonitorStatus, changeChannelMonitorStatus } from '@/actions/channels'
import { Channel, ChannelVideo } from '@/types/channel'
import { Bookmark } from 'lucide-react'
import { useCallback, useOptimistic, useTransition } from 'react'

interface MonitorToggleProps {
  video?: ChannelVideo
  channel?: Channel
  initialState: boolean
  disabled?: boolean
  inverted?: boolean
  className?: string
}

export default function MonitorToggle({
  video,
  channel,
  initialState,
  disabled,
  inverted = false,
  className
}: MonitorToggleProps) {
  const [isMonitored, setIsMonitored] = useOptimistic(initialState);
  const [, startMonitorUpdate] = useTransition();

  const VARIANTS = {
    MONITORED: inverted ? 'fill-white stroke-white' : 'fill-primary stroke-primary',
    NOT_MONITORED: inverted ? 'stroke-white' : 'stroke-primary'
  }

  const toggleMonitorState = useCallback(async () => {
    setIsMonitored(!isMonitored);
    if (video) {
      await changeVideoMonitorStatus(video.id, !isMonitored);
    }
    if (channel) {
      await changeChannelMonitorStatus(channel.id, !isMonitored == true ? 'future' : 'none');
    }
  }, [video, channel, initialState])

  if (!disabled) {
    return <Bookmark
      onClick={() => startMonitorUpdate(() => toggleMonitorState())}
      className={`${isMonitored ? VARIANTS.MONITORED : VARIANTS.NOT_MONITORED} cursor-pointer ${className || ''}`}
    />
  } else {
    return <Bookmark className='stroke-slate-300 cursor-not-allowed' />
  }
}