"use client"

import { Download, MoreHorizontal, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { formatNumber } from "@/lib/utils"
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { createBrowserClient } from '@/lib/pocketbase'
import { Channel, ChannelVideo } from '@/types/channel'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { downloadVideo } from '@/actions/channels'
import MonitorToggle from './video-list-monitor'
import { FixedSizeList as VirtualizedList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import Client from 'pocketbase'

interface VideoListProps {
  channel: Channel
  initialVideos: ChannelVideo[]
  dbHost: string
}

export default function VideoList({ channel, initialVideos, dbHost }: VideoListProps) {
  const [videos, setVideos] = useState<ChannelVideo[]>(initialVideos);
  const [temporaryBlock, setTemporaryBlock] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('');
  const pbRef = useRef<Client>(null);

  const filteredVideos = useMemo(() => {
    return videos.filter(video =>
      video.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [videos, filter]);

  const requestDownload = useCallback(async (youtube_id: string) => {
    await downloadVideo(youtube_id);
  }, []);

  const renderStatus = useCallback((video: ChannelVideo) => {
    switch (video.status) {
      case 'none':
        return <Button
          disabled={temporaryBlock.includes(video.youtube_id)}
          className="p-1 h-6 bg-secondary border border-primary text-primary hover:text-white"
          onClick={() => {
            requestDownload(video.youtube_id);
            setTemporaryBlock(prev => [...prev, video.youtube_id]);
            setTimeout(() => {
              setTemporaryBlock(prev => prev.filter(id => id !== video.youtube_id));
            }, 10000)
          }}
        >
          <Download />
        </Button>
      case 'queued':
        return <Badge>Queued</Badge>;
      case 'downloading':
        return <Progress value={video.progress} />;
      case 'finished':
        return <Badge>{video.quality}</Badge>
    }
  }, [temporaryBlock, requestDownload]);

  useEffect(() => {
    const pb = createBrowserClient(dbHost);
    pbRef.current = pb;

    try {
      pb.collection('channel_videos').subscribe<ChannelVideo>('*', (video) => {
        setVideos((prevVideos) => {
          const updatedVideos = [...prevVideos];
          const index = updatedVideos.findIndex(v => v.id === video.record.id);

          if (index !== -1) {
            updatedVideos[index] = video.record;
          } else {
            updatedVideos.push(video.record);
          }

          return updatedVideos
            .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
        });
      }, {
        filter: `channel = "${channel.id}"`
      });
    } catch (e) {
      console.error(e);
    }

    return () => {
      pb.collection('channel_videos').unsubscribe('*');
    }
  }, [channel]);

  const VideoRow = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const video = filteredVideos[index];
    return (
      <div
        style={style}
        className="grid grid-cols-[50px_100px_2fr_150px_100px] items-center border-b last:border-b-0"
      >
        <div className="p-2">
          <MonitorToggle video={video} initialState={video.monitored} disabled={(video.is_short && channel.ignore_shorts) || channel.monitored == 'none'} />
        </div>
        <div className="p-2 text-sm">{Math.abs(index - filteredVideos.length)}</div>
        <div className="p-2 text-sm">{video.title} {video.is_short ? <Badge className="ml-2">Short</Badge> : ""}</div>
        <div className="p-2 text-sm">{new Date(video.published).toLocaleDateString()}</div>
        <div className="p-2">{renderStatus(video)}</div>
      </div>
    );
  }, [filteredVideos, renderStatus, channel]);

  return (
    <div className="flex-grow bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">Videos</h2>
            <span className="text-sm text-gray-500">
              {formatNumber(videos.length || 0)} videos /
              {formatNumber(videos.filter(v => v.status !== 'finished' && v.monitored).length)} Missing
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              className="w-64"
              placeholder="Filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
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
            <tr className="grid grid-cols-[50px_100px_2fr_150px_100px] bg-gray-50 border-b">
              <th className="p-2 text-left font-medium text-gray-500"></th>
              <th className="p-2 text-left font-medium text-gray-500">#</th>
              <th className="p-2 text-left font-medium text-gray-500">Title</th>
              <th className="p-2 text-left font-medium text-gray-500">Published Date</th>
              <th className="p-2 text-left font-medium text-gray-500">Status</th>
            </tr>
          </thead>

        </table>
        <div style={{ height: '600px', width: '100%' }} role="rowgroup">
          <AutoSizer>
            {({ height, width }) => (
              <VirtualizedList
                height={height}
                width={width}
                itemCount={filteredVideos.length}
                itemSize={50}
                overscanCount={10}
              >
                {VideoRow}
              </VirtualizedList>
            )}
          </AutoSizer>
        </div>

      </div>
    </div>
  );
}