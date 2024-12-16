'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Settings, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'

type MenuItem = {
  name: string
  href: string
  icon?: React.ElementType
  subItems?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    name: "Channels",
    href: "/",
    icon: Film,
    subItems: [
      { name: "Add new", href: "/channels/new" },
      // { name: "Library Import", href: "/channels/import" }
    ]
  },
  // { name: "Calendar", href: "/calendar", icon: Calendar },
  // {
  //   name: "Activity",
  //   href: "/activity/queue",
  //   icon: Activity,
  //   subItems: [
  //     { name: "Queue", href: "/activity/queue" },
  //     { name: "History", href: "/activity/history" },
  //     { name: "Blocklist", href: "/activity/blocklist" }
  //   ]
  // },
  // {
  //   name: "Wanted",
  //   href: "/wanted/missing",
  //   icon: AlertTriangle,
  //   subItems: [
  //     { name: "Missing", href: "/wanted/missing" },
  //     { name: "Cutoff Unmet", href: "/wanted/unmet" }
  //   ]
  // },
  {
    name: "Settings",
    href: "/settings/media/management",
    icon: Settings,
    subItems: [
      { name: "Media Management", href: "/settings/media/management" },
      // { name: "General", href: "/settings/general" },
      // { name: "UI", href: "/settings/ui" },
      // { name: "Tags", href: "/settings/tags" }
    ]
  },
  {
    name: "System",
    href: "/system/status",
    icon: Monitor,
    subItems: [
      // { name: "Status", href: "/system/status" },
      { name: "Log Files", href: "/system/logs/files" }
    ]
  }
]

function MenuItemComponent({ item, isSubItem = false, openMenuItem, setOpenMenuItem }: { item: MenuItem, isSubItem?: boolean, openMenuItem: string | null, setOpenMenuItem: (item: string | null) => void }) {
  const pathname = usePathname()
  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  const isOpen = openMenuItem === item.href || (item.subItems && item.subItems.some(subItem => pathname.startsWith(subItem.href)))

  const Icon = item.icon
  const hasSubItems = item.subItems && item.subItems.length > 0

  const handleClick = () => {
    if (hasSubItems && !isSubItem) {
      setOpenMenuItem(isOpen ? null : item.href)
    }
  }

  useEffect(() => {
    if (isActive && hasSubItems && !isSubItem) {
      setOpenMenuItem(item.href)
    }
  }, [pathname, isActive, hasSubItems, isSubItem, item.href, setOpenMenuItem])

  return (
    <>
      <Link
        href={item.href}
        className={`flex items-center px-4 py-2 hover:bg-secondary text-sm ${isActive ? 'bg-secondary' : ''} ${isSubItem ? 'pl-8' : ''} ${isOpen && !isSubItem ? 'bg-secondary/50' : ''}`}
        onClick={handleClick}
      >
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {item.name}
      </Link>
      {isOpen && hasSubItems && (
        <div className="ml-4">
          {item.subItems!.map((subItem) => (
            <MenuItemComponent
              key={subItem.href}
              item={subItem}
              isSubItem
              openMenuItem={openMenuItem}
              setOpenMenuItem={setOpenMenuItem}
            />
          ))}
        </div>
      )}
    </>
  )
}

export function Sidebar() {
  const [openMenuItem, setOpenMenuItem] = useState<string | null>(null);
  const pathname = usePathname()

  useEffect(() => {
    const activeMenuItem = menuItems.find(item =>
      item.href !== '/' && pathname.startsWith(item.href)
    )
    if (activeMenuItem) {
      setOpenMenuItem(activeMenuItem.href)
    } else if (pathname === '/') {
      setOpenMenuItem('/')
    }
  }, [pathname])

  return (
    <div className="w-[200px] bg-background text-foreground min-h-screen pt-16">
      <div className="flex flex-col space-y-1">
        {menuItems.map((item) => (
          <MenuItemComponent
            key={item.href}
            item={item}
            openMenuItem={openMenuItem}
            setOpenMenuItem={setOpenMenuItem}
          />
        ))}
      </div>
    </div>
  )
}

