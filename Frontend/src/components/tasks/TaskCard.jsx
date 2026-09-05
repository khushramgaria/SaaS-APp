import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, AlertCircle } from "lucide-react";

const priorityStyles = {
  LOW: "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60",
  MEDIUM: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  URGENT: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-bold",
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const TaskCard = ({ task, index, onCardClick }) => {
  const formattedDueDate = formatDate(task.dueDate);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onCardClick && onCardClick(task)}
          className={`group rounded-xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-violet-500/50 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer select-none mb-3 ${
            snapshot.isDragging
              ? "shadow-2xl ring-2 ring-violet-500/50 rotate-1 scale-[1.02] bg-white dark:bg-slate-900"
              : ""
          }`}
        >
          {/* Card Header: Task Key & Priority Badge */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-mono font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
              {task.taskKey || "TASK"}
            </span>

            <span
              className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full border ${
                priorityStyles[task.priority] || priorityStyles.MEDIUM
              }`}
            >
              {task.priority === "URGENT" && (
                <AlertCircle className="w-2.5 h-2.5 inline mr-1" />
              )}
              {task.priority}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-200 transition-colors line-clamp-2 mb-3 leading-snug">
            {task.title}
          </h4>

          {/* Card Footer: Due Date & Assignee */}
          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
            {formattedDueDate ? (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="text-[11px] font-medium">{formattedDueDate}</span>
              </div>
            ) : (
              <div></div>
            )}

            {/* Assignee Avatar */}
            {task.assigneeId ? (
              <div
                className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-[10px] font-bold text-violet-700 dark:text-violet-300"
                title={task.assigneeId.name}
              >
                {getInitials(task.assigneeId.name)}
              </div>
            ) : (
              <div
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500"
                title="Unassigned"
              >
                ?
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
