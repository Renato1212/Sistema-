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
        "rounded-sm shadow-2xl bg-marfim border border-areia backdrop:bg-cacau/40 backdrop:backdrop-blur-sm p-0 max-h-[90vh] overflow-y-auto",
        {
          "w-full max-w-sm": size === "sm",
          "w-full max-w-lg": size === "md",
          "w-full max-w-2xl": size === "lg",
          "w-full max-w-4xl": size === "xl",
        }
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="sticky top-0 z-10 bg-marfim border-b border-areia px-6 py-4 flex items-center justify-between">
        {title && (
          <h2 className="font-bodoni text-lg text-cacau">{title}</h2>
        )}
        <button
          onClick={onClose}
          className="ml-auto p-1 text-cacau/50 hover:text-cacau transition-colors rounded"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
