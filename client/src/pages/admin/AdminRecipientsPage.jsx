import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ShieldAlert,
  Trash2,
  RefreshCw,
  Inbox,
  X,
  Phone,
  Mail,
  UserCheck,
  Building2,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { adminService } from '../../services/adminService';

export default function AdminRecipientsPage() {
  const [recipients, setRecipients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [accountTypeFilter, setAccountTypeFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [feedback, setFeedback] = useState('');
  const [targetForDelete, setTargetForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verification Review Modal State
  const [targetForVerify, setTargetForVerify] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isVerifyingAction, setIsVerifyingAction] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const fetchRecipients = async () => {
    setIsLoading(true);
    try {
      const params = { role: 'recipient' };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const res = await adminService.getUsers(params);
      if (res && res.users) {
        setRecipients(
          res.users.map((u) => ({
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            phone: u.phone,
            city: u.city || 'N/A',
            state: u.state || 'N/A',
            accountStatus: u.isBlocked ? 'Blocked' : 'Active',
            isBlocked: u.isBlocked,
            accountType: u.accountType || 'individual',
            verificationStatus: u.verificationStatus || (u.accountType === 'hospital_rep' ? 'pending' : 'verified'),
            verificationRejectionReason: u.verificationRejectionReason || '',
            hospitalName: u.hospitalName || '',
            hospitalAddress: u.hospitalAddress || '',
            hospitalContactPhone: u.hospitalContactPhone || '',
            representativeDesignation: u.representativeDesignation || '',
            authorizationNotes: u.authorizationNotes || '',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch recipients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, [searchQuery]);

  const handleToggleBlock = async (id) => {
    const target = recipients.find((r) => r.id === id);
    if (!target) return;
    try {
      if (target.isBlocked) {
        await adminService.unblockUser(id);
        setFeedback(`Recipient ${target.fullName} unblocked successfully.`);
      } else {
        await adminService.blockUser(id);
        setFeedback(`Recipient ${target.fullName} blocked successfully.`);
      }
      fetchRecipients();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetForDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deactivateUser(targetForDelete.id);
      setFeedback(`Recipient ${targetForDelete.fullName} account deactivated.`);
      setTargetForDelete(null);
      fetchRecipients();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.message || 'Deactivation failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openVerifyModal = (recipient) => {
    setTargetForVerify(recipient);
    setRejectionReason(recipient.verificationRejectionReason || '');
    setIsRejecting(false);
    setVerifyError('');
  };

  const closeVerifyModal = () => {
    setTargetForVerify(null);
    setRejectionReason('');
    setIsRejecting(false);
    setVerifyError('');
  };

  const handleVerifySubmit = async (status) => {
    if (!targetForVerify) return;
    if (status === 'rejected' && !rejectionReason.trim()) {
      setVerifyError('Rejection reason is required when rejecting verification.');
      return;
    }

    setIsVerifyingAction(true);
    setVerifyError('');
    try {
      await adminService.verifyUser(targetForVerify.id, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason.trim() : undefined,
      });

      setFeedback(
        `Verification updated for ${targetForVerify.fullName} (${status === 'verified' ? 'Approved' : 'Rejected'}).`
      );
      closeVerifyModal();
      fetchRecipients();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setVerifyError(err.message || 'Failed to update verification status.');
    } finally {
      setIsVerifyingAction(false);
    }
  };

  const filtered = recipients.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.accountStatus === statusFilter;
    const matchesAccountType = accountTypeFilter === 'ALL' || r.accountType === accountTypeFilter;
    const matchesVerification =
      verificationFilter === 'ALL' || r.verificationStatus === verificationFilter;
    return matchesStatus && matchesAccountType && matchesVerification;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Manage Recipient & Hospital Accounts
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit registered individual recipients, review institutional credentials, and approve hospital accounts
          </p>
        </div>

        <button
          onClick={fetchRecipients}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shadow-xs"
          title="Refresh recipients"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, hospital, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-3 py-2 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:focus:border-zinc-200 dark:focus:ring-zinc-200"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 shrink-0">Type:</span>
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="font-medium text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option className="bg-white dark:bg-slate-900" value="ALL">All Account Types</option>
              <option className="bg-white dark:bg-slate-900" value="individual">Individual / Family</option>
              <option className="bg-white dark:bg-slate-900" value="hospital_rep">Hospital Representative</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 shrink-0">Verification:</span>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="font-medium text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option className="bg-white dark:bg-slate-900" value="ALL">All Verifications</option>
              <option className="bg-white dark:bg-slate-900" value="verified">Verified Only</option>
              <option className="bg-white dark:bg-slate-900" value="pending">Pending Review</option>
              <option className="bg-white dark:bg-slate-900" value="rejected">Rejected Only</option>
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
              <option className="bg-white dark:bg-slate-900" value="ALL">All Statuses</option>
              <option className="bg-white dark:bg-slate-900" value="Active">Active Only</option>
              <option className="bg-white dark:bg-slate-900" value="Blocked">Blocked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
          <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">No recipients match criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query or filter selections.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Recipient Info</th>
                  <th className="py-3 px-5">Account Type & Institution</th>
                  <th className="py-3 px-5">Verification</th>
                  <th className="py-3 px-5">Account Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 dark:text-white">{r.fullName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{r.email}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{r.phone?.startsWith('+91') ? r.phone : `+91 ${r.phone}`}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-0.5">
                        {r.city}{r.state && r.state !== 'N/A' ? `, ${r.state}` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      {r.accountType === 'hospital_rep' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            <Building2 className="w-3 h-3" /> Hospital Rep
                          </span>
                          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                            {r.hospitalName || 'Unnamed Institution'}
                          </div>
                          {r.representativeDesignation && (
                            <div className="text-[11px] text-slate-400">{r.representativeDesignation}</div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Individual
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge
                        status={
                          r.verificationStatus === 'verified'
                            ? 'Verified'
                            : r.verificationStatus === 'rejected'
                            ? 'Rejected'
                            : 'Pending Verification'
                        }
                      />
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          r.accountStatus === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {r.accountStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                      {r.accountType === 'hospital_rep' && (
                        <button
                          onClick={() => openVerifyModal(r)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 cursor-pointer transition-colors shadow-2xs"
                        >
                          Review & Verify
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleBlock(r.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                          r.accountStatus === 'Active'
                            ? 'bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 border-slate-200 dark:border-slate-700'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {r.accountStatus === 'Active' ? 'Block' : 'Unblock'}
                      </button>

                      <button
                        onClick={() => setTargetForDelete(r)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors inline-flex items-center cursor-pointer"
                        title="Deactivate Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VERIFICATION REVIEW MODAL */}
      {targetForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden space-y-0">
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Hospital Representative Verification
                </h3>
              </div>
              <button
                onClick={closeVerifyModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {verifyError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Representative Info</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{targetForVerify.fullName}</p>
                <p className="text-xs text-slate-500">{targetForVerify.email} • {targetForVerify.phone}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Hospital / Facility</span>
                  <StatusBadge
                    status={
                      targetForVerify.verificationStatus === 'verified'
                        ? 'Verified'
                        : targetForVerify.verificationStatus === 'rejected'
                        ? 'Rejected'
                        : 'Pending Verification'
                    }
                  />
                </div>
                <div className="space-y-1 pt-1">
                  <div><strong>Institution Name:</strong> {targetForVerify.hospitalName || 'Not specified'}</div>
                  <div><strong>Designation:</strong> {targetForVerify.representativeDesignation || 'Not specified'}</div>
                  <div><strong>Hospital Desk Phone:</strong> {targetForVerify.hospitalContactPhone || 'Not specified'}</div>
                  <div><strong>Address:</strong> {targetForVerify.hospitalAddress || 'Not specified'}</div>
                  {targetForVerify.authorizationNotes && (
                    <div className="pt-1 text-[11px] text-slate-500 italic">
                      Notes: {targetForVerify.authorizationNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason Form */}
              {isRejecting ? (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                    Rejection Reason (Required)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a clear clinical or administrative reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full text-xs rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 p-2.5 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => setIsRejecting(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isVerifyingAction}
                      onClick={() => handleVerifySubmit('rejected')}
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[11px] text-slate-500 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
                  <span>
                    Approving verification promotes pending blood requisitions submitted by this representative to <strong>Active</strong> status and broadcasts them to eligible donors.
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isRejecting && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" onClick={closeVerifyModal}>
                  Close
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsRejecting(true)}
                  >
                    Reject Verification
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isVerifyingAction}
                    onClick={() => handleVerifySubmit('verified')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve Verification
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!targetForDelete}
        title="Deactivate Recipient Account"
        message={`Are you sure you want to deactivate the recipient account for "${targetForDelete?.fullName}" (${targetForDelete?.email})?`}
        confirmText="Deactivate Account"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setTargetForDelete(null)}
      />
    </div>
  );
}
