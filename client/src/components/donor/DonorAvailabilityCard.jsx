import React, { useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck, Power } from "lucide-react";
import Button from "../common/Button";

export default function DonorAvailabilityCard({ isAvailable, onToggle }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleClick = async () => {
    setIsUpdating(true);
    try {
      await onToggle();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#181B21] p-6 sm:p-7 rounded-2xl border border-[#E2E8F0] dark:border-[#343B47] space-y-4 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-[#1E293B] dark:text-[#F1F5F9] text-base">Donation Availability</h3>
            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#28734A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-emerald-800/50 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#28734A] dark:bg-emerald-400 animate-pulse" /> Available to Donate
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" /> Unavailable
              </span>
            )}
          </div>
          <p className="text-xs text-[#475569] dark:text-[#CBD5E1] max-w-xl">
            {isAvailable
              ? "You are active in emergency donor searches for nearby recipients requiring your blood group within your service radius."
              : "You are currently hidden from active donor search results. Toggle on when you are available to donate."}
          </p>
        </div>

        <Button
          variant={isAvailable ? "outline" : "primary"}
          size="sm"
          isLoading={isUpdating}
          onClick={handleToggleClick}
          className="shrink-0 font-semibold"
        >
          <Power className="w-3.5 h-3.5 mr-1.5" />
          {isAvailable ? "Set to Unavailable" : "Set to Available"}
        </Button>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#343B47] flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
        <div className="flex items-center gap-1.5 text-[#28734A] dark:text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Location Privacy Active: Exact home address is never revealed publicly (~500m Coarsened)</span>
        </div>
        <span className="hidden md:inline text-[#64748B] dark:text-[#94A3B8] font-mono">Real-time emergency broadcast enabled</span>
      </div>
    </div>
  );
}
