import { Search, User } from 'lucide-react';
import YoutubeLogo from '@/app/_static/images/yt.png';
import Image from 'next/image';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background flex items-center px-4 z-50 border-b">
      <div className="flex items-center">
        <Image 
          src={YoutubeLogo}
          alt="YTarr"
          width={50}
          height={50}
        />
      </div>
      <div className="ml-auto flex items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-secondary text-foreground placeholder-muted-foreground px-4 py-1.5 rounded border border-input focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <User className="ml-4 w-6 h-6 text-foreground" />
      </div>
    </header>
  )
}

