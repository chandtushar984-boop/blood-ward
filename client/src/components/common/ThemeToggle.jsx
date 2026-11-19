import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Universal Icon-Only Theme Selector
 * - Two-option segmented control displaying both Sun and Moon icons simultaneously.
 * - Active theme receives a clearly visible highlight / background / border.
 * - Inactive icon remains readable and clickable with full accessibility.
 * - Tooltips & Aria labels: "Switch to Light mode" and "Switch to Dark mode".
 */
export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#20242C] border border-[#CBD5E1] dark:border-[#343B47] shrink-0 select-none ${className}`}
      role="group"
      aria-label="Theme selector"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
          !isDark
            ? "bg-white text-amber-500 shadow-xs ring-1 ring-[#CBD5E1] font-semibold"
            : "text-[#64748B] hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]"
        }`}
        aria-pressed={!isDark}
        title="Switch to Light mode"
        aria-label="Switch to Light mode"
      >
        <Sun className="w-4 h-4 text-amber-500 shrink-0" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
          isDark
            ? "bg-[#252A33] text-indigo-400 shadow-xs ring-1 ring-[#343B47] font-semibold"
            : "text-[#64748B] hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]"
        }`}
        aria-pressed={isDark}
        title="Switch to Dark mode"
        aria-label="Switch to Dark mode"
      >
        <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
      </button>
    </div>
  );
}
