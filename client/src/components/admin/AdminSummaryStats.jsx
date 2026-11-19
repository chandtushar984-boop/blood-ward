import React from "react";
import { Users, UserCheck, AlertTriangle, CheckCircle2, Activity } from "lucide-react";

export default function AdminSummaryStats({ stats }) {
  const statItems = [
    {
      title: "Registered Donors",
      value: stats?.totalDonors || 0,
      subtext: "Verified donor profiles",
      icon: Users,
      iconColor: "text-zinc-900 dark:text-zinc-100",
      iconBg: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800",
      badge: "Donors",
    },
    {
      title: "Active Available Donors",
      value: stats?.activeAvailableDonors || 0,
      subtext: "Available for search",
      icon: UserCheck,
      iconColor: "text-zinc-900 dark:text-zinc-100",
      iconBg: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
      badge: "Ready",
    },
    {
      title: "Registered Recipients",
      value: stats?.totalRecipients || 0,
      subtext: "Patient accounts",
      icon: Users,
      iconColor: "text-zinc-900 dark:text-zinc-100",
      iconBg: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
      badge: "Recipients",
    },
    {
      title: "Emergency Requests",
      value: stats?.emergencyRequests || 0,
      subtext: "Immediate broadcasts",
      icon: AlertTriangle,
      iconColor: "text-zinc-900 dark:text-zinc-100",
      iconBg: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
      badge: "Urgent",
    },
    {
      title: "Active Requests",
      value: stats?.activeRequests || 0,
      subtext: "Pending fulfillment",
      icon: Activity,
      iconColor: "text-zinc-900 dark:text-zinc-100",
      iconBg: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
      badge: "Live",
    },
    {
      title: "Fulfilled Requests",
      value: stats?.fulfilledRequests || 0,
      subtext: "Successful donations",
      icon: CheckCircle2,
      iconColor: "text-zinc-900 dark:text-zinc-100",
      iconBg: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
      badge: "Completed",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#181B21] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs flex flex-col justify-between space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${item.iconBg} ${item.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#20242C] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#343B47]">
                {item.badge}
              </span>
            </div>

            <div>
              <div className="text-2xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">{item.value}</div>
              <div className="text-xs font-semibold text-[#1E293B] dark:text-[#F1F5F9] mt-0.5">{item.title}</div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">{item.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
