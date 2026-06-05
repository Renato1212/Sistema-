"use client";

import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-hanken font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champanhe focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          {
            "bg-champanhe text-white hover:bg-terracota shadow-sm hover:shadow-md":
              variant === "primary",
            "border border-black/10 text-cacau bg-white hover:bg-areia/20 hover:border-black/15":
              variant === "secondary",
            "border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 hover:border-red-300":
              variant === "danger",
            "text-cacau bg-transparent hover:bg-black/5":
              variant === "ghost",
          },
          {
            "px-3.5 py-1.5 text-xs rounded-full": size === "sm",
            "px-5 py-2.5 text-sm rounded-full": size === "md",
            "px-8 py-3 text-base rounded-full": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
