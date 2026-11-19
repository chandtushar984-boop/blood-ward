import React, { useState } from "react";
import { MapPin, AlertTriangle, Check, X, Building2, Calendar, ShieldAlert, Radar } from "lucide-react";
import BloodGroupBadge from "../common/BloodGroupBadge";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import DistanceIneligibleModal from "../common/DistanceIneligibleModal";

export default function DonorRequestCard({ request, onAccept, onDecline }) {
  const [isResponding, setIsResponding] = useState(false);
  const [responseState, setResponseState] = useState(null); // "ACCEPTED" | "DECLINED"
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [ineligibleDistance, setIneligibleDistance] = useState(request.distanceKm || null);

  const maxAllowedKm = request.radiusKm || 20;
  const isOutsideRadius = typeof request.distanceKm === "number" && request.distanceKm > maxAllowedKm;

  const handleAcceptClick = async () => {
    // Client-side pre-check for request radius eligibility rule
    if (isOutsideRadius) {
      setIneligibleDistance(request.distanceKm);
      setShowDistanceModal(true);
      return;
    }

    setIsResponding(true);
    try {
      if (onAccept) {
        await onAccept(request.id);
      }
      setResponseState("ACCEPTED");
    } catch (err) {
      if (err?.code === "DISTANCE_LIMIT_EXCEEDED" || (typeof err?.distanceKm === "number" && err.distanceKm > maxAllowedKm)) {
        setIneligibleDistance(err.distanceKm || request.distanceKm);
        setShowDistanceModal(true);
      } else {
        throw err;
      }
    } finally {
      setIsResponding(false);
    }
  };

  const handleDeclineClick = async () => {
    setIsResponding(true);
    try {
      if (onDecline) {
        await onDecline(request.id);
      }
      setResponseState("DECLINED");
    } finally {
      setIsResponding(false);
    }
  };

  if (responseState === "DECLINED") {
    return null;
  }

  const isEmergency = request.urgency === "Emergency";

  return (
    <div
      className={`bg-white dark:bg-[#181B21] rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
        isEmergency
          ? "border-[#FECACA] dark:border-rose-900/60 ring-1 ring-[#FECACA] dark:ring-rose-900/40"
          : "border-[#E2E8F0] dark:border-[#343B47] hover:border-[#315B83] dark:hover:border-sky-500"
      }`}
    >
      {/* Emergency Header Bar if Emergency */}
      {isEmergency && (
        <div className="bg-[#A61B2B] dark:bg-[#991B1B] text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-4 h-4 fill-current text-white" /> CRITICAL EMERGENCY REQUEST
          </span>
          <span className="text-[10px] uppercase font-bold bg-[#7F1D1D] text-white px-2 py-0.5 rounded">
            Priority Alert
          </span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Request Top Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#315B83] dark:text-sky-400 shrink-0" />
              <h4 className="font-bold text-[#1E293B] dark:text-[#F1F5F9] text-base leading-snug">
                {request.hospitalName}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] pl-6 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">{request.city}</span>
              <span className="text-[#CBD5E1] dark:text-[#343B47]">•</span>
              {typeof request.distanceKm === "number" && (
                <span className="font-mono text-[#1E293B] dark:text-[#F1F5F9] bg-[#F1F5F9] dark:bg-[#20242C] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#343B47] text-[11px] font-semibold">
                  ~ {request.distanceKm} km · straight-line
                </span>
              )}
              <span className="text-[#CBD5E1] dark:text-[#343B47]">•</span>
              <span className="font-mono text-[#64748B] dark:text-[#94A3B8] text-[11px] flex items-center gap-1">
                <Radar className="w-3 h-3 text-[#315B83] dark:text-sky-400" /> Max {maxAllowedKm} KM
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <BloodGroupBadge group={request.bloodGroup} size="md" />
            <StatusBadge status={request.status} urgency={request.urgency} />
          </div>
        </div>

        {/* Requirements Detail Bar */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] dark:bg-[#20242C] p-3 rounded-xl text-xs text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#343B47]">
          <div>
            <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px] uppercase font-semibold">
              Units Required:
            </span>
            <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] text-xs">{request.unitsNeeded} Unit(s)</span>
          </div>
          <div>
            <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px] uppercase font-semibold">
              Needed By:
            </span>
            <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3 text-[#315B83] dark:text-sky-400" /> {request.requiredDate}
            </span>
          </div>
        </div>

        {/* Additional Notes */}
        {request.additionalNotes && (
          <p className="text-xs text-[#475569] dark:text-[#CBD5E1] italic bg-[#F8FAFC] dark:bg-[#20242C] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#343B47]">
            "{request.additionalNotes}"
          </p>
        )}

        {/* Response Action State */}
        {responseState === "ACCEPTED" ? (
          <div className="p-3 bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#BBF7D0] dark:border-emerald-800/50 text-[#28734A] dark:text-emerald-400 text-xs rounded-xl flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#28734A] dark:text-emerald-400" /> You accepted this blood request!
            </span>
            <span className="text-[11px] underline cursor-pointer hover:text-[#1E293B] dark:hover:text-white">
              View Hospital Contacts
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleDeclineClick}
              disabled={isResponding}
              className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#A61B2B] dark:hover:text-rose-400 hover:bg-[#FEF2F2] dark:hover:bg-rose-950/30 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Decline
            </button>

            <Button
              variant={isEmergency ? "primary" : "secondary"}
              size="sm"
              isLoading={isResponding}
              onClick={handleAcceptClick}
              className="font-bold shadow-xs"
            >
              <Check className="w-4 h-4 mr-1" /> Respond & Accept Request
            </Button>
          </div>
        )}
      </div>

      {/* Distance Restriction Modal */}
      <DistanceIneligibleModal
        isOpen={showDistanceModal}
        onClose={() => setShowDistanceModal(false)}
        distanceKm={ineligibleDistance}
        maxAllowedKm={maxAllowedKm}
      />
    </div>
  );
}
