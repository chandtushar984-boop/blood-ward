import React from "react";
import { MapPin, Clock, Eye, AlertCircle } from "lucide-react";
import BloodGroupBadge from "../common/BloodGroupBadge";
import Button from "../common/Button";

export default function RecipientDonorCard({ donor, onViewDetails }) {
  const isPreviewOnly = typeof donor.distanceKm === "number" && donor.distanceKm > 20;

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs hover:shadow-xs hover:border-[#315B83] flex flex-col justify-between space-y-4 transition-all">
      {/* Top Row: Blood Group & Availability */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-[#1E293B] text-base leading-snug">
              {donor.name}
            </h4>
            <BloodGroupBadge group={donor.bloodGroup} size="sm" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-medium text-[#475569]">{donor.city}{donor.state ? `, ${donor.state}` : ""}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {donor.isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F0FDF4] text-[#28734A] border border-[#BBF7D0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#28734A] animate-pulse" /> Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" /> Unavailable
            </span>
          )}

          {isPreviewOnly && (
            <span className="text-[10px] font-medium text-[#A66B19] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">
              Preview Only (&gt;20 km)
            </span>
          )}
        </div>
      </div>

      {/* Proximity & Activity Matrix */}
      <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 rounded-xl text-xs text-[#475569] border border-[#E2E8F0]">
        <div>
          <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Distance:</span>
          <span className="font-semibold text-[#1E293B]">
            {typeof donor.distanceKm === "number" ? `~ ${donor.distanceKm} km · straight-line` : "All Cities"}
          </span>
        </div>
        <div>
          <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Activity:</span>
          <span className="font-medium text-[#475569] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#315B83]" /> {donor.lastActive || "Recently"}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewDetails && onViewDetails(donor)}
        className="w-full justify-center font-semibold text-xs"
      >
        <Eye className="w-3.5 h-3.5 mr-1.5 text-[#315B83]" /> View Match Details
      </Button>
    </div>
  );
}
