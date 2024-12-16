import { listRootFolders } from '@/actions/fs'
import { ChannelSearch } from './_components/search'

export const dynamic = 'force-dynamic';

export default async function AddNewChannel() {

  const rootFolders = await listRootFolders();

  return (
    <div className="w-full">
      <ChannelSearch rootFolders={rootFolders.success ? rootFolders.data : []} />
    </div>
  )
}