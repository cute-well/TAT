import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Sparkles, UploadCloud } from "lucide-react";
import { BeautifulButton } from "../ui/beautiful-button";
import { useProcessDocument } from "@/hooks/use-documents";

export function ProcessDocumentDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const { mutate: processDocument, isPending } = useProcessDocument();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text) return;
    
    processDocument({ title, text }, {
      onSuccess: () => {
        setTitle("");
        setText("");
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={!isPending ? onClose : undefined}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 border-b border-border relative bg-gradient-to-b from-primary/5 to-transparent">
                <button 
                  onClick={onClose}
                  disabled={isPending}
                  className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Process New Document</h2>
                    <p className="text-muted-foreground text-sm mt-1">Paste raw OCR text below. Our AI will automatically categorize it and extract key entities.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                <form id="process-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Document Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Q3 Invoice - Acme Corp"
                      disabled={isPending}
                      className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 disabled:opacity-50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-foreground">Raw Text / OCR Output</label>
                    <div className="relative">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste the scanned document text here..."
                        disabled={isPending}
                        className="w-full h-64 px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none disabled:opacity-50 font-mono text-sm"
                        required
                      />
                      
                      {/* Scanning Animation Overlay */}
                      {isPending && (
                        <div className="absolute inset-0 bg-primary/5 rounded-xl overflow-hidden pointer-events-none border-2 border-primary/50">
                          <div className="w-full h-32 bg-gradient-to-b from-transparent via-primary/20 to-primary/40 border-b border-primary animate-scanline" />
                          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-primary font-bold text-sm flex items-center gap-2">
                              <Sparkles className="w-4 h-4 animate-pulse" />
                              AI is extracting data...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-border bg-secondary/30 flex justify-end gap-3">
                <BeautifulButton variant="ghost" onClick={onClose} disabled={isPending}>
                  Cancel
                </BeautifulButton>
                <BeautifulButton type="submit" form="process-form" isLoading={isPending} className="min-w-[160px]">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {isPending ? "Processing..." : "Process Document"}
                </BeautifulButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
