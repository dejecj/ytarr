import { changeVideoMonitorStatus } from '@/actions/channels'
import { ChannelVideo } from '@/types/channel'
import { Bookmark } from 'lucide-react'
import { useCallback, useOptimistic, useTransition } from 'react'

interface MonitorToggleProps {
  video: ChannelVideo
  initialState: boolean
  disabled: boolean
}

export default function MonitorToggle({
  video,
  initialState,
  disabled
}: MonitorToggleProps) {
  const [isMonitored, setIsMonitored] = useOptimistic(initialState);
  const [, startMonitorUpdate] = useTransition();

  const toggleMonitorState = useCallback(async () => {
    setIsMonitored(!isMonitored);
    await changeVideoMonitorStatus(video.id, !isMonitored);
  }, [video, initialState])

  if (!disabled) {
    return <Bookmark
      onClick={() => startMonitorUpdate(() => toggleMonitorState())}
      className={`${isMonitored ? 'fill-primary stroke-none' : 'stroke-primary'} cursor-pointer`}
    />
  } else {
    return <Bookmark className='stroke-slate-300 cursor-not-allowed' />
  }
}