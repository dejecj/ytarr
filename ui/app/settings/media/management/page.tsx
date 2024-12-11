import { listRootFolders } from "@/actions/fs"
import { RootFoldersSection } from "@/components/root-folders"

export default async function MediaManagementPage() {

  const rootFolders = await listRootFolders();

  if (!rootFolders.success) {
    console.error(rootFolders.error);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Video Naming Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Video Naming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="rename-videos" />
            <Label htmlFor="rename-videos">
              Rename Videos
              <span className="text-sm text-muted-foreground ml-2">
                Tubarr will use the existing file name if renaming is disabled
              </span>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="replace-illegal" />
            <Label htmlFor="replace-illegal">
              Replace Illegal Characters
              <span className="text-sm text-muted-foreground ml-2">
                Replace illegal characters. If unchecked, Tubarr will remove them instead
              </span>
            </Label>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label htmlFor="colon-replacement">Colon Replacement</Label>
            <Select defaultValue="smart">
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select replacement" />
              </SelectTrigger>
              <SelectContent>
                {COLON_REPLACEMENT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Standard Format</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Format used for standard video naming</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <NamingTokenSelector 
              value="{ChannelTitle} - {UploadDate} - {VideoTitle} [{Quality}]"
              onChange={() => {}}
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Root Folders Section */}
      {
        rootFolders.success ?
          <RootFoldersSection folders={rootFolders.data} />
          :
          <p>Oops! We've hit a snag fetching your root folders! Refresh to try again.</p>
      }
    </div>
  )
}

