'use client'

import { X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip'
import { YoutubeChannel } from '@/types/channel'
import { add, getByYoutubeId } from '@/actions/channels'
import { useEffect, useLayoutEffect, useState } from 'react'

interface AddChannelModalProps {
  channel: YoutubeChannel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddChannelModal({ channel, open, onOpenChange }: AddChannelModalProps) {
  if (!channel) return null

  const [ isPending, setIsPending ] = useState(true);
  const [ isAdded, setIsAdded ] = useState(false);

  const addChannel = async () => {
    setIsPending(true);
    const newChannel = await add({
        name: channel.title,
        image: channel.thumbnails.high.url,
        monitored: true, //TODO: updated based on user selection
        youtube_id: channel.channelId
    });

    if(newChannel.success){
        onOpenChange(false);
    } else {
        // TODO: add toaster with error message
        console.error('Failed to add new channel');
    }
    setIsPending(false);
  }

  const getChannelStatus = async () => {
    setIsPending(true);

    const channelCheck = await getByYoutubeId(channel.channelId);

    if (channelCheck.success){
        setIsAdded(true);
    } else {
        setIsAdded(false);
    }

    setIsPending(false);
  }

  useLayoutEffect(()=>{
      getChannelStatus();
  }, [channel])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {channel.title} <span className="text-muted-foreground">({channel.publishedAt})</span>
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex gap-6 mt-4">
          <img
            src={channel.thumbnails.high.url}
            alt=""
            className="h-[270px] w-[180px] rounded-lg object-cover"
          />
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Root Folder</label>
              <Input value="/unraid/Media/Anime/Breaking In" readOnly />
              <p className="text-sm text-muted-foreground">
                &apos;Breaking In&apos; subfolder will be created automatically
              </p>
            </div>
            
            <div className="space-y-2">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Monitor</label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            Choose what episodes to monitor
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <Select defaultValue="all">
                <SelectTrigger>
                <SelectValue placeholder="Select monitor option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Episodes</SelectItem>
                    <SelectItem value="future">Future Episodes</SelectItem>
                    <SelectItem value="missing">Missing Episodes</SelectItem>
                    <SelectItem value="existing">Existing Episodes</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
            <label className="text-sm font-medium">Quality Profile</label>
            <Select defaultValue="any">
                <SelectTrigger>
                <SelectValue placeholder="Select quality profile" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="2160p">2160p (4K)</SelectItem>
                <SelectItem value="1080p">1080p (HD)</SelectItem>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="480p">480p (SD)</SelectItem>
                <SelectItem value="360p">360p (LD)</SelectItem>
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input placeholder="Enter tags" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="start-search" defaultChecked />
                <label
                  htmlFor="start-search"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Start search for missing episodes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="cutoff-search" />
                <label
                  htmlFor="cutoff-search"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Start search for cutoff unmet episodes
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-green-500 hover:bg-green-600" onClick={addChannel} disabled={isAdded || isPending}>
            {isPending ? 'Checking..' : isAdded ? 'Already Added' : `Add ${channel.title}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

