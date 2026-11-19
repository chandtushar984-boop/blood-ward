import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  ShieldAlert,
  RefreshCw,
  Inbox,
  Eye,
  X,
} from 'lucide-react';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AdminRequestDetailModal from '../../components/admin/AdminRequestDetailModal';
import { adminService } from '../../services/adminService';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState(null);
  const [targetForCancel, setTargetForCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (urgencyFilter !== 'ALL') params.urgency = urgencyFilter;
      if (bloodGroupFilter !== 'ALL') params.bloodGroup = bloodGroupFilter;
      if (searchQuery.trim()) params.city = searchQuery.trim();
      const res = await adminService.getRequests(params);
      if (res && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error('Failed to fetch admin requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter, bloodGroupFilter, searchQuery]);

  const handleConfirmCancel = async () => {
    if (!targetForCancel) return;
    setIsCancelling(true);
    try {
      await adminService.cancelRequest(targetForCancel.id);
      setFeedback(`Blood Request #${targetForCancel.id} cancelled by Admin and logged in security audit trail.`);
      setTargetForCancel(null);
      fetchRequests();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  const filtered = requests;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Blood Requests Overview
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect active and historical emergency blood requests platform-wide
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shadow-xs"
          title="Refresh requests"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {feedback}
          </span>
          <button onClick={() => setFeedback('')} className="text-amber-600 dark:text-amber-400 hover:text-amber-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-3 py-2 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:focus:border-zinc-200 dark:focus:ring-zinc-200"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 shrink-0">Blood Group:</span>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="font-medium text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="ALL">All Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 shrink-0">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="font-medium text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="ALL">All Urgencies</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="Emergency">Emergency</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="High">High</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="Normal">Normal</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="font-medium text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="ALL">All Statuses</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="Active">Active</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="Pending Verification">Pending Verification</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="Donor Accepted">Donor Accepted</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="In Progress">In Progress</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="Fulfilled">Fulfilled</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
          <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">No blood requests found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No requests match your selected admin filters.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Ref & Recipient</th>
                  <th className="py-3 px-5">Group / Units</th>
                  <th className="py-3 px-5">Facility & Location</th>
                  <th className="py-3 px-5">Urgency & Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-mono font-medium text-slate-500 text-[11px]">#{req.id?.slice(-6) || req.id}</div>
                      <div className="font-semibold text-slate-900 dark:text-white pt-0.5">{req.recipientName || "Recipient"}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <BloodGroupBadge group={req.bloodGroup} size="sm" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{req.unitsNeeded} Unit(s)</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 dark:text-white">{req.hospitalName}</div>
                      <div className="text-[11px] text-slate-400">{req.city}</div>
                    </td>
                    <td className="py-3.5 px-5 space-y-1">
                      <StatusBadge status={req.status} urgency={req.urgency} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedRequestForDetail(req)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {!["Fulfilled", "Cancelled", "Expired"].includes(req.status) && (
                        <button
                          onClick={() => setTargetForCancel(req)}
                          className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-medium text-xs transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AdminRequestDetailModal
        request={selectedRequestForDetail}
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
      />

      <ConfirmDialog
        isOpen={!!targetForCancel}
        title="Administrative Request Cancellation"
        message={`Are you sure you want to cancel blood request #${targetForCancel?.id} at ${targetForCancel?.hospitalName}?`}
        confirmText="Cancel Request"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setTargetForCancel(null)}
      />
    </div>
  );
}
