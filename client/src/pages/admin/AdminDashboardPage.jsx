import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Users,
  FileText,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Lock,
  ArrowRight,
  Clock,
  CheckCircle2,
  Inbox,
  UserCheck,
} from 'lucide-react';
import AdminSummaryStats from '../../components/admin/AdminSummaryStats';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const dashboardRes = await adminService.getDashboard();
        if (dashboardRes && dashboardRes.stats) {
          setDashboardStats({
            totalDonors: dashboardRes.stats.totalDonors || 0,
            activeAvailableDonors: dashboardRes.stats.availableDonors || 0,
            totalRecipients: dashboardRes.stats.totalRecipients || 0,
            emergencyRequests: dashboardRes.stats.emergencyRequests || 0,
            activeRequests: dashboardRes.stats.activeRequests || 0,
            fulfilledRequests: dashboardRes.stats.fulfilledRequests || 0,
            totalUsers: dashboardRes.stats.totalUsers || 0,
            blockedUsers: dashboardRes.stats.blockedUsers || 0,
            totalRequests: dashboardRes.stats.totalRequests || 0,
            cancelledRequests: dashboardRes.stats.cancelledRequests || 0,
            donorAcceptedRequests: dashboardRes.stats.donorAcceptedRequests || 0,
            inProgressRequests: dashboardRes.stats.inProgressRequests || 0,
          });
        }

        const auditRes = await adminService.getAuditLogs({ limit: 10 });
        if (auditRes && auditRes.logs) {
          setRecentLogs(auditRes.logs);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
        setError(err.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 dark:border-t-slate-100 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-[#181B21] p-8 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm text-center space-y-4 max-w-md">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F1F5F9]">Dashboard Error</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[#1E293B] dark:bg-[#252A33] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. ADMIN OVERVIEW HEADER */}
      <div className="bg-white dark:bg-[#181B21] text-[#1E293B] dark:text-[#F1F5F9] p-6 sm:p-7 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1E293B] text-white dark:bg-[#252A33] dark:text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E293B] dark:text-[#F1F5F9]">
                Admin Monitoring Console
              </h1>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Platform governance, user management, and security audit log oversight
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System Active & Guarded
          </span>
        </div>
      </div>

      {/* 2. ADMIN SUMMARY STATS GRID */}
      <AdminSummaryStats stats={dashboardStats} />

      {/* 3. QUICK NAVIGATION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/donors')}
          className="bg-white dark:bg-[#181B21] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs hover:border-[#315B83] dark:hover:border-sky-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#20242C] text-[#1E293B] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#343B47]">
              <Users className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1E293B] dark:group-hover:text-white transition-colors" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] text-sm">Manage Donors</h4>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">View & audit donor accounts</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/recipients')}
          className="bg-white dark:bg-[#181B21] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs hover:border-[#315B83] dark:hover:border-sky-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-[#F0F7FF] dark:bg-sky-950/40 text-[#315B83] dark:text-sky-300 border border-[#BFDBFE] dark:border-sky-800/50">
              <UserCheck className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1E293B] dark:group-hover:text-white transition-colors" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] text-sm">Manage Recipients</h4>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">View recipient accounts</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/requests')}
          className="bg-white dark:bg-[#181B21] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs hover:border-[#A61B2B] dark:hover:border-rose-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
              <FileText className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1E293B] dark:group-hover:text-white transition-colors" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] text-sm">Blood Requests</h4>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Monitor active broadcasts</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/audit-logs')}
          className="bg-white dark:bg-[#181B21] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs hover:border-[#28734A] dark:hover:border-emerald-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#28734A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-emerald-800/50">
              <Activity className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1E293B] dark:group-hover:text-white transition-colors" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] text-sm">Security Audit Logs</h4>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">System activity trail</p>
          </div>
        </div>
      </div>

      {/* 4. RECENT PLATFORM ACTIVITY TIMELINE & SECURITY STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Timeline (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#181B21] p-6 sm:p-7 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#343B47] pb-3">
            <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" /> Recent Platform Activity
            </h3>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Live feed</span>
          </div>

          <div className="space-y-2.5">
            {recentLogs.length === 0 ? (
              <div className="p-6 text-center">
                <Inbox className="w-6 h-6 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">No recent activity recorded yet.</p>
              </div>
            ) : recentLogs.map((act) => (
              <div
                key={act.id}
                className="p-3 bg-[#F8FAFC] dark:bg-[#20242C] rounded-lg border border-[#E2E8F0] dark:border-[#343B47] text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9]">{act.action}</span>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Initiated by {act.actorName || act.actor?.fullName || "System"}</p>
                </div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] shrink-0 font-medium">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Security Status Panel (1 Col) */}
        <div className="bg-white dark:bg-[#181B21] text-[#1E293B] dark:text-[#F1F5F9] p-6 sm:p-7 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#343B47] pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Security & Privacy Guard</h3>
          </div>

          <div className="space-y-2.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
            <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Cookie Authentication
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                JWT tokens stored in HttpOnly cookies with CSRF-safe configurations.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Location Privacy
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Donor exact residential addresses shielded from public search results.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Audit Logging
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                All administrative state updates recorded in an immutable audit ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
