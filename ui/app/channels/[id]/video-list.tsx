"use client"

import { MoreHorizontal, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { formatNumber } from "@/lib/utils"
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/pocketbase'
import { Channel, ChannelVideo } from '@/types/channel'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface VideoListProps {
  channel: Channel
  initialVideos: ChannelVideo[]
}

export default function VideoList({ channel, initialVideos }: VideoListProps) {

  const [videos, setVideos] = useState<ChannelVideo[]>([]);

  const renderStatus = (video: ChannelVideo) => {
    switch (video.status) {
      case 'none':
        return null;
      case 'queued':
        return <Badge>Queued</Badge>;
      case 'downloading':
        return <Progress value={video.progress} />;
      case 'finished':
        return <Badge>{video.quality}</Badge>
    }
  }

  useEffect(() => {
    const pb = createBrowserClient();
    setVideos(initialVideos);

    try {
      pb.collection('channel_videos').subscribe<ChannelVideo>('*', (video) => {
        setVideos((prevVideos) => {

          let existingVideo = prevVideos.find(v => v.id == video.record.id);

          if (existingVideo) {
            prevVideos = prevVideos.map(v => {
              if (v.id == video.record.id) {
                return video.record;
              }
              return v;
            })
          } else {
            prevVideos.push(video.record);
          }

          return prevVideos.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
        })
      }, {
        filter: `channel = "${channel.id}"`
      });
    } catch (err) {
      console.error(err);
    }

    return () => {
      pb.collection('channel_videos').unsubscribe('*');
    }
  }, [channel])

  return <div className="flex-grow bg-gray-100 p-6">
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Videos</h2>
          <span className="text-sm text-gray-500">{formatNumber(videos.length || 0)} videos / {formatNumber(videos.filter(v => v.status !== 'finished').length)} Missing</span>
        </div>
        <div className="flex items-center space-x-2">
          <Input className="w-64" placeholder="Filter" />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2 text-left font-medium text-gray-500">#</th>
            <th className="p-2 text-left font-medium text-gray-500">Title</th>
            <th className="p-2 text-left font-medium text-gray-500">Published Date</th>
            <th className="p-2 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video, index) => (
            <tr key={index} className="border-b last:border-b-0">
              <td className="p-2 text-sm">{Math.abs(index - videos.length)}</td>
              <td className="p-2 text-sm">
                {video.title}
              </td>
              <td className="p-2 text-sm">{new Date(video.published).toLocaleDateString()}</td>
              <td className="p-2">
                {renderStatus(video)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}