import React from "react";
import { AlertCircle, MapPin, X } from "lucide-react";
import Button from "./Button";

export default function DistanceIneligibleModal({
  isOpen,
  onClose,
  distanceKm,
  maxAllowedKm = 20,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="distance-ineligible-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-theme-modal max-w-md w-full rounded-2xl border border-theme shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="p-5 bg-theme-modal-header text-theme-primary flex items-start justify-between border-b border-theme gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="distance-ineligible-title"
                className="font-bold text-base text-theme-primary leading-snug"
              >
                You are too far away to accept this request.
              </h3>
              <p className="text-xs text-theme-muted mt-0.5">
                Eligibility Service Boundary Notice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg bg-theme-subtle hover:bg-theme-hover text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-theme-secondary leading-relaxed">
            This blood request is outside your eligible service area. You must be within {maxAllowedKm} KM of the request location to accept it.
          </p>

          {/* Telemetry Chip */}
          <div className="p-3.5 bg-theme-subtle rounded-xl border border-theme flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-theme-secondary">
              <MapPin className="w-4 h-4 text-theme-muted shrink-0" />
              <span>Calculated Distance:</span>
            </div>
            <span className="font-semibold text-theme-primary px-2.5 py-1 rounded-md bg-theme-card border border-theme">
              {typeof distanceKm === "number" && !Number.isNaN(distanceKm)
                ? `~ ${distanceKm} km · straight-line`
                : `Exceeds ${maxAllowedKm} km`}
            </span>
          </div>

          <div className="text-[11px] text-theme-muted leading-relaxed">
            Emergency patient safety protocols require rapid donor transit times. Donors located beyond {maxAllowedKm} km cannot be dispatched for this hospital requirement.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-theme-modal-footer border-t border-theme flex items-center justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="font-semibold px-5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

