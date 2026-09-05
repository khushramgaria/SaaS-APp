import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProjects } from "../redux/slices/projectSlice";
import { fetchTasks, updateTaskStatus } from "../redux/slices/taskSlice";
import { fetchWorkspaceActivities } from "../redux/slices/activitySlice";
import { fetchMembers } from "../redux/slices/memberSlice";
import ActivityTimeline from "../components/activity/ActivityTimeline";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import {
  CheckSquare,
  AlertCircle,
  Folder,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const dispatch = useDispatch();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { projects, isLoading: isLoadingProjects } = useSelector(
    (state) => state.projects
  );
  const { tasks, isLoading: isLoadingTasks } = useSelector(
    (state) => state.tasks
  );
  const { workspaceActivities, isLoading: isLoadingActivities } = useSelector(
    (state) => state.activity
  );
  const { members, isLoading: isLoadingMembers } = useSelector(
    (state) => state.members
  );
  const { onlineUserIds } = useSelector((state) => state.chat);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchTasks());
    dispatch(fetchWorkspaceActivities({ page: 1, limit: 5 }));
    dispatch(fetchMembers());
  }, [dispatch]);

  // Helper to match user ID across string or object format
  const isUserMatch = (userRef, targetId) => {
    if (!userRef || !targetId) return false;
    const refId = typeof userRef === "object" ? userRef._id : userRef;
    return String(refId) === String(targetId);
  };

  // 1. My Assigned Open Tasks
  const myAssignedOpenTasks = tasks.filter(
    (t) => isUserMatch(t.assigneeId, currentUser?._id) && t.status !== "DONE"
  );

  // 2. Tasks Due Soon / Overdue (assigned to user, within 48h or past due)
  const now = new Date();
  const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const dueSoonOrOverdueTasks = myAssignedOpenTasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due <= next48h; // overdue or due within 48 hours
  });

  // Sort urgent tasks: overdue first, then by earliest due date
  const urgentTasks = [...myAssignedOpenTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  // Active Projects
  const activeProjects = projects;

  // Role verification for project creation
  const userRole = currentUser?.role || "MEMBER";
  const canCreateProject = ["OWNER", "ADMIN"].includes(userRole);

  // Inline Mark Task Done
  const handleMarkTaskDone = async (taskId) => {
    try {
      await dispatch(
        updateTaskStatus({ taskId, status: "DONE", previousStatus: "TODO" })
      ).unwrap();
      toast.success("Task completed!");
    } catch (err) {
      toast.error("Failed to update task.");
    }
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors">
      {/* A. Header & Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {currentUser?.name || "User"}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              {userRole}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Workspace Overview & Personal Command Center</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>

          {canCreateProject && (
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-200/80 dark:border-slate-700/60 cursor-pointer"
            >
              <Folder className="w-4 h-4 text-indigo-500" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* B. Top Metric Cards (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Assigned Tasks */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-xs transition-colors">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              My Pending Tasks
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoadingTasks ? "..." : myAssignedOpenTasks.length}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Tasks Due Soon / Overdue */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-xs transition-colors">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Due Soon / Overdue
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoadingTasks ? "..." : dueSoonOrOverdueTasks.length}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/50">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Projects */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-xs transition-colors">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Active Projects
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoadingProjects ? "..." : activeProjects.length}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50">
            <Folder className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Team Members & Online Count */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-xs transition-colors">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Team Members
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isLoadingMembers ? "..." : members.length}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{onlineUserIds.length} Online</span>
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800/50">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* C. Main Content Area (2-Column Asymmetric Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workload & Projects (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Widget 1: My Urgent Tasks */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  My Urgent Tasks
                </h2>
              </div>
              <Link
                to="/tasks"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingTasks ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : urgentTasks.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  All caught up!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No pending tasks assigned to you right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {urgentTasks.slice(0, 5).map((task) => {
                  const isOverdue =
                    task.dueDate && new Date(task.dueDate) < now;

                  const priorityColors = {
                    URGENT:
                      "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
                    HIGH: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
                    MEDIUM:
                      "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60",
                    LOW: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                  };

                  return (
                    <div
                      key={task._id}
                      className="py-3 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleMarkTaskDone(task._id)}
                          title="Mark as Done"
                          className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 flex items-center justify-center text-transparent hover:text-emerald-500 transition-colors shrink-0 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {task.taskKey || "TASK"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {task.title}
                            </span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span
                                className={
                                  isOverdue
                                    ? "text-rose-600 dark:text-rose-400 font-medium"
                                    : "text-slate-500 dark:text-slate-400"
                                }
                              >
                                {isOverdue ? "Overdue: " : "Due: "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                            priorityColors[task.priority] || priorityColors.LOW
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Widget 2: Project Progress Overview */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Project Progress
                </h2>
              </div>
              <Link
                to="/projects"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingProjects ? (
              <div className="space-y-4 py-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Folder className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No projects created yet
                </p>
                {canCreateProject && (
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Project</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 4).map((project) => {
                  const projectTasks = tasks.filter(
                    (t) =>
                      isUserMatch(t.projectId, project._id) ||
                      t.projectId === project._id
                  );
                  const totalTasks = projectTasks.length;
                  const completedTasks = projectTasks.filter(
                    (t) => t.status === "DONE"
                  ).length;
                  const percentage =
                    totalTasks > 0
                      ? Math.round((completedTasks / totalTasks) * 100)
                      : 0;

                  return (
                    <div
                      key={project._id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/projects/${project._id}`}
                          className="flex items-center gap-2 group min-w-0"
                        >
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {project.key}
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {project.name}
                          </span>
                        </Link>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {completedTasks} / {totalTasks} completed ({percentage}%)
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Stream (Span 1) */}
        <div className="space-y-6">
          {/* Widget 1: Recent Activity (Limit 5) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
              <Link
                to="/activity"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </Link>
            </div>

            <ActivityTimeline
              activities={workspaceActivities.slice(0, 5)}
              isLoading={isLoadingActivities}
              emptyMessage="No recent workspace events."
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projects={projects}
        members={members}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        members={members}
      />
    </div>
  );
};

export default DashboardPage;
