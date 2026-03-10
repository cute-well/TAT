"use client"

import { useState } from "react"
import { FileBarChart, Download, Loader2, CheckCircle2, FileText, BarChart3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

type ReportType = "summary" | "extraction" | "category" | "full"
type ReportFormat = "pdf" | "csv" | "xlsx"

const reportTypes: { value: ReportType; label: string; description: string }[] = [
  {
    value: "summary",
    label: "Summary Report",
    description: "High-level overview of all processed documents",
  },
  {
    value: "extraction",
    label: "Extraction Report",
    description: "Detailed view of all extracted fields and values",
  },
  {
    value: "category",
    label: "Category Report",
    description: "Documents grouped by category with statistics",
  },
  {
    value: "full",
    label: "Full Audit Report",
    description: "Complete document history, extractions, and workflow runs",
  },
]

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>("summary")
  const [format, setFormat] = useState<ReportFormat>("pdf")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRawText, setIncludeRawText] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setProgress(0)
    setGenerated(false)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 25
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setGenerating(false)
            setGenerated(true)
          }, 300)
          return 100
        }
        return next
      })
    }, 400)
  }

  const handleClose = () => {
    setGenerating(false)
    setProgress(0)
    setGenerated(false)
    onOpenChange(false)
  }

  const selectedType = reportTypes.find((r) => r.value === reportType)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileBarChart className="h-5 w-5 text-primary" />
            Generate Report
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a report from your processed documents
          </DialogDescription>
        </DialogHeader>

        {!generated ? (
          <div className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-3">
              <Label>Report Type</Label>
              <div className="grid gap-2">
                {reportTypes.map((rt) => (
                  <div
                    key={rt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      reportType === rt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setReportType(rt.value)}
                  >
                    <div
                      className={`mt-0.5 h-4 w-4 rounded-full border-2 ${
                        reportType === rt.value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">{rt.label}</span>
                      <span className="text-xs text-muted-foreground">{rt.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="xlsx">Excel Workbook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Label>Date Range</Label>
                <Select defaultValue="30d">
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Options</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={(v) => setIncludeCharts(!!v)}
                  />
                  <Label htmlFor="include-charts" className="text-sm font-normal cursor-pointer">
                    Include charts and visualizations
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-raw"
                    checked={includeRawText}
                    onCheckedChange={(v) => setIncludeRawText(!!v)}
                  />
                  <Label htmlFor="include-raw" className="text-sm font-normal cursor-pointer">
                    Include raw extracted text
                  </Label>
                </div>
              </div>
            </div>

            {generating && (
              <div className="flex flex-col gap-2 rounded-lg bg-secondary p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-foreground">Generating report...</span>
                </div>
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-foreground">Report Ready</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your {selectedType?.label} has been generated successfully
              </p>
            </div>
            <div className="flex w-full items-center gap-3 rounded-lg bg-secondary p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {selectedType?.label}_{new Date().toISOString().split("T")[0]}.{format}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format.toUpperCase()} · Generated just now
                </span>
              </div>
              <Badge variant="secondary" className="text-xs text-primary">
                Ready
              </Badge>
            </div>
            <Button className="w-full gap-2" onClick={handleClose}>
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        )}

        {!generated && (
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={handleClose} disabled={generating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
