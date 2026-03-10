import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface BeautifulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const BeautifulButton = React.forwardRef<HTMLButtonElement, BeautifulButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-[0_4px_14px_0_hsl(var(--primary)/0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border-2 border-border bg-transparent hover:border-primary hover:text-primary",
      ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground shadow-[0_4px_14px_0_hsl(var(--destructive)/0.39)] hover:bg-destructive/90",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-lg",
      md: "h-11 px-6 text-base rounded-xl",
      lg: "h-14 px-8 text-lg rounded-2xl",
      icon: "h-11 w-11 rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: disabled || isLoading ? 0 : -2 }}
        whileTap={{ y: disabled || isLoading ? 0 : 1 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          (disabled || isLoading) && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled || isLoading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

BeautifulButton.displayName = "BeautifulButton";
