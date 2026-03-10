"use client"

import {
  FileText,
  MoreHorizontal,
  Star,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  status: "processed" | "processing" | "failed"
  extractedFields?: number
  starred?: boolean
  thumbnail?: string
  category?: "Invoices" | "Contracts" | "Receipts" | "Reports"
}

interface DocumentCardProps {
  document: Document
  onSelect: (doc: Document) => void
  selected?: boolean
}

export function DocumentCard({ document, onSelect, selected }: DocumentCardProps) {
  const statusConfig = {
    processed: {
      icon: CheckCircle2,
      label: "Processed",
      className: "text-primary bg-primary/10",
    },
    processing: {
      icon: Clock,
      label: "Processing",
      className: "text-yellow-500 bg-yellow-500/10",
    },
    failed: {
      icon: AlertCircle,
      label: "Failed",
      className: "text-destructive bg-destructive/10",
    },
  }

  const status = statusConfig[document.status]
  const StatusIcon = status.icon

  return (
    <Card
      className={cn(
        "group cursor-pointer border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80",
        selected && "border-primary bg-primary/5"
      )}
      onClick={() => onSelect(document)}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-medium text-foreground">
              {document.name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4" />
                  {document.starred ? "Unstar" : "Star"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{document.type}</span>
            <span>-</span>
            <span>{document.size}</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className={cn("text-xs", status.className)}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
            {document.category && (
              <Badge variant="outline" className="text-xs">
                {document.category}
              </Badge>
            )}
            {document.extractedFields && document.status === "processed" && (
              <span className="text-xs text-muted-foreground">
                {document.extractedFields} fields extracted
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Uploaded {document.uploadedAt}
          </p>
        </div>

        {document.starred && (
          <Star className="h-4 w-4 shrink-0 fill-yellow-500 text-yellow-500" />
        )}
      </div>
    </Card>
  )
}
