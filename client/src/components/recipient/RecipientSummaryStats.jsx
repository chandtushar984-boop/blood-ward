import React from "react";
import { CheckCircle2, HeartHandshake, FileText, Activity } from "lucide-react";

export default function RecipientSummaryStats({ stats }) {
  const statItems = [
    {
      title: "Active Requests",
      value: stats?.activeRequests || 0,
      subtext: "Awaiting donor acceptance",
      icon: Activity,
      iconColor: "text-[#315B83] dark:text-sky-300",
      iconBg: "bg-[#F0F7FF] dark:bg-sky-950/40 border border-[#BFDBFE] dark:border-sky-800/50",
      badge: "Live",
      badgeColor: "text-[#315B83] dark:text-sky-300 bg-[#F0F7FF] dark:bg-sky-950/40 border-[#BFDBFE] dark:border-sky-800/50",
    },
    {
      title: "Donors Responded",
      value: stats?.donorsResponded || 0,
      subtext: "Accepted & ready to donate",
      icon: HeartHandshake,
      iconColor: "text-[#A61B2B] dark:text-rose-400",
      iconBg: "bg-[#FEF2F2] dark:bg-rose-950/40 border border-[#FECACA] dark:border-rose-800/50",
      badge: "Unlocked",
      badgeColor: "text-[#A61B2B] dark:text-rose-400 bg-[#FEF2F2] dark:bg-rose-950/40 border-[#FECACA] dark:border-rose-800/50",
    },
    {
      title: "Fulfilled Requests",
      value: stats?.fulfilledCount || 0,
      subtext: "Successfully completed",
      icon: CheckCircle2,
      iconColor: "text-[#28734A] dark:text-emerald-400",
      iconBg: "bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#BBF7D0] dark:border-emerald-800/50",
      badge: "Complete",
      badgeColor: "text-[#28734A] dark:text-emerald-400 bg-[#F0FDF4] dark:bg-emerald-950/40 border-[#BBF7D0] dark:border-emerald-800/50",
    },
    {
      title: "Total Requests Created",
      value: stats?.totalRequests || 0,
      subtext: "All-time history",
      icon: FileText,
      iconColor: "text-[#1E293B] dark:text-[#F1F5F9]",
      iconBg: "bg-[#F1F5F9] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47]",
      badge: "Total",
      badgeColor: "text-[#1E293B] dark:text-[#F1F5F9] bg-[#F1F5F9] dark:bg-[#20242C] border-[#E2E8F0] dark:border-[#343B47]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#181B21] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs flex flex-col justify-between space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${item.iconBg} ${item.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.badgeColor}`}>
                {item.badge}
              </span>
            </div>

            <div>
              <div className="text-2xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">{item.value}</div>
              <div className="text-xs font-bold text-[#1E293B] dark:text-[#F1F5F9] mt-0.5">{item.title}</div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">{item.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
