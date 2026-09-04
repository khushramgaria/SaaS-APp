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
  { id: "BACKLOG", title: "Backlog", color: "border-slate-500 text-slate-400 bg-slate-500/10" },
  { id: "TODO", title: "To Do", color: "border-blue-500 text-blue-400 bg-blue-500/10" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-amber-500 text-amber-400 bg-amber-500/10" },
  { id: "IN_REVIEW", title: "In Review", color: "border-violet-500 text-violet-400 bg-violet-500/10" },
  { id: "DONE", title: "Done", color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-6">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasksByColumn[col.id] || [];

          return (
            <div
              key={col.id}
              className="flex flex-col bg-slate-950/60 rounded-2xl border border-slate-800/80 p-3 min-w-[260px] h-full"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full border ${col.color}`}
                  ></div>
                  <h3 className="font-bold text-sm text-slate-200 tracking-tight">
                    {col.title}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                  {colTasks.length}
                </span>
              </div>

              {/* Droppable Container */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[300px] rounded-xl transition-colors duration-150 p-1 ${
                      snapshot.isDraggingOver ? "bg-slate-900/60 ring-2 ring-violet-500/20" : ""
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
                      <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-800/60 rounded-xl text-xs text-slate-500 font-medium">
                        No tasks
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
