import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu, Search, Bell } from "lucide-react";
import { ProcessDocumentDialog } from "../documents/process-document-dialog";
import { BeautifulButton } from "../ui/beautiful-button";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isProcessOpen, setIsProcessOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <header className="h-20 glass sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-muted-foreground hover:bg-secondary rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center relative">
              <Search className="w-5 h-5 absolute left-3 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search documents, entities, dates..." 
                className="pl-10 pr-4 py-2.5 bg-secondary/50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl w-80 transition-all duration-300"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
            
            <BeautifulButton onClick={() => setIsProcessOpen(true)} className="hidden sm:flex">
              Process New Document
            </BeautifulButton>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      <ProcessDocumentDialog 
        isOpen={isProcessOpen} 
        onClose={() => setIsProcessOpen(false)} 
      />
    </div>
  );
}
