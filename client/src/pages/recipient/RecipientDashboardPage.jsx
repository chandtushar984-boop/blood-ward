import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { requestService } from "../../services/requestService";
import { socketService } from "../../services/socketService";
import {
  Search,
  PlusCircle,
  AlertTriangle,
  Activity,
  Inbox,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import Button from "../../components/common/Button";
import RecipientSummaryStats from "../../components/recipient/RecipientSummaryStats";
import RecipientRequestSummaryCard from "../../components/recipient/RecipientRequestSummaryCard";
import BloodCompatibility from "../../components/common/BloodCompatibility";

export default function RecipientDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const res = await requestService.getMyRequests();
      if (res && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error("Failed to load recipient dashboard requests:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleReconnect = () => {
      fetchDashboardData();
    };

    socketService.on("bloodRequest:accepted", fetchDashboardData);
    socketService.on("bloodRequest:statusChanged", fetchDashboardData);
    socketService.on("bloodRequest:fulfilled", fetchDashboardData);
    socketService.on("bloodRequest:cancelled", fetchDashboardData);
    window.addEventListener("bloodward:reconnect", handleReconnect);

    return () => {
      socketService.off("bloodRequest:accepted", fetchDashboardData);
      socketService.off("bloodRequest:statusChanged", fetchDashboardData);
      socketService.off("bloodRequest:fulfilled", fetchDashboardData);
      socketService.off("bloodRequest:cancelled", fetchDashboardData);
      window.removeEventListener("bloodward:reconnect", handleReconnect);
    };
  }, []);

  const totalCount = requests.length;
  const activeList = requests.filter((r) => ["Active", "Donor Accepted", "In Progress"].includes(r.status));
  const activeCount = activeList.length;
  const responsesCount = requests.filter((r) => r.acceptedDonor || r.donorResponsesCount > 0).length;
  const fulfilledCount = requests.filter((r) => r.status === "Fulfilled").length;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. WELCOME HEADER */}
      <div className="bg-white dark:bg-[#181B21] text-[#1E293B] dark:text-[#F1F5F9] p-6 sm:p-7 rounded-2xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E293B] dark:text-[#F1F5F9]">
            Welcome, {user?.fullName || "Recipient"}
          </h1>
          <p className="text-[#475569] dark:text-[#CBD5E1] text-xs sm:text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#315B83] dark:text-sky-400 shrink-0" />
            <span>Search Location: <strong className="text-[#1E293B] dark:text-white">{user?.city ? (user?.state ? user.city + ", " + user.state : user.city) : (user?.state || "Not specified")}</strong></span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/recipient/donors")}
            className="font-medium text-xs"
          >
            <Search className="w-3.5 h-3.5 mr-1.5 text-[#315B83] dark:text-sky-400" /> Search Donors
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/recipient/requests/create")}
            className="font-bold text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Create Blood Request
          </Button>
        </div>
      </div>

      {/* Verification Notice for Hospital Representatives */}
      {user?.accountType === "hospital_rep" && user?.verificationStatus === "pending" && (
        <div className="p-4 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/40 border border-[#FDE68A] dark:border-amber-800/50 text-xs text-[#92400E] dark:text-amber-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#A66B19] dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#78350F] dark:text-amber-100">
              Hospital Account Verification Pending
            </h4>
            <p className="text-[#92400E] dark:text-amber-300 leading-relaxed">
              Your hospital representative account is awaiting administrative verification. Any blood requests created will remain in <em>Pending Verification</em> status and will not dispatch to voluntary donors until your hospital credentials are verified.
            </p>
          </div>
        </div>
      )}

      {user?.accountType === "hospital_rep" && user?.verificationStatus === "rejected" && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] dark:bg-rose-950/40 border border-[#FECACA] dark:border-rose-800/50 text-xs text-[#991B1B] dark:text-rose-200 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-[#A61B2B] dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#7F1D1D] dark:text-rose-100">
              Hospital Account Verification Rejected
            </h4>
            <p className="text-[#991B1B] dark:text-rose-300 leading-relaxed">
              Reason: {user?.verificationRejectionReason || "Verification credentials could not be confirmed."} Please visit your profile to update details.
            </p>
          </div>
        </div>
      )}

      {/* 2. ENTERPRISE EMERGENCY REQUEST NOTICE */}
      <div className="bg-gradient-to-r from-[#FEF2F2] to-[#F0F7FF] dark:from-[#2A161A] dark:to-[#172535] p-6 sm:p-7 rounded-2xl border border-[#FECACA] dark:border-[#343B47] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#181B21] text-[#A61B2B] dark:text-rose-400 text-[11px] font-semibold uppercase tracking-wider border border-[#FECACA] dark:border-[#343B47]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#A61B2B] dark:text-rose-400" /> Urgent Broadcast Protocol
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#1E293B] dark:text-[#F1F5F9]">
            Need Blood Urgently For A Medical Procedure?
          </h2>
          <p className="text-[#475569] dark:text-[#CBD5E1] text-xs leading-relaxed">
            Dispatch an emergency request to immediately notify verified voluntary donors within your chosen operational radius.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/recipient/requests/create?emergency=true")}
          className="shrink-0 font-bold shadow-xs"
        >
          Create Emergency Request →
        </Button>
      </div>

      {/* 3. RECIPIENT SUMMARY STATS */}
      <RecipientSummaryStats stats={{ totalRequests: totalCount, activeRequests: activeCount, donorsResponded: responsesCount, fulfilledCount: fulfilledCount }} />

      {/* 4. ACTIVE BLOOD REQUESTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#343B47] pb-3">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#315B83] dark:text-sky-400" />
              Your Active Requests
            </h2>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
              Track donor acceptances, unlocked contacts, and request statuses
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/recipient/requests")}
          >
            View All Requests →
          </Button>
        </div>

        {activeList.length === 0 ? (
          <div className="bg-white dark:bg-[#181B21] p-8 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] dark:bg-[#20242C] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center mx-auto">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] text-base">No active blood requests</h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] max-w-md mx-auto">
              You do not have any active blood requests. Search available donors or create a new request when needed.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/recipient/requests/create")}
            >
              Create Request Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeList.map((req) => (
              <RecipientRequestSummaryCard
                key={req.id}
                request={req}
                onViewDetails={() => navigate("/recipient/requests")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clinical Compatibility Matrix */}
      <BloodCompatibility defaultRecipientGroup={user?.bloodGroup || "O+"} />

      {/* 5. RECENT ACTIVITY TIMELINE SNIPPET */}
      <div className="bg-white dark:bg-[#181B21] p-6 sm:p-7 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-3 transition-colors">
        <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" /> Recent Request Activity
        </h3>

        {activeList.length === 0 ? (
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] italic">No recent request activity recorded yet.</p>
        ) : (
          <div className="space-y-2.5 text-xs">
            {activeList.map((req) => (
              <div key={req.id} className="p-3 bg-[#F8FAFC] dark:bg-[#20242C] rounded-lg border border-[#E2E8F0] dark:border-[#343B47] flex items-start gap-3">
                <div className="p-1.5 bg-[#F1F5F9] dark:bg-[#252A33] text-[#475569] dark:text-[#CBD5E1] rounded-md shrink-0 border border-[#E2E8F0] dark:border-[#343B47]">
                  <PlusCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                    Request #{req.id?.slice(-6) || "--"} at {req.hospitalName || "Hospital"}
                  </p>
                  <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">Status: {req.status} • {req.createdAt || "Recently"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
