import { Channel } from "@/types/channel";
import Link from "next/link";
import Image from 'next/image';

interface ChannelCardProps {
  channel: Channel
}

export function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <div key={channel.id} className="relative group">
      <div className="absolute top-2 right-2 bg-primary w-3 h-3 rotate-45" aria-hidden="true" />
      <Link href={`/channels/${channel.id}`}>
        <Image
          src={channel.image}
          alt={channel.name}
          width={1000}
          height={1000}
          className="w-full aspect-[2/3] object-cover rounded"
          quality={100}
        />
      </Link>
      <div className="mt-2 space-y-1">
        <div className="text-sm text-gray-300">{channel.monitored ? 'Monitored' : 'Not Monitored'}</div>
        <div className="text-xs text-gray-500">Added: {channel.created}</div>
      </div>
    </div>
  )
}

