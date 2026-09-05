import React from "react";
import DataTable from "../common/DataTable";
import { AlertCircle, Calendar } from "lucide-react";

const priorityStyles = {
  LOW: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  MEDIUM: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  URGENT: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-bold",
};

const statusStyles = {
  BACKLOG: "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20",
  TODO: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  IN_REVIEW: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  DONE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TaskTable = ({ tasks = [], isLoading = false, onTaskClick, showProjectColumn = true }) => {
  const columns = [
    {
      header: "Key",
      cell: (row) => (
        <span
          onClick={() => onTaskClick && onTaskClick(row)}
          className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded cursor-pointer hover:bg-violet-500/20 transition-colors"
        >
          {row.taskKey || "TASK"}
        </span>
      ),
    },
    {
      header: "Title",
      cell: (row) => (
        <span
          onClick={() => onTaskClick && onTaskClick(row)}
          className="font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
        >
          {row.title}
        </span>
      ),
    },
    ...(showProjectColumn
      ? [
          {
            header: "Project",
            cell: (row) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {row.projectId?.name || "N/A"}
              </span>
            ),
          },
        ]
      : []),
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
            statusStyles[row.status] || statusStyles.TODO
          }`}
        >
          {row.status?.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Priority",
      cell: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
            priorityStyles[row.priority] || priorityStyles.MEDIUM
          }`}
        >
          {row.priority === "URGENT" && (
            <AlertCircle className="w-3 h-3 inline mr-1" />
          )}
          {row.priority}
        </span>
      ),
    },
    {
      header: "Assignee",
      cell: (row) =>
        row.assigneeId ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-300">
              {getInitials(row.assigneeId.name)}
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">
              {row.assigneeId.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">Unassigned</span>
        ),
    },
    {
      header: "Created At",
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tasks}
      isLoading={isLoading}
      emptyMessage="No tasks found matching current filters."
    />
  );
};

export default TaskTable;
