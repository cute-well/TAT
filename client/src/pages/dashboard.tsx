import React, { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useDocuments } from "@/hooks/use-documents";
import { DocumentCard } from "@/components/documents/document-card";
import { BeautifulButton } from "@/components/ui/beautiful-button";
import { Download, FileWarning, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: documents, isLoading } = useDocuments();
  const { toast } = useToast();

  const handleGenerateReport = () => {
    if (!documents || documents.length === 0) {
      toast({ title: "No documents to export", variant: "destructive" });
      return;
    }

    const headers = ["ID", "Title", "Category", "Status", "Date", "Extracted Names", "Extracted Amounts"];
    const rows = documents.map(d => {
      const extracted = (d.extractedData as { names?: string[]; amounts?: number[]; dates?: string[] } | null) || {};
      return [
        d.id,
        d.title,
        d.category?.name || "Uncategorized",
        d.status,
        d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "",
        (extracted.names || []).join("; "),
        (extracted.amounts || []).join("; "),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `documind_report_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Generated",
      description: "Your CSV report is downloading.",
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all processed documents</p>
        </div>
        <BeautifulButton variant="outline" onClick={handleGenerateReport} disabled={isLoading || !documents?.length}>
          <Download className="w-4 h-4 mr-2" />
          Generate CSV Report
        </BeautifulButton>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col">
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary animate-pulse" />
                <div className="w-24 h-6 rounded-full bg-secondary animate-pulse" />
              </div>
              <div className="w-3/4 h-6 rounded-md bg-secondary animate-pulse mb-4" />
              <div className="w-1/2 h-4 rounded-md bg-secondary animate-pulse mb-8" />
              <div className="space-y-2 mt-auto">
                <div className="w-full h-4 rounded-md bg-secondary animate-pulse" />
                <div className="w-2/3 h-4 rounded-md bg-secondary animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : documents?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-card rounded-3xl border border-dashed border-border"
        >
          <div className="bg-secondary/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileWarning className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">No documents found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            You haven't processed any documents yet. Upload your first document to extract intelligent data automatically.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {documents?.map((doc, i) => (
            <DocumentCard key={doc.id} document={doc} index={i} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
