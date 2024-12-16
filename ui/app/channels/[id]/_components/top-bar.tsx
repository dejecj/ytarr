"use client"
import { Edit, History, Trash2 } from 'lucide-react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Channel } from '@/types/channel'
import { remove } from '@/actions/channels'
import MonitorToggle from './video-list-monitor'
import { createBrowserClient } from '@/lib/pocketbase'
import Client from 'pocketbase'

interface TopBarProps {
  channel: Channel
}

export default function TopBar({ channel }: TopBarProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [stateChannel, setStateChannel] = useState<Channel>(channel)
  const router = useRouter()

  const deleteChannel = useCallback(async () => {
    await remove(channel.id)
    setIsDeleteDialogOpen(false)
    router.push('/')
  }, [channel.id, router]);

  const pbRef = useRef<Client>(null);

  useEffect(() => {
    const pb = createBrowserClient();
    pbRef.current = pb;

    try {
      pb.collection('channels').subscribe<Channel>(channel.id, (c) => {
        setStateChannel(c.record);
      });
    } catch (e) {
      console.error(e);
    }

    return () => {
      pb.collection('channels').unsubscribe(channel.id);
    }
  }, [channel.id]);

  return (
    <>
      <div className="flex items-center justify-between p-2 bg-primary text-white">
        <div className="flex items-center space-x-2">
          {/* <Button variant="ghost" size="icon" className="text-white">
            <Bookmark className="h-4 w-4" />
          </Button> */}
          <MonitorToggle className="h-4 w-4" channel={stateChannel} initialState={stateChannel.monitored !== 'none'} inverted={true} />
          <Separator orientation="vertical" className="h-6 bg-gray-600" />
          <Button variant="ghost" size="icon" className="text-white">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            variant="ghost"
            size="icon"
            className="text-white"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the channel "{stateChannel.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteChannel}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

