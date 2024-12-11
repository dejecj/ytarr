"use client"

import { useOptimistic, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, LoaderCircle } from 'lucide-react'
import { FileBrowserDialog } from "@/components/file-browser-dialog"
import { CreateRootFolder, RootFolder } from "@/types/fs"
import { addRootFolder, deleteRootFolder } from "@/actions/fs"

interface RootFoldersSectionProps {
  folders: RootFolder[]
}

interface FolderListProps {
  folders: RootFolder[]
  deleteFolder: (id: string) => Promise<void>
}

const FolderList = ({ folders, deleteFolder }: FolderListProps) => {
  const [optimisticRootFolders, setOptimisticRootFolder] = useOptimistic(folders);
  const [, startDelete] = useTransition();
  const handleDelete = async (id: string) => {
    setOptimisticRootFolder(folders.map(f => {
      if (f.id === id) {
        return { ...f, deleting: true };
      }
      return f;
    }));
    deleteFolder(id);
  }

  return <div className="space-y-2">
    {optimisticRootFolders.length === 0 ?
      <div key={1} className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-9 text-sm">No folders have been added.</div>
      </div>
      : null
    }
    {optimisticRootFolders.map((folder) => (
      <div key={folder.id} className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-9 text-sm">{folder.path}</div>
        <div className="col-span-2 text-sm">{folder.free_space || 'Unknown'}</div>
        <div className="col-span-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              startDelete(() => handleDelete(folder.id));
            }}
          >
            {folder.deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    ))}
  </div>
}

export function RootFoldersSection({ folders }: RootFoldersSectionProps) {
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false)
  const [rootFolders, setRootFolders] = useState<RootFolder[]>(folders);


  const handleAddRootFolder = async (folder: CreateRootFolder) => {
    const newFolder = await addRootFolder(folder);
    if (newFolder.success) {
      setRootFolders((currentFolders) => [
        ...currentFolders,
        newFolder.data
      ]);
      setFileBrowserOpen(false);
    } else {
      // TODO: add toaster for error message
      console.error(newFolder.error);
    }
  }

  const handleRootFolderRemove = async (id: string) => {
    const deletedFolder = await deleteRootFolder(id);
    if (deletedFolder.success) {
      setRootFolders((currentFolders) => currentFolders.filter(f => f.id !== id));
    } else {
      // TODO: add toaster for error message
      console.log(deletedFolder.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Root Folders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium">
            <div className="col-span-9">Path</div>
            <div className="col-span-2">Free Space</div>
            <div className="col-span-1"></div>
          </div>

          {/* Root Folder Items */}
          <FolderList folders={rootFolders} deleteFolder={handleRootFolderRemove} />
          <Button
            variant="secondary"
            onClick={() => setFileBrowserOpen(true)}
          >
            Add Root Folder
          </Button>
        </div>
      </CardContent>

      <FileBrowserDialog
        open={fileBrowserOpen}
        onOpenChange={setFileBrowserOpen}
        onSelect={handleAddRootFolder}
      />
    </Card>
  )
}

