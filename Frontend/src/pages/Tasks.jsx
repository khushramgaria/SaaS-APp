import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ListTodo,
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
  Plus,
  User,
  Flag,
  Folder,
} from "lucide-react";
import Button from "../components/ui/Button";
import SkeletonLoader from "../components/common/SkeletonLoader";
import KanbanBoard from "../components/tasks/KanbanBoard";
import TaskTable from "../components/tasks/TaskTable";
import TaskDetailDrawer from "../components/tasks/TaskDetailDrawer";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import { fetchTasks, setCurrentTask } from "../redux/slices/taskSlice";
import { fetchProjects } from "../redux/slices/projectSlice";
import { fetchMembers } from "../redux/slices/memberSlice";

const Tasks = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, currentTask, isLoading } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);
  const { members } = useSelector((state) => state.members);

  const [viewMode, setViewMode] = useState("board"); // "board" | "table"
  const [search, setSearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [isMyTasksOnly, setIsMyTasksOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchMembers());
  }, [dispatch]);

  useEffect(() => {
    const assigneeFilter = isMyTasksOnly ? user?._id : selectedAssigneeId;
    dispatch(
      fetchTasks({
        projectId: selectedProjectId,
        priority: selectedPriority,
        assigneeId: assigneeFilter,
        search,
      })
    );
  }, [
    dispatch,
    selectedProjectId,
    selectedPriority,
    selectedAssigneeId,
    isMyTasksOnly,
    search,
    user?._id,
  ]);

  const handleTaskClick = (task) => {
    dispatch(setCurrentTask(task));
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Workspace Tasks
            </h1>
            <p className="text-sm text-slate-400">
              Manage and track all tasks across projects in one unified view
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "board"
                  ? "bg-violet-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-violet-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or key..."
            className="w-full bg-slate-950 text-white text-xs placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 border border-slate-800 focus:border-violet-500 outline-none transition-all"
          />
        </div>

        {/* Project Selector */}
        <div className="min-w-[160px]">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs font-medium outline-none cursor-pointer"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="min-w-[140px]">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs font-medium outline-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="min-w-[150px]">
          <select
            value={isMyTasksOnly ? "" : selectedAssigneeId}
            disabled={isMyTasksOnly}
            onChange={(e) => setSelectedAssigneeId(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs font-medium outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="">All Assignees</option>
            {members.map((m) => {
              const id = m.userId || m._id || m.membershipId;
              const name = m.name || m.userId?.name;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Quick Toggle: My Tasks */}
        <button
          type="button"
          onClick={() => setIsMyTasksOnly((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            isMyTasksOnly
              ? "bg-violet-600/20 text-violet-300 border-violet-500/40"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Tasks</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <SkeletonLoader variant="table" rows={6} columns={5} />}

      {/* Main View Area */}
      {!isLoading && (
        <>
          {viewMode === "board" ? (
            <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} />
          ) : (
            <TaskTable
              tasks={tasks}
              isLoading={isLoading}
              onTaskClick={handleTaskClick}
              showProjectColumn={true}
            />
          )}
        </>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projects={projects}
        members={members}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={currentTask}
        isOpen={Boolean(currentTask)}
        onClose={() => dispatch(setCurrentTask(null))}
        members={members}
      />
    </div>
  );
};

export default Tasks;
