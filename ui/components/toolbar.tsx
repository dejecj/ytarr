import { RefreshCw, Rss, Check, Calendar, Grid, Eye, SlidersHorizontal, Filter } from 'lucide-react'

export function Toolbar() {
  return (
    <div className="h-12 bg-background flex items-center justify-between px-4 border-b border-border">
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-1 text-muted-foreground text-sm hover:text-foreground">
          <RefreshCw className="w-4 h-4" />
          <span>Update Filtered</span>
        </button>
        <button className="flex items-center space-x-1 text-muted-foreground text-sm hover:text-foreground">
          <Rss className="w-4 h-4" />
          <span>RSS Sync</span>
        </button>
        <button className="flex items-center space-x-1 text-muted-foreground text-sm hover:text-foreground">
          <Check className="w-4 h-4" />
          <span>Select Series</span>
        </button>
        <button className="flex items-center space-x-1 text-muted-foreground text-sm hover:text-foreground">
          <Calendar className="w-4 h-4" />
          <span>Parsing</span>
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-muted-foreground hover:text-foreground">
          <Grid className="w-4 h-4" />
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <Eye className="w-4 h-4" />
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

