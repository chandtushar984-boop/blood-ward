import React from "react";
import { X, ShieldAlert, Terminal } from "lucide-react";
import Button from "../common/Button";

export default function AdminAuditDetailModal({ log, isOpen, onClose }) {
  if (!isOpen || !log) return null;

  const isHighSeverity = log.severity === "HIGH";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                AUDIT #{log.id}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                  isHighSeverity
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                {log.severity} Severity
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
              {log.action}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {isHighSeverity && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-lg flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Security Event: High-priority administrative action recorded in ledger.</span>
            </div>
          )}

          {/* Matrix Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Timestamp</span>
              <span className="font-semibold text-slate-900 dark:text-white block mt-1">{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Category</span>
              <span className="font-semibold text-slate-900 dark:text-white block mt-1">{log.category}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Actor Identity</span>
              <span className="font-semibold text-slate-900 dark:text-white block mt-1">{log.actorName || log.actor?.fullName || "System"}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Client IP Address</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white block mt-1">{log.ipAddress || "N/A"}</span>
            </div>
          </div>

          {/* Target */}
          <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Target Entity</span>
            <span className="font-semibold text-slate-900 dark:text-white text-xs">{log.target || "N/A"}</span>
          </div>

          {/* Details */}
          {log.details && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Event Context & Payload:</span>
              <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg font-mono text-[11px] leading-relaxed border border-slate-200 dark:border-slate-800">
                {typeof log.details === "object" ? JSON.stringify(log.details, null, 2) : log.details}
              </p>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 flex items-center gap-2 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Audit record cryptographically timestamped and stored in security collection.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Audit View
          </Button>
        </div>
      </div>
    </div>
  );
}
