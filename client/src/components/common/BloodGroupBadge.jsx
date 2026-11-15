import React from "react";

export default function BloodGroupBadge({ group, size = "md", variant = "subtle" }) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-bold",
    md: "px-2.5 py-0.5 text-xs font-bold",
    lg: "px-3.5 py-1 text-sm font-extrabold",
  };

  const variantClass =
    variant === "solid"
      ? "bg-[#A61B2B] text-white border border-[#8E1724]"
      : "bg-[#FEF2F2] dark:bg-[#A61B2B]/20 text-[#A61B2B] dark:text-rose-400 border border-[#FECACA] dark:border-[#A61B2B]/40";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-mono tracking-tight select-none shadow-2xs ${variantClass} ${
        sizeClasses[size] || sizeClasses.md
      }`}
    >
      {group || "N/A"}
    </span>
  );
}
