import React, { useState } from "react";
import Toast from "../../components/common/Toast";
import { donorService } from "../../services/donorService";
import { useAuth } from "../../context/AuthContext";
import {
  CheckCircle2,
  XCircle,
  Bell,
  ShieldCheck,
  Info,
  X,
  Power,
  Zap,
} from "lucide-react";
import DonorAvailabilityCard from "../../components/donor/DonorAvailabilityCard";

export default function DonorAvailabilityPage() {
  const { user, updateUser } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const isAvailable = user?.availability === "available";

  const handleToggle = async () => {
    const nextState = !isAvailable;
    const nextAvailability = nextState ? "available" : "not_available";
    try {
      const res = await donorService.updateAvailability(nextAvailability);
      const canonical = res?.availability || nextAvailability;
      updateUser({ availability: canonical });
      setFeedback(
        nextState
          ? "Status updated to Available. You are now active in emergency donor searches within 20 KM."
          : "Status updated to Unavailable. Emergency alerts and search visibility paused."
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Failed to update availability:", err);
      setToastMessage(err.message || "Failed to update availability.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
            <Power className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Donation Availability Control
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your visibility in emergency blood discovery and real-time alert dispatch within 20 KM
            </p>
          </div>
        </div>
      </div>

      {/* Instant Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between shadow-2xs transition-all ${
            isAvailable
              ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
          }`}
        >
          <span className="flex items-center gap-2">
            {isAvailable ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Reused Donor Availability Card */}
      <DonorAvailabilityCard isAvailable={isAvailable} onToggle={handleToggle} />

      {/* Impact Explanation Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
          How Availability Status Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AVAILABLE MODE EFFECT */}
          <div
            className={`p-4 rounded-lg border transition-all ${
              isAvailable
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AVAILABLE MODE
              </span>
              <span className="text-[10px] font-semibold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Active
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>You appear in active donor searches for blood group <strong className="text-slate-900 dark:text-white">{user?.bloodGroup || "O+"}</strong> within 20 KM.</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>You receive instant real-time alerts for emergency blood requests in your operational zone.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Your contact phone number remains strictly shielded until you voluntarily accept a request.</span>
              </li>
            </ul>
          </div>

          {/* NOT AVAILABLE MODE EFFECT */}
          <div
            className={`p-4 rounded-lg border transition-all ${
              !isAvailable
                ? "bg-slate-100/70 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700"
                : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-slate-400" /> UNAVAILABLE MODE
              </span>
              <span className="text-[10px] font-semibold uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600">
                Paused
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Your profile is hidden from recipient donor search queries.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Emergency request broadcasts and notifications are temporarily paused.</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Toggle to this mode when traveling, recovering, or temporarily unavailable to donate.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
