import Image from "next/image"
import { ArrowDownToLine, Bookmark, Edit, History, MonitorOff, MoreHorizontal, RefreshCw, Search, Settings, Trash2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// This would come from your YouTube API client
async function getChannelData(id: string) {
  // Implementation of YouTube API call
  return {} as any
}

export default async function ChannelPage({ params }: { params: { id: string } }) {
  const channel = await getChannelData(params.id)
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 bg-gray-600" />
          <Button variant="ghost" size="icon" className="text-white">
            <MonitorOff className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Banner and Channel Info */}
      <div className="relative h-[300px]">
        <Image
          src={channel.brandingSettings?.image?.bannerExternalUrl || "/placeholder.svg?height=300&width=1280"}
          alt="Channel banner"
          width={1280}
          height={300}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 p-6">
          <div className="flex gap-6 h-full">
            {/* Left Column - Channel Image */}
            <div className="w-[200px] h-[200px] flex-shrink-0">
              <Image
                src={channel.snippet?.thumbnails?.high?.url || "/placeholder.svg?height=200&width=200"}
                alt="Channel thumbnail"
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-lg border-2 border-white/20"
              />
            </div>

            {/* Right Column - Channel Details */}
            <div className="flex flex-col flex-grow">
              <h1 className="text-2xl font-bold text-white mb-2">
                {channel.snippet?.title || "Channel Title"}
              </h1>
              <div className="flex items-center text-sm text-white/80 space-x-4 mb-2">
                <span>{channel.statistics?.videoCount || "0"} videos</span>
                <span>{channel.statistics?.subscriberCount || "0"} subscribers</span>
                <span>Joined {new Date(channel.snippet?.publishedAt || Date.now()).getFullYear()}</span>
              </div>
              <div className="text-sm text-white/60 mb-4">
                {channel.snippet?.customUrl || ""}
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-white/80">{channel.statistics?.viewCount || "0"} views</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {channel.status?.privacyStatus || "Public"}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {channel.status?.isLinked ? "Linked" : "Unlinked"}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {channel.status?.longUploadsStatus || "Eligible for long uploads"}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {channel.snippet?.country || "Country: Unknown"}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {channel.topicDetails?.topicCategories?.[0]?.split('/').pop() || "Category: Unknown"}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {channel.statistics?.hiddenSubscriberCount ? "Hidden Subscriber Count" : "Visible Subscriber Count"}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {channel.brandingSettings?.channel?.moderateComments ? "Comments Moderated" : "Comments Unmoderated"}
                </Badge>
              </div>
              <p className="text-sm text-white/80">
                {channel.snippet?.description || "Channel description"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="flex-grow bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Latest Videos</h2>
              <span className="text-sm text-gray-500">{channel.statistics?.videoCount || "0"} videos</span>
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
                <th className="p-2 text-left font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(12)].map((_, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="p-2 text-sm">{index + 1}</td>
                  <td className="p-2 text-sm">
                    {`Video Title ${index + 1}`}
                  </td>
                  <td className="p-2 text-sm">{new Date(Date.now() - index * 86400000).toLocaleDateString()}</td>
                  <td className="p-2">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                      Downloaded
                    </span>
                  </td>
                  <td className="p-2">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <ArrowDownToLine className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

