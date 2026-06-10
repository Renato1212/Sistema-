import { clsx } from "clsx";
import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="cp-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            "cp-field resize-y min-h-[80px]",
            error && "border-rose/60 focus:border-rose focus:ring-rose/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
