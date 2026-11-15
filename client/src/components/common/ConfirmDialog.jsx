import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Security Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-theme-modal max-w-md w-full rounded-xl border border-theme shadow-xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-4 bg-theme-modal-header text-theme-primary flex items-center justify-between border-b border-theme">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-zinc-950 dark:text-zinc-100" />
            <h3 className="font-semibold text-sm text-theme-primary">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md bg-theme-subtle hover:bg-theme-hover text-theme-secondary hover:text-theme-primary cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-theme-secondary leading-relaxed">{message}</p>
          <div className="p-2.5 bg-theme-subtle border border-theme rounded-lg text-[11px] text-theme-muted font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-zinc-100 shrink-0" />
            <span>Administrative Audit Notice: This action is recorded in the security audit log.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-theme-modal-footer border-t border-theme flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
            className="font-bold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
