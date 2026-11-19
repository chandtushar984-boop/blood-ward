import React from "react";

export default function StatusBadge({ status, urgency }) {
  const isEmergency = urgency === "Emergency";

  const getBadgeConfig = () => {
    if (isEmergency) {
      return {
        container:
          "bg-[#FEF2F2] dark:bg-[#A61B2B]/20 text-[#A61B2B] dark:text-rose-400 border border-[#FECACA] dark:border-[#A61B2B]/40 font-bold tracking-tight",
        dot: "bg-[#A61B2B] dark:bg-rose-400 animate-pulse",
        label: status ? `${status} (Emergency)` : "Emergency",
      };
    }

    switch (status) {
      case "Pending Verification":
        return {
          container:
            "bg-amber-50 dark:bg-[#2C2415] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-[#A66B19]/50 font-semibold text-[11px]",
          dot: "bg-amber-500 animate-pulse",
          label: "Pending Verification",
        };
      case "Created":
      case "Active":
        return {
          container:
            "bg-[#FFFBEB] dark:bg-[#2C2415] text-[#A66B19] dark:text-amber-300 border border-[#FDE68A] dark:border-[#A66B19]/50 font-semibold text-[11px]",
          dot: "bg-[#A66B19] dark:bg-amber-400",
          label: status,
        };
      case "Donor Accepted":
        return {
          container:
            "bg-[#F0FDF4] dark:bg-[#1B2E24] text-[#28734A] dark:text-emerald-300 border border-[#BBF7D0] dark:border-[#28734A]/50 font-semibold text-[11px]",
          dot: "bg-[#28734A] dark:bg-emerald-400",
          label: status,
        };
      case "In Progress":
        return {
          container:
            "bg-[#F0FDF4] dark:bg-[#152336] text-[#315B83] dark:text-sky-300 border border-[#BFDBFE] dark:border-[#1E3A5F] font-semibold text-[11px]",
          dot: "bg-[#315B83] dark:bg-sky-400",
          label: status,
        };
      case "Fulfilled":
      case "Completed":
        return {
          container:
            "bg-[#F0FDF4] dark:bg-[#1B2E24] text-[#28734A] dark:text-emerald-300 border border-[#BBF7D0] dark:border-[#28734A]/50 font-medium text-[11px]",
          dot: "bg-[#28734A] dark:bg-emerald-400",
          label: status,
        };
      case "Cancelled":
      case "Expired":
        return {
          container:
            "bg-[#F8FAFC] dark:bg-[#20242C] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#343B47] line-through font-medium text-[11px]",
          dot: "bg-[#94A3B8]",
          label: status,
        };
      default:
        return {
          container:
            "bg-[#F1F5F9] dark:bg-[#20242C] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#343B47] font-medium text-[11px]",
          dot: "bg-[#64748B] dark:bg-zinc-400",
          label: status || urgency || "Normal",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs transition-colors select-none ${config.container}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
