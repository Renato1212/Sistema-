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
          "inline-flex items-center justify-center gap-2 font-hanken font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champanhe focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-champanhe text-white hover:bg-terracota active:bg-terracota":
              variant === "primary",
            "border border-areia text-cacau bg-transparent hover:bg-areia/30":
              variant === "secondary",
            "border border-red-300 text-red-700 bg-transparent hover:bg-red-50":
              variant === "danger",
            "text-cacau bg-transparent hover:bg-areia/20":
              variant === "ghost",
          },
          {
            "px-3 py-1.5 text-xs rounded": size === "sm",
            "px-5 py-2.5 text-sm rounded-sm": size === "md",
            "px-8 py-3 text-base rounded-sm": size === "lg",
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
