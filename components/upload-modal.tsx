"use client"

import { useState, useCallback } from "react"
import { Upload, X, FileText, CheckCircle2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UploadFile {
  id: string
  name: string
  size: string
  progress: number
  status: "uploading" | "processing" | "complete" | "error"
}

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const simulateUpload = (file: File) => {
    const uploadFile: UploadFile = {
      id: Math.random().toString(36).slice(2),
      name: file.name,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      progress: 0,
      status: "uploading",
    }

    setFiles((prev) => [...prev, uploadFile])

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, progress: 100, status: "processing" } : f
          )
        )
        // Simulate processing
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: "complete" } : f
            )
          )
        }, 2000)
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, progress } : f
          )
        )
      }
    }, 200)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach(simulateUpload)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach(simulateUpload)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Upload Documents</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload documents for AI-powered OCR and data extraction
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">
              Drop files here or click to upload
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports PDF, PNG, JPG, DOCX up to 50MB
            </p>
            <label className="mt-4 cursor-pointer">
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                onChange={handleFileSelect}
              />
              <Button variant="outline" className="pointer-events-none">
                Browse Files
              </Button>
            </label>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 rounded-lg bg-secondary p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                      <span className="text-xs text-muted-foreground">-</span>
                      {file.status === "uploading" && (
                        <span className="text-xs text-muted-foreground">
                          Uploading... {file.progress.toFixed(0)}%
                        </span>
                      )}
                      {file.status === "processing" && (
                        <span className="flex items-center gap-1 text-xs text-yellow-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing with AI...
                        </span>
                      )}
                      {file.status === "complete" && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </span>
                      )}
                    </div>
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="mt-1 h-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={files.length === 0 || files.some((f) => f.status !== "complete")}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
