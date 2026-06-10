import { clsx } from "clsx";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="cp-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "cp-field",
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
Input.displayName = "Input";
