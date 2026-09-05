import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Activity as ActivityIcon, ShieldAlert, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import ActivityTimeline from "../components/activity/ActivityTimeline";
import { fetchWorkspaceActivities } from "../redux/slices/activitySlice";

const ActivityPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeWorkspace, user } = useSelector((state) => state.auth);
  const { workspaceActivities, pagination, isLoading } = useSelector(
    (state) => state.activity
  );

  const [page, setPage] = useState(1);

  // Check user role for RBAC
  const userRole = activeWorkspace?.role || user?.role || "MEMBER";
  const isAllowed = userRole === "OWNER" || userRole === "ADMIN";

  useEffect(() => {
    if (isAllowed) {
      dispatch(fetchWorkspaceActivities({ page, limit: 20 }));
    }
  }, [dispatch, page, isAllowed]);

  // If role is MEMBER or VIEWER, render Access Denied View
  if (!isAllowed) {
    return (
      <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[70vh]">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-md w-full shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Workspace Activity logs are restricted to Workspace Owners and Admins only.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer w-full shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <span>Workspace Activity</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Audit logs of all task, project, member, and document operations.
          </p>
        </div>
      </div>

      {/* Main Content Card Container */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xl transition-colors duration-200">
        <ActivityTimeline
          activities={workspaceActivities}
          isLoading={isLoading}
          emptyMessage="No activity recorded in this workspace yet."
        />

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Showing page <strong className="text-slate-900 dark:text-white">{pagination.page}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{pagination.totalPages}</strong> (Total{" "}
              <strong className="text-slate-900 dark:text-white">{pagination.total}</strong> events)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 dark:text-white px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-200 dark:border-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages || isLoading}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 dark:text-white px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-200 dark:border-transparent"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
