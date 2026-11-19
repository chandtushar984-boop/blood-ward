import React, { useState } from "react";
import {
  X,
  Building2,
  Calendar,
  AlertTriangle,
  Check,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import BloodGroupBadge from "../common/BloodGroupBadge";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import DistanceIneligibleModal from "../common/DistanceIneligibleModal";
import { requestService } from "../../services/requestService";

export default function DonorRequestDetailModal({ request, isOpen, onClose, onAccept, onDecline }) {
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [ineligibleDistance, setIneligibleDistance] = useState(null);

  if (!isOpen || !request) return null;

  const maxAllowedKm = request.radiusKm || 20;
  const isOutsideRadius = typeof request.distanceKm === "number" && request.distanceKm > maxAllowedKm;

  const handleAcceptClick = async () => {
    if (isOutsideRadius) {
      setIneligibleDistance(request.distanceKm);
      setShowDistanceModal(true);
      return;
    }

    try {
      if (onAccept) await onAccept(request.id);
      onClose();
    } catch (err) {
      if (err?.code === "DISTANCE_LIMIT_EXCEEDED" || (typeof err?.distanceKm === "number" && err.distanceKm > maxAllowedKm)) {
        setIneligibleDistance(err.distanceKm || request.distanceKm);
        setShowDistanceModal(true);
      } else {
        throw err;
      }
    }
  };

  const isEmergency = request.urgency === "Emergency";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 max-w-xl w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-6 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                REF #{request.id}
              </span>
              <StatusBadge status={request.status} urgency={request.urgency} />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-snug">
              {request.hospitalName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Emergency Alert Banner */}
          {isEmergency && (
            <div className="p-3.5 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-xl text-xs flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 fill-current shrink-0" />
              <span>CRITICAL EMERGENCY: Immediate donor arrival required for procedure.</span>
            </div>
          )}

          {/* Key Parameters Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Blood Group</span>
              <div className="mt-1 flex justify-center">
                <BloodGroupBadge group={request.bloodGroup} size="sm" />
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Units</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm block mt-1">
                {request.unitsNeeded} Unit(s)
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Distance</span>
              <span className="font-bold text-zinc-950 dark:text-zinc-100 text-xs block mt-1">
                {typeof request.distanceKm === "number" ? `~ ${request.distanceKm.toFixed(1)} KM` : "N/A"}
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Service Radius</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm block mt-1">
                {maxAllowedKm} KM
              </span>
            </div>
          </div>

          {/* Hospital & Time Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 text-zinc-600 dark:text-zinc-300">
              <Building2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-zinc-900 dark:text-zinc-100">Hospital Address:</span>
                <span className="text-zinc-500">{request.hospitalName}, {request.city}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-zinc-600 dark:text-zinc-300">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-zinc-900 dark:text-zinc-100">Required Timeline:</span>
                <span className="text-zinc-500">{request.requiredDate}</span>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          {request.additionalNotes && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Additional Request Information:</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 italic">
                "{request.additionalNotes}"
              </p>
            </div>
          )}

          {/* Privacy Workflow Disclosure */}
          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4" /> Secure Contact Exchange
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When you click <strong>"Accept Request"</strong>, BloodWard securely discloses your contact phone number to the hospital blood coordinator to facilitate immediate donation routing.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (onDecline) onDecline(request.id);
              onClose();
            }}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer underline"
          >
            Decline Request
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {request.status === "Donor Accepted" ? (
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  try {
                    await requestService.markInProgress(request.id);
                    if (onAccept) onAccept(request.id);
                    onClose();
                  } catch (err) {
                    alert(err.message || "Failed to mark in progress");
                  }
                }}
                className="font-bold"
              >
                <Clock className="w-4 h-4 mr-1" /> Mark In Progress
              </Button>
            ) : request.status === "In Progress" ? (
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  try {
                    await requestService.fulfill(request.id);
                    if (onAccept) onAccept(request.id);
                    onClose();
                  } catch (err) {
                    alert(err.message || "Failed to fulfill request");
                  }
                }}
                className="font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> Mark as Fulfilled
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptClick}
                className="font-bold"
              >
                <Check className="w-4 h-4 mr-1" /> Accept & Unlock Contacts
              </Button>
            )}
          </div>
        </div>
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
