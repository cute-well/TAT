"use client"

import {
  X,
  FileText,
  Download,
  Star,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Document } from "./document-card"

interface ExtractedField {
  label: string
  value: string
  confidence: number
}

const sampleExtractedData: ExtractedField[] = [
  { label: "Invoice Number", value: "INV-2024-001", confidence: 98 },
  { label: "Date", value: "March 10, 2024", confidence: 95 },
  { label: "Vendor Name", value: "Acme Corporation", confidence: 92 },
  { label: "Total Amount", value: "$1,234.56", confidence: 99 },
  { label: "Due Date", value: "April 10, 2024", confidence: 94 },
  { label: "Tax Amount", value: "$123.46", confidence: 97 },
  { label: "Subtotal", value: "$1,111.10", confidence: 98 },
  { label: "Payment Terms", value: "Net 30", confidence: 88 },
  { label: "PO Number", value: "PO-2024-0456", confidence: 91 },
  { label: "Billing Address", value: "123 Main St, City, ST 12345", confidence: 85 },
]

interface DocumentDetailsProps {
  document: Document
  onClose: () => void
}

export function DocumentDetails({ document, onClose }: DocumentDetailsProps) {
  return (
    <div className="flex h-full w-96 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <h3 className="text-sm font-semibold text-foreground">Document Details</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-secondary p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-background">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <h4 className="text-center text-sm font-medium text-foreground">
                {document.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {document.type} - {document.size}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Star className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="extracted" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="extracted" className="flex-1 text-xs">
                Extracted Data
              </TabsTrigger>
              <TabsTrigger value="info" className="flex-1 text-xs">
                File Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="extracted" className="mt-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    AI Extracted Fields
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {sampleExtractedData.length} fields
                  </Badge>
                </div>

                <div className="flex flex-col gap-2">
                  {sampleExtractedData.map((field, index) => (
                    <div
                      key={index}
                      className="group flex flex-col gap-1 rounded-lg bg-secondary p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {field.label}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {field.value}
                        </span>
                        <span
                          className={`text-xs ${
                            field.confidence >= 95
                              ? "text-primary"
                              : field.confidence >= 85
                                ? "text-yellow-500"
                                : "text-destructive"
                          }`}
                        >
                          {field.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <InfoRow label="File Name" value={document.name} />
                  <InfoRow label="File Type" value={document.type} />
                  <InfoRow label="File Size" value={document.size} />
                  <InfoRow label="Uploaded" value={document.uploadedAt} />
                  <InfoRow label="Status" value={document.status} />
                  <InfoRow label="Extracted Fields" value={document.extractedFields?.toString() || "0"} />
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Actions
                  </span>
                  <Button variant="outline" size="sm" className="justify-start gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open Original
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Export Extracted Data
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
