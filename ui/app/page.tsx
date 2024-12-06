import { Toolbar } from "@/components/toolbar"
import { ChannelGrid } from "@/components/media-grid"
import { list } from "@/actions/channels"

export default async function Home() {

  let channels = await list();

  const renderChannels = () => {
    if(channels.success){
      return <ChannelGrid channels={channels.data} />
    } else {
      console.error(channels.error)
      return <div className="flex items-center justify-center h-[calc(100vh-7rem)] text-gray-400">
        <p>Something went wrong fetching channels!</p>
      </div>
    }
  }

  return (
    
      <>
        <Toolbar />
        {renderChannels()}
      </>
  )
}

