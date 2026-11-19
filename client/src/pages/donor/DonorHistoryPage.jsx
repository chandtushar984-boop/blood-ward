import React, { useState, useEffect } from "react";
import { requestService } from "../../services/requestService";
import { useAuth } from "../../context/AuthContext";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import BloodGroupBadge from "../../components/common/BloodGroupBadge";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";

export default function DonorHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDonorHistory = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await requestService.getDonorHistory();
      if (res && res.requests) {
        setHistory(res.requests);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch donor history:", err);
      setError(err.message || "Failed to load donation history log.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchHospital = item.hospitalName?.toLowerCase().includes(q);
      const matchCity = item.city?.toLowerCase().includes(q);
      const matchId = String(item.id).includes(q);
      if (!matchHospital && !matchCity && !matchId) return false;
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "Fulfilled" && item.status !== "Fulfilled" && item.status !== "Completed") {
        return false;
      }
      if (statusFilter === "Accepted" && item.status !== "Donor Accepted" && item.status !== "In Progress") {
        return false;
      }
      if (statusFilter === "Cancelled" && item.status !== "Cancelled") {
        return false;
      }
    }

    return true;
  });

  const getHistoryCounts = () => {
    const fulfilled = history.filter((h) => h.status === "Fulfilled" || h.status === "Completed").length;
    const accepted = history.filter((h) => h.status === "Donor Accepted" || h.status === "In Progress").length;
    return { fulfilled, accepted, total: history.length };
  };

  const counts = getHistoryCounts();

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Donation Response History
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete record of requests you responded to or accepted for blood group {user?.bloodGroup}
              </p>
            </div>
          </div>
        </div>

        {/* Header Stats */}
        <div className="flex items-center gap-2 text-xs font-medium shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {counts.fulfilled} Fulfilled
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {counts.accepted} Active
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {counts.total} Total
          </span>
          <button
            onClick={fetchDonorHistory}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Refresh History"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference # or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-3 py-2 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:focus:border-zinc-200 dark:focus:ring-zinc-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="font-medium text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Statuses</option>
              <option value="Fulfilled" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Fulfilled / Completed</option>
              <option value="Accepted" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Accepted / Active</option>
              <option value="Cancelled" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Cancelled</option>
            </select>
          </div>
        </div>

        {(searchQuery || statusFilter !== "ALL") && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">
              Showing {filteredHistory.length} matching history entries
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
          <RefreshCw className="w-6 h-6 text-slate-400 mx-auto animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading donation history...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 p-8 rounded-xl border border-rose-200 dark:border-rose-800 text-center space-y-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 mx-auto" />
          <h3 className="font-semibold text-rose-800 dark:text-rose-300 text-base">Error Loading History</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDonorHistory}>
            Try Again
          </Button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">No history logs found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No donation history matches your current search or status filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Reference ID</th>
                  <th className="py-3 px-5">Hospital & Location</th>
                  <th className="py-3 px-5">Blood Info</th>
                  <th className="py-3 px-5">Required Date</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Notes / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-medium text-slate-800 dark:text-slate-200">
                      #{item.id}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.hospitalName}</div>
                      <div className="text-[11px] text-slate-400">{item.city}</div>
                    </td>
                    <td className="py-3.5 px-5 space-y-1">
                      <BloodGroupBadge group={item.bloodGroup} size="sm" />
                      <div className="text-[11px] text-slate-400">{item.unitsNeeded} Unit(s)</div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700 dark:text-slate-300">
                      {item.requiredDate}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={item.status} urgency={item.urgency} />
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-xs text-[11px]">
                      {item.additionalNotes || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredHistory.map((item) => (
              <div key={item.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    #{item.id}
                  </span>
                  <StatusBadge status={item.status} urgency={item.urgency} />
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{item.hospitalName}</h4>
                  <p className="text-xs text-slate-500">{item.city}</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <BloodGroupBadge group={item.bloodGroup} size="sm" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.unitsNeeded} Unit(s)</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{item.requiredDate}</span>
                </div>

                {item.additionalNotes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-200 dark:border-slate-800">
                    "{item.additionalNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
