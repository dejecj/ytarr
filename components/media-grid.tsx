import { Channel } from "@/types/channel"
import { ChannelCard } from "./channel-card"

interface ChannelGridProps {
  channels: Channel[]
}

export function ChannelGrid({ channels }: ChannelGridProps) {
  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)] text-gray-400">
        <p>No channels to display. Add some channels to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 p-6">
      {channels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel}/>
      ))}
    </div>
  )
}

