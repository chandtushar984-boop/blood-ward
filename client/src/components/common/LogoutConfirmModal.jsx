import React, { useEffect, useRef } from "react";
import { LogOut, X } from "lucide-react";
import Button from "./Button";

/**
 * Centered Logout Confirmation Dialog
 * Adheres to BloodWard healthcare clinical tokens, supporting both Light & Dark themes,
 * full keyboard navigation (Escape to cancel, focus trap / return), outside click,
 * and loading state prevention.
 */
export default function LogoutConfirmModal({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
  triggerRef,
}) {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Shift focus to the Cancel button by default for safety
    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
        triggerRef?.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose, triggerRef]);

  const handleCancel = () => {
    if (isLoading) return;
    onClose();
    triggerRef?.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-desc"
    >
      <div className="bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden transition-all duration-200 transform scale-100 animate-in zoom-in-95">
        {/* Header with Logout Badge & Close Button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-[#A61B2B] dark:text-rose-400 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#1E293B] dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-[#F1F5F9] dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-3 space-y-2">
          <h3
            id="logout-dialog-title"
            className="text-base font-bold text-[#1E293B] dark:text-zinc-100 tracking-tight"
          >
            Are you sure you want to log out?
          </h3>
          <p
            id="logout-dialog-desc"
            className="text-xs text-[#64748B] dark:text-zinc-400 leading-relaxed"
          >
            You will be signed out of your BloodWard account. You can sign in again whenever you need access.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-zinc-950/50 border-t border-[#E2E8F0] dark:border-zinc-800/80 flex items-center justify-end gap-2.5">
          <Button
            ref={cancelBtnRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="font-medium text-xs dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isLoading}
            disabled={isLoading}
            onClick={onConfirm}
            className="font-semibold text-xs"
          >
            Yes, log out
          </Button>
        </div>
      </div>
    </div>
  );
}
