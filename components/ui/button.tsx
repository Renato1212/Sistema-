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
          "inline-flex items-center justify-center gap-2 font-bodoni font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-areia focus-visible:ring-offset-2 focus-visible:ring-offset-marfim disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          {
            "btn-shine bg-champanhe text-[#241A10] hover:bg-areia shadow-gold hover:shadow-gold-lg":
              variant === "primary",
            "border border-white/10 text-cacau bg-white/[0.04] hover:bg-champanhe/10 hover:border-areia/40":
              variant === "secondary",
            "border border-rose/30 text-rose bg-rose/[0.06] hover:bg-rose/[0.12] hover:border-rose/50":
              variant === "danger",
            "text-cacau bg-transparent hover:bg-white/[0.06]":
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
