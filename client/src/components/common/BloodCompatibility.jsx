import React, { useState } from "react";
import { Droplet, Info, Check } from "lucide-react";

/**
 * Red Blood Cell (RBC) Compatibility Matrix
 * Directionality: Selected group is ALWAYS the Recipient's needed blood group.
 * Output cards are ALWAYS the eligible Donor RBC blood groups.
 */
export const RBC_RECIPIENT_TO_DONORS = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

export const ALL_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodCompatibility({
  defaultRecipientGroup = "O+",
  className = "",
}) {
  const [selectedRecipientGroup, setSelectedRecipientGroup] = useState(defaultRecipientGroup);

  const compatibleDonors = RBC_RECIPIENT_TO_DONORS[selectedRecipientGroup] || [];

  return (
    <div
      className={`bg-white dark:bg-[#181B21] border border-[#E2E8F0] dark:border-[#343B47] rounded-xl p-5 sm:p-6 shadow-xs text-[#1E293B] dark:text-[#F1F5F9] transition-colors ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0] dark:border-[#343B47]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] dark:bg-[#A61B2B]/20 border border-[#FECACA] dark:border-[#A61B2B]/40 text-[#A61B2B] dark:text-rose-400 flex items-center justify-center">
            <Droplet className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">
              Blood Compatibility Reference
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Red Blood Cell (RBC) Transfusion Protocol
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F0F7FF] dark:bg-[#152336] text-[#315B83] dark:text-sky-300 border border-[#BFDBFE] dark:border-[#1E3A5F]">
          Clinical Standard
        </span>
      </div>

      {/* Selector Section: Recipient Blood Group */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#1E293B] dark:text-[#F1F5F9] uppercase tracking-wider">
            Select Recipient Blood Group
          </label>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Active: <span className="font-bold text-[#A61B2B] dark:text-rose-400">{selectedRecipientGroup}</span>
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {ALL_BLOOD_GROUPS.map((group) => {
            const isSelected = selectedRecipientGroup === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedRecipientGroup(group)}
                className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  isSelected
                    ? "bg-[#A61B2B] text-white border-[#8E1724] shadow-xs ring-1 ring-[#A61B2B]"
                    : "bg-[#F8FAFC] dark:bg-[#20242C] hover:bg-[#F1F5F9] dark:hover:bg-[#252A33] text-[#1E293B] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#343B47]"
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>
      </div>

      {/* Output Section: Compatible Donor Blood Groups */}
      <div className="mt-5 space-y-2.5 pt-4 border-t border-[#E2E8F0] dark:border-[#343B47]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#1E293B] dark:text-[#F1F5F9] uppercase tracking-wider">
            Compatible Donor Blood Groups
          </label>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            {compatibleDonors.length} compatible type{compatibleDonors.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ALL_BLOOD_GROUPS.map((group) => {
            const isMatch = compatibleDonors.includes(group);
            return (
              <div
                key={group}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  isMatch
                    ? "bg-[#F0FDF4] dark:bg-[#1B2E24] text-[#1E293B] dark:text-[#F1F5F9] border-[#BBF7D0] dark:border-[#28734A]/50 shadow-2xs"
                    : "bg-[#F8FAFC] dark:bg-[#13161B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#242A35]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-bold font-mono tracking-tight ${isMatch ? "text-[#1E293B] dark:text-[#F1F5F9]" : "text-[#64748B] dark:text-[#94A3B8]"}`}>
                    {group}
                  </span>
                </div>
                {isMatch ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#15231C] text-[#28734A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-[#28734A]/50 font-bold flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> Eligible
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#20242C] text-[#64748B] dark:text-[#94A3B8] border border-[#CBD5E1] dark:border-[#343B47]">
                    Ineligible
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer */}
      <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#343B47] flex items-start gap-2.5 text-[11px] text-[#1E3A5F] dark:text-sky-200 leading-relaxed font-sans bg-[#F0F7FF] dark:bg-[#152336] p-3 rounded-lg border border-[#BFDBFE] dark:border-[#1E3A5F]">
        <Info className="w-4 h-4 text-[#315B83] dark:text-sky-400 shrink-0 mt-0.5" />
        <p>
          This compatibility reference concerns red blood cell transfusion; actual transfusions require appropriate blood bank testing and crossmatching.
        </p>
      </div>
    </div>
  );
}
