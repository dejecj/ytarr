'use client'

import { Info } from 'lucide-react'
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
import { useCallback, useEffect, useState } from 'react'
import { RootFolder } from '@/types/fs'

interface AddChannelModalProps {
    channel: YoutubeChannel
    open: boolean
    rootFolders: RootFolder[]
    onOpenChange: (open: boolean) => void
}

export function AddChannelModal({ channel, open, rootFolders, onOpenChange }: AddChannelModalProps) {

    const [isPending, setIsPending] = useState(true);
    const [isAdded, setIsAdded] = useState(false);
    const [selectedRootFolder, setSelectedRootFolder] = useState<string>(rootFolders[0]?.id);
    const [selectedMonitor, setSelectedMonitor] = useState<"all" | "future" | "none">("future");
    const [selectedQuality, setSelectedQuality] = useState<"any" | "2160p" | "1080p" | "720p" | "480p" | "360p">("any");

    const addChannel = useCallback(async () => {
        setIsPending(true);
        const newChannel = await add({
            name: channel.title,
            image: channel.thumbnails.high.url,
            monitored: selectedMonitor,
            youtube_id: channel.channelId,
            root_folder: selectedRootFolder as string,
            quality: selectedQuality,
            description: channel.description
        });

        if (newChannel.success) {
            onOpenChange(false);
            setIsAdded(true);
        } else {
            // TODO: add toaster with error message
            console.error('Failed to add new channel', newChannel.error);
        }
        setIsPending(false);
    }, [selectedRootFolder, channel, selectedMonitor, selectedQuality]);

    const getChannelStatus = async () => {
        setIsPending(true);

        const channelCheck = await getByYoutubeId(channel.channelId);

        if (channelCheck.success) {
            setIsAdded(true);
            setSelectedRootFolder(channelCheck.data.root_folder.id);
            setSelectedMonitor(channelCheck.data.monitored);
            setSelectedQuality(channelCheck.data.quality);
        } else {
            setIsAdded(false);
            setSelectedRootFolder(rootFolders[0]?.id);
            setSelectedMonitor('future');
            setSelectedQuality('any');
        }

        setIsPending(false);
    }

    useEffect(() => {
        getChannelStatus();
    }, [channel])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">
                            {channel.title} <span className="text-muted-foreground">({new Date(channel.publishedAt).getFullYear()})</span>
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
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Root Folder</label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Choose where the videos for this channel are located.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Select value={selectedRootFolder} onValueChange={(rf) => setSelectedRootFolder(rf)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select root folder" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rootFolders.map(rf =>
                                        <SelectItem key={rf.id} value={rf.id}>{rf.path}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
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
                            <Select defaultValue="future" value={selectedMonitor} onValueChange={(m: "all" | "future" | "none") => setSelectedMonitor(m)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select monitor option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Episodes</SelectItem>
                                    <SelectItem value="future">Future Episodes</SelectItem>
                                    {/* <SelectItem value="missing">Missing Episodes</SelectItem>
                                    <SelectItem value="existing">Existing Episodes</SelectItem> */}
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quality Profile</label>
                            <Select defaultValue="any" value={selectedQuality} onValueChange={(q: "any" | "2160p" | "1080p" | "720p" | "480p" | "360p") => setSelectedQuality(q)}>
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
                            <Input placeholder="Enter tags" disabled={true} />
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

