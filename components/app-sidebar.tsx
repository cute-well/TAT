"use client"

import { useState } from "react"
import {
  FileText,
  Upload,
  FolderOpen,
  Search,
  Settings,
  BarChart3,
  Clock,
  Star,
  Trash2,
  ChevronDown,
  Sparkles,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  icon: React.ElementType
  label: string
  badge?: number
  active?: boolean
}

const mainNavItems: NavItem[] = [
  { icon: Upload, label: "Upload", active: false },
  { icon: FileText, label: "All Documents", badge: 156, active: true },
  { icon: Clock, label: "Recent", active: false },
  { icon: Star, label: "Starred", badge: 12, active: false },
  { icon: Search, label: "Search", active: false },
]

const folders = [
  { name: "Invoices", count: 45 },
  { name: "Contracts", count: 28 },
  { name: "Receipts", count: 67 },
  { name: "Reports", count: 16 },
]

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  onFolderSelect?: (folder: string) => void
  activeFolder?: string
}

export function AppSidebar({ activeView, onViewChange, onFolderSelect, activeFolder }: AppSidebarProps) {
  const [foldersOpen, setFoldersOpen] = useState(true)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">DocuAI</span>
          <span className="text-xs text-muted-foreground">Document Manager</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const isActive = item.label.toLowerCase().replace(" ", "-") === activeView
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "h-10 w-full justify-start gap-3 px-3 text-sm font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => onViewChange(item.label.toLowerCase().replace(" ", "-"))}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </Button>
            )
          })}
        </nav>

        <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen} className="mt-6">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-full justify-between px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Folders
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  foldersOpen && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 flex flex-col gap-1">
            {folders.map((folder) => (
              <Button
                key={folder.name}
                variant="ghost"
                className={cn(
                  "h-9 w-full justify-start gap-3 px-3 pl-9 text-sm font-medium",
                  activeFolder === folder.name
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => {
                  onViewChange("all-documents")
                  onFolderSelect?.(activeFolder === folder.name ? "" : folder.name)
                }}
              >
                {folder.name}
                <span className="ml-auto text-xs">{folder.count}</span>
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-6 flex flex-col gap-1">
          <Button
            variant="ghost"
            className={cn(
              "h-10 w-full justify-start gap-3 px-3 text-sm font-medium",
              activeView === "analytics"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            onClick={() => onViewChange("analytics")}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "h-10 w-full justify-start gap-3 px-3 text-sm font-medium",
              activeView === "workflows"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            onClick={() => onViewChange("workflows")}
          >
            <Zap className="h-4 w-4" />
            Workflows
          </Button>
          <Button
            variant="ghost"
            className="h-10 w-full justify-start gap-3 px-3 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Trash
          </Button>
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className="h-10 w-full justify-start gap-3 px-3 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </aside>
  )
}
