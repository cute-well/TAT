import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus } from "lucide-react";
import { BeautifulButton } from "../ui/beautiful-button";
import { useCreateCategory } from "@/hooks/use-categories";

export function CreateCategoryDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutate: createCategory, isPending } = useCreateCategory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    createCategory({ name, description }, {
      onSuccess: () => {
        setName("");
        setDescription("");
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
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
              <div className="p-6 border-b border-border relative">
                <button 
                  onClick={onClose}
                  disabled={isPending}
                  className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-foreground">New Category</h2>
                </div>
              </div>

              <div className="p-6">
                <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Category Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Invoices"
                      disabled={isPending}
                      className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What type of documents go here?"
                      disabled={isPending}
                      className="w-full h-24 px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-border bg-secondary/30 flex justify-end gap-3">
                <BeautifulButton variant="ghost" onClick={onClose} disabled={isPending}>
                  Cancel
                </BeautifulButton>
                <BeautifulButton type="submit" form="category-form" isLoading={isPending}>
                  Create Category
                </BeautifulButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
