import React from "react";
import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { useDocument } from "@/hooks/use-documents";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, Clock, Sparkles, User, Calendar, DollarSign, Tag, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function DocumentDetail() {
  const [, params] = useRoute("/document/:id");
  const id = parseInt(params?.id || "0");
  const { data: document, isLoading } = useDocument(id);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-secondary rounded-md" />
          <div className="h-16 w-3/4 bg-secondary rounded-xl" />
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 h-96 bg-secondary rounded-2xl" />
            <div className="col-span-1 h-96 bg-secondary rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!document) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Document not found</h2>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return to dashboard</Link>
        </div>
      </MainLayout>
    );
  }

  const extracted = (document.extractedData as { names?: string[]; amounts?: number[]; dates?: string[] } | null) || {};

  const statusConfig = {
    pending: { color: "text-amber-600", bg: "bg-amber-100", icon: Clock },
    processing: { color: "text-blue-600", bg: "bg-blue-100", icon: Sparkles },
    completed: { color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle2 },
  };

  const status = (statusConfig[document.status as keyof typeof statusConfig] || statusConfig.pending);
  const StatusIcon = status.icon;

  return (
    <MainLayout>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight mb-3">
            {document.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className={cn("px-3 py-1 rounded-full font-bold flex items-center gap-1.5", status.bg, status.color)}>
              <StatusIcon className="w-4 h-4" />
              <span className="capitalize">{document.status}</span>
            </div>
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {document.createdAt ? format(new Date(document.createdAt), "MMMM d, yyyy 'at' h:mm a") : "Unknown date"}
            </span>
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <Link href={`/category/${document.categoryId}`} className="hover:text-primary transition-colors">
                {document.category?.name || "Uncategorized"}
              </Link>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">Document Content</h2>
            </div>
            <div className="prose prose-slate max-w-none text-foreground">
              <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed p-6 bg-secondary/30 rounded-2xl border border-border/50">
                {document.content || "No content available."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Data Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-card rounded-3xl p-6 border border-blue-100 dark:border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-24 h-24 text-primary" />
            </div>
            
            <h3 className="text-lg font-display font-bold text-foreground mb-6 flex items-center gap-2 relative z-10">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Extracted Data
            </h3>

            <div className="space-y-6 relative z-10">
              {/* Names */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" /> People & Entities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(extracted.names?.length ?? 0) > 0 ? extracted.names!.map((name: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-white dark:bg-card text-foreground rounded-lg text-sm font-medium border border-border shadow-sm">
                      {name}
                    </span>
                  )) : <span className="text-sm text-muted-foreground italic">None detected</span>}
                </div>
              </div>

              {/* Amounts */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Financial Data
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(extracted.amounts?.length ?? 0) > 0 ? extracted.amounts!.map((amount: number, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-bold border border-green-200 dark:border-green-900 shadow-sm">
                      ${amount}
                    </span>
                  )) : <span className="text-sm text-muted-foreground italic">None detected</span>}
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Dates & Deadlines
                </h4>
                <div className="flex flex-col gap-2">
                  {(extracted.dates?.length ?? 0) > 0 ? extracted.dates!.map((date: string, i: number) => (
                    <div key={i} className="px-3 py-2 bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-900 shadow-sm flex items-center justify-between">
                      <span>{date}</span>
                    </div>
                  )) : <span className="text-sm text-muted-foreground italic">None detected</span>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
