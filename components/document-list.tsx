"use client"

import { useState } from "react"
import { Grid, List, Filter, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DocumentCard, Document } from "./document-card"
import { ScrollArea } from "@/components/ui/scroll-area"

const sampleDocuments: Document[] = [
  {
    id: "1",
    name: "Invoice_2024_001.pdf",
    type: "PDF",
    size: "245 KB",
    uploadedAt: "2 hours ago",
    status: "processed",
    extractedFields: 12,
    starred: true,
    category: "Invoices",
  },
  {
    id: "2",
    name: "Contract_Agreement_Final.pdf",
    type: "PDF",
    size: "1.2 MB",
    uploadedAt: "5 hours ago",
    status: "processed",
    extractedFields: 28,
    category: "Contracts",
  },
  {
    id: "3",
    name: "Receipt_Amazon_March.png",
    type: "PNG",
    size: "156 KB",
    uploadedAt: "1 day ago",
    status: "processing",
    category: "Receipts",
  },
  {
    id: "4",
    name: "Tax_Document_2023.pdf",
    type: "PDF",
    size: "3.4 MB",
    uploadedAt: "2 days ago",
    status: "processed",
    extractedFields: 45,
    starred: true,
    category: "Reports",
  },
  {
    id: "5",
    name: "Expense_Report_Q1.xlsx",
    type: "XLSX",
    size: "89 KB",
    uploadedAt: "3 days ago",
    status: "failed",
    category: "Reports",
  },
  {
    id: "6",
    name: "Business_License.pdf",
    type: "PDF",
    size: "567 KB",
    uploadedAt: "1 week ago",
    status: "processed",
    extractedFields: 8,
    category: "Contracts",
  },
]

interface DocumentListProps {
  onDocumentSelect: (doc: Document) => void
  selectedDocument?: Document | null
  categoryFilter?: string
}

export function DocumentList({ onDocumentSelect, selectedDocument, categoryFilter }: DocumentListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [filter, setFilter] = useState("all")

  const filteredDocuments = sampleDocuments.filter((doc) => {
    const statusMatch = filter === "all" || doc.status === filter
    const categoryMatch = !categoryFilter || doc.category === categoryFilter
    return statusMatch && categoryMatch
  })

  const title = categoryFilter ? categoryFilter : "All Documents"

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground">
            {filteredDocuments.length} documents
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 w-36 bg-secondary">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <SortAsc className="h-4 w-4" />
            Sort
          </Button>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as "grid" | "list")}
            className="border border-border"
          >
            <ToggleGroupItem value="list" size="sm" className="h-8 w-8">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" size="sm" className="h-8 w-8">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 py-4">
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={onDocumentSelect}
              selected={selectedDocument?.id === doc.id}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
