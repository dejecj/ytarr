import { listRootFolders } from '@/actions/fs'
import { ChannelSearch } from './_components/search'

export default async function AddNewChannel() {

  let rootFolders = await listRootFolders();

  return (
    <div className="w-full">
      <ChannelSearch rootFolders={rootFolders.success ? rootFolders.data : []}/>
    </div>
  )
}