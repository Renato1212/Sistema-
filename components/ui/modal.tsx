"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => onClose();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        "rounded-2xl shadow-apple bg-surface text-cacau border border-white/10 backdrop:bg-black/70 backdrop:backdrop-blur-sm p-0 max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)]",
        {
          "sm:max-w-sm": size === "sm",
          "sm:max-w-lg": size === "md",
          "sm:max-w-2xl": size === "lg",
          "sm:max-w-4xl": size === "xl",
        }
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm border-b border-white/[0.07] px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between">
        {title && (
          <h2 className="font-bodoni font-semibold text-base sm:text-lg text-cacau">{title}</h2>
        )}
        <button
          onClick={onClose}
          className="ml-auto p-2 text-cacau/40 hover:text-cacau hover:bg-white/[0.06] rounded-full transition-all touch-manipulation"
          aria-label="Fechar"
        >
          <X size={17} />
        </button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </dialog>
  );
}
