"use client"

import { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Folder as FolderIcon} from 'lucide-react'
import path from 'path'
import type { CreateRootFolder, FSFolder, } from "@/types/fs"
import { browseFSFolders } from "@/actions/fs"

interface FileBrowserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (folder: CreateRootFolder) => void
}

export function FileBrowserDialog({ open, onOpenChange, onSelect }: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState("/")
  const [items, setItems] = useState<FSFolder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFolderContents = useCallback(async (path: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const folders = await browseFSFolders(path);
      if (!folders.success) {
        throw new Error(folders.error?.message || 'Error fetching folder contents')
      }
      setItems(folders.data)
      setCurrentPath(path)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchFolderContents(currentPath)
    }
  }, [open, currentPath, fetchFolderContents])

  const handleItemClick = (item: FSFolder) => {
    fetchFolderContents(item.path)
  }

  const handleParentDirectoryClick = () => {
    const parentPath = path.dirname(currentPath)
    fetchFolderContents(parentPath)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Folder Browser</DialogTitle>
          <DialogDescription>
            Select a folder to add as a root folder for video management.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Current path"
            value={currentPath}
            onChange={(e) => setCurrentPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchFolderContents(currentPath)
              }
            }}
          />
          <div className="grid grid-cols-[auto_1fr] gap-4 text-sm font-medium text-muted-foreground">
            <div>Type</div>
            <div>Name</div>
          </div>
          <div className="h-[300px] border rounded-md overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">Loading...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">{error}</div>
            ) : (
              <div className="space-y-1 p-1">
                {currentPath !== '/' && (
                  <button
                    onClick={handleParentDirectoryClick}
                    className="w-full grid grid-cols-[auto_1fr] gap-4 px-2 py-1 text-sm hover:bg-accent rounded-sm"
                  >
                    <FolderIcon className="h-4 w-4" />
                    <span className="text-left">..</span>
                  </button>
                )}
                {items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleItemClick(item)}
                    className="w-full grid grid-cols-[auto_1fr] gap-4 px-2 py-1 text-sm hover:bg-accent rounded-sm"
                  >
                    <FolderIcon className="h-4 w-4" />
                    <span className="text-left">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              onSelect({path:currentPath})
            }}>
              Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

