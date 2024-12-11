import { changeVideoMonitorStatus } from '@/actions/channels'
import { ChannelVideo } from '@/types/channel'
import { Bookmark } from 'lucide-react'
import { useCallback, useOptimistic, useTransition } from 'react'

interface MonitorToggleProps {
  video: ChannelVideo
  initialState: boolean
}

export default function MonitorToggle({
  video,
  initialState
}: MonitorToggleProps) {
  const [isMonitored, setIsMonitored] = useOptimistic(initialState);
  const [, startMonitorUpdate] = useTransition();

  const toggleMonitorState = useCallback(async () => {
    setIsMonitored(!isMonitored);
    await changeVideoMonitorStatus(video.id, !isMonitored);
  }, [video, initialState])

  return <Bookmark
    onClick={() => startMonitorUpdate(() => toggleMonitorState())}
    className={`${isMonitored ? 'fill-primary stroke-none' : 'stroke-primary'} cursor-pointer`}
  />
}