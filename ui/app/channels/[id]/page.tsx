import Image from "next/image"
import { Bookmark, Download, Edit, History, Trash2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { get, listAllVideos } from "@/actions/channels"
import { formatNumber } from "@/lib/utils"
import VideoList from "./video-list"

export default async function ChannelPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  let channel = await get(id);

  const splitKeywords = (keywordsString: string) => {
    const keywords = [];
    let currentWord = [];
    let inQuotes = false;

    for (let char of keywordsString) {
      if (char === '"') {
        inQuotes = !inQuotes;

        if (!inQuotes) {
          keywords.push(currentWord.join(''));
          currentWord = [];
        }
        continue;
      }

      if (char.match(/\s/) && !inQuotes) {
        if (currentWord.length) {
          keywords.push(currentWord.join(''));
          currentWord = [];
        }
      } else {
        currentWord.push(char);
      }
    }

    // Add any remaining word
    if (currentWord.length) {
      keywords.push(currentWord.join(''));
    }

    return keywords;
  }

  if (channel.success) {
    const channelData = channel.data;
    let videos = await listAllVideos(channelData.id);
    return (
      <div className="flex flex-col min-h-screen">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between p-2 bg-primary text-white">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-gray-600" />
            <Button variant="ghost" size="icon" className="text-white">
              <History className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Banner and Channel Info */}
        <div className="relative h-[300px]">
          <Image
            src={channelData.banner_image}
            alt="Channel banner"
            width={1280}
            height={300}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/85" />
          <div className="absolute inset-0 p-6">
            <div className="flex gap-6 h-full">
              {/* Left Column - Channel Image */}
              <div className="w-[200px] h-[200px] flex-shrink-0">
                <Image
                  src={channelData.image}
                  alt="Channel thumbnail"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover rounded-lg border-2 border-white/20"
                />
              </div>

              {/* Right Column - Channel Details */}
              <div className="flex flex-col flex-grow">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {channelData.name}
                </h1>
                <div className="flex items-center text-sm text-white/80 space-x-4 mb-2">
                  <span>{formatNumber(channelData.video_count || 0)} videos</span>
                  <span>{formatNumber(channelData.subscriber_count || 0)} subscribers</span>
                  <span>Joined {new Date(channelData.published).getFullYear()}</span>
                </div>
                <div className="text-sm text-white/60 mb-4">
                  {channelData.slug}
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-white/80">{formatNumber(channelData.view_count || 0)} views</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {
                    splitKeywords(channelData.keywords).slice(0, 15).map(k => {
                      return <Badge key={k} variant="secondary" className="bg-white/20 text-white">
                        {k}
                      </Badge>
                    })
                  }
                </div>
                <p className="text-sm text-white/80 line-clamp-3 overflow-hidden text-ellipsis">
                  {channelData.description || "Channel description"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video List */}
        <VideoList channel={channelData} initialVideos={videos.success ? videos.data : []} />
      </div>
    )
  } else {
    return <p>Oops! It seems we could not find the requested channel in your library.</p>
  }
}