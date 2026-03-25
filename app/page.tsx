"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { DocumentList } from "@/components/document-list"
import { DocumentDetails } from "@/components/document-details"
import { UploadModal } from "@/components/upload-modal"
import { AnalyticsView } from "@/components/analytics-view"
import { WorkflowsView } from "@/components/workflows-view"
import { ReportModal } from "@/components/report-modal"
import { Document } from "@/components/document-card"

export default function Home() {
  const [activeView, setActiveView] = useState("all-documents")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [activeFolder, setActiveFolder] = useState("")

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc)
  }

  const handleCloseDetails = () => {
    setSelectedDocument(null)
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
    if (view !== "all-documents") {
      setActiveFolder("")
    }
    setSelectedDocument(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        onFolderSelect={setActiveFolder}
        activeFolder={activeFolder}
      />

      <div className="flex flex-1 flex-col">
        <AppHeader
          onUploadClick={() => setUploadModalOpen(true)}
          onReportClick={() => setReportModalOpen(true)}
        />

        <main className="flex flex-1 overflow-hidden">
          {activeView === "analytics" ? (
            <div className="flex-1">
              <AnalyticsView />
            </div>
          ) : activeView === "workflows" ? (
            <div className="flex-1">
              <WorkflowsView />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-hidden">
                <DocumentList
                  onDocumentSelect={handleDocumentSelect}
                  selectedDocument={selectedDocument}
                  categoryFilter={activeFolder}
                />
              </div>

              {selectedDocument && (
                <DocumentDetails
                  document={selectedDocument}
                  onClose={handleCloseDetails}
                />
              )}
            </>
          )}
        </main>
      </div>

      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
      <ReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} />
    </div>
  )
}
