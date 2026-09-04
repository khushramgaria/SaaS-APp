import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FolderKanban,
  Kanban,
  ListTodo,
  LayoutDashboard,
  Plus,
  UserPlus,
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";
import Button from "../components/ui/Button";
import SkeletonLoader from "../components/common/SkeletonLoader";
import KanbanBoard from "../components/tasks/KanbanBoard";
import TaskTable from "../components/tasks/TaskTable";
import TaskDetailDrawer from "../components/tasks/TaskDetailDrawer";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import AddProjectMemberModal from "../components/projects/AddProjectMemberModal";
import {
  fetchProjectById,
  clearCurrentProject,
} from "../redux/slices/projectSlice";
import { fetchTasks, setCurrentTask } from "../redux/slices/taskSlice";
import { fetchMembers } from "../redux/slices/memberSlice";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activeWorkspace } = useSelector((state) => state.auth);
  const { currentProject, stats, isLoading: isProjectLoading } = useSelector(
    (state) => state.projects
  );
  const { tasks, currentTask, isLoading: isTasksLoading } = useSelector(
    (state) => state.tasks
  );
  const { members: workspaceMembers } = useSelector((state) => state.members);

  const [activeTab, setActiveTab] = useState("board");
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const userRole = activeWorkspace?.role || "MEMBER";
  const canManage = userRole === "OWNER" || userRole === "ADMIN";

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
      dispatch(fetchTasks({ projectId }));
      dispatch(fetchMembers());
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, projectId]);

  const handleTaskClick = (task) => {
    dispatch(setCurrentTask(task));
  };

  const projectTasks = tasks.filter((t) => {
    const pId = t.projectId?._id || t.projectId;
    return pId === projectId;
  });

  const totalTasks = stats?.TOTAL || projectTasks.length || 0;
  const completedTasks = stats?.DONE || projectTasks.filter((t) => t.status === "DONE").length || 0;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (isProjectLoading || !currentProject) {
    return (
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="table" rows={6} columns={4} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="font-mono text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl shadow-inner">
              {currentProject.key}
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentProject.name}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                {currentProject.leadId && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    <span>Lead: {currentProject.leadId.name}</span>
                  </span>
                )}
                <span>•</span>
                <span>{currentProject.members?.length || 0} Members</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateTaskModalOpen(true)}
          >
            Create Task
          </Button>
        </div>

        {/* Completion Progress Bar */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-300">
                Project Completion Progress
              </span>
              <p className="text-[11px] text-slate-400">
                {completedTasks} of {totalTasks} tasks completed ({completionPercent}%)
              </p>
            </div>
          </div>
          <div className="w-full md:w-64 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("board")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "board"
              ? "border-violet-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Kanban className="w-4 h-4" />
          <span>Kanban Board</span>
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "tasks"
              ? "border-violet-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Task Table</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
            {projectTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-violet-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>
      </div>

      {/* Tab 1: Board */}
      {activeTab === "board" && (
        <KanbanBoard tasks={projectTasks} onTaskClick={handleTaskClick} />
      )}

      {/* Tab 2: Tasks Table */}
      {activeTab === "tasks" && (
        <TaskTable
          tasks={projectTasks}
          isLoading={isTasksLoading}
          onTaskClick={handleTaskClick}
          showProjectColumn={false}
        />
      )}

      {/* Tab 3: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total Tasks
                </span>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats?.TOTAL || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  In Progress
                </span>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {stats?.IN_PROGRESS || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  In Review
                </span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">
                  {stats?.IN_REVIEW || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Completed
                </span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {stats?.DONE || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Description & Team Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Project Description
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentProject.description || "No project description specified."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-400" />
                  <span>Project Team</span>
                </h3>
                {canManage && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={UserPlus}
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>

              <div className="space-y-2.5">
                {currentProject.members &&
                  currentProject.members.map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60"
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">
                          {m.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {m.email}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projects={[currentProject]}
        members={currentProject.members || workspaceMembers}
        defaultProjectId={projectId}
      />

      {/* Add Project Member Modal */}
      <AddProjectMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        project={currentProject}
        workspaceMembers={workspaceMembers}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={currentTask}
        isOpen={Boolean(currentTask)}
        onClose={() => dispatch(setCurrentTask(null))}
        members={currentProject.members || workspaceMembers}
      />
    </div>
  );
};

export default ProjectDetail;
