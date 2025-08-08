"use client"

import * as React from "react"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebarOptional } from "@/components/ui/sidebar"

/**
 * Centers horizontally when the sidebar is collapsed, and left-aligns when expanded.
 * Works both inside and outside of SidebarProvider without throwing.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Optional sidebar context (undefined if ThemeToggle is rendered outside SidebarProvider)
  const sidebar = useSidebarOptional()
  const isCollapsed = sidebar ? !sidebar.open : false

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const wrapperClasses = cn(
    "mt-2 px-2 w-full flex",
    isCollapsed ? "justify-center self-center" : "justify-start self-stretch",
    className
  )

  if (!mounted) {
    // Avoid hydration mismatch
    return (
      <div className={wrapperClasses} aria-hidden="true">
        <div className={cn(isCollapsed ? "h-9 w-9" : "h-9 w-full")} />
      </div>
    )
  }

  return (
    <div className={wrapperClasses}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            className={cn(isCollapsed ? "w-9 h-9 p-0" : "w-full justify-start")}
          >
            <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
