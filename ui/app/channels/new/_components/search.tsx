'use client'

import { useState, useEffect } from 'react'
import { Search, X, ExternalLink, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from 'use-debounce'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { YoutubeChannel } from '@/types/channel'
import { search } from '@/actions/channels'
import Link from 'next/link'
import { AddChannelModal } from '@/components/add-channel-modal'
import { RootFolder } from '@/types/fs'

interface ChannelSearchProps {
    rootFolders: RootFolder[]
}

export function ChannelSearch({rootFolders}:ChannelSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 500)
  const [isLoading, setIsLoading] = useState(false)
  const [channels, setChannels] = useState<YoutubeChannel[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<YoutubeChannel | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  async function searchChannels(searchQuery: string) {
    if (!searchQuery) {
      setChannels([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    try {
      let searchResults = await search(searchQuery);

      if(searchResults.success){
        setChannels(searchResults.data)
      } else {
        // TODO: add toaster with error
        setChannels([])
      }
    } catch (error) {
      console.error('Failed to search channels:', error)
      setChannels([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (debouncedQuery) {
      searchChannels(debouncedQuery)
    } else {
      setChannels([])
      setHasSearched(false)
      setIsLoading(false)
    }
  }, [debouncedQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    if (newQuery === '') {
      setIsLoading(false)
      setHasSearched(false)
      setChannels([])
    } else if (!isLoading) {
      setIsLoading(true)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setChannels([])
    setHasSearched(false)
    setIsLoading(false)
  }

  const handleChannelClick = (channel: YoutubeChannel) => {
    setSelectedChannel(channel)
    setModalOpen(true)
  }

  return (
    <div className="w-full pt-8">
      <div className="px-4">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="eg. Breaking Bad, tvdb:####"
              value={query}
              onChange={handleInputChange}
              className="w-full pl-9 pr-12"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!query && (
          <div className="mt-4 text-center space-y-2">
            <p className="text-lg font-medium">
              It's easy to add new channels, just start typing the name of the channel you want to add.
            </p>
            <p className="text-sm text-muted-foreground">
              You can also search using the id of a channel. eg. UC6uKrU_WqJ1R2HMTY3LIx5Q
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg border bg-card">
                <Skeleton className="h-[100px] w-[100px] rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))
          ) : channels.length > 0 ? (
            channels.map((channel) => (
              <div
                key={channel.channelId}
                className="flex gap-4 p-4 rounded-lg border bg-card relative group cursor-pointer hover:bg-accent"
                onClick={() => handleChannelClick(channel)}
              >
                <img
                  src={channel.thumbnails.default.url}
                  alt={channel.title}
                  className="h-[100px] w-[100px] rounded object-cover"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-medium">
                      {channel.title}
                    </h3>
                    <Link target="_blank" href={`https://youtube.com/channel/${channel.channelId}`}>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5 mb-1.5">
                    <Badge variant="secondary">
                      <Calendar className="w-3 h-3 mr-1" />
                      Since {channel.publishedAt}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {channel.description}
                  </p>
                </div>
              </div>
            ))
          ) : hasSearched && !isLoading ? (
            <div className="text-center text-muted-foreground">
              No channels found. Try a different search term.
            </div>
          ) : null}
        </div>
      </div>
      {selectedChannel && (
        <AddChannelModal
          channel={selectedChannel}
          open={modalOpen}
          onOpenChange={setModalOpen}
          rootFolders={rootFolders}
        />
      )}
    </div>
  )
}

