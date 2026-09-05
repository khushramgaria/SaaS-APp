import React from "react";
import { useDispatch } from "react-redux";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { toast } from "react-hot-toast";
import TaskCard from "./TaskCard";
import {
  moveTaskOptimistically,
  updateTaskStatus,
} from "../../redux/slices/taskSlice";

const KANBAN_COLUMNS = [
  { id: "BACKLOG", title: "Backlog", color: "border-slate-500 text-slate-400 bg-slate-500/20" },
  { id: "TODO", title: "To Do", color: "border-blue-500 text-blue-400 bg-blue-500/20" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-amber-500 text-amber-400 bg-amber-500/20" },
  { id: "IN_REVIEW", title: "In Review", color: "border-violet-500 text-violet-400 bg-violet-500/20" },
  { id: "DONE", title: "Done", color: "border-emerald-500 text-emerald-400 bg-emerald-500/20" },
];

const KanbanBoard = ({ tasks = [], onTaskClick }) => {
  const dispatch = useDispatch();

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;
    const previousStatus = source.droppableId;

    // 1. Optimistic local update
    dispatch(moveTaskOptimistically({ taskId, destinationStatus: newStatus }));

    // 2. Persist backend update
    try {
      await dispatch(
        updateTaskStatus({ taskId, status: newStatus, previousStatus })
      ).unwrap();
    } catch (error) {
      toast.error("Failed to update status on server. Rolled back.");
    }
  };

  // Group tasks by status column
  const tasksByColumn = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="w-full overflow-x-auto pb-6 pt-1">
        <div className="flex items-start gap-5 min-w-max pb-2">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = tasksByColumn[col.id] || [];

            return (
              <div
                key={col.id}
                className="flex flex-col bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800/90 p-4 w-[280px] sm:w-[300px] shrink-0 min-h-[520px] shadow-sm dark:shadow-xl"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800/90 px-1">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3 h-3 rounded-full border shadow-sm ${col.color}`}
                    />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
                      {col.title}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 shadow-inner">
                    {colTasks.length}
                  </span>
                </div>

                {/* Droppable Container */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[420px] rounded-xl transition-all duration-150 p-1 flex flex-col ${
                        snapshot.isDraggingOver
                          ? "bg-violet-500/10 dark:bg-violet-950/20 border border-dashed border-violet-500/40 ring-2 ring-violet-500/20"
                          : ""
                      }`}
                    >
                      {colTasks.map((task, index) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          index={index}
                          onCardClick={onTaskClick}
                        />
                      ))}
                      {provided.placeholder}

                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium my-auto min-h-[140px]">
                          <span>No tasks in {col.title}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
