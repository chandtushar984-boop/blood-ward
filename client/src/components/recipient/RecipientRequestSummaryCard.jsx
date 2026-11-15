import React from "react";
import { Building2, MapPin, Calendar, Users, Phone, CheckCircle2, AlertTriangle, Eye, Radar } from "lucide-react";
import BloodGroupBadge from "../common/BloodGroupBadge";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";

export default function RecipientRequestSummaryCard({ request, onViewDetails }) {
  const isEmergency = request.urgency === "Emergency";
  const radius = request.radiusKm || 20;

  return (
    <div
      className={`bg-white dark:bg-[#181B21] rounded-2xl border overflow-hidden transition-all duration-200 shadow-xs ${
        isEmergency
          ? "border-[#FECACA] dark:border-rose-900/60 ring-1 ring-[#FECACA] dark:ring-rose-900/40"
          : "border-[#E2E8F0] dark:border-[#343B47] hover:border-[#315B83] dark:hover:border-sky-500"
      }`}
    >
      {/* Emergency Header */}
      {isEmergency && (
        <div className="bg-[#A61B2B] dark:bg-[#991B1B] text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-white" />
            CRITICAL EMERGENCY REQUEST
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-[#7F1D1D] text-white px-2 py-0.5 rounded">
            Priority Alert
          </span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Top Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#315B83] dark:text-sky-400 shrink-0" />
              <h4 className="font-bold text-[#1E293B] dark:text-[#F1F5F9] text-base leading-snug">
                {request.hospitalName}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] pl-6">
              <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">{request.city}</span>
              <span className="text-[#CBD5E1] dark:text-[#343B47]">•</span>
              <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                <Radar className="w-3 h-3 text-[#315B83] dark:text-sky-400" /> {radius} KM radius
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <BloodGroupBadge group={request.bloodGroup} size="md" />
            <StatusBadge status={request.status} urgency={request.urgency} />
          </div>
        </div>

        {/* Requirements Summary Bar */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] dark:bg-[#20242C] p-3 rounded-xl text-xs text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#343B47]">
          <div>
            <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px] uppercase font-semibold">
              Units Required:
            </span>
            <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] text-xs">{request.unitsNeeded} Unit(s)</span>
          </div>
          <div>
            <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px] uppercase font-semibold">
              Target Date:
            </span>
            <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3 text-[#315B83] dark:text-sky-400" /> {request.requiredDate}
            </span>
          </div>
        </div>

        {/* Donor Response Section */}
        {request.acceptedDonorDetails ? (
          <div className="p-3.5 bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#BBF7D0] dark:border-emerald-800/50 text-[#1E293B] dark:text-[#F1F5F9] text-xs rounded-xl space-y-2">
            <div className="flex items-center justify-between font-bold text-[#28734A] dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#28734A] dark:text-emerald-400" />
                Donor Accepted Request
              </span>
              <span className="text-[10px] bg-white dark:bg-[#181B21] border border-[#BBF7D0] dark:border-emerald-800/50 text-[#28734A] dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                Contact Unlocked
              </span>
            </div>

            <div className="bg-white dark:bg-[#181B21] p-2.5 rounded-lg border border-[#BBF7D0] dark:border-emerald-800/50 text-[11px] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1E293B] dark:text-[#F1F5F9]">{request.acceptedDonorDetails.fullName}</span>
                <span className="text-[#64748B] dark:text-[#94A3B8] ml-1 font-medium">
                  ({request.acceptedDonorDetails.bloodGroup}{request.acceptedDonorDetails.city ? `, ${request.acceptedDonorDetails.city}` : ""})
                </span>
              </div>
              <a
                href={`tel:${request.acceptedDonorDetails.phone}`}
                className="font-bold text-[#315B83] dark:text-sky-400 hover:underline flex items-center gap-1 font-mono"
              >
                <Phone className="w-3 h-3 text-[#315B83] dark:text-sky-400" />
                {request.acceptedDonorDetails.phone?.startsWith("+91") ? request.acceptedDonorDetails.phone : `+91 ${request.acceptedDonorDetails.phone}`}
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#20242C] px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#343B47]">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#315B83] dark:text-sky-400" />
              {request.status === "Active"
                ? `Actively notifying donors within ${radius} KM`
                : "Awaiting donor response"}
            </span>
            <span className="font-bold font-mono text-[#1E293B] dark:text-[#F1F5F9]">
              {request.donorResponsesCount || 0} response(s)
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-1 border-t border-[#E2E8F0] dark:border-[#343B47]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(request)}
            className="w-full sm:w-auto font-semibold text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 text-[#315B83] dark:text-sky-400" /> Track & Manage Request
          </Button>
        </div>
      </div>
    </div>
  );
}
