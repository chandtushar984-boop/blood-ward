import React from "react";
import {
  X,
  Building2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import BloodGroupBadge from "../common/BloodGroupBadge";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";

export default function AdminRequestDetailModal({ request, isOpen, onClose }) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                REF #{request.id}
              </span>
              <StatusBadge status={request.status} urgency={request.urgency} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
              {request.hospitalName}
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {request.urgency === "Emergency" && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Emergency Broadcast: High priority alert active for this blood request.</span>
            </div>
          )}

          {/* Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Recipient</span>
              <span className="font-semibold text-slate-900 dark:text-white text-xs block mt-1">
                {request.recipientName || "Recipient"}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Blood Group</span>
              <div className="mt-1">
                <BloodGroupBadge group={request.bloodGroup} size="sm" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Units</span>
              <span className="font-semibold text-slate-900 dark:text-white text-xs block mt-1">
                {request.unitsNeeded} Unit(s)
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Donors Accepted</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs block mt-1">
                {request.donorResponsesCount || (request.acceptedDonorDetails ? 1 : 0)} Donor
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">Hospital Facility:</span>
                <span className="text-slate-500">{request.hospitalName}, {request.city}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">Required Date:</span>
                <span className="text-slate-500">{request.requiredDate}</span>
              </div>
            </div>
          </div>

          {/* Clinical notes */}
          {request.additionalNotes && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Clinical / Request Notes:</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 italic">
                "{request.additionalNotes}"
              </p>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Administrative Oversight: All request transitions are recorded in the security audit ledger.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
