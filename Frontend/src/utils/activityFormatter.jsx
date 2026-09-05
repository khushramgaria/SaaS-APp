import React from "react";
import {
  CheckSquare,
  ArrowRightLeft,
  AlertTriangle,
  UserCheck,
  Calendar,
  Trash2,
  FolderPlus,
  Users,
  Mail,
  RefreshCw,
  XCircle,
  ShieldCheck,
  UserMinus,
  FilePlus,
  FileEdit,
  FileMinus,
  Activity as DefaultActivityIcon,
} from "lucide-react";

export const getRelativeTime = (createdAt) => {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));

  if (diffInSeconds < 30) return "Just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

const renderStatusBadge = (status) => {
  if (!status) return null;
  const normalized = status.replace("_", " ");
  let badgeColor = "bg-slate-800 text-slate-300 border-slate-700/60";

  if (status === "DONE") {
    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (status === "IN_PROGRESS") {
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  } else if (status === "IN_REVIEW") {
    badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  } else if (status === "TODO") {
    badgeColor = "bg-slate-800 text-slate-300 border-slate-700/60";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}
    >
      {normalized}
    </span>
  );
};

const renderRoleBadge = (role) => {
  if (!role) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
      {role}
    </span>
  );
};

const renderPriorityBadge = (priority) => {
  if (!priority) return null;
  let color = "bg-slate-800 text-slate-300 border-slate-700/60";
  if (priority === "HIGH" || priority === "URGENT") {
    color = "bg-rose-500/10 text-rose-400 border-rose-500/20";
  } else if (priority === "MEDIUM") {
    color = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  } else if (priority === "LOW") {
    color = "bg-sky-500/10 text-sky-400 border-sky-500/20";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${color}`}
    >
      {priority}
    </span>
  );
};

export const formatActivity = (activity) => {
  if (!activity) {
    return {
      titleNode: <span>Unknown activity</span>,
      icon: DefaultActivityIcon,
      iconColor: "text-slate-400 bg-slate-800/80 border-slate-700/50",
      relativeTime: "",
    };
  }

  const { action, metadata = {}, userId, createdAt } = activity;

  // Actor display name
  const userName =
    typeof userId === "object" && userId?.name
      ? userId.name
      : metadata.userName || "A user";

  const relativeTime = getRelativeTime(createdAt);

  const renderActor = () => (
    <span className="font-semibold text-white mr-1">{userName}</span>
  );

  switch (action) {
    case "TASK_CREATED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            created task{" "}
            {metadata.taskKey && (
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded mr-1">
                {metadata.taskKey}
              </span>
            )}
            <span className="text-slate-100 font-medium">
              "{metadata.taskTitle || "Untitled Task"}"
            </span>
          </span>
        ),
        icon: CheckSquare,
        iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        relativeTime,
      };

    case "TASK_STATUS_UPDATED":
      return {
        titleNode: (
          <span className="inline-flex items-center flex-wrap gap-1 text-slate-300">
            {renderActor()}
            moved{" "}
            {metadata.taskKey && (
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                {metadata.taskKey}
              </span>
            )}
            from {renderStatusBadge(metadata.fromStatus)} to{" "}
            {renderStatusBadge(metadata.toStatus)}
          </span>
        ),
        icon: ArrowRightLeft,
        iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        relativeTime,
      };

    case "TASK_PRIORITY_UPDATED":
      return {
        titleNode: (
          <span className="inline-flex items-center flex-wrap gap-1 text-slate-300">
            {renderActor()}
            changed priority of{" "}
            {metadata.taskKey && (
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                {metadata.taskKey}
              </span>
            )}
            to {renderPriorityBadge(metadata.toPriority || metadata.priority)}
          </span>
        ),
        icon: AlertTriangle,
        iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        relativeTime,
      };

    case "TASK_ASSIGNEE_UPDATED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            assigned{" "}
            {metadata.taskKey && (
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded mr-1">
                {metadata.taskKey}
              </span>
            )}
            to{" "}
            <span className="font-medium text-white">
              {metadata.assigneeName || "a team member"}
            </span>
          </span>
        ),
        icon: UserCheck,
        iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        relativeTime,
      };

    case "TASK_DUE_DATE_UPDATED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            changed due date for{" "}
            {metadata.taskKey && (
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                {metadata.taskKey}
              </span>
            )}
          </span>
        ),
        icon: Calendar,
        iconColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        relativeTime,
      };

    case "TASK_DELETED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            deleted task{" "}
            {metadata.taskKey && (
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                {metadata.taskKey}
              </span>
            )}
          </span>
        ),
        icon: Trash2,
        iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        relativeTime,
      };

    case "PROJECT_CREATED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            created project{" "}
            {metadata.projectKey && (
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded mr-1">
                [{metadata.projectKey}]
              </span>
            )}
            <span className="font-medium text-white">
              {metadata.projectName || ""}
            </span>
          </span>
        ),
        icon: FolderPlus,
        iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        relativeTime,
      };

    case "PROJECT_MEMBERS_UPDATED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            updated team assignments for{" "}
            {metadata.projectKey && (
              <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
                [{metadata.projectKey}]
              </span>
            )}
          </span>
        ),
        icon: Users,
        iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        relativeTime,
      };

    case "MEMBER_INVITED":
      return {
        titleNode: (
          <span className="inline-flex items-center flex-wrap gap-1 text-slate-300">
            {renderActor()}
            invited{" "}
            <span className="font-medium text-white">
              {metadata.targetUserEmail}
            </span>{" "}
            as {renderRoleBadge(metadata.role)}
          </span>
        ),
        icon: Mail,
        iconColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
        relativeTime,
      };

    case "MEMBER_INVITE_RESENT":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            resent invitation to{" "}
            <span className="font-medium text-white">
              {metadata.targetUserEmail}
            </span>
          </span>
        ),
        icon: RefreshCw,
        iconColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
        relativeTime,
      };

    case "MEMBER_INVITE_REVOKED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            revoked invitation for{" "}
            <span className="font-medium text-white">
              {metadata.targetUserEmail}
            </span>
          </span>
        ),
        icon: XCircle,
        iconColor: "text-red-400 bg-red-500/10 border-red-500/20",
        relativeTime,
      };

    case "MEMBER_ROLE_UPDATED":
      return {
        titleNode: (
          <span className="inline-flex items-center flex-wrap gap-1 text-slate-300">
            {renderActor()}
            updated{" "}
            <span className="font-medium text-white">
              {metadata.targetUserName || "member"}'s
            </span>{" "}
            role to {renderRoleBadge(metadata.toRole || metadata.role)}
          </span>
        ),
        icon: ShieldCheck,
        iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        relativeTime,
      };

    case "MEMBER_REMOVED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            removed{" "}
            <span className="font-medium text-white">
              {metadata.targetUserName || "a member"}
            </span>{" "}
            from workspace
          </span>
        ),
        icon: UserMinus,
        iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        relativeTime,
      };

    case "MEMBER_JOINED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            accepted invite and joined workspace
          </span>
        ),
        icon: UserCheck,
        iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        relativeTime,
      };

    case "DOCUMENT_CREATED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            created document{" "}
            <span className="font-medium text-white">
              "{metadata.docTitle || "Untitled Document"}"
            </span>
          </span>
        ),
        icon: FilePlus,
        iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        relativeTime,
      };

    case "DOCUMENT_UPDATED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            edited document{" "}
            <span className="font-medium text-white">
              "{metadata.docTitle || "Untitled Document"}"
            </span>
          </span>
        ),
        icon: FileEdit,
        iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        relativeTime,
      };

    case "DOCUMENT_DELETED":
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            deleted document{" "}
            <span className="font-medium text-white">
              "{metadata.docTitle || "Untitled Document"}"
            </span>
          </span>
        ),
        icon: FileMinus,
        iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        relativeTime,
      };

    default:
      return {
        titleNode: (
          <span className="text-slate-300">
            {renderActor()}
            performed action ({action})
          </span>
        ),
        icon: DefaultActivityIcon,
        iconColor: "text-slate-400 bg-slate-800/80 border-slate-700/50",
        relativeTime,
      };
  }
};
