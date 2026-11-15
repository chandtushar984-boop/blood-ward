import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export default function Toast({ message, onClose, duration = 4000, type = "info" }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === "success" || message.toLowerCase().includes("success");
  const isError = type === "error" || message.toLowerCase().includes("failed") || message.toLowerCase().includes("error");

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm sm:max-w-md w-full px-4 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className={`flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-lg border ${
        isSuccess
          ? "border-zinc-950 dark:border-zinc-100"
          : isError
            ? "border-zinc-950 dark:border-zinc-100 ring-1 ring-zinc-950/20"
            : "border-zinc-300 dark:border-zinc-700"
      }`}>
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-zinc-950 dark:text-zinc-100" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-950 dark:text-zinc-100" />
        ) : (
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-zinc-500" />
        )}
        <div className="flex-1 text-xs font-medium leading-snug text-theme-primary">
          {message}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors cursor-pointer shrink-0"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
