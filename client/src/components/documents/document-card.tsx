import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { format } from "date-fns";
import { FileText, Calendar, User, DollarSign, ArrowRight, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: any;
  index: number;
}

export function DocumentCard({ document, index }: DocumentCardProps) {
  const extracted = document.extractedData || {};
  const hasExtractedData = extracted.names?.length > 0 || extracted.dates?.length > 0 || extracted.amounts?.length > 0;

  const statusConfig = {
    pending: { color: "text-amber-600", bg: "bg-amber-100", icon: Clock },
    processing: { color: "text-blue-600", bg: "bg-blue-100", icon: Sparkles },
    completed: { color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle2 },
  };

  const status = (statusConfig[document.status as keyof typeof statusConfig] || statusConfig.pending);
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-secondary/50 rounded-xl text-primary group-hover:bg-primary/10 transition-colors">
          <FileText className="w-6 h-6" />
        </div>
        <div className={cn("px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5", status.bg, status.color)}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="capitalize">{document.status}</span>
        </div>
      </div>

      <h3 className="font-display font-bold text-xl text-foreground mb-1 line-clamp-1">
        {document.title}
      </h3>
      
      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          <Link href={`/category/${document.categoryId}`}>
            <span className="px-2 py-0.5 bg-secondary rounded-md font-medium text-foreground hover:bg-primary/10 transition-colors cursor-pointer">
              {document.category?.name || "Uncategorized"}
            </span>
          </Link>
          <span className="text-sm text-muted-foreground self-center">
            {format(new Date(document.createdAt), "MMM d, yyyy")}
          </span>
        </div>

        {hasExtractedData ? (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extracted Data</h4>
            <div className="flex flex-wrap gap-2">
              {extracted.names?.slice(0, 2).map((name: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                  <User className="w-3 h-3" /> {name}
                </span>
              ))}
              {extracted.amounts?.slice(0, 2).map((amount: number, i: number) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100">
                  <DollarSign className="w-3 h-3" /> {amount}
                </span>
              ))}
              {extracted.dates?.slice(0, 1).map((date: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100">
                  <Calendar className="w-3 h-3" /> {date}
                </span>
              ))}
              {((extracted.names?.length || 0) + (extracted.amounts?.length || 0) + (extracted.dates?.length || 0)) > 5 && (
                <span className="inline-flex items-center px-2.5 py-1 bg-secondary text-muted-foreground rounded-lg text-xs font-medium">
                  + more
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-secondary/20 text-muted-foreground text-sm italic py-6">
            No data extracted yet
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <Link href={`/document/${document.id}`} className="flex items-center text-primary font-semibold text-sm hover:text-primary/80 group/link">
          View Full Details
          <ArrowRight className="w-4 h-4 ml-1.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
