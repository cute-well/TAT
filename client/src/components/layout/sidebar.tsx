import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, FolderOpen, Tags, Sparkles, Plus, Layers } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { data: categories, isLoading } = useCategories();

  const isCurrent = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-72 hidden lg:flex flex-col h-screen fixed top-0 left-0 border-r border-border glass z-30">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 text-primary font-display font-bold text-2xl tracking-tight">
          <div className="bg-gradient-to-tr from-primary to-blue-400 p-2 rounded-xl shadow-lg shadow-primary/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          DocuMind
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Main Menu</h4>
          <nav className="space-y-1">
            <Link href="/" className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
              isCurrent("/") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="/documents" className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
              isCurrent("/documents") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}>
              <FileText className="w-5 h-5" />
              All Documents
            </Link>
          </nav>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</h4>
          </div>
          <nav className="space-y-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-secondary/50 rounded-xl animate-pulse" />
              ))
            ) : categories?.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground italic">No categories yet</div>
            ) : (
              categories?.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.id}`} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                  isCurrent(`/category/${cat.id}`) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <FolderOpen className="w-4 h-4" />
                  {cat.name}
                </Link>
              ))
            )}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
            AM
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@documind.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
