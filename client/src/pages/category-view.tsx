import React from "react";
import { useRoute } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { useDocuments } from "@/hooks/use-documents";
import { useCategories } from "@/hooks/use-categories";
import { DocumentCard } from "@/components/documents/document-card";
import { FolderOpen, FileWarning } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryView() {
  const [, params] = useRoute("/category/:id");
  const categoryId = parseInt(params?.id || "0");
  
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const { data: categories, isLoading: catsLoading } = useCategories();

  const category = categories?.find(c => c.id === categoryId);
  const filteredDocs = documents?.filter(d => d.categoryId === categoryId) || [];
  
  const isLoading = docsLoading || catsLoading;

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
              {isLoading ? "Loading..." : category?.name || "Category Not Found"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {category?.description || "Browse documents in this category"}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-card rounded-3xl border border-dashed border-border"
        >
          <div className="bg-secondary/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileWarning className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">No documents here</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            There are no documents assigned to this category yet. Upload a document and the AI might place it here!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocs.map((doc, i) => (
            <DocumentCard key={doc.id} document={doc} index={i} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
