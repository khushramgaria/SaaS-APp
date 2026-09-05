import React from "react";
import { Inbox, Clock } from "lucide-react";
import { formatActivity } from "../../utils/activityFormatter";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const ActivityTimeline = ({
  activities = [],
  isLoading = false,
  emptyMessage = "No activity recorded yet.",
}) => {
  // 1. Loading State: 5 skeleton rows with pulse animation
  if (isLoading) {
    return (
      <div className="relative pl-8 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800/80">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="relative flex items-center justify-between gap-4 p-3 rounded-lg animate-pulse"
          >
            {/* Connector Line Skeleton Node */}
            <div className="absolute -left-5 sm:-left-4 top-2.5 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-950" />

            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar Skeleton */}
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              {/* Text Skeleton */}
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              </div>
            </div>
            {/* Timestamp Skeleton */}
            <div className="h-3 bg-slate-200 dark:bg-slate-800/80 rounded w-16 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // 2. Empty State
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-8 sm:p-12 text-center max-w-md mx-auto my-4 transition-colors duration-200">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No Activities Found
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  // 3. Timeline Item Layout
  return (
    <div className="relative pl-8 sm:pl-10 space-y-4 sm:space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {activities.map((activity) => {
        const formatted = formatActivity(activity);
        const IconComponent = formatted.icon;

        const user = activity.userId || {};
        const userName = user.name || activity.metadata?.userName || "User";
        const avatarUrl = user.avatarUrl || user.avatar;
        const initials = getInitials(userName);

        return (
          <div key={activity._id || activity.id} className="relative group">
            {/* Event Action Icon Pill on the connector line */}
            <div
              className={`absolute -left-8 sm:-left-7 top-2.5 flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-slate-950 border text-xs shadow-md transition-transform group-hover:scale-110 ${formatted.iconColor}`}
              title={activity.action}
            >
              <IconComponent className="w-3.5 h-3.5" />
            </div>

            {/* Row Content */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs ring-1 ring-indigo-500/30 dark:ring-indigo-500/40 flex items-center justify-center shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                {/* Formatted Activity Title / Description Node */}
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-snug break-words">
                  {formatted.titleNode}
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 self-end sm:self-center">
                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                <span>{formatted.relativeTime}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
