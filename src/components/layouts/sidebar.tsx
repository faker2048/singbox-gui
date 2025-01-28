"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Activity,
  Settings,
  Terminal,
  FileJson,
  Home
} from "lucide-react"

const sidebarItems = [
  {
    title: "主页",
    href: "/home",
    icon: Home
  },
  {
    title: "节点切换",
    href: "/node-switch",
    icon: Activity
  },
  {
    title: "设置",
    href: "/settings",
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-48 border-r h-screen flex flex-col">
      <div className="h-14 border-b flex items-center px-4">
        <span className="font-bold text-lg">SingBox Manager</span>
      </div>
      <nav className="flex-1 p-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-secondary/80 hover:text-secondary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 